import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { reconcile } from "@/lib/services/ledger";
import { modUpdateCase } from "@/app/actions";
import { ActionForm, LocalTime, Submit } from "@/components/forms";
import { PageHeader, StatusPill } from "@/components/ui";

export const metadata = { title: "Moderation" };

export default async function Mod() {
  const me = await requireRole(["MODERATOR", "ADMIN", "COIN_ADMIN"]);
  const [cases, held, recon] = await Promise.all([
    db.report.findMany({ where: { status: { in: ["OPEN", "IN_REVIEW"] } }, orderBy: { createdAt: "asc" } }),
    db.exchange.findMany({ where: { status: { in: ["DISPUTED", "DELIVERED"] } }, include: { listing: true }, orderBy: { updatedAt: "asc" } }),
    reconcile(),
  ]);
  const overdue = held.filter((e) => e.status === "DELIVERED" && e.flaggedAt);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-4">
      <PageHeader title="Moderation" back="/profile" subtitle={`Signed in as ${me.role.toLowerCase().replace("_", " ")}`} />
      <section className={`card mb-6 p-4 ${recon.ok ? "" : "border-2 border-minus"}`}>
        <h2 className="font-extrabold">Ledger reconciliation {recon.ok ? "✓ balanced" : "⚠ problems found"}</h2>
        <p className="text-[14px] text-ink-soft">Issued {recon.totals.issued} · available {recon.totals.available} · held {recon.totals.reserved} · transferred {recon.totals.transferred}</p>
        {recon.problems.map((p) => <p key={p} className="text-[13px] text-minus">{p}</p>)}
      </section>

      {me.role !== "COIN_ADMIN" && (
        <>
          <h2 className="h-section mb-2">Coin holds needing review ({held.filter((e) => e.status === "DISPUTED").length + overdue.length})</h2>
          <div className="mb-6 space-y-2">
            {[...held.filter((e) => e.status === "DISPUTED"), ...overdue].map((e) => (
              <Link key={e.id} href={`/mod/exchanges/${e.id}`} className="card flex items-center gap-3 p-4">
                <div className="flex-1"><p className="font-bold">{e.ref} · {e.listing.title}</p><p className="text-[13px] text-muted">{e.reserved} coins held · updated <LocalTime iso={e.updatedAt.toISOString()} mode="relative" /></p></div>
                <StatusPill status={e.status} />
              </Link>
            ))}
            {held.length === 0 && <p className="text-[14px] text-muted">No held exchanges.</p>}
          </div>

          <h2 className="h-section mb-2">Open cases ({cases.length})</h2>
          <div className="space-y-2">
            {cases.map((c) => (
              <div key={c.id} className="card p-4">
                <div className="flex items-center justify-between"><p className="font-bold">{c.ref} · {c.category}</p><span className="text-[12px] text-muted"><LocalTime iso={c.createdAt.toISOString()} mode="relative" /></span></div>
                <p className="text-[13px] text-muted">{c.targetType} {c.targetType === "EXCHANGE" ? <Link className="underline" href={`/mod/exchanges/${c.targetId}`}>open case view</Link> : c.targetId}</p>
                {c.explanation && <p className="mt-2 rounded-2xl bg-mist p-3 text-[14px]">{c.explanation}</p>}
                <ActionForm action={modUpdateCase} className="mt-3 flex flex-wrap gap-2">
                  <input type="hidden" name="reportId" value={c.id} />
                  <input name="resolution" className="field flex-1 py-2" placeholder="Outcome / note to reporter" />
                  <Submit name="status" value="IN_REVIEW" className="btn-secondary btn-sm">Take</Submit>
                  <Submit name="status" value="RESOLVED" className="btn-primary btn-sm">Resolve</Submit>
                  <Submit name="status" value="DISMISSED" className="btn-ghost btn-sm">Dismiss</Submit>
                </ActionForm>
              </div>
            ))}
            {cases.length === 0 && <p className="text-[14px] text-muted">No open cases.</p>}
          </div>
        </>
      )}
    </main>
  );
}
