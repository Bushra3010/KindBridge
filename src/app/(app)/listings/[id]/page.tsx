import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { sendProposal, toggleListing } from "@/app/actions";
import { reputation } from "@/lib/services/reviews";
import { getOrCreateMemberAccount } from "@/lib/services/ledger";
import { FORMATS, type Format } from "@/lib/constants";
import { ActionForm, LocalTime, Submit } from "@/components/forms";
import { Avatar } from "@/components/avatar";
import { Coin } from "@/components/brand";
import { Icon } from "@/components/icons";
import { TermsFields } from "@/components/terms-fields";
import { categoryIcon, EmptyState, Note, PageHeader, Screen, StatusPill } from "@/components/ui";

export default async function ListingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ posted?: string }> }) {
  const { account, community } = await requireMember();
  const { id } = await params;
  const { posted } = await searchParams;
  const listing = await db.listing.findUnique({ where: { id }, include: { category: true, owner: { include: { profile: true } } } });
  // Listings outside the viewer's community are indistinguishable from missing ones.
  if (!listing || listing.communityId !== community.id || (listing.status === "REMOVED" && listing.ownerId !== account.id)) notFound();

  const isOwner = listing.ownerId === account.id;
  const owner = listing.owner.profile!;

  if (isOwner) {
    const proposals = await db.exchange.findMany({
      where: { listingId: id },
      include: { versions: { orderBy: { version: "desc" }, take: 1 }, requester: { include: { profile: true } }, helper: { include: { profile: true } } },
      orderBy: { createdAt: "desc" },
    });
    const reps = await Promise.all(proposals.map((p) => reputation(listing.kind === "REQUEST" ? p.helperId : p.requesterId)));
    return (
      <Screen>
        <PageHeader
          title={listing.kind === "REQUEST" ? "Your request" : "Your offer"}
          back="/exchanges"
          right={<span className="pill bg-white text-ink"><span className={`size-2 rounded-full ${listing.status === "OPEN" ? "bg-plus" : "bg-muted"}`} />{listing.status === "OPEN" ? "Open" : listing.status === "PAUSED" ? "Booked" : listing.status === "REMOVED" ? "Removed" : "Closed"}</span>}
        />
        {posted && <p role="status" className="mb-4 rounded-2xl bg-teal-50 px-4 py-3 text-[14px] font-semibold text-teal-800">Published. Members of {community.name} can now see it.</p>}
        <div className="card-tint flex items-start gap-3 p-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-white/70 text-teal-700"><Icon name={categoryIcon(listing.category)} /></div>
          <div className="flex-1">
            <p className="text-[17px] font-bold">{listing.title}</p>
            <p className="text-[13px] text-ink-soft">{listing.coins} coins · {listing.durationMin} min · {FORMATS[listing.format as Format]}</p>
            <p className="mt-2 text-[14px] text-ink-soft">{listing.description}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          {listing.status === "OPEN" && <form action={toggleListing} className="flex-1"><input type="hidden" name="listingId" value={id} /><input type="hidden" name="status" value="CLOSED" /><button className="btn-secondary btn-sm w-full">Close listing</button></form>}
          {listing.status === "CLOSED" && <form action={toggleListing} className="flex-1"><input type="hidden" name="listingId" value={id} /><input type="hidden" name="status" value="OPEN" /><button className="btn-secondary btn-sm w-full">Reopen listing</button></form>}
        </div>

        <h2 className="h-section mb-3 mt-6">Proposals ({proposals.length})</h2>
        <div className="space-y-3">
          {proposals.map((p, i) => {
            const other = listing.kind === "REQUEST" ? p.helper : p.requester;
            const v = p.versions[0];
            const rep = reps[i];
            return (
              <div key={p.id} className="card p-4">
                <div className="flex items-center gap-3">
                  <Avatar preset={other.profile?.avatar} size={48} online={!other.profile?.paused} />
                  <div className="flex-1">
                    <p className="font-bold">{other.profile?.displayName}</p>
                    <p className="text-[13px] text-muted">{rep.rating ? <>★ {rep.rating} · </> : null}{rep.completedHelp} sessions</p>
                  </div>
                  <StatusPill status={p.status} />
                </div>
                {v.note && <p className="mt-3 rounded-2xl bg-mist px-3 py-2 text-[14px]">{v.note}</p>}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-soft">
                  <span className="inline-flex items-center gap-1"><Icon name={v.format === "ONLINE" ? "video" : "pin"} size={15} />{FORMATS[v.format as Format]}</span>
                  <span className="inline-flex items-center gap-1"><Icon name="calendar" size={15} /><LocalTime iso={v.scheduledAt.toISOString()} mode="date" /></span>
                  <span className="inline-flex items-center gap-1"><Coin size={15} />{v.coins}</span>
                </div>
                <Link href={`/exchanges/${p.id}`} className="btn-primary btn-sm mt-3 w-full">View proposal</Link>
              </div>
            );
          })}
          {proposals.length === 0 && <EmptyState icon="clock" title="No proposals yet" body="We'll notify you when a member responds. Proposals expire after 7 days if not accepted." />}
        </div>
      </Screen>
    );
  }

  const [rep, wallet, mine] = await Promise.all([
    reputation(listing.ownerId),
    getOrCreateMemberAccount(db, community.id, account.id),
    db.exchange.findFirst({ where: { listingId: id, status: { notIn: ["DECLINED", "WITHDRAWN", "EXPIRED"] }, OR: [{ requesterId: account.id }, { helperId: account.id }] } }),
  ]);
  const isOffer = listing.kind === "OFFER";
  const short = isOffer && wallet.available < listing.coins;

  return (
    <Screen>
      <PageHeader title={isOffer ? "Offer" : "Request"} back="/explore" right={<Link href={`/report?type=LISTING&id=${id}`} className="grid size-10 place-items-center rounded-full bg-white/80 text-ink-soft" aria-label="Report this listing"><Icon name="flag" size={18} /></Link>} />
      <Link href={`/u/${owner.username}`} className="card flex items-center gap-3 p-4">
        <Avatar preset={owner.avatar} size={56} online={!owner.paused} />
        <div className="flex-1">
          <p className="text-[18px] font-bold">{owner.displayName}</p>
          <p className="text-[13px] text-muted">{rep.rating ? <>★ {rep.rating} ({rep.reviewCount} reviews) · </> : "New member · "}{rep.completedHelp} sessions helped</p>
        </div>
        <Icon name="right" className="text-muted" />
      </Link>
      <div className="card mt-3 p-5">
        {listing.category.active && <span className="pill mb-2 bg-teal-50 text-teal-800">{listing.category.name}</span>}
        <h2 className="text-[22px] font-extrabold">{listing.title}</h2>
        <p className="mt-2 whitespace-pre-line text-[15px] text-ink-soft">{listing.description}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[13px]">
          <div className="rounded-2xl bg-mist p-2"><Coin size={20} className="mx-auto" /><div className="mt-1 font-bold">{listing.coins} coins</div></div>
          <div className="rounded-2xl bg-mist p-2"><Icon name="clock" className="mx-auto text-teal-700" /><div className="mt-1 font-bold">{listing.durationMin} min</div></div>
          <div className="rounded-2xl bg-mist p-2"><Icon name={listing.format === "ONLINE" ? "video" : "pin"} className="mx-auto text-teal-700" /><div className="mt-1 font-bold">{FORMATS[listing.format as Format]}</div></div>
        </div>
        <p className="mt-3 text-[13px] text-muted">Usually available: {listing.availability}</p>
      </div>

      {mine ? (
        <Link href={`/exchanges/${mine.id}`} className="btn-primary mt-4 w-full">View your proposal</Link>
      ) : listing.status !== "OPEN" ? (
        <p className="card mt-4 p-4 text-center text-muted">This listing isn't taking proposals right now.</p>
      ) : (
        <section className="mt-6">
          <h2 className="h-section mb-1">{isOffer ? "Request this help" : "Offer to help"}</h2>
          <p className="mb-4 text-[14px] text-muted">{isOffer ? `${owner.displayName} will review and accept your terms.` : `${owner.displayName} approves the coin amount before anything is reserved.`}</p>
          {short && <p className="mb-4 rounded-2xl bg-amber-50 p-3 text-[14px] text-amber-900">You have {wallet.available} coins available. You can still propose a lower amount, or <Link href="/explore?kind=REQUEST" className="font-bold underline">help someone</Link> to earn more.</p>}
          <ActionForm action={sendProposal} className="card space-y-4 p-4">
            <input type="hidden" name="listingId" value={id} />
            <TermsFields d={{ deliverable: listing.title, durationMin: listing.durationMin, coins: listing.coins, format: listing.format }} maxCoins={listing.category.maxCoins} />
            <Submit>{isOffer ? "Send proposal" : "Accept helping"}</Submit>
            <Note>{isOffer ? "Coins are reserved when the helper accepts, and released only after you confirm the help." : "You'll earn coins after the requester confirms your help."}</Note>
          </ActionForm>
        </section>
      )}
    </Screen>
  );
}
