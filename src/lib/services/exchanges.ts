// Exchange lifecycle and resolution rules (PRD §6.3, §8).
//
// Every state change is a guarded `updateMany({ where: { status: … } })`, so
// two concurrent requests can't both move an exchange out of the same state.
// Coin movements share the database transaction with the state change.

import { z } from "zod";
import { transaction, type Tx } from "@/lib/db";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { CONFIRM_FLAG_DAYS, CONFIRM_REMINDER_HOURS, PROPOSAL_EXPIRY_DAYS } from "@/lib/constants";
import * as ledger from "./ledger";
import { audit, nextRef, notify } from "./support";
import { isBlockedEitherWay } from "./safety";

export const termsSchema = z.object({
  deliverable: z.string().trim().min(3, "Describe what will be delivered").max(300),
  durationMin: z.coerce.number().int().min(15).max(240),
  coins: z.coerce.number().int().min(1, "Offer at least 1 coin").max(500),
  format: z.enum(["ONLINE", "SHARED_SPACE"]),
  scheduledAt: z.coerce.date(),
  materials: z.string().trim().max(300).default(""),
  note: z.string().trim().max(500).default(""),
});
export type Terms = z.infer<typeof termsSchema>;

const HOUR = 3600_000;
const DAY = 24 * HOUR;

async function loadForActor(tx: Tx, exchangeId: string, actorId: string) {
  const ex = await tx.exchange.findUnique({
    where: { id: exchangeId },
    include: { versions: { orderBy: { version: "desc" }, take: 1 }, listing: true },
  });
  if (!ex) throw notFound("Exchange");
  if (ex.requesterId !== actorId && ex.helperId !== actorId) throw forbidden();
  return { ex, latest: ex.versions[0] };
}

async function transition(tx: Tx, id: string, from: string[], data: Record<string, unknown>) {
  const { count } = await tx.exchange.updateMany({ where: { id, status: { in: from } }, data });
  if (count === 0) throw new AppError("This exchange changed in the meantime. Refresh to see the latest status.", "CONFLICT");
}

async function event(tx: Tx, exchangeId: string, actorId: string | null, type: string, detail = "", system?: string) {
  await tx.exchangeEvent.create({ data: { exchangeId, actorId, type, detail } });
  if (system) await tx.message.create({ data: { exchangeId, kind: "SYSTEM", body: system } });
}

async function assertCanTransact(tx: Tx, accountId: string, communityId: string) {
  const acct = await tx.account.findUniqueOrThrow({ where: { id: accountId } });
  if (acct.status !== "ACTIVE") throw new AppError("Your account is restricted. Contact support for help.", "SUSPENDED");
  if (!acct.emailVerifiedAt) throw new AppError("Verify your email before proposing or accepting help.");
  const m = await tx.membership.findUnique({ where: { accountId_communityId: { accountId, communityId } } });
  if (m?.status !== "APPROVED") throw new AppError("You need an approved membership in this community.");
}

function validateSchedule(t: Terms) {
  if (t.scheduledAt.getTime() < Date.now() - 5 * 60_000) throw new AppError("Choose a time in the future.");
}

// ── Proposals ──────────────────────────────────────────────────────────

/**
 * Starts a proposal on a listing. On a REQUEST the actor offers to help; on an
 * OFFER the actor asks to receive help.
 */
