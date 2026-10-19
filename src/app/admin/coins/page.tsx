import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { reconcile } from "@/lib/services/ledger";
import { Note } from "@/components/ui";
import { Transactions } from "./transactions";

export const metadata = { title: "Coins" };

const PAGE = 40;
const TYPES = ["STARTER_GRANT", "RESERVE", "RELEASE", "SETTLE", "REFUND", "CORRECTION"];

export default async function AdminCoins({ searchParams }: { searchParams: Promise<{ community?: string; type?: string; page?: string }> }) {
  await requireRole(["ADMIN", "COIN_ADMIN"]);
  const { community = "", type = "", page = "1" } = await searchParams;
  const p = Math.max(1, Number(page) || 1);
  const communities = await db.community.findMany({ orderBy: { createdAt: "asc" } });
  const recons = await Promise.all(communities.map((c) => reconcile(c.id)));
  const where = { ...(type && { type }), ...(community && { entries: { some: { coinAccount: { communityId: community } } } }) };
  const [txns, total] = await Promise.all([
    db.ledgerTransaction.findMany({
      where,
      include: { entries: { include: { coinAccount: { include: { account: { include: { profile: true } } } } } } },
      orderBy: { createdAt: "desc" },
      skip: (p - 1) * PAGE,
      take: PAGE,
    }),
    db.ledgerTransaction.count({ where }),
  ]);
  const reversed = new Set((await db.ledgerTransaction.findMany({ where: { reversesId: { in: txns.map((t) => t.id) } }, select: { reversesId: true } })).map((t) => t.reversesId!));
  const qs = (over: Record<string, string>) => new URLSearchParams({ community, type, ...over }).toString();

  return (
    <div className="space-y-6">
      <section className="grid gap-2 sm:grid-cols-2">
        {communities.map((c, i) => (
          <div key={c.id} className={`card p-4 ${recons[i].ok ? "" : "border-2 border-minus"}`}>
            <p className="font-extrabold">{c.name} {recons[i].ok ? "✓" : "⚠"}</p>
            <p className="text-[13px] text-ink-soft">Issued {recons[i].totals.issued} of {c.starterAllocation} · available {recons[i].totals.available} · held {recons[i].totals.reserved} · transferred {recons[i].totals.transferred}</p>
            {recons[i].problems.slice(0, 3).map((pr) => <p key={pr} className="text-[12px] text-minus">{pr}</p>)}
          </div>
        ))}
      </section>

      <section>
        <form className="mb-3 flex flex-wrap gap-2">
          <select name="community" defaultValue={community} aria-label="Community" className="field w-auto">
            <option value="">All communities</option>
            {communities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select name="type" defaultValue={type} aria-label="Type" className="field w-auto">
            <option value="">All types</option>
            {TYPES.map((t) => <option key={t} value={t}>{t.toLowerCase().replace("_", " ")}</option>)}
          </select>
          <button className="btn-primary">Filter</button>
        </form>
        <p className="mb-2 text-[13px] text-muted">{total} transaction{total === 1 ? "" : "s"} · open one to see details or post a reversal</p>
        <Transactions txns={txns} reversed={reversed} canReverse />
        {total > PAGE && (
          <div className="mt-3 flex justify-between">
            {p > 1 ? <Link href={`?${qs({ page: String(p - 1) })}`} className="btn-secondary btn-sm">← Newer</Link> : <span />}
            {p * PAGE < total && <Link href={`?${qs({ page: String(p + 1) })}`} className="btn-secondary btn-sm">Older →</Link>}
          </div>
        )}
      </section>

      <Note icon="lock">Balances are never edited. A correction posts mirror entries that undo the original, records your reason, and shows up in the audit log. Coins held by an open exchange can only be moved by resolving that exchange.</Note>
    </div>
  );
}
