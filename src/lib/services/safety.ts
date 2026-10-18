import { transaction, type Tx } from "@/lib/db";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { audit, nextRef, notify } from "./support";

export async function isBlockedEitherWay(tx: Tx, a: string, b: string) {
  const n = await tx.block.count({ where: { OR: [{ blockerId: a, blockedId: b }, { blockerId: b, blockedId: a }] } });
  return n > 0;
}

/**
 * Blocking stops free-form messages and new proposals. Structured completion,
 * cancellation, reporting and dispute actions on existing exchanges remain.
 */
export async function block(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) throw new AppError("You can't block yourself.");
  return transaction(async (tx) => {
    await tx.block.upsert({ where: { blockerId_blockedId: { blockerId, blockedId } }, create: { blockerId, blockedId }, update: {} });
    await tx.exchange.updateMany({
      where: { status: "PROPOSED", OR: [{ requesterId: blockerId, helperId: blockedId }, { requesterId: blockedId, helperId: blockerId }] },
      data: { status: "WITHDRAWN" },
    });
  });
}

export async function unblock(blockerId: string, blockedId: string) {
  await transaction((tx) => tx.block.deleteMany({ where: { blockerId, blockedId } }));
}

export const REPORT_TARGETS = ["LISTING", "PROFILE", "MESSAGE", "REVIEW", "EXCHANGE", "OTHER"] as const;

/** Reporter identity is never shown to the reported member. */
export async function submitReport(reporterId: string, r: { targetType: string; targetId: string; category: string; explanation?: string }) {
  if (!REPORT_TARGETS.includes(r.targetType as (typeof REPORT_TARGETS)[number])) throw new AppError("Unknown report type.");
  return transaction(async (tx) => {
    const report = await tx.report.create({
      data: { ref: await nextRef(tx, "CASE"), reporterId, targetType: r.targetType, targetId: r.targetId || "-", category: r.category, explanation: (r.explanation ?? "").slice(0, 1000) },
    });
    await notify(tx, reporterId, { type: "report_submitted", title: `We received your report (${report.ref})`, body: "A moderator will triage it within one business day during support hours.", href: "/settings/cases", category: "SAFETY" });
    return report;
  });
}

async function requireModerator(tx: Tx, id: string) {
  const a = await tx.account.findUniqueOrThrow({ where: { id } });
  if (!["MODERATOR", "ADMIN"].includes(a.role)) throw forbidden();
}

export async function updateCase(modId: string, reportId: string, status: "IN_REVIEW" | "RESOLVED" | "DISMISSED", resolution?: string) {
  return transaction(async (tx) => {
    await requireModerator(tx, modId);
    const r = await tx.report.findUnique({ where: { id: reportId } });
    if (!r) throw notFound("Case");
    await tx.report.update({
      where: { id: r.id },
      data: { status, assigneeId: modId, resolution: resolution ?? r.resolution, resolvedAt: status === "IN_REVIEW" ? null : new Date() },
    });
    await audit(tx, { actorId: modId, action: `case_${status.toLowerCase()}`, targetType: "Report", targetId: r.id, data: { resolution } });
    if (status !== "IN_REVIEW")
      await notify(tx, r.reporterId, { type: "case_updated", title: `Your case ${r.ref} was ${status === "RESOLVED" ? "resolved" : "closed"}`, href: "/settings/cases", category: "SAFETY" });
  });
}

export async function removeListing(modId: string, listingId: string, reason: string) {
  return transaction(async (tx) => {
    await requireModerator(tx, modId);
    await tx.listing.update({ where: { id: listingId }, data: { status: "REMOVED" } });
    await audit(tx, { actorId: modId, action: "listing_removed", targetType: "Listing", targetId: listingId, data: { reason } });
  });
}

/** Restricting an account keeps its balances and exchange records intact (PRD §6.1). */
export async function setAccountStatus(modId: string, accountId: string, status: "ACTIVE" | "SUSPENDED", reason: string) {
  return transaction(async (tx) => {
    await requireModerator(tx, modId);
    await tx.account.update({ where: { id: accountId }, data: { status } });
    if (status === "SUSPENDED") await tx.session.deleteMany({ where: { accountId } });
    await audit(tx, { actorId: modId, action: `account_${status.toLowerCase()}`, targetType: "Account", targetId: accountId, data: { reason } });
  });
}