export async function propose(actorId: string, listingId: string, input: unknown) {
  const terms = termsSchema.parse(input);
  validateSchedule(terms);
  return transaction(async (tx) => {
    const listing = await tx.listing.findUnique({ where: { id: listingId }, include: { category: true } });
    if (!listing || listing.status !== "OPEN") throw new AppError("This listing isn't open for proposals right now.");
    if (listing.ownerId === actorId) throw new AppError("You can't send a proposal to your own listing.");
    await assertCanTransact(tx, actorId, listing.communityId);
    if (await isBlockedEitherWay(tx, actorId, listing.ownerId)) throw new AppError("You can't send proposals to this member.");
    if (terms.coins > listing.category.maxCoins)
      throw new AppError(`${listing.category.name} quotes are capped at ${listing.category.maxCoins} coins during the pilot.`);

    const open = await tx.exchange.findFirst({ where: { listingId, status: "PROPOSED", OR: [{ requesterId: actorId }, { helperId: actorId }] } });
    if (open) throw new AppError("You already have an open proposal on this listing.");

    const isRequest = listing.kind === "REQUEST";
    const exchange = await tx.exchange.create({
      data: {
        ref: await nextRef(tx, "KB"),
        communityId: listing.communityId,
        listingId,
        requesterId: isRequest ? listing.ownerId : actorId,
        helperId: isRequest ? actorId : listing.ownerId,
        expiresAt: new Date(Date.now() + PROPOSAL_EXPIRY_DAYS * DAY),
        versions: { create: { version: 1, authorId: actorId, ...terms } },
      },
    });
    await event(tx, exchange.id, actorId, "proposal_sent", "v1", "Proposal sent.");
    await notify(tx, listing.ownerId, {
      type: "proposal_sent",
      title: isRequest ? "Someone offered to help with your request" : "Someone requested your offer",
      body: listing.title,
      href: `/exchanges/${exchange.id}`,
    });
    return exchange;
  });
}

/** Suggest changes: creates a new terms version that needs fresh acceptance by the other party. */
export async function revise(actorId: string, exchangeId: string, input: unknown) {
  const terms = termsSchema.parse(input);
  validateSchedule(terms);
  return transaction(async (tx) => {
    const { ex, latest } = await loadForActor(tx, exchangeId, actorId);
    if (ex.status !== "PROPOSED") throw new AppError("Only open proposals can be revised. Use reschedule for booked sessions.");
    const version = latest.version + 1;
    await tx.proposalVersion.create({ data: { exchangeId, version, authorId: actorId, ...terms } });
    await tx.exchange.update({ where: { id: exchangeId }, data: { expiresAt: new Date(Date.now() + PROPOSAL_EXPIRY_DAYS * DAY) } });
    await event(tx, exchangeId, actorId, "terms_revised", `v${version}`, `New terms suggested (version ${version}).`);
    await notify(tx, counterpart(ex, actorId), { type: "terms_revised", title: "New terms were suggested", href: `/exchanges/${exchangeId}` });
    return version;
  });
}

/**
 * Accepts the latest terms. Atomically books the listing and reserves the
 * requester's coins; any failure leaves the proposal unaccepted. Replays of a
 * successful accept are no-ops.
 */
export async function accept(actorId: string, exchangeId: string, version: number) {
  return transaction(async (tx) => {
    const { ex, latest } = await loadForActor(tx, exchangeId, actorId);
    if (ex.status !== "PROPOSED") {
      if (ex.acceptedVersionId) return { replayed: true }; // already accepted: replay is a no-op
      throw new AppError("This proposal is no longer open.", "CONFLICT");
    }
    if (latest.version !== version) throw new AppError("The terms changed. Review the latest version before accepting.", "CONFLICT");
    if (latest.authorId === actorId) throw new AppError("The other member needs to accept terms you proposed.");
    if (ex.expiresAt < new Date()) throw new AppError("This proposal has expired.");
    await assertCanTransact(tx, actorId, ex.communityId);
    if (await isBlockedEitherWay(tx, ex.requesterId, ex.helperId)) throw new AppError("This proposal can't be accepted.");

    await transition(tx, ex.id, ["PROPOSED"], { status: "ACCEPTED", acceptedVersionId: latest.id, acceptedAt: new Date(), reserved: latest.coins });

    const booked = await tx.listing.updateMany({ where: { id: ex.listingId, status: "OPEN" }, data: { status: "PAUSED" } });
    if (booked.count === 0) throw new AppError("This listing was just booked by someone else.", "CONFLICT");

    await ledger.reserve(tx, { communityId: ex.communityId, payerId: ex.requesterId, amount: latest.coins, exchangeId: ex.id, actorId });

    await event(tx, ex.id, actorId, "terms_accepted", `v${latest.version}`, `Booked. ${latest.coins} coins are reserved until help is confirmed.`);
    await notify(tx, counterpart(ex, actorId), { type: "terms_accepted", title: "Your session is booked", href: `/exchanges/${ex.id}` });
    return { replayed: false };
  });
}

