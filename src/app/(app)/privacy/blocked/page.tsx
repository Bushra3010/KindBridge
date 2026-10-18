import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { unblockMember } from "@/app/actions";
import { Avatar } from "@/components/avatar";
import { EmptyState, Note, PageHeader, Screen } from "@/components/ui";

export const metadata = { title: "Blocked accounts" };

export default async function Blocked() {
  const { account } = await requireMember();
  const blocks = await db.block.findMany({ where: { blockerId: account.id }, include: { blocked: { include: { profile: true } } } });
  return (
    <Screen>
      <PageHeader title="Blocked accounts" back="/privacy" />
      {blocks.length === 0 ? <EmptyState icon="ban" title="No blocked accounts" /> : (
        <ul className="space-y-2">
          {blocks.map((b) => (
            <li key={b.blockedId} className="card flex items-center gap-3 p-3.5">
              <Avatar preset={b.blocked.profile?.avatar} size={44} />
              <span className="flex-1 font-bold">{b.blocked.profile?.displayName}</span>
              <form action={unblockMember}><input type="hidden" name="accountId" value={b.blockedId} /><button className="btn-secondary btn-sm">Unblock</button></form>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4"><Note>Blocked members can't message you or send new proposals. Existing sessions keep their completion, cancellation and dispute options.</Note></div>
    </Screen>
  );
}
