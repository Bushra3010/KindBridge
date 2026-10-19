// Append-only, double-entry help-coin ledger (PRD §7).
//
// Every operation is a LedgerTransaction whose entries sum to zero across
// accounts/buckets. Balances on HelpCoinAccount are a cache updated in the same
// database transaction; reconcile() proves they match the entries. Member
// buckets can never go negative: debits use a conditional update, so a
// concurrent overspend fails instead of racing.

import { db, type Tx } from "@/lib/db";
import { AppError, InsufficientBalanceError, notFound } from "@/lib/errors";
import { ACTIVE_EXCHANGE_STATUSES } from "@/lib/constants";
import { audit } from "./support";

export type Bucket = "AVAILABLE" | "RESERVED";
export type LedgerType = "STARTER_GRANT" | "RESERVE" | "RELEASE" | "SETTLE" | "REFUND" | "CORRECTION";

type Leg = { coinAccountId: string; bucket: Bucket; amount: number };

type PostInput = {
  key: string;
  type: LedgerType;
  actorId: string | null;
  exchangeId?: string | null;
  reason: string;
  reversesId?: string | null;
  legs: Leg[];
};

export async function getOrCreateMemberAccount(tx: Tx, communityId: string, accountId: string) {
  const existing = await tx.helpCoinAccount.findUnique({
    where: { communityId_accountId: { communityId, accountId } },
  });
  if (existing) return existing;
  return tx.helpCoinAccount.create({ data: { communityId, accountId, kind: "MEMBER" } });
}

export async function getIssuanceAccount(tx: Tx, communityId: string) {
  const existing = await tx.helpCoinAccount.findFirst({ where: { communityId, kind: "ISSUANCE" } });
  if (existing) return existing;
  return tx.helpCoinAccount.create({ data: { communityId, kind: "ISSUANCE" } });
}

/**
 * Posts a balanced transaction. Replaying the same idempotency key returns the
 * original transaction without moving coins again.
 */
export async function post(tx: Tx, input: PostInput) {
  const prior = await tx.ledgerTransaction.findUnique({ where: { idempotencyKey: input.key } });
  if (prior) return { transaction: prior, replayed: true };

  const legs = input.legs.filter((l) => l.amount !== 0);
  if (legs.length < 2) throw new AppError("A ledger transaction needs at least two entries.");
  if (legs.some((l) => !Number.isInteger(l.amount))) throw new AppError("Coin amounts must be whole numbers.");
  if (legs.reduce((s, l) => s + l.amount, 0) !== 0) throw new AppError("Ledger transaction is unbalanced.");

  // Debits first so an insufficient balance aborts before any credit lands.
  const ordered = [...legs].sort((a, b) => a.amount - b.amount);
  for (const leg of ordered) await applyLeg(tx, leg);

  const transaction = await tx.ledgerTransaction.create({
    data: {
      idempotencyKey: input.key,
      type: input.type,
      actorId: input.actorId,
      exchangeId: input.exchangeId ?? null,
      reason: input.reason,
      reversesId: input.reversesId ?? null,
      entries: { create: legs.map((l) => ({ coinAccountId: l.coinAccountId, bucket: l.bucket, amount: l.amount })) },
    },
  });
  return { transaction, replayed: false };
}

async function applyLeg(tx: Tx, leg: Leg) {
  const field = leg.bucket === "AVAILABLE" ? "available" : "reserved";
  const account = await tx.helpCoinAccount.findUniqueOrThrow({ where: { id: leg.coinAccountId } });

  if (leg.amount > 0 || account.kind === "ISSUANCE") {
    await tx.helpCoinAccount.update({
      where: { id: leg.coinAccountId },
      data: { [field]: { increment: leg.amount } },
    });
    return;
  }

  const debit = -leg.amount;
  const { count } = await tx.helpCoinAccount.updateMany({
    where: { id: leg.coinAccountId, [field]: { gte: debit } },
    data: { [field]: { decrement: debit } },
  });
  if (count === 0) {
    if (leg.bucket === "AVAILABLE") throw new InsufficientBalanceError(debit, account.available);
    throw new AppError("Reserved balance is lower than the amount being released.", "LEDGER_INVARIANT");
  }
}

