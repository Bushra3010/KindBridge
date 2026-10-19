import Link from "next/link";
import { db } from "@/lib/db";
import { reconcile } from "@/lib/services/ledger";
import { LocalTime } from "@/components/forms";
import { AuditRows, actorNames } from "./audit/rows";

export function OverviewPlaceholder({ label }: { label: string }) {
  return <div role="status" className="card p-5 text-sm text-muted"><span className="mr-2 inline-block size-2 rounded-full bg-teal-200" />Loading {label}…</div>;
}

export async function OverviewLedger() {
  const recon = await reconcile();
  return <section className={`card p-4 ${recon.ok ? "" : "border-2 border-minus"}`}>
    <div className="flex items-center justify-between gap-3"><h2 className="font-extrabold">Ledger {recon.ok ? "✓ balanced" : "⚠ problems found"}</h2><Link href="/admin/coins" className="text-[14px] font-bold text-teal-700">Coins →</Link></div>
    <p className="text-[14px] text-ink-soft">Issued {recon.totals.issued} · available {recon.totals.available} · held {recon.totals.reserved} · transferred {recon.totals.transferred}</p>
    {recon.problems.slice(0, 5).map(p => <p key={p} className="text-[13px] text-minus">{p}</p>)}
  </section>;
}

export async function OverviewStats({ isAdmin }: { isAdmin: boolean }) {
  const since = new Date(Date.now() - 7 * 86_400_000);
  const [accounts, communities, pending, openListings, exchanges, weekCompleted, openCases] = await Promise.all([
    db.account.groupBy({ by: ["status", "role"], _count: true }),
    db.community.count(),
    db.membership.count({ where: { status: "PENDING" } }),
    db.listing.count({ where: { status: "OPEN" } }),
    db.exchange.groupBy({ by: ["status"], _count: true }),
    db.exchange.count({ where: { status: "COMPLETED", completedAt: { gte: since } } }),
    db.report.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
  ]);
  const members = accounts.filter(a => a.status === "ACTIVE").reduce((n, a) => n + a._count, 0);
  const suspended = accounts.filter(a => a.status === "SUSPENDED").reduce((n, a) => n + a._count, 0);
  const staff = accounts.filter(a => a.status === "ACTIVE" && a.role !== "MEMBER").reduce((n, a) => n + a._count, 0);
  const byStatus = Object.fromEntries(exchanges.map(e => [e.status, e._count]));
  const active = ["PROPOSED", "ACCEPTED", "IN_PROGRESS", "DELIVERED"].reduce((n, s) => n + (byStatus[s] ?? 0), 0);
  const tiles: [string, number, string?][] = [
    ["Active accounts", members, isAdmin ? "/admin/members?status=ACTIVE" : undefined],
    ["Suspended", suspended, isAdmin ? "/admin/members?status=SUSPENDED" : undefined],
    ["Staff", staff, isAdmin ? "/admin/members?role=STAFF" : undefined],
    ["Communities", communities, isAdmin ? "/admin/communities" : undefined],
    ["Pending approvals", pending], ["Open listings", openListings],
    ["Exchanges in progress", active], ["Completed this week", weekCompleted],
    ["Disputed", byStatus.DISPUTED ?? 0, "/mod"], ["Open cases", openCases, "/mod"],
  ];
  return <section aria-label="Platform statistics" className="grid grid-cols-2 gap-3 lg:grid-cols-5">{tiles.map(([label, value, href]) => {
    const body = <><p className="text-[24px] font-extrabold">{value}</p><p className="text-[13px] text-muted">{label}</p></>;
    return href ? <Link key={label} href={href} className="card p-4 hover:bg-white">{body}</Link> : <div key={label} className="card p-4">{body}</div>;
  })}</section>;
}

export async function OverviewActivity() {
  const recent = await db.auditEvent.findMany({ orderBy: { createdAt: "desc" }, take: 8 });
  const names = await actorNames(recent);
  return <section><div className="mb-2 flex items-center justify-between"><h2 className="h-section">Recent audited activity</h2><Link href="/admin/audit" className="text-[14px] font-bold text-teal-700">All →</Link></div><AuditRows events={recent} names={names} /></section>;
}

export async function OverviewNewest({ isAdmin }: { isAdmin: boolean }) {
  const newest = await db.account.findMany({ where: { status: { not: "CLOSED" } }, select: { id: true, createdAt: true, profile: { select: { displayName: true } } }, orderBy: { createdAt: "desc" }, take: 5 });
  return <section><div className="mb-2 flex items-center justify-between"><h2 className="h-section">Newest accounts</h2>{isAdmin && <Link href="/admin/members" className="text-[14px] font-bold text-teal-700">All →</Link>}</div><div className="card divide-y divide-line">{newest.map(a => {
    const body = <><span className="flex-1 font-semibold">{a.profile?.displayName ?? "(no profile yet)"}</span><span className="text-[12px] text-muted"><LocalTime iso={a.createdAt.toISOString()} mode="relative" /></span></>;
    return isAdmin ? <Link key={a.id} href={`/admin/members/${a.id}`} prefetch={false} className="flex items-center gap-3 px-4 py-3 hover:bg-mist">{body}</Link> : <div key={a.id} className="flex items-center gap-3 px-4 py-3">{body}</div>;
  })}</div></section>;
}
