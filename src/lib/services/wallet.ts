import { db } from "@/lib/db";
import { getOrCreateMemberAccount } from "./ledger";

export type Activity = {
  id: string;
  type: string;
  createdAt: Date;
  title: string;
  /** Change to total holdings (available + reserved). Reserve/release are 0. */
  net: number;
  availableDelta: number;
  reservedDelta: number;
  exchangeId: string | null;
  counterpart: { displayName: string; avatar: string } | null;
};

const TYPE_TITLE: Record<string, string> = {
  STARTER_GRANT: "Starter coins",
  RESERVE: "Coins reserved",
  REFUND: "Reserved coins returned",
  SETTLE: "Help settled",
  CORRECTION: "Correction",
};

/** The member's private coin history. Only ever queried for the signed-in owner. */
export async function walletActivity(communityId: string, accountId: string, take = 50): Promise<{ available: number; reserved: number; items: Activity[] }> {
  const acct = await getOrCreateMemberAccount(db, communityId, accountId);
  const txs = await db.ledgerTransaction.findMany({
    where: { entries: { some: { coinAccountId: acct.id } } },
    include: { entries: true },
    orderBy: { createdAt: "desc" },
    take,
  });
  const exIds = txs.map((t) => t.exchangeId).filter((x): x is string => !!x);
  const exchanges = await db.exchange.findMany({
    where: { id: { in: exIds } },
    include: { listing: true, requester: { include: { profile: true } }, helper: { include: { profile: true } } },
  });

  const items = txs.map((t) => {
    const mine = t.entries.filter((e) => e.coinAccountId === acct.id);
    const availableDelta = mine.filter((e) => e.bucket === "AVAILABLE").reduce((s, e) => s + e.amount, 0);
    const reservedDelta = mine.filter((e) => e.bucket === "RESERVED").reduce((s, e) => s + e.amount, 0);
    const ex = exchanges.find((e) => e.id === t.exchangeId);
    const other = ex ? (ex.requesterId === accountId ? ex.helper : ex.requester) : null;
    return {
      id: t.id,
      type: t.type,
      createdAt: t.createdAt,
      title: ex?.listing.title ?? TYPE_TITLE[t.type] ?? t.type,
      net: availableDelta + reservedDelta,
      availableDelta,
      reservedDelta,
      exchangeId: t.exchangeId,
      counterpart: other?.profile ? { displayName: other.profile.displayName, avatar: other.profile.avatar } : null,
    };
  });
  return { available: acct.available, reserved: acct.reserved, items };
}

export function activityLabel(a: Activity) {
  if (a.type === "STARTER_GRANT") return "One-time community welcome";
  if (a.type === "RESERVE") return `${a.reservedDelta} reserved`;
  if (a.type === "REFUND") return `${a.availableDelta} returned to available`;
  if (a.type === "SETTLE") return a.net > 0 ? "You provided help" : "You received help";
  return TYPE_TITLE[a.type] ?? a.type;
}
