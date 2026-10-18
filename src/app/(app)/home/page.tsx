import Link from "next/link";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { affordableOffers, opportunitiesFor } from "@/lib/services/listings";
import { getOrCreateMemberAccount } from "@/lib/services/ledger";
import { Avatar } from "@/components/avatar";
import { Coin } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ListingCard, MiniListingCard } from "@/components/listing-card";
import { Screen } from "@/components/ui";

export const metadata = { title: "Home" };

export default async function Home() {
  const { account, profile, community } = await requireMember();
  const wallet = await getOrCreateMemberAccount(db, community.id, account.id);
  const [spend, opportunities, needsAction, unread, recentHelpers] = await Promise.all([
    affordableOffers(account.id, community.id, wallet.available),
    opportunitiesFor(account.id, community.id),
    db.exchange.count({
      where: {
        OR: [
          { requesterId: account.id, status: "DELIVERED" },
          { status: "PROPOSED", listing: { ownerId: account.id } },
        ],
      },
    }),
    db.notification.count({ where: { accountId: account.id, readAt: null } }),
    db.listing.findMany({
      where: { communityId: community.id, status: "OPEN", kind: "OFFER", ownerId: { not: account.id } },
      include: { owner: { include: { profile: true } } },
      distinct: ["ownerId"],
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <Screen>
      <header className="flex items-center gap-3 pt-2">
        <Link href="/profile"><Avatar preset={profile.avatar} size={54} online={!profile.paused} /></Link>
        <div className="flex-1">
          <p className="text-[20px] font-extrabold leading-tight">{profile.displayName}</p>
          <p className="text-[14px] text-muted">{community.name}</p>
        </div>
        <Link href="/coins" className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-2 text-[14px] font-bold shadow-sm">
          <Coin size={20} /> {wallet.available}
        </Link>
        <Link href="/updates" className="relative grid size-11 place-items-center rounded-full bg-white/80 shadow-sm" aria-label={`Updates${unread ? `, ${unread} unread` : ""}`}>
          <Icon name="bell" />
          {unread > 0 && <span className="absolute right-2 top-2 size-2.5 rounded-full bg-minus ring-2 ring-white" />}
        </Link>
      </header>

      <form action="/explore" className="relative mt-5" role="search">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input name="q" className="field rounded-full bg-white/80 pl-12" placeholder="What do you need help with?" aria-label="Search for help" />
      </form>

      {needsAction > 0 && (
        <Link href="/exchanges" className="card mt-4 flex items-center gap-3 border-l-4 border-amber-400 p-4">
          <Icon name="bell" className="text-amber-600" />
          <span className="flex-1 text-[15px] font-bold">{needsAction} {needsAction === 1 ? "item needs" : "items need"} your response</span>
          <Icon name="right" size={18} className="text-muted" />
        </Link>
      )}

      {recentHelpers.length > 0 && (
        <div className="-mx-4 mt-5 flex gap-4 overflow-x-auto px-4 pb-1">
          {recentHelpers.map((l) => (
            <Link key={l.ownerId} href={`/u/${l.owner.profile?.username}`} className="flex w-16 shrink-0 flex-col items-center gap-1">
              <Avatar preset={l.owner.profile?.avatar} size={60} online={!l.owner.profile?.paused} />
              <span className="w-full truncate text-center text-[12px] font-semibold">{l.owner.profile?.displayName}</span>
            </Link>
          ))}
        </div>
      )}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="h-section">Find a little help</h2>
          <Link href="/explore?kind=OFFER" className="text-[14px] font-bold text-teal-700">See all</Link>
        </div>
        {spend.length > 0 ? (
          <>
            <p className="-mt-2 mb-3 text-[13px] text-muted">Offers you can afford with your {wallet.available} coins.</p>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
              {spend.map((l) => <MiniListingCard key={l.id} listing={l} />)}
            </div>
          </>
        ) : (
          <div className="card p-4 text-[14px] text-ink-soft">
            {wallet.available === 0 ? "Help a neighbour to earn coins you can spend here." : "No affordable offers right now."}{" "}
            <Link href="/listings/new?kind=REQUEST" className="font-bold text-teal-700">Post a request</Link> and helpers will come to you.
          </div>
        )}
      </section>

      {opportunities.length > 0 && (
        <section className="mt-6">
          <h2 className="h-section mb-3">Requests that match your skills</h2>
          <div className="space-y-3">
            {opportunities.slice(0, 3).map(({ listing, why }) => <ListingCard key={listing.id} listing={listing} why={why} />)}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="h-section mb-3">For your community</h2>
        <div className="card-tint relative overflow-hidden p-5">
          <div className="mb-3 grid size-10 place-items-center rounded-full bg-white text-teal-700"><Icon name="users" /></div>
          <p className="text-[20px] font-extrabold">Share what you know</p>
          <p className="text-[14px] text-ink-soft">Someone nearby could use your skills.</p>
          <div className="mt-4 flex items-center justify-between">
            <Link href="/listings/new?kind=OFFER" className="btn-secondary btn-sm">Offer a skill</Link>
            <Link href="/listings/new?kind=OFFER" aria-label="Offer a skill" className="grid size-11 place-items-center rounded-full bg-white shadow"><Icon name="right" /></Link>
          </div>
        </div>
      </section>
    </Screen>
  );
}
