import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { blockMember } from "@/app/actions";
import { reputation } from "@/lib/services/reviews";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";
import { ListingCard } from "@/components/listing-card";
import { LocalTime } from "@/components/forms";
import { PageHeader, Screen } from "@/components/ui";

export default async function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const { account, community } = await requireMember();
  const { username } = await params;
  const profile = await db.profile.findUnique({ where: { username: username.toLowerCase() }, include: { account: true } });
  if (!profile) notFound();
  // Profiles are visible only inside the same community.
  const shared = await db.membership.findFirst({ where: { accountId: profile.accountId, communityId: community.id, status: "APPROVED" } });
  if (!shared || profile.account.status === "CLOSED") notFound();

  const isMe = profile.accountId === account.id;
  const [rep, categorySkills, custom, listings] = await Promise.all([
    reputation(profile.accountId),
    db.userSkill.findMany({ where: { accountId: profile.accountId, kind: "OFFER" }, include: { category: true } }),
    db.customSkill.findMany({ where: { accountId: profile.accountId, kind: "OFFER" }, orderBy: { id: "asc" } }),
    db.listing.findMany({ where: { ownerId: profile.accountId, communityId: community.id, status: "OPEN" }, include: { category: true, owner: { include: { profile: true } } }, take: 10 }),
  ]);
  const skills = [...categorySkills.map((s) => s.category.name), ...custom.map((s) => s.name)];

  return (
    <Screen>
      <PageHeader title={isMe ? "How others see you" : ""} back={isMe ? "/profile" : "/explore"} right={!isMe && <Link href={`/report?type=PROFILE&id=${profile.accountId}`} className="grid size-10 place-items-center rounded-full bg-white/80 text-ink-soft" aria-label="Report profile"><Icon name="flag" size={18} /></Link>} />
      <div className="text-center">
        <div className="flex justify-center"><Avatar preset={profile.avatar} size={100} online={!profile.paused} /></div>
        <h1 className="mt-3 text-[26px] font-extrabold">{profile.displayName}</h1>
        {profile.bio && <p className="text-ink-soft">{profile.bio}</p>}
        <div className="mt-2 flex justify-center gap-1.5">
          <span className="pill bg-teal-50 text-teal-800"><Icon name="checkCircle" size={14} /> Contact verified</span>
          <span className="pill bg-sky-50 text-sky-900"><Icon name="users" size={14} /> Community member</span>
        </div>
        <p className="mt-2 text-[13px] text-muted">{profile.paused ? "Currently unavailable" : `Usually available: ${profile.availability}`}</p>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="card p-3"><p className="text-[22px] font-extrabold">{rep.completedHelp}</p><p className="text-[13px] text-muted">Helped</p></div>
        <div className="card p-3"><p className="text-[22px] font-extrabold">{rep.rating ? `★ ${rep.rating}` : "—"}</p><p className="text-[13px] text-muted">{rep.reviewCount} review{rep.reviewCount === 1 ? "" : "s"}</p></div>
        <div className="card p-3"><p className="text-[22px] font-extrabold">{skills.length}</p><p className="text-[13px] text-muted">Skills</p></div>
      </div>
      {rep.reviewCount > 0 && rep.reviewCount < 3 && <p className="mt-2 text-center text-[12px] text-muted">Based on only {rep.reviewCount} review{rep.reviewCount === 1 ? "" : "s"} so far.</p>}

      {skills.length > 0 && (
        <section className="mt-6"><h2 className="h-section mb-2">Skills</h2><div className="flex flex-wrap gap-2">{skills.map((s) => <span key={s} className="chip">{s}</span>)}</div></section>
      )}
      {listings.length > 0 && (
        <section className="mt-6"><h2 className="h-section mb-2">Active listings</h2><div className="space-y-3">{listings.map((l) => <ListingCard key={l.id} listing={l} />)}</div></section>
      )}
      <section className="mt-6">
        <h2 className="h-section mb-2">Reviews</h2>
        {rep.reviews.length === 0 ? <p className="text-[14px] text-muted">No published reviews yet.</p> : (
          <div className="space-y-2">
            {rep.reviews.slice(0, 10).map((r) => (
              <div key={r.id} className="card p-4">
                <p className="text-[14px] font-bold text-gold-700">{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span></p>
                {r.body && <p className="mt-1 text-[14px]">{r.body}</p>}
                <p className="mt-1 text-[12px] text-muted"><LocalTime iso={r.createdAt.toISOString()} mode="relative" /></p>
              </div>
            ))}
          </div>
        )}
      </section>
      {!isMe && (
        <form action={blockMember} className="mt-8 text-center">
          <input type="hidden" name="accountId" value={profile.accountId} />
          <button className="btn-ghost text-minus"><Icon name="ban" size={18} /> Block {profile.displayName}</button>
        </form>
      )}
    </Screen>
  );
}
