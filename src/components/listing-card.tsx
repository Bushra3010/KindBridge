import Link from "next/link";
import { Avatar } from "./avatar";
import { Coin } from "./brand";
import { Icon } from "./icons";
import { CATEGORY_ICON } from "./ui";
import { FORMATS, type Format } from "@/lib/constants";

type L = {
  id: string; kind: string; title: string; coins: number; durationMin: number; format: string;
  category: { slug: string; name: string };
  owner: { profile: { displayName: string; avatar: string; paused: boolean } | null };
};

export function ListingCard({ listing, why }: { listing: L; why?: string }) {
  const p = listing.owner.profile;
  return (
    <Link href={`/listings/${listing.id}`} className="card flex items-center gap-3 p-4 transition hover:shadow-lg">
      <Avatar preset={p?.avatar} size={52} online={!p?.paused} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-bold text-ink-soft">{p?.displayName}</span>
          <span className={`pill ${listing.kind === "OFFER" ? "bg-teal-50 text-teal-800" : "bg-sky-50 text-sky-900"}`}>{listing.kind === "OFFER" ? "Offering" : "Needs help"}</span>
        </div>
        <div className="truncate text-[16px] font-bold">{listing.title}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
          <span className="inline-flex items-center gap-1"><Coin size={14} />{listing.coins} coins</span>·
          <span>{listing.durationMin} min</span>·
          <span className="inline-flex items-center gap-1"><Icon name={listing.format === "ONLINE" ? "video" : "pin"} size={13} />{FORMATS[listing.format as Format]}</span>
        </div>
        {why && <div className="mt-1 text-[12px] font-semibold text-teal-700">✓ {why}</div>}
      </div>
      <Icon name={CATEGORY_ICON[listing.category.slug] ?? "sparkle"} className="shrink-0 text-teal-600" />
    </Link>
  );
}

export function MiniListingCard({ listing }: { listing: L }) {
  return (
    <Link href={`/listings/${listing.id}`} className="card flex w-40 shrink-0 flex-col gap-3 p-4 transition hover:shadow-lg">
      <div className="grid size-10 place-items-center rounded-full bg-teal-50 text-teal-700"><Icon name={CATEGORY_ICON[listing.category.slug] ?? "sparkle"} /></div>
      <div className="line-clamp-2 min-h-[2.5em] text-[15px] font-bold leading-tight">{listing.title}</div>
      <div className="flex items-center gap-1 text-[12px] text-muted"><Coin size={13} />{listing.coins} coins · {listing.durationMin} min</div>
    </Link>
  );
}
