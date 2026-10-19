import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { AuditRows, actorNames } from "./rows";

export const metadata = { title: "Audit log" };

const PAGE = 50;

export default async function AdminAudit({ searchParams }: { searchParams: Promise<{ action?: string; target?: string; page?: string }> }) {
  await requireRole(["ADMIN", "COIN_ADMIN"]);
  const { action = "", target = "", page = "1" } = await searchParams;
  const p = Math.max(1, Number(page) || 1);
  const where = { ...(action && { action }), ...(target && { targetType: target }) };
  const [events, total, actions, targets] = await Promise.all([
    db.auditEvent.findMany({ where, orderBy: { createdAt: "desc" }, skip: (p - 1) * PAGE, take: PAGE }),
    db.auditEvent.count({ where }),
    db.auditEvent.findMany({ distinct: ["action"], select: { action: true }, orderBy: { action: "asc" } }),
    db.auditEvent.findMany({ distinct: ["targetType"], select: { targetType: true }, orderBy: { targetType: "asc" } }),
  ]);
  const names = await actorNames(events);
  const qs = (over: Record<string, string>) => new URLSearchParams({ action, target, ...over }).toString();

  return (
    <div>
      <form className="mb-3 flex flex-wrap gap-2">
        <select name="action" defaultValue={action} aria-label="Action" className="field w-auto">
          <option value="">All actions</option>
          {actions.map((a) => <option key={a.action} value={a.action}>{a.action.replaceAll("_", " ")}</option>)}
        </select>
        <select name="target" defaultValue={target} aria-label="Target" className="field w-auto">
          <option value="">All targets</option>
          {targets.map((t) => <option key={t.targetType}>{t.targetType}</option>)}
        </select>
        <button className="btn-primary">Filter</button>
      </form>
      <p className="mb-2 text-[13px] text-muted">{total} event{total === 1 ? "" : "s"}. The log is append-only.</p>
      <AuditRows events={events} names={names} />
      {total > PAGE && (
        <div className="mt-3 flex justify-between">
          {p > 1 ? <Link href={`?${qs({ page: String(p - 1) })}`} className="btn-secondary btn-sm">← Newer</Link> : <span />}
          {p * PAGE < total && <Link href={`?${qs({ page: String(p + 1) })}`} className="btn-secondary btn-sm">Older →</Link>}
        </div>
      )}
    </div>
  );
}
