import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { issuedStarterTotal } from "@/lib/services/ledger";
import { adminSaveCommunity } from "@/app/actions";
import { ActionForm, Submit } from "@/components/forms";

export const metadata = { title: "Communities" };

type C = { id?: string; name?: string; slug?: string; description?: string; inviteCode?: string; joinPolicy?: string; starterGrant?: number; starterAllocation?: number };

function CommunityForm({ c }: { c: C }) {
  const f = (name: string) => `${c.id ?? "new"}-${name}`;
  return (
    <ActionForm action={adminSaveCommunity} resetOnSuccess={!c.id} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={c.id ?? ""} />
      <div><label className="label" htmlFor={f("name")}>Name</label><input id={f("name")} name="name" required defaultValue={c.name} className="field" /></div>
      <div><label className="label" htmlFor={f("slug")}>Slug</label><input id={f("slug")} name="slug" required defaultValue={c.slug} pattern="[a-z0-9-]{2,40}" className="field" /></div>
      <div className="sm:col-span-2"><label className="label" htmlFor={f("description")}>Description</label><input id={f("description")} name="description" defaultValue={c.description} className="field" /></div>
      <div><label className="label" htmlFor={f("inviteCode")}>Invite code</label><input id={f("inviteCode")} name="inviteCode" required defaultValue={c.inviteCode} className="field uppercase" /></div>
      <div>
        <label className="label" htmlFor={f("joinPolicy")}>Without an invite code</label>
        <select id={f("joinPolicy")} name="joinPolicy" defaultValue={c.joinPolicy ?? "APPROVAL"} className="field">
          <option value="APPROVAL">Organizer approves requests</option>
          <option value="INVITE">Invite code only</option>
        </select>
      </div>
      <div><label className="label" htmlFor={f("starterGrant")}>Starter grant (coins per member)</label><input id={f("starterGrant")} name="starterGrant" type="number" min={0} max={200} required defaultValue={c.starterGrant ?? 20} className="field" /></div>
      <div><label className="label" htmlFor={f("starterAllocation")}>Starter allocation (total cap)</label><input id={f("starterAllocation")} name="starterAllocation" type="number" min={0} required defaultValue={c.starterAllocation ?? 2000} className="field" /></div>
      <div className="sm:col-span-2"><Submit className="btn-primary btn-sm">{c.id ? "Save changes" : "Create community"}</Submit></div>
    </ActionForm>
  );
}

export default async function AdminCommunities() {
  await requireRole(["ADMIN"]);
  const communities = await db.community.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { memberships: { where: { status: "APPROVED" } }, listings: { where: { status: "OPEN" } } } } },
  });
  const extra = await Promise.all(
    communities.map(async (c) => ({
      issued: await issuedStarterTotal(db, c.id),
      pending: await db.membership.count({ where: { communityId: c.id, status: "PENDING" } }),
      organizers: await db.membership.findMany({ where: { communityId: c.id, role: "ORGANIZER", status: "APPROVED" }, include: { account: { include: { profile: true } } } }),
    })),
  );

  return (
    <div className="space-y-3">
      {communities.map((c, i) => (
        <details key={c.id} className="card p-4">
          <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-extrabold">{c.name}</span>
            <span className="text-[13px] text-muted">{c._count.memberships} members · {extra[i].pending} pending · {c._count.listings} open listings · code {c.inviteCode}</span>
            <span className="ml-auto text-[13px] text-muted">starter coins {extra[i].issued} / {c.starterAllocation}</span>
          </summary>
          <p className="mb-3 mt-2 text-[13px] text-muted">Organizers: {extra[i].organizers.map((m) => m.account.profile?.displayName).join(", ") || "none"}</p>
          <CommunityForm c={c} />
        </details>
      ))}
      <details className="card p-4">
        <summary className="cursor-pointer list-none font-extrabold text-teal-700">+ New community</summary>
        <div className="mt-3"><CommunityForm c={{}} /></div>
      </details>
    </div>
  );
}
