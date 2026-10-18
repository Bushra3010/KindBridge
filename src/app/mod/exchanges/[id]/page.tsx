import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { modResolveExchange } from "@/app/actions";
import { audit } from "@/lib/services/support";
import { ActionForm, LocalTime, Submit } from "@/components/forms";
import { PageHeader, StatusPill } from "@/components/ui";

export const metadata = { title: "Case view" };

/** Case-scoped moderator access. Every view is audited (PRD §6.4, §10). */
export default async function ModExchange({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireRole(["MODERATOR", "ADMIN"]);
  const { id } = await params;
  const ex = await db.exchange.findUnique({
    where: { id },
    include: { listing: true, versions: { orderBy: { version: "asc" } }, events: { orderBy: { createdAt: "asc" } }, messages: { orderBy: { createdAt: "asc" } }, requester: { include: { profile: true } }, helper: { include: { profile: true } } },
  });
  if (!ex) notFound();
  const hasCase = (await db.report.count({ where: { targetType: "EXCHANGE", targetId: id } })) > 0 || !!ex.flaggedAt;
  if (!hasCase) notFound();
  await audit(db, { actorId: me.id, action: "case_viewed", targetType: "Exchange", targetId: id });

  const name = (accId: string | null) => (accId === ex.requesterId ? `${ex.requester.profile?.displayName} (requester)` : accId === ex.helperId ? `${ex.helper.profile?.displayName} (helper)` : "System");
  const accepted = ex.versions.find((v) => v.id === ex.acceptedVersionId);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-4">
      <PageHeader title={`${ex.ref} · case view`} back="/mod" />
      <div className="card space-y-1 p-4 text-[14px]">
        <div className="flex items-center justify-between"><p className="font-bold">{ex.listing.title}</p><StatusPill status={ex.status} /></div>
        <p>Requester: {ex.requester.profile?.displayName} · Helper: {ex.helper.profile?.displayName}</p>
        {accepted && <p>Agreed: {accepted.deliverable} · {accepted.coins} coins · <LocalTime iso={accepted.scheduledAt.toISOString()} /></p>}
        <p><strong>Held: {ex.reserved}</strong> · settled {ex.settled} · refunded {ex.refunded}</p>
      </div>

      {["DISPUTED", "DELIVERED", "IN_PROGRESS"].includes(ex.status) && ex.reserved > 0 && (
        <ActionForm action={modResolveExchange} className="card mt-4 space-y-3 p-4">
          <h2 className="font-extrabold">Resolve coin hold</h2>
          <input type="hidden" name="exchangeId" value={ex.id} />
          <label className="label" htmlFor="toHelper">Coins to helper (rest refunded to requester, of {ex.reserved})</label>
          <input id="toHelper" name="toHelper" type="number" min={0} max={ex.reserved} defaultValue={0} className="field" required />
          <label className="label" htmlFor="evidence">Evidence reviewed</label>
          <textarea id="evidence" name="evidence" rows={2} className="field" placeholder="Chat log, timeline, statements…" />
          <label className="label" htmlFor="reason">Reason (shared with both members)</label>
          <textarea id="reason" name="reason" rows={2} className="field" required />
          <Submit>Record decision</Submit>
        </ActionForm>
      )}

      <h2 className="h-section mb-2 mt-6">Timeline</h2>
      <ol className="card divide-y divide-line text-[13px]">
        {ex.events.map((e) => <li key={e.id} className="flex gap-3 px-4 py-2"><span className="w-40 shrink-0 text-muted"><LocalTime iso={e.createdAt.toISOString()} /></span><span><strong>{e.type}</strong> {e.detail} — {name(e.actorId)}</span></li>)}
      </ol>
      <h2 className="h-section mb-2 mt-6">Messages</h2>
      <ol className="card divide-y divide-line text-[13px]">
        {ex.messages.map((m) => <li key={m.id} className="px-4 py-2"><span className="text-muted">{name(m.senderId)} · <LocalTime iso={m.createdAt.toISOString()} /></span><p>{m.body}</p></li>)}
      </ol>
    </main>
  );
}