export async function decline(actorId: string, exchangeId: string) {
  return transaction(async (tx) => {
    const { ex, latest } = await loadForActor(tx, exchangeId, actorId);
    if (latest.authorId === actorId) throw new AppError("Use withdraw to take back your own proposal.");
    await transition(tx, ex.id, ["PROPOSED"], { status: "DECLINED" });
    await event(tx, ex.id, actorId, "proposal_declined", "", "Proposal declined.");
    await notify(tx, counterpart(ex, actorId), { type: "proposal_declined", title: "A proposal was declined", href: `/exchanges/${ex.id}` });
  });
}

export async function withdraw(actorId: string, exchangeId: string) {
  return transaction(async (tx) => {
    const { ex } = await loadForActor(tx, exchangeId, actorId);
    await transition(tx, ex.id, ["PROPOSED"], { status: "WITHDRAWN" });
    await event(tx, ex.id, actorId, "proposal_withdrawn", "", "Proposal withdrawn.");
  });
}

// ── Booked sessions ────────────────────────────────────────────────────

export async function start(actorId: string, exchangeId: string) {
  return transaction(async (tx) => {
    const { ex } = await loadForActor(tx, exchangeId, actorId);
    await transition(tx, ex.id, ["ACCEPTED"], { status: "IN_PROGRESS" });
    await event(tx, ex.id, actorId, "session_started", "", "Session started.");
  });
}

/** Cancellation before work begins releases the full reservation exactly once. */
export async function cancel(actorId: string, exchangeId: string, reason: string) {
  return transaction(async (tx) => {
    const { ex } = await loadForActor(tx, exchangeId, actorId);
    if (ex.status === "IN_PROGRESS" || ex.status === "DELIVERED")
      throw new AppError("Work has started. Agree a partial amount or open a dispute instead.");
    await transition(tx, ex.id, ["ACCEPTED"], { status: "CANCELLED", cancelledAt: new Date(), cancelReason: reason.slice(0, 300), refunded: ex.reserved, reserved: 0 });
    await ledger.refund(tx, {
      communityId: ex.communityId, payerId: ex.requesterId, amount: ex.reserved, exchangeId: ex.id,
      actorId, key: `cancel-refund:${ex.id}`, reason: "Cancelled before work began",
    });
    await tx.listing.updateMany({ where: { id: ex.listingId, status: "PAUSED" }, data: { status: "OPEN" } });
    await event(tx, ex.id, actorId, "exchange_cancelled", reason, `Session cancelled. ${ex.reserved} coins returned to the requester.`);
    await notify(tx, counterpart(ex, actorId), { type: "exchange_cancelled", title: "A session was cancelled", href: `/exchanges/${ex.id}` });
  });
}

/** Rescheduling of a booked session needs both members' agreement; stored on a new version. */
export async function proposeReschedule(actorId: string, exchangeId: string, scheduledAt: Date) {
  if (scheduledAt.getTime() < Date.now()) throw new AppError("Choose a time in the future.");
  return transaction(async (tx) => {
    const { ex } = await loadForActor(tx, exchangeId, actorId);
    if (ex.status !== "ACCEPTED") throw new AppError("Only booked sessions that haven't started can be rescheduled.");
    const current = await tx.proposalVersion.findUniqueOrThrow({ where: { id: ex.acceptedVersionId! } });
    const last = await tx.proposalVersion.findFirstOrThrow({ where: { exchangeId }, orderBy: { version: "desc" } });
    const { id: _id, createdAt: _c, version: _v, authorId: _a, ...rest } = current;
    await tx.proposalVersion.create({ data: { ...rest, version: last.version + 1, authorId: actorId, scheduledAt, note: "Reschedule request" } });
    await event(tx, ex.id, actorId, "reschedule_proposed", scheduledAt.toISOString(), "New time suggested. The current booking stays in place until it's accepted.");
    await notify(tx, counterpart(ex, actorId), { type: "reschedule_proposed", title: "A new session time was suggested", href: `/exchanges/${ex.id}` });
  });
}

