import { transaction, type Tx } from "@/lib/db";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { audit } from "./support";

export const ROLES = ["MEMBER", "MODERATOR", "COIN_ADMIN", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

async function requireAdmin(tx: Tx, id: string) {
  const a = await tx.account.findUniqueOrThrow({ where: { id } });
  if (a.role !== "ADMIN") throw forbidden();
}

/** Platform role changes are ADMIN-only and audited. Admins can't change their own role. */
export async function setRole(adminId: string, accountId: string, role: Role, reason: string) {
  if (!ROLES.includes(role)) throw new AppError("Unknown role.");
  if (!reason) throw new AppError("Record a reason for the role change.");
  if (adminId === accountId) throw new AppError("Ask another admin to change your own role.");
  return transaction(async (tx) => {
    await requireAdmin(tx, adminId);
    const target = await tx.account.findUnique({ where: { id: accountId } });
    if (!target) throw notFound("Account");
    if (target.status === "CLOSED") throw new AppError("Closed accounts can't be given a role.");
    if (target.role === role) return;
    await tx.account.update({ where: { id: accountId }, data: { role } });
    await audit(tx, { actorId: adminId, action: "role_changed", targetType: "Account", targetId: accountId, data: { from: target.role, to: role, reason } });
  });
}

export type CommunityInput = { name: string; slug: string; description: string; inviteCode: string; joinPolicy: "APPROVAL" | "INVITE"; starterGrant: number; starterAllocation: number };

function checkCommunity(c: CommunityInput) {
  if (!c.name) throw new AppError("Give the community a name.");
  if (!/^[a-z0-9-]{2,40}$/.test(c.slug)) throw new AppError("Slug: 2–40 lowercase letters, numbers or dashes.");
  if (!/^[A-Z0-9]{4,20}$/.test(c.inviteCode)) throw new AppError("Invite code: 4–20 capital letters or numbers.");
  if (!Number.isInteger(c.starterGrant) || c.starterGrant < 0 || c.starterGrant > 200) throw new AppError("Starter grant must be 0–200 coins.");
  if (!Number.isInteger(c.starterAllocation) || c.starterAllocation < 0) throw new AppError("Starter allocation must be a whole number of coins.");
}

export async function saveCommunity(adminId: string, id: string | null, c: CommunityInput) {
  checkCommunity(c);
  return transaction(async (tx) => {
    await requireAdmin(tx, adminId);
    const clash = await tx.community.findFirst({ where: { OR: [{ slug: c.slug }, { inviteCode: c.inviteCode }], ...(id && { id: { not: id } }) } });
    if (clash) throw new AppError(clash.slug === c.slug ? "That slug is already used." : "That invite code is already used.");
    const saved = id ? await tx.community.update({ where: { id }, data: c }) : await tx.community.create({ data: c });
    await audit(tx, { actorId: adminId, action: id ? "community_updated" : "community_created", targetType: "Community", targetId: saved.id, data: c });
    return saved;
  });
}

// ── Blocking and deleting accounts ──────────────────────────────────────

const OPEN_EXCHANGE = ["PROPOSED", "ACCEPTED", "IN_PROGRESS", "DELIVERED", "DISPUTED"];

/**
 * Closes an account but keeps its ledger, exchange and case records (PRD §9):
 * the public profile is pseudonymized, private details and sessions are removed
 * and the email is released so it can sign up again.
 */
export async function closeAccountRecords(tx: Tx, accountId: string) {
  await tx.profile.updateMany({ where: { accountId }, data: { displayName: "Former member", username: `closed-${accountId}`, bio: "", paused: true } });
  await tx.privateContact.deleteMany({ where: { accountId } });
  await tx.customSkill.deleteMany({ where: { accountId } });
  await tx.disclosureGrant.updateMany({ where: { ownerId: accountId, revokedAt: null }, data: { revokedAt: new Date() } });
  await tx.listing.updateMany({ where: { ownerId: accountId, status: { in: ["OPEN", "PAUSED"] } }, data: { status: "CLOSED" } });
  await tx.account.update({ where: { id: accountId }, data: { status: "CLOSED", role: "MEMBER", email: `closed+${accountId}@kindbridge.invalid` } });
  await tx.session.deleteMany({ where: { accountId } });
}

/** Whether anything other people or the ledger depend on references this account. */
async function hasHistory(tx: Tx, accountId: string) {
  const counts = await Promise.all([
    tx.listing.count({ where: { ownerId: accountId } }),
    tx.exchange.count({ where: { OR: [{ requesterId: accountId }, { helperId: accountId }] } }),
    tx.message.count({ where: { senderId: accountId } }),
    tx.ledgerEntry.count({ where: { coinAccount: { accountId } } }),
    tx.disclosureGrant.count({ where: { OR: [{ ownerId: accountId }, { recipientId: accountId }] } }),
    tx.review.count({ where: { OR: [{ authorId: accountId }, { subjectId: accountId }] } }),
    tx.report.count({ where: { reporterId: accountId } }),
  ]);
  return counts.some((n) => n > 0);
}

/**
 * Admin deletion. An account with no activity is removed outright; one with
 * coin, exchange or case history is closed and pseudonymized instead so the
 * ledger stays balanced and auditable. Returns which of the two happened.
 */
export async function deleteAccount(adminId: string, accountId: string, reason: string): Promise<"deleted" | "closed"> {
  if (!reason) throw new AppError("Record a reason for deleting the account.");
  if (adminId === accountId) throw new AppError("You can't delete your own account from here.");
  return transaction(async (tx) => {
    await requireAdmin(tx, adminId);
    const target = await tx.account.findUnique({ where: { id: accountId } });
    if (!target) throw notFound("Account");
    if (target.status === "CLOSED") throw new AppError("That account is already deleted.");
    if (target.role === "ADMIN") throw new AppError("Remove the admin role before deleting this account.");
    const open = await tx.exchange.count({ where: { OR: [{ requesterId: accountId }, { helperId: accountId }], status: { in: OPEN_EXCHANGE } } });
    if (open) throw new AppError(`This member has ${open} open exchange${open === 1 ? "" : "s"} holding coins. Resolve or cancel ${open === 1 ? "it" : "them"} first.`);

    const label = target.email;
    let outcome: "deleted" | "closed";
    if (await hasHistory(tx, accountId)) {
      await closeAccountRecords(tx, accountId);
      outcome = "closed";
    } else {
      await tx.block.deleteMany({ where: { OR: [{ blockerId: accountId }, { blockedId: accountId }] } });
      await tx.helpCoinAccount.deleteMany({ where: { accountId } }); // empty wallets only (no entries)
      await tx.account.delete({ where: { id: accountId } }); // profile, sessions, memberships, skills, notifications cascade
      outcome = "deleted";
    }
    await audit(tx, { actorId: adminId, action: outcome === "deleted" ? "account_deleted" : "account_closed_by_admin", targetType: "Account", targetId: accountId, data: { reason, email: outcome === "deleted" ? label : undefined } });
    return outcome;
  });
}