// ── Domain operations ──────────────────────────────────────────────────

export async function reserve(tx: Tx, p: { communityId: string; payerId: string; amount: number; exchangeId: string; actorId: string }) {
  const acct = await getOrCreateMemberAccount(tx, p.communityId, p.payerId);
  return post(tx, {
    key: `reserve:${p.exchangeId}`,
    type: "RESERVE",
    actorId: p.actorId,
    exchangeId: p.exchangeId,
    reason: "Coins reserved for accepted exchange",
    legs: [
      { coinAccountId: acct.id, bucket: "AVAILABLE", amount: -p.amount },
      { coinAccountId: acct.id, bucket: "RESERVED", amount: p.amount },
    ],
  });
}

export async function settle(
  tx: Tx,
  p: { communityId: string; payerId: string; payeeId: string; amount: number; exchangeId: string; actorId: string | null; key: string; reason: string },
) {
  const payer = await getOrCreateMemberAccount(tx, p.communityId, p.payerId);
  const payee = await getOrCreateMemberAccount(tx, p.communityId, p.payeeId);
  return post(tx, {
    key: p.key,
    type: "SETTLE",
    actorId: p.actorId,
    exchangeId: p.exchangeId,
    reason: p.reason,
    legs: [
      { coinAccountId: payer.id, bucket: "RESERVED", amount: -p.amount },
      { coinAccountId: payee.id, bucket: "AVAILABLE", amount: p.amount },
    ],
  });
}

export async function refund(
  tx: Tx,
  p: { communityId: string; payerId: string; amount: number; exchangeId: string; actorId: string | null; key: string; reason: string },
) {
  const acct = await getOrCreateMemberAccount(tx, p.communityId, p.payerId);
  return post(tx, {
    key: p.key,
    type: "REFUND",
    actorId: p.actorId,
    exchangeId: p.exchangeId,
    reason: p.reason,
    legs: [
      { coinAccountId: acct.id, bucket: "RESERVED", amount: -p.amount },
      { coinAccountId: acct.id, bucket: "AVAILABLE", amount: p.amount },
    ],
  });
}

export async function starterGrant(tx: Tx, p: { communityId: string; accountId: string; amount: number; actorId: string | null }) {
  const issuance = await getIssuanceAccount(tx, p.communityId);
  const member = await getOrCreateMemberAccount(tx, p.communityId, p.accountId);
  return post(tx, {
    key: `starter:${p.communityId}:${p.accountId}`,
    type: "STARTER_GRANT",
    actorId: p.actorId,
    reason: "One-time starter grant",
    legs: [
      { coinAccountId: issuance.id, bucket: "AVAILABLE", amount: -p.amount },
      { coinAccountId: member.id, bucket: "AVAILABLE", amount: p.amount },
    ],
  });
}

/** Reverses a prior transaction with mirror entries. Requires a COIN_ADMIN actor (checked by caller). */
export async function reverse(tx: Tx, p: { transactionId: string; actorId: string; reason: string }) {
  const original = await tx.ledgerTransaction.findUniqueOrThrow({ where: { id: p.transactionId }, include: { entries: true } });
  return post(tx, {
    key: `reverse:${original.id}`,
    type: "CORRECTION",
    actorId: p.actorId,
    exchangeId: original.exchangeId,
    reason: p.reason,
    reversesId: original.id,
    legs: original.entries.map((e) => ({ coinAccountId: e.coinAccountId, bucket: e.bucket as Bucket, amount: -e.amount })),
  });
}

/**
 * An audited coin correction: reverses a transaction unless it was already
 * reversed or its coins still belong to an open exchange (resolve that instead).
 */