export async function acceptReschedule(actorId: string, exchangeId: string, version: number) {
  return transaction(async (tx) => {
    const { ex, latest } = await loadForActor(tx, exchangeId, actorId);
    if (ex.status !== "ACCEPTED" || latest.id === ex.acceptedVersionId) throw new AppError("There's no pending reschedule.");
    if (latest.version !== version) throw new AppError("The suggestion changed. Review it again.", "CONFLICT");
    if (latest.authorId === actorId) throw new AppError("The other member needs to accept your suggested time.");
    await tx.exchange.update({ where: { id: ex.id }, data: { acceptedVersionId: latest.id } });
    await event(tx, ex.id, actorId, "reschedule_accepted", "", "New time agreed.");
    await notify(tx, counterpart(ex, actorId), { type: "reschedule_accepted", title: "Your new session time was accepted", href: `/exchanges/${ex.id}` });
  });
}

/** Helper reports delivery. Coins do not move until the recipient confirms. */
export async function markDelivered(actorId: string, exchangeId: string) {
  return transaction(async (tx) => {
    const { ex } = await loadForActor(tx, exchangeId, actorId);
    if (ex.helperId !== actorId) throw new AppError("Only the helper can mark help as delivered.");
    await transition(tx, ex.id, ["ACCEPTED", "IN_PROGRESS"], { status: "DELIVERED", deliveredAt: new Date() });
    await event(tx, ex.id, actorId, "service_delivered", "", "Helper marked this as delivered. Waiting for confirmation.");
    await notify(tx, ex.requesterId, {
      type: "service_delivered",
      title: "Please confirm the help you received",
      body: "Confirm to release the reserved coins, or tell us what went wrong.",
      href: `/exchanges/${ex.id}`,
    });
  });
}

/** Recipient confirms: reserved coins transfer to the helper, once. */
export async function confirmCompletion(actorId: string, exchangeId: string) {
  return transaction(async (tx) => {
    const { ex } = await loadForActor(tx, exchangeId, actorId);
    if (ex.requesterId !== actorId) throw new AppError("Only the member who received help can confirm it.");
    if (ex.status === "COMPLETED") return { replayed: true };
    const amount = ex.reserved;
    await transition(tx, ex.id, ["DELIVERED"], { status: "COMPLETED", completedAt: new Date(), settled: amount, reserved: 0 });
    await ledger.settle(tx, {
      communityId: ex.communityId, payerId: ex.requesterId, payeeId: ex.helperId, amount, exchangeId: ex.id,
      actorId, key: `settle:${ex.id}`, reason: "Help confirmed by recipient",
    });
    await event(tx, ex.id, actorId, "coins_settled", String(amount), `Completed. ${amount} coins sent to the helper.`);
    await notify(tx, ex.helperId, {
      type: "coins_settled", title: `You received ${amount} coins`, body: "For helping with a session", href: `/coins`, category: "COINS",
    });
    return { replayed: false };
  });
}

// ── Partial delivery & disputes ────────────────────────────────────────

