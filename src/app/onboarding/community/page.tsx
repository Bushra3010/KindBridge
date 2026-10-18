import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentAccount } from "@/lib/auth";
import { joinCommunity } from "@/app/actions";
import { ActionForm, Submit } from "@/components/forms";
import { Icon } from "@/components/icons";
import { Note, PageHeader, Screen } from "@/components/ui";

export const metadata = { title: "Find your community" };

export default async function FindCommunity({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const account = await currentAccount();
  if (!account) redirect("/login");
  if (!account.emailVerifiedAt) redirect("/verify");
  const existing = await db.membership.findFirst({ where: { accountId: account.id, status: { in: ["PENDING", "APPROVED"] } } });
  if (existing) redirect("/onboarding/skills");

  const { q = "" } = await searchParams;
  const communities = await db.community.findMany({
    where: q ? { OR: [{ name: { contains: q } }, { inviteCode: q.toUpperCase() }] } : {},
    orderBy: { name: "asc" },
    take: 20,
  });

  return (
    <Screen nav={false}>
      <PageHeader title="" back="/" />
      <div className="text-center">
        <h1 className="text-[26px] font-extrabold">Find your community</h1>
        <p className="mt-1 text-ink-soft">Join a local or interest-based community.</p>
      </div>
      <form className="relative mt-6" role="search">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input name="q" defaultValue={q} className="field pl-12" placeholder="Search by community or invite code" aria-label="Search communities" />
      </form>

      <ActionForm action={joinCommunity} className="mt-4 space-y-3">
        <fieldset className="space-y-3">
          <legend className="sr-only">Communities</legend>
          {communities.map((c, i) => (
            <div key={c.id}>
              <input type="radio" name="communityId" id={c.id} value={c.id} defaultChecked={i === 0} className="peer sr-only" required />
              <label htmlFor={c.id} className="card flex cursor-pointer items-start gap-3 border-2 border-transparent p-4 peer-checked:border-teal-200 peer-checked:bg-gradient-to-br peer-checked:from-teal-50 peer-checked:to-sky-50 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-700">
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-teal-700 shadow-sm"><Icon name="users" size={24} /></div>
                <div className="flex-1">
                  <div className="text-[16px] font-bold">{c.name}</div>
                  <p className="text-[13px] text-muted">{c.description}</p>
                  <p className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-ink-soft"><Icon name="lock" size={14} /> {c.joinPolicy === "INVITE" ? "Invitation required." : "Membership approval required."}</p>
                </div>
              </label>
            </div>
          ))}
          {communities.length === 0 && <p className="card p-5 text-center text-muted">No communities match. Check the name or invite code with your organizer.</p>}
        </fieldset>
        <div className="pt-2">
          <label className="label" htmlFor="inviteCode">Invite code <span className="font-normal text-muted">(optional — skips approval)</span></label>
          <div className="relative">
            <Icon name="tag" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input id="inviteCode" name="inviteCode" className="field pl-12 uppercase" placeholder="KIND2026" autoCapitalize="characters" />
          </div>
        </div>
        <Submit>Request to join</Submit>
        <Note icon="shield">Your exact address is never public.</Note>
      </ActionForm>
    </Screen>
  );
}
