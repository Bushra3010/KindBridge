import Link from "next/link";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { reputation } from "@/lib/services/reviews";
import { getOrCreateMemberAccount } from "@/lib/services/ledger";
import { Avatar } from "@/components/avatar";
import { Coin } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Screen } from "@/components/ui";

export const metadata = { title: "Your profile" };

export default async function Profile() {
  const { account, profile, community, membership } = await requireMember();
  const [rep, wallet, skills, monthHelped, thanks] = await Promise.all([
    reputation(account.id),
    getOrCreateMemberAccount(db, community.id, account.id),
    db.userSkill.findMany({ where: { accountId: account.id }, include: { category: true } }),
    db.exchange.findMany({ where: { helperId: account.id, status: "COMPLETED", completedAt: { gte: new Date(Date.now() - 30 * 86_400_000) } }, select: { requesterId: true }, distinct: ["requesterId"] }),
    db.review.findMany({ where: { subjectId: account.id, thanks: { not: "" } }, include: { author: { include: { profile: true } } }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);
  const offers = skills.filter((s) => s.kind === "OFFER");
  const needs = skills.filter((s) => s.kind === "NEED");
  const isStaff = ["MODERATOR", "ADMIN", "COIN_ADMIN"].includes(account.role);

  return (
    <Screen>
      <header className="flex items-start gap-4 pt-2">
        <Avatar preset={profile.avatar} size={92} online={!profile.paused} />
        <div className="min-w-0 flex-1 pt-1">
          <p className="text-[24px] font-extrabold leading-tight">{profile.displayName}</p>
          <p className="text-[14px] text-muted">@{profile.username}</p>
          {profile.bio && <p className="mt-1 text-[14px] text-ink-soft">{profile.bio}</p>}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="pill bg-teal-50 text-teal-800" title="Email address confirmed. This is not an identity check."><Icon name="checkCircle" size={14} /> Contact verified</span>
            <span className="pill bg-sky-50 text-sky-900" title="Approved member of this community"><Icon name="users" size={14} /> {community.name}</span>
            {profile.paused && <span className="pill bg-gray-100 text-gray-700"><Icon name="pause" size={14} /> Paused</span>}
          </div>
        </div>
        <Link href="/settings" aria-label="Settings" className="grid size-11 place-items-center rounded-full bg-white/80 shadow-sm"><Icon name="settings" /></Link>
      </header>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="card p-3"><p className="text-[22px] font-extrabold">{rep.completedHelp}</p><p className="text-[13px] text-muted">Helped</p></div>
        <div className="card p-3"><p className="text-[22px] font-extrabold">{rep.rating ? <>★ {rep.rating}</> : "—"}</p><p className="text-[13px] text-muted">{rep.reviewCount ? `${rep.reviewCount} review${rep.reviewCount > 1 ? "s" : ""}` : "No reviews yet"}</p></div>
        <div className="card p-3"><p className="text-[22px] font-extrabold">{offers.length}</p><p className="text-[13px] text-muted">Skills</p></div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link href="/profile/edit" className="btn-secondary"><Icon name="edit" size={18} /> Edit profile</Link>
        <Link href={`/u/${profile.username}`} className="btn-secondary"><Icon name="eye" size={18} /> Preview profile</Link>
      </div>

      <Link href="/coins" className="card-tint mt-3 flex items-center gap-3 p-4">
        <Coin size={48} />
        <div className="flex-1"><p className="text-[28px] font-extrabold leading-none">{wallet.available}</p><p className="text-[14px] text-ink-soft">help coins</p></div>
        <p className="text-[13px] text-ink-soft">Only visible<br />to you.</p>
        <Icon name="right" />
      </Link>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between"><h2 className="h-section">Skills you offer</h2><Link href="/onboarding/skills?next=/profile" className="text-[14px] font-bold text-teal-700">Edit</Link></div>
        <div className="flex flex-wrap gap-2">{offers.map((s) => <span key={s.categoryId} className="chip">{s.category.name}</span>)}{offers.length === 0 && <span className="text-[14px] text-muted">None yet</span>}</div>
        {needs.length > 0 && (
          <>
            <h2 className="h-section mb-2 mt-4">Looking for help with</h2>
            <div className="flex flex-wrap gap-2">{needs.map((s) => <span key={s.categoryId} className="chip">{s.category.name}</span>)}</div>
          </>
        )}
      </section>

      <section className="mt-6">
        <h2 className="h-section mb-2">Contributions</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="card flex items-center gap-3 p-4"><Icon name="user" className="text-teal-700" /><div><p className="text-[20px] font-extrabold">{rep.completedHelp}</p><p className="text-[12px] text-muted">sessions completed</p></div></div>
          <div className="card flex items-center gap-3 p-4"><Icon name="users" className="text-teal-700" /><div><p className="text-[20px] font-extrabold">{monthHelped.length}</p><p className="text-[12px] text-muted">people helped this month</p></div></div>
        </div>
      </section>

      {thanks.length > 0 && (
        <section className="mt-6">
          <h2 className="h-section mb-2">Thank-you notes <span className="text-[13px] font-semibold text-muted">· private</span></h2>
          <div className="space-y-2">{thanks.map((t) => <div key={t.id} className="card p-4 text-[14px]"><p>“{t.thanks}”</p><p className="mt-1 text-[12px] text-muted">— {t.author.profile?.displayName}</p></div>)}</div>
        </section>
      )}

      <div className="card mt-6 divide-y divide-line overflow-hidden">
        <Link href="/updates" className="flex items-center gap-3 px-4 py-3.5 hover:bg-mist"><Icon name="bell" className="text-ink-soft" /><span className="flex-1 font-semibold">Updates</span><Icon name="right" size={18} className="text-muted" /></Link>
        <Link href="/privacy" className="flex items-center gap-3 px-4 py-3.5 hover:bg-mist"><Icon name="shield" className="text-ink-soft" /><span className="flex-1 font-semibold">Privacy & sharing</span><Icon name="right" size={18} className="text-muted" /></Link>
        {membership.role === "ORGANIZER" && <Link href="/organizer" className="flex items-center gap-3 px-4 py-3.5 hover:bg-mist"><Icon name="users" className="text-ink-soft" /><span className="flex-1 font-semibold">Organizer tools</span><Icon name="right" size={18} className="text-muted" /></Link>}
        {isStaff && <Link href="/mod" className="flex items-center gap-3 px-4 py-3.5 hover:bg-mist"><Icon name="shieldCheck" className="text-ink-soft" /><span className="flex-1 font-semibold">Moderation</span><Icon name="right" size={18} className="text-muted" /></Link>}
      </div>
    </Screen>
  );
}