/** Either party proposes a partial amount for the helper; the other must approve the same amount. */
export async function proposePartial(actorId: string, exchangeId: string, amount: number) {
  return transaction(async (tx) => {
    const { ex } = await loadForActor(tx, exchangeId, actorId);
    if (!["IN_PROGRESS", "DELIVERED", "DISPUTED"].includes(ex.status)) throw new AppError("Partial settlement applies after work has started.");
    if (!Number.isInteger(amount) || amount < 0 || amount > ex.reserved)
      throw new AppError(`Choose a whole number between 0 and ${ex.reserved}.`);
    const byReq = ex.requesterId === actorId;
    await tx.exchange.update({ where: { id: ex.id }, data: { partialAmount: amount, partialByReq: byReq, partialByHelper: !byReq } });
    await event(tx, ex.id, actorId, "partial_proposed", String(amount), `Partial settlement suggested: ${amount} of ${ex.reserved} coins to the helper.`);
    await notify(tx, counterpart(ex, actorId), { type: "partial_proposed", title: "A partial settlement was suggested", href: `/exchanges/${ex.id}` });
  });
}

export async function approvePartial(actorId: string, exchangeId: string, amount: number) {
  return transaction(async (tx) => {
    const { ex } = await loadForActor(tx, exchangeId, actorId);
    if (ex.partialAmount === null || ex.partialAmount !== amount) throw new AppError("The suggested amount changed. Review it again.", "CONFLICT");
    const byReq = ex.requesterId === actorId;
    if ((byReq && ex.partialByReq) || (!byReq && ex.partialByHelper)) throw new AppError("Waiting for the other member to approve.");
    await settleSplit(tx, ex, amount, actorId, "partial", "Partial delivery agreed by both members");
    await tx.exchange.update({ where: { id: ex.id }, data: { partialByReq: true, partialByHelper: true } });
    await event(tx, ex.id, actorId, "partial_settled", String(amount), `Both agreed: ${amount} coins to the helper, ${ex.reserved - amount} returned.`);
    await notify(tx, counterpart(ex, actorId), { type: "partial_settled", title: "Partial settlement completed", href: `/exchanges/${ex.id}`, category: "COINS" });
  });
}

/** Settles `toHelper` and refunds the rest of the hold. Settlement + refund always equals the held amount. */
async function settleSplit(tx: Tx, ex: { id: string; communityId: string; requesterId: string; helperId: string; reserved: number; status: string }, toHelper: number, actorId: string, keyPrefix: string, reason: string) {
  const held = ex.reserved;
  if (toHelper < 0 || toHelper > held) throw new AppError(`Settlement must be between 0 and ${held}.`);
  await transition(tx, ex.id, ["IN_PROGRESS", "DELIVERED", "DISPUTED"], {
    status: "RESOLVED", completedAt: new Date(), settled: toHelper, refunded: held - toHelper, reserved: 0,
  });
  if (toHelper > 0)
    await ledger.settle(tx, { communityId: ex.communityId, payerId: ex.requesterId, payeeId: ex.helperId, amount: toHelper, exchangeId: ex.id, actorId, key: `${keyPrefix}-settle:${ex.id}`, reason });
  if (held - toHelper > 0)
    await ledger.refund(tx, { communityId: ex.communityId, payerId: ex.requesterId, amount: held - toHelper, exchangeId: ex.id, actorId, key: `${keyPrefix}-refund:${ex.id}`, reason });
}

export async function openDispute(actorId: string, exchangeId: string, category: string, explanation: string) {
  return transaction(async (tx) => {
    const { ex } = await loadForActor(tx, exchangeId, actorId);
    await transition(tx, ex.id, ["ACCEPTED", "IN_PROGRESS", "DELIVERED"], { status: "DISPUTED" });
    const report = await tx.report.create({
      data: { ref: await nextRef(tx, "CASE"), reporterId: actorId, targetType: "EXCHANGE", targetId: ex.id, category, explanation: explanation.slice(0, 1000) },
    });
    await event(tx, ex.id, actorId, "dispute_opened", report.ref, `A review was requested (${report.ref}). Reserved coins stay held until it's resolved.`);
    await notify(tx, counterpart(ex, actorId), { type: "dispute_opened", title: "A session is under review", body: "Reserved coins are held until resolved.", href: `/exchanges/${ex.id}`, category: "SAFETY" });
    return report;
  });
}

