import Link from "next/link";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { revokeGrant, updatePrivateContact } from "@/app/actions";
import { DISCLOSURE_FIELDS, type DisclosureField } from "@/lib/constants";
import { ActionForm, Submit } from "@/components/forms";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";
import { Note, PageHeader, Row, Screen } from "@/components/ui";

export const metadata = { title: "Privacy & sharing" };

export default async function Privacy() {
  const { account, profile } = await requireMember();
  const [contact, grants, blockedCount] = await Promise.all([
    db.privateContact.findUnique({ where: { accountId: account.id } }),
    db.disclosureGrant.findMany({ where: { ownerId: account.id, revokedAt: null }, include: { recipient: { include: { profile: true } } }, orderBy: { createdAt: "desc" } }),
    db.block.count({ where: { blockerId: account.id } }),
  ]);
  const byRecipient = new Map<string, typeof grants>();
  for (const g of grants) byRecipient.set(g.recipientId, [...(byRecipient.get(g.recipientId) ?? []), g]);

  return (
    <Screen>
      <PageHeader title="Privacy & sharing" back="/profile" />
      <div className="card-tint flex items-center gap-4 p-5">
        <div className="grid size-16 shrink-0 place-items-center rounded-full bg-white/80 text-teal-700"><Icon name="shield" size={34} /></div>
        <div><p className="text-[19px] font-extrabold">Private by default</p><p className="text-[14px] text-ink-soft">You control what you share and who can see it.</p></div>
      </div>

      <div className="card mt-4 divide-y divide-line overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5"><Icon name="user" className="text-ink-soft" /><span className="flex-1 font-semibold">Username</span><span className="text-muted">{profile.displayName}</span></div>
        <Row href="/profile/edit" icon="image" label="Avatar" value="Illustration" />
        <div className="flex items-center gap-3 px-4 py-3.5"><Icon name="lock" className="text-ink-soft" /><span className="flex-1 font-semibold">Real name & contact details</span><span className="text-muted">Hidden</span></div>
      </div>

      <details className="card mt-3 overflow-hidden">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5"><Icon name="edit" className="text-ink-soft" /><span className="flex-1 font-semibold">Details you can choose to share</span><Icon name="down" size={18} className="text-muted" /></summary>
        <ActionForm action={updatePrivateContact} className="space-y-3 border-t border-line p-4">
          <p className="text-[13px] text-muted">Stored privately. Nobody sees these unless you share a specific field with a specific person.</p>
          <div><label className="label" htmlFor="firstName">First name</label><input id="firstName" name="firstName" className="field" defaultValue={contact?.firstName ?? ""} maxLength={40} /></div>
          <div><label className="label" htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" className="field" defaultValue={contact?.phone ?? ""} placeholder="+91" /></div>
          <div><label className="label" htmlFor="photoUrl">Photo link</label><input id="photoUrl" name="photoUrl" type="url" className="field" defaultValue={contact?.photoUrl ?? ""} placeholder="https://" /></div>
          <div><label className="label" htmlFor="meetingLocation">Preferred meeting spot</label><input id="meetingLocation" name="meetingLocation" className="field" defaultValue={contact?.meetingLocation ?? ""} placeholder="Clubhouse lounge, Block B" maxLength={120} /><p className="mt-1 text-[12px] text-muted">Use a shared space, never your home address.</p></div>
          <Submit>Save private details</Submit>
        </ActionForm>
      </details>

      <h2 className="h-section mb-1 mt-6">Shared with specific people</h2>
      <p className="mb-3 text-[14px] text-muted">You can share limited details with people you've helped or are working with.</p>
      {byRecipient.size === 0 ? <p className="card p-4 text-[14px] text-muted">You haven't shared anything. Use “Share details” from a booked session.</p> : (
        <div className="space-y-2">
          {[...byRecipient.values()].map((gs) => (
            <details key={gs[0].recipientId} className="card overflow-hidden">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                <Avatar preset={gs[0].recipient.profile?.avatar} size={46} />
                <div className="flex-1"><p className="font-bold">{gs[0].recipient.profile?.displayName}</p><p className="text-[13px] text-muted">{gs.map((g) => DISCLOSURE_FIELDS[g.field as DisclosureField].label).join(", ")}</p></div>
                <span className="btn-secondary btn-sm">Manage</span>
              </summary>
              <div className="space-y-1 border-t border-line px-4 py-2">
                {gs.map((g) => (
                  <form key={g.id} action={revokeGrant} className="flex items-center justify-between py-1.5">
                    <input type="hidden" name="grantId" value={g.id} />
                    <span className="text-[14px]">{DISCLOSURE_FIELDS[g.field as DisclosureField].label}</span>
                    <button className="btn-ghost btn-sm">Stop sharing</button>
                  </form>
                ))}
                <Link href={`/exchanges/${gs[0].exchangeId}`} className="block py-2 text-[13px] font-bold text-teal-700">Open session</Link>
              </div>
            </details>
          ))}
        </div>
      )}
      <div className="mt-2"><Note>Recipients may save a copy. Stopping sharing removes future in-app access.</Note></div>

      <div className="card mt-6 overflow-hidden"><Row href="/privacy/blocked" icon="ban" label="Blocked accounts" value={blockedCount} /></div>
    </Screen>
  );
}
