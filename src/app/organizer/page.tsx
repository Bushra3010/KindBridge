import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentAccount } from "@/lib/auth";
import { decideMember } from "@/app/actions";
import { Avatar } from "@/components/avatar";
import { LocalTime } from "@/components/forms";
import { Note, PageHeader } from "@/components/ui";

export const metadata = { title: "Organizer tools" };

/** Aggregates under this size are suppressed so individuals can't be identified (PRD §9). */
const MIN_GROUP = 5;
const show = (n: number) => (n < MIN_GROUP ? `< ${MIN_GROUP}` : String(n));

export default async function Organizer() {
  const account = await currentAccount();
  if (!account) redirect("/login");
  const org = await db.membership.findFirst({ where: { accountId: account.id, role: "ORGANIZER", status: "APPROVED" }, include: { community: true } });
  if (!org) redirect("/home");

  const since = new Date(Date.now() - 7 * 86_400_000);
  const [pending, members, listings, weekCompleted, totalCompleted] = await Promise.all([
    db.membership.findMany({ where: { communityId: org.communityId, status: "PENDING" }, include: { account: { include: { profile: true } } }, orderBy: { createdAt: "asc" } }),
    db.membership.count({ where: { communityId: org.communityId, status: "APPROVED" } }),
    db.listing.count({ where: { communityId: org.communityId, status: "OPEN" } }),
    db.exchange.count({ where: { communityId: org.communityId, status: "COMPLETED", completedAt: { gte: since } } }),
    db.exchange.count({ where: { communityId: org.communityId, status: "COMPLETED" } }),
  ]);

  return (
    <main className="mx-auto max-w-md px-4 pb-16 pt-4">
      <PageHeader title="Organizer tools" back="/profile" subtitle={org.community.name} />
      <div className="grid grid-cols-2 gap-2">
        {[["Members", String(members)], ["Open listings", String(listings)], ["Sessions this week", show(weekCompleted)], ["Sessions all time", show(totalCompleted)]].map(([l, v]) => (
          <div key={l} className="card p-4"><p className="text-[24px] font-extrabold">{v}</p><p className="text-[13px] text-muted">{l}</p></div>
        ))}
      </div>
      <p className="mt-2 text-[12px] text-muted">Invite code: <strong>{org.community.inviteCode}</strong> — members joining with it are approved automatically.</p>

      <h2 className="h-section mb-2 mt-6">Membership requests ({pending.length})</h2>
      <div className="space-y-2">
        {pending.map((m) => (
          <div key={m.id} className="card flex items-center gap-3 p-3.5">
            <Avatar preset={m.account.profile?.avatar} size={44} />
            <div className="flex-1"><p className="font-bold">{m.account.profile?.displayName ?? "New member"}</p><p className="text-[12px] text-muted">Requested <LocalTime iso={m.createdAt.toISOString()} mode="relative" /></p></div>
            <form action={decideMember}><input type="hidden" name="membershipId" value={m.id} /><button name="decision" value="approve" className="btn-primary btn-sm">Approve</button></form>
            <form action={decideMember}><input type="hidden" name="membershipId" value={m.id} /><button name="decision" value="reject" className="btn-ghost btn-sm">Decline</button></form>
          </div>
        ))}
        {pending.length === 0 && <p className="text-[14px] text-muted">No pending requests.</p>}
      </div>
      <div className="mt-6"><Note icon="lock">Organizers see usernames and aggregate activity only — never emails, private chats, coin balances or shared details.</Note></div>
    </main>
  );
}