/** Moderator resolution: records evidence and reason; settlement + refund equals the held amount. */
export async function moderatorResolve(modId: string, exchangeId: string, toHelper: number, reason: string, evidence: string) {
  return transaction(async (tx) => {
    const mod = await tx.account.findUniqueOrThrow({ where: { id: modId } });
    if (!["MODERATOR", "ADMIN"].includes(mod.role)) throw forbidden();
    const ex = await tx.exchange.findUnique({ where: { id: exchangeId } });
    if (!ex) throw notFound("Exchange");
    if (ex.requesterId === modId || ex.helperId === modId) throw new AppError("You can't resolve an exchange you're part of.");
    if (!["DISPUTED", "DELIVERED", "IN_PROGRESS"].includes(ex.status)) throw new AppError("Only held exchanges can be resolved.");
    if (!reason.trim()) throw new AppError("Record the reason for this decision.");

    await settleSplit(tx, ex, toHelper, modId, "mod", `Moderator decision: ${reason}`);
    await audit(tx, { actorId: modId, action: "exchange_resolved", targetType: "Exchange", targetId: ex.id, data: { held: ex.reserved, toHelper, refunded: ex.reserved - toHelper, reason, evidence } });
    await tx.report.updateMany({
      where: { targetType: "EXCHANGE", targetId: ex.id, status: { in: ["OPEN", "IN_REVIEW"] } },
      data: { status: "RESOLVED", resolution: reason, resolvedAt: new Date(), assigneeId: modId },
    });
    const msg = `Resolved by a moderator: ${toHelper} coins to the helper, ${ex.reserved - toHelper} returned. You can appeal from Settings → My support cases.`;
    await event(tx, ex.id, modId, "moderator_resolved", String(toHelper), msg);
    for (const id of [ex.requesterId, ex.helperId])
      await notify(tx, id, { type: "moderator_resolved", title: "Your session review was resolved", href: `/exchanges/${ex.id}`, category: "SAFETY" });
  });
}

// ── Background sweeps (run lazily on page loads and by cron in production) ─

export async function sweep(now = new Date()) {
  await transaction(async (tx) => {
    await tx.exchange.updateMany({ where: { status: "PROPOSED", expiresAt: { lt: now } }, data: { status: "EXPIRED" } });

    // No automatic success: remind at 24h/72h, then flag for human review at 7 days.
    const waiting = await tx.exchange.findMany({ where: { status: "DELIVERED", flaggedAt: null } });
    for (const ex of waiting) {
      const age = now.getTime() - ex.deliveredAt!.getTime();
      if (age >= CONFIRM_FLAG_DAYS * DAY) {
        await tx.exchange.update({ where: { id: ex.id }, data: { flaggedAt: now } });
        await tx.report.create({
          data: { ref: await nextRef(tx, "CASE"), reporterId: ex.helperId, targetType: "EXCHANGE", targetId: ex.id, category: "No confirmation after 7 days", explanation: "Automatically flagged: the recipient hasn't confirmed or disputed delivery." },
        });
        await event(tx, ex.id, null, "flagged_for_review", "", "No confirmation after 7 days, so a moderator will review this. Coins stay held.");
      } else if (ex.remindersSent < CONFIRM_REMINDER_HOURS.length && age >= CONFIRM_REMINDER_HOURS[ex.remindersSent] * HOUR) {
        await tx.exchange.update({ where: { id: ex.id }, data: { remindersSent: { increment: 1 } } });
        await notify(tx, ex.requesterId, { type: "confirm_reminder", title: "Reminder: confirm the help you received", href: `/exchanges/${ex.id}` });
      }
    }
  });
}

function counterpart(ex: { requesterId: string; helperId: string }, actorId: string) {
  return ex.requesterId === actorId ? ex.helperId : ex.requesterId;
}
