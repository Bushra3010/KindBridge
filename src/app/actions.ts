"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, transaction } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { attempt, type ActionState } from "@/lib/action";
import { createSession, currentAccount, destroySession, hashPassword, newVerifyCode, verifyLogin } from "@/lib/auth";
import { AVATAR_KEYS } from "@/components/avatar";
import * as exchanges from "@/lib/services/exchanges";
import * as disclosure from "@/lib/services/disclosure";
import * as safety from "@/lib/services/safety";
import { createListing, setListingStatus } from "@/lib/services/listings";
import { decideMembership, maybeGrantStarter, requestMembership } from "@/lib/services/membership";
import { submitReview } from "@/lib/services/reviews";
import { reverse } from "@/lib/services/ledger";
import { audit } from "@/lib/services/support";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

async function me() {
  const a = await currentAccount();
  if (!a) redirect("/login");
  return a;
}

// ── Auth & onboarding ──────────────────────────────────────────────────

const RESERVED = ["admin", "moderator", "kindbridge", "support", "staff", "official", "system"];

const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Usernames need at least 3 characters")
    .max(20, "Usernames can be up to 20 characters")
    .regex(/^[A-Za-z][A-Za-z0-9_]*$/, "Use letters, numbers and underscores, starting with a letter"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters for your password"),
  avatar: z.enum(AVATAR_KEYS as [string, ...string[]]),
  adult: z.literal("on", { error: "You must be 18 or older and accept the community rules" }),
});

export async function signup(_: ActionState, fd: FormData): Promise<ActionState> {
  const res = await attempt(async () => {
    const d = signupSchema.parse(Object.fromEntries(fd));
    const lower = d.username.toLowerCase();
    if (RESERVED.some((r) => lower.includes(r))) throw new AppError("That username isn't available. Try another.");
    if (await db.profile.findUnique({ where: { username: lower } })) throw new AppError("That username is taken.");
    if (await db.account.findUnique({ where: { email: d.email.toLowerCase() } })) throw new AppError("An account with that email already exists. Try signing in.");
    const now = new Date();
    const account = await db.account.create({
      data: {
        email: d.email.toLowerCase(),
        passwordHash: await hashPassword(d.password),
        verifyCode: newVerifyCode(),
        adultConfirmedAt: now,
        rulesAcceptedAt: now,
        profile: { create: { username: lower, displayName: d.username, avatar: d.avatar } },
        contact: { create: {} },
      },
    });
    await createSession(account.id);
  });
  if (res?.error) return res;
  redirect("/verify");
}

export async function verifyEmail(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  const res = await attempt(async () => {
    if (str(fd, "code") !== account.verifyCode) throw new AppError("That code doesn't match. Check your email and try again.");
    await transaction(async (tx) => {
      await tx.account.update({ where: { id: account.id }, data: { emailVerifiedAt: new Date(), verifyCode: null } });
      // A member approved before verifying becomes starter-eligible now.
      const m = await tx.membership.findFirst({ where: { accountId: account.id, status: "APPROVED" } });
      if (m) await maybeGrantStarter(tx, m.id);
    });
  });
  if (res?.error) return res;
  redirect("/onboarding/community");
}

export async function resendCode(): Promise<ActionState> {
  const account = await me();
  await db.account.update({ where: { id: account.id }, data: { verifyCode: newVerifyCode() } });
  revalidatePath("/verify");
  return { ok: true, message: "We sent a new code." };
}