export async function correct(tx: Tx, p: { transactionId: string; actorId: string; reason: string }) {
  const original = await tx.ledgerTransaction.findUnique({ where: { id: p.transactionId } });
  if (!original) throw notFound("Transaction");
  if (await tx.ledgerTransaction.count({ where: { reversesId: original.id } })) throw new AppError("That transaction has already been reversed.");
  const ex = original.exchangeId ? await tx.exchange.findUnique({ where: { id: original.exchangeId } }) : null;
  if (ex && ["PROPOSED", ...ACTIVE_EXCHANGE_STATUSES].includes(ex.status)) throw new AppError(`Exchange ${ex.ref} is still open. Resolve it from moderation before correcting its coins.`);
  const r = await reverse(tx, { transactionId: original.id, actorId: p.actorId, reason: p.reason });
  await audit(tx, { actorId: p.actorId, action: "ledger_reversed", targetType: "LedgerTransaction", targetId: original.id, data: { reason: p.reason, reversal: r.transaction.id } });
  return r;
}

/** Total coins starter-granted in a community, from ledger entries (not a counter). */
export async function issuedStarterTotal(tx: Tx, communityId: string) {
  const issuance = await getIssuanceAccount(tx, communityId);
  const agg = await tx.ledgerEntry.aggregate({
    where: { coinAccountId: issuance.id, transaction: { type: "STARTER_GRANT" } },
    _sum: { amount: true },
  });
  return -(agg._sum.amount ?? 0);
}

// ── Reconciliation (PRD §7, §17.12) ────────────────────────────────────

export type ReconcileReport = {
  ok: boolean;
  problems: string[];
  totals: { issued: number; available: number; reserved: number; transferred: number };
};

export async function reconcile(communityId?: string): Promise<ReconcileReport> {
  const problems: string[] = [];
  const [accounts, sums, unbalanced, transferredAgg] = await Promise.all([
    db.helpCoinAccount.findMany({ where: communityId ? { communityId } : {}, select: { id: true, kind: true, available: true, reserved: true } }),
    db.ledgerEntry.groupBy({
    by: ["coinAccountId", "bucket"],
    _sum: { amount: true },
    where: communityId ? { coinAccount: { communityId } } : {},
    }),
    db.ledgerEntry.groupBy({
      by: ["transactionId"],
      where: communityId ? { coinAccount: { communityId } } : {},
      having: { amount: { _sum: { not: 0 } } },
    }),
    db.ledgerEntry.aggregate({
      where: { amount: { gt: 0 }, transaction: { type: "SETTLE" }, ...(communityId ? { coinAccount: { communityId } } : {}) },
      _sum: { amount: true },
    }),
  ]);
  const balances = new Map(sums.map(s => [`${s.coinAccountId}:${s.bucket}`, s._sum.amount ?? 0]));
  const sumOf = (id: string, bucket: Bucket) => balances.get(`${id}:${bucket}`) ?? 0;

  let issued = 0, available = 0, reserved = 0;
  for (const a of accounts) {
    const av = sumOf(a.id, "AVAILABLE"), rs = sumOf(a.id, "RESERVED");
    if (av !== a.available || rs !== a.reserved)
      problems.push(`Account ${a.id}: cached ${a.available}/${a.reserved} ≠ ledger ${av}/${rs}`);
    if (a.kind === "MEMBER") {
      if (a.available < 0 || a.reserved < 0) problems.push(`Account ${a.id} has a negative balance`);
      available += a.available;
      reserved += a.reserved;
    } else issued += -(a.available + a.reserved);
  }
  if (issued !== available + reserved) problems.push(`Issued ${issued} ≠ member holdings ${available + reserved}`);

  for (const u of unbalanced) problems.push(`Transaction ${u.transactionId} is unbalanced`);

  return {
    ok: problems.length === 0,
    problems,
    totals: { issued, available, reserved, transferred: transferredAgg._sum.amount ?? 0 },
  };
}
