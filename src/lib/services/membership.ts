import { db, transaction, type Tx } from "@/lib/db";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { issuedStarterTotal, starterGrant } from "./ledger";
import { audit, notify } from "./support";

/** Request membership. A valid invite code counts as organizer-confirmed invitation (PRD §6.1). */
export async function requestMembership(accountId: string, communityId: string, inviteCode?: string) {
  return transaction(async (tx) => {
    const community = await tx.community.findUnique({ where: { id: communityId } });
    if (!community) throw notFound("Community");

    const active = await tx.membership.findFirst({
      where: { accountId, status: { in: ["PENDING", "APPROVED"] } },
    });
    if (active && active.communityId !== communityId)
      throw new AppError("The pilot supports one community per account. Leave your current community first.");
    if (active) return active;

    const code = inviteCode?.trim().toUpperCase();
    const viaInvite = !!code && code === community.inviteCode;
    if (code && !viaInvite) throw new AppError("That invite code doesn't match this community.");
    if (community.joinPolicy === "INVITE" && !viaInvite)
      throw new AppError("This community is invitation-only. Ask your organizer for an invite code.");

    const membership = await tx.membership.upsert({
      where: { accountId_communityId: { accountId, communityId } },
      create: { accountId, communityId, viaInvite, status: viaInvite ? "APPROVED" : "PENDING", approvedAt: viaInvite ? new Date() : null },
      update: { viaInvite, status: viaInvite ? "APPROVED" : "PENDING", approvedAt: viaInvite ? new Date() : null },
    });

    if (viaInvite) await maybeGrantStarter(tx, membership.id);
    else {
      const organizers = await tx.membership.findMany({ where: { communityId, role: "ORGANIZER", status: "APPROVED" } });
      for (const o of organizers)
        await notify(tx, o.accountId, { type: "membership_requested", title: "New membership request", href: "/organizer", category: "COMMUNITY" });
    }
    return membership;
  });
}

const DEFAULT_SLUG = () => process.env.DEFAULT_COMMUNITY_SLUG || "kindbridge";

/**
 * The community every member belongs to. Members never pick one, so if none
 * exists yet (fresh database) it is created here with the standard coin
 * settings; admins can rename or adjust it in /admin → Communities.
 */
async function defaultCommunity() {
  const bySlug = await db.community.findUnique({ where: { slug: DEFAULT_SLUG() } });
  if (bySlug) return bySlug;
  const oldest = await db.community.findFirst({ orderBy: { createdAt: "asc" } });
  if (oldest) return oldest;
  const inviteCode = `KB${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  // upsert so two first signups racing each other end up in the same community.
  return db.community.upsert({
    where: { slug: DEFAULT_SLUG() },
    create: { name: "KindBridge", slug: DEFAULT_SLUG(), description: "Share skills, earn help coins and find support.", inviteCode, joinPolicy: "APPROVAL" },
    update: {},
  });
}

/**
 * Members don't choose or apply to a community: they're placed in the pilot
 * community (DEFAULT_COMMUNITY_SLUG, else the oldest one), approved at once and
 * given their starter coins. Returns null only for removed/declined members.
 */
export async function joinDefaultCommunity(accountId: string) {
  const community = await defaultCommunity();
  return transaction(async (tx) => {
    const key = { accountId_communityId: { accountId, communityId: community.id } };
    const existing = await tx.membership.findUnique({ where: key });
    // Someone a moderator removed or declined is never re-enrolled automatically.
    if (existing && existing.status !== "PENDING" && existing.status !== "APPROVED") return null;
    const membership =
      existing?.status === "APPROVED"
        ? existing
        : await tx.membership.upsert({
            where: key,
            create: { accountId, communityId: community.id, status: "APPROVED", approvedAt: new Date() },
            update: { status: "APPROVED", approvedAt: new Date() },
          });
    await maybeGrantStarter(tx, membership.id);
    return membership;
  });
}

export async function decideMembership(organizerId: string, membershipId: string, approve: boolean) {
  return transaction(async (tx) => {
    const m = await tx.membership.findUnique({ where: { id: membershipId } });
    if (!m) throw notFound("Membership");
    const org = await tx.membership.findUnique({
      where: { accountId_communityId: { accountId: organizerId, communityId: m.communityId } },
    });
    if (org?.role !== "ORGANIZER" || org.status !== "APPROVED") throw forbidden();
    if (m.status !== "PENDING") return m;

    const updated = await tx.membership.update({
      where: { id: m.id },
      data: approve
        ? { status: "APPROVED", approvedAt: new Date(), approvedById: organizerId }
        : { status: "REJECTED" },
    });
    await audit(tx, { actorId: organizerId, action: approve ? "membership_approved" : "membership_rejected", targetType: "Membership", targetId: m.id });
    await notify(tx, m.accountId, {
      type: approve ? "membership_approved" : "membership_rejected",
      title: approve ? "You're in! Your membership was approved." : "Your membership request wasn't approved.",
      href: "/home",
      category: "COMMUNITY",
    });
    if (approve) await maybeGrantStarter(tx, m.id);
    return updated;
  });
}

/**
 * One-time starter grant from the community's capped onboarding allocation.
 * Requires an approved membership, an active account, and a verified email.
 */
export async function maybeGrantStarter(tx: Tx, membershipId: string) {
  const m = await tx.membership.findUniqueOrThrow({ where: { id: membershipId }, include: { community: true, account: true } });
  if (m.status !== "APPROVED" || m.starterGranted || m.account.status !== "ACTIVE" || !m.account.emailVerifiedAt) return false;

  const issued = await issuedStarterTotal(tx, m.communityId);
  if (issued + m.community.starterGrant > m.community.starterAllocation) return false;

  // Claim the grant flag first; a concurrent attempt sees count 0 and stops.
  const { count } = await tx.membership.updateMany({ where: { id: m.id, starterGranted: false }, data: { starterGranted: true } });
  if (count === 0) return false;

  await starterGrant(tx, { communityId: m.communityId, accountId: m.accountId, amount: m.community.starterGrant, actorId: null });
  await notify(tx, m.accountId, {
    type: "starter_grant",
    title: `You received ${m.community.starterGrant} starter coins`,
    body: "Spend them on help from a neighbour.",
    href: "/coins",
    category: "COINS",
  });
  return true;
}

export async function activeMembership(tx: Tx, accountId: string) {
  return tx.membership.findFirst({
    where: { accountId, status: { in: ["PENDING", "APPROVED"] } },
    include: { community: true },
  });
}