export async function login(_: ActionState, fd: FormData): Promise<ActionState> {
  const res = await attempt(async () => {
    const account = await verifyLogin(str(fd, "email"), String(fd.get("password") ?? ""));
    await createSession(account.id);
  });
  if (res?.error) return res;
  redirect("/home");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function joinCommunity(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  const res = await attempt(() => requestMembership(account.id, str(fd, "communityId"), str(fd, "inviteCode") || undefined));
  if (res?.error) return res;
  redirect("/onboarding/skills");
}

export async function saveSkills(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  const offer = fd.getAll("offer").map(String);
  const need = fd.getAll("need").map(String);
  const res = await attempt(async () => {
    if (offer.length === 0) throw new AppError("Pick at least one skill you can share.");
    await transaction(async (tx) => {
      await tx.userSkill.deleteMany({ where: { accountId: account.id } });
      await tx.userSkill.createMany({
        data: [...offer.map((categoryId) => ({ accountId: account.id, categoryId, kind: "OFFER" })), ...need.map((categoryId) => ({ accountId: account.id, categoryId, kind: "NEED" }))],
      });
      await tx.profile.update({ where: { accountId: account.id }, data: { availability: str(fd, "availability") || "Flexible", onboardedAt: new Date() } });
    });
  });
  if (res?.error) return res;
  redirect(str(fd, "next") || "/home");
}

// ── Profile & privacy ──────────────────────────────────────────────────

export async function updateProfile(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  return attempt(async () => {
    const avatar = str(fd, "avatar");
    await db.profile.update({
      where: { accountId: account.id },
      data: {
        bio: str(fd, "bio").slice(0, 160),
        availability: str(fd, "availability") || "Flexible",
        paused: fd.get("paused") === "on",
        ...(AVATAR_KEYS.includes(avatar) && { avatar }),
      },
    });
    revalidatePath("/profile");
  }, "Profile saved.");
}

export async function updatePrivateContact(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  return attempt(async () => {
    const phone = str(fd, "phone");
    if (phone && !/^\+?[\d\s-]{8,16}$/.test(phone)) throw new AppError("Enter a valid phone number.");
    const data = {
      firstName: str(fd, "firstName").slice(0, 40) || null,
      phone: phone || null,
      photoUrl: str(fd, "photoUrl").slice(0, 300) || null,
      meetingLocation: str(fd, "meetingLocation").slice(0, 120) || null,
    };
    await db.privateContact.upsert({ where: { accountId: account.id }, create: { accountId: account.id, ...data }, update: data });
    revalidatePath("/privacy");
  }, "Saved. These stay hidden unless you share them with someone.");
}

export async function updateNotificationPrefs(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  return attempt(() => db.profile.update({ where: { accountId: account.id }, data: { notifyDigest: fd.get("digest") === "on" } }), "Preferences saved.");
}

export async function shareDetails(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  const res = await attempt(() => disclosure.grant(account.id, str(fd, "exchangeId"), fd.getAll("field").map(String)), "Shared. Only this member can see these details.");
  revalidatePath(`/exchanges/${str(fd, "exchangeId")}`);
  return res;
}

export async function revokeGrant(fd: FormData) {
  const account = await me();
  await disclosure.revoke(account.id, str(fd, "grantId"));
  revalidatePath("/privacy");
  revalidatePath("/exchanges");
}

export async function blockMember(fd: FormData) {
  const account = await me();
  await safety.block(account.id, str(fd, "accountId"));
  revalidatePath("/privacy");
  redirect(str(fd, "next") || "/privacy/blocked");
}

export async function unblockMember(fd: FormData) {
  const account = await me();
  await safety.unblock(account.id, str(fd, "accountId"));
  revalidatePath("/privacy/blocked");
}

export async function requestDeletion(_: ActionState): Promise<ActionState> {
  const account = await me();
  return attempt(async () => {
    const open = await db.exchange.count({
      where: { OR: [{ requesterId: account.id }, { helperId: account.id }], status: { in: ["PROPOSED", "ACCEPTED", "IN_PROGRESS", "DELIVERED", "DISPUTED"] } },
    });
    if (open) throw new AppError("Finish or cancel your open exchanges first. Unresolved coin holds must be settled before an account can close.");
    await transaction(async (tx) => {
      // Pseudonymize the public profile; keep ledger and case records (PRD §9).
      await tx.profile.update({ where: { accountId: account.id }, data: { displayName: "Former member", username: `closed-${account.id}`, bio: "", paused: true } });
      await tx.privateContact.deleteMany({ where: { accountId: account.id } });
      await tx.disclosureGrant.updateMany({ where: { ownerId: account.id, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.listing.updateMany({ where: { ownerId: account.id, status: { in: ["OPEN", "PAUSED"] } }, data: { status: "CLOSED" } });
      await tx.account.update({ where: { id: account.id }, data: { status: "CLOSED", email: `closed+${account.id}@kindbridge.invalid` } });
      await tx.session.deleteMany({ where: { accountId: account.id } });
      await audit(tx, { actorId: account.id, action: "account_closed", targetType: "Account", targetId: account.id });
    });
  }).then((r) => {
    if (r?.error) return r;
    redirect("/");
  });
}

// ── Listings ───────────────────────────────────────────────────────────

export async function postListing(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  let id = "";
  const res = await attempt(async () => {
    const l = await createListing(account.id, Object.fromEntries(fd));
    id = l.id;
  });
  if (res?.error) return res;
  redirect(`/listings/${id}?posted=1`);
}

export async function toggleListing(fd: FormData) {
  const account = await me();
  await setListingStatus(account.id, str(fd, "listingId"), str(fd, "status") === "OPEN" ? "OPEN" : "CLOSED");
  revalidatePath(`/listings/${str(fd, "listingId")}`);
}

// ── Exchanges ──────────────────────────────────────────────────────────

export async function sendProposal(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  let id = "";
  const res = await attempt(async () => {
    const e = await exchanges.propose(account.id, str(fd, "listingId"), Object.fromEntries(fd));
    id = e.id;
  });
  if (res?.error) return res;
  redirect(`/exchanges/${id}`);
}

/** All structured exchange actions go through one dispatcher keyed by `op`. */
export async function exchangeAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  const id = str(fd, "exchangeId");
  const op = str(fd, "op");
  const version = Number(fd.get("version"));
  const amount = Number(fd.get("amount"));
  const res = await attempt(async () => {
    switch (op) {
      case "accept": return exchanges.accept(account.id, id, version);
      case "decline": return exchanges.decline(account.id, id);
      case "withdraw": return exchanges.withdraw(account.id, id);
      case "revise": return exchanges.revise(account.id, id, Object.fromEntries(fd));
      case "start": return exchanges.start(account.id, id);
      case "deliver": return exchanges.markDelivered(account.id, id);
      case "confirm": return exchanges.confirmCompletion(account.id, id);
      case "cancel": return exchanges.cancel(account.id, id, str(fd, "reason") || "No reason given");
      case "reschedule": return exchanges.proposeReschedule(account.id, id, new Date(str(fd, "scheduledAt")));
      case "acceptReschedule": return exchanges.acceptReschedule(account.id, id, version);
      case "partial": return exchanges.proposePartial(account.id, id, amount);
      case "approvePartial": return exchanges.approvePartial(account.id, id, amount);
      case "dispute": return exchanges.openDispute(account.id, id, str(fd, "category") || "Something else", str(fd, "explanation"));
      case "review": return submitReview(account.id, id, Object.fromEntries(fd));
      default: throw new AppError("Unknown action.");
    }
  });
  revalidatePath(`/exchanges/${id}`);
  if (res?.error) return res;
  if (op === "accept") redirect(`/exchanges/${id}?booked=1`);
  return res;
}

export async function sendMessage(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  const id = str(fd, "exchangeId");
  const body = str(fd, "body");
  return attempt(async () => {
    if (!body) return;
    if (body.length > 2000) throw new AppError("Messages can be up to 2000 characters.");
    const ex = await db.exchange.findUnique({ where: { id } });
    if (!ex || (ex.requesterId !== account.id && ex.helperId !== account.id)) throw new AppError("You don't have access to this conversation.");
    const other = ex.requesterId === account.id ? ex.helperId : ex.requesterId;
    if (await safety.isBlockedEitherWay(db, account.id, other))
      throw new AppError("Messaging is off between you and this member. Session actions and support remain available.");
    await db.message.create({ data: { exchangeId: id, senderId: account.id, body } });
    revalidatePath(`/exchanges/${id}`);
  });
}

// ── Safety, moderation & organizers ────────────────────────────────────

export async function submitReport(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  return attempt(
    () => safety.submitReport(account.id, { targetType: str(fd, "targetType") || "OTHER", targetId: str(fd, "targetId"), category: str(fd, "category"), explanation: str(fd, "explanation") }),
    "Thanks — we received your report. You can follow it in My support cases. The other member isn't told who reported.",
  );
}

export async function modResolveExchange(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  const res = await attempt(() => exchanges.moderatorResolve(account.id, str(fd, "exchangeId"), Number(fd.get("toHelper")), str(fd, "reason"), str(fd, "evidence")), "Resolved and recorded.");
  revalidatePath("/mod");
  return res;
}

export async function modUpdateCase(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  const status = str(fd, "status") as "IN_REVIEW" | "RESOLVED" | "DISMISSED";
  const res = await attempt(() => safety.updateCase(account.id, str(fd, "reportId"), status, str(fd, "resolution") || undefined), "Case updated.");
  revalidatePath("/mod");
  return res;
}

export async function modRemoveListing(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  return attempt(() => safety.removeListing(account.id, str(fd, "listingId"), str(fd, "reason")), "Listing removed.");
}

export async function modSetAccountStatus(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  const status = str(fd, "status") === "ACTIVE" ? "ACTIVE" : "SUSPENDED";
  return attempt(() => safety.setAccountStatus(account.id, str(fd, "accountId"), status, str(fd, "reason")), "Account updated.");
}

/** Coin corrections need the separate COIN_ADMIN role (PRD §10). */
export async function coinReverse(_: ActionState, fd: FormData): Promise<ActionState> {
  const account = await me();
  return attempt(async () => {
    if (!["COIN_ADMIN", "ADMIN"].includes(account.role)) throw new AppError("Coin corrections need the coin-admin role.");
    const reason = str(fd, "reason");
    if (!reason) throw new AppError("Record a reason for the correction.");
    await transaction(async (tx) => {
      const r = await reverse(tx, { transactionId: str(fd, "transactionId"), actorId: account.id, reason });
      await audit(tx, { actorId: account.id, action: "ledger_reversed", targetType: "LedgerTransaction", targetId: str(fd, "transactionId"), data: { reason, reversal: r.transaction.id } });
    });
  }, "Reversal posted.");
}

export async function decideMember(fd: FormData) {
  const account = await me();
  await decideMembership(account.id, str(fd, "membershipId"), str(fd, "decision") === "approve");
  revalidatePath("/organizer");
}

export async function markAllRead() {
  const account = await me();
  await db.notification.updateMany({ where: { accountId: account.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/updates");
}
