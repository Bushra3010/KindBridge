import Link from "next/link";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { searchListings, type SearchFilters } from "@/lib/services/listings";
import { getOrCreateMemberAccount } from "@/lib/services/ledger";
import { AVAILABILITY_OPTIONS } from "@/lib/constants";
import { Coin } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ListingCard } from "@/components/listing-card";
import { EmptyState, Screen } from "@/components/ui";

export const metadata = { title: "Explore" };

type SP = { q?: string; category?: string; kind?: string; format?: string; availability?: string; max?: string; filters?: string };

export default async function Explore({ searchParams }: { searchParams: Promise<SP> }) {
  const { account, community } = await requireMember();
  const sp = await searchParams;
  const wallet = await getOrCreateMemberAccount(db, community.id, account.id);
  const categories = await db.skillCategory.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  const filters: SearchFilters = {
    q: sp.q,
    category: sp.category,
    kind: sp.kind === "OFFER" || sp.kind === "REQUEST" ? sp.kind : undefined,
    format: sp.format === "ONLINE" || sp.format === "SHARED_SPACE" ? sp.format : undefined,
    availability: sp.availability || undefined,
    maxCoins: sp.max === "affordable" ? wallet.available : sp.max ? Number(sp.max) || undefined : undefined,
  };
  const results = await searchListings(account.id, community.id, filters);

  const href = (patch: Partial<SP>) => {
    const next = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/explore${next.size ? `?${next}` : ""}`;
  };
  const activeFilters = [filters.kind, filters.format, filters.availability, sp.max].filter(Boolean).length;

  return (
    <Screen>
      <header className="flex items-center justify-between pt-2">
        <h1 className="text-[26px] font-extrabold">Explore</h1>
        <Link href="/coins" className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-2 text-[14px] font-bold shadow-sm"><Coin size={20} /> {wallet.available} coins</Link>
      </header>

      <form className="mt-4 flex gap-2" role="search">
        {sp.category && <input type="hidden" name="category" value={sp.category} />}
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={sp.q} className="field rounded-full pl-12" placeholder="Find a skill" aria-label="Search listings" />
        </div>
        <Link href={href({ filters: sp.filters ? "" : "1" })} className={`relative grid size-12 shrink-0 place-items-center rounded-full shadow-sm ${sp.filters ? "bg-teal-100 text-teal-800" : "bg-white"}`} aria-label="Filters" aria-expanded={!!sp.filters}>
          <Icon name="filter" />
          {activeFilters > 0 && <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-teal-700 text-[11px] font-bold text-white">{activeFilters}</span>}
        </Link>
      </form>

      {sp.filters && (
        <form className="card mt-3 space-y-3 p-4">
          {Object.entries(sp).filter(([k]) => ["q", "category"].includes(k)).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <div className="grid grid-cols-2 gap-3">
            <label className="text-[13px] font-bold text-ink-soft">Type
              <select name="kind" defaultValue={sp.kind ?? ""} className="field mt-1 py-2.5">
                <option value="">Offers & requests</option><option value="OFFER">Offers</option><option value="REQUEST">Requests</option>
              </select>
            </label>
            <label className="text-[13px] font-bold text-ink-soft">Format
              <select name="format" defaultValue={sp.format ?? ""} className="field mt-1 py-2.5">
                <option value="">Any</option><option value="ONLINE">Online</option><option value="SHARED_SPACE">Shared space</option>
              </select>
            </label>
            <label className="text-[13px] font-bold text-ink-soft">Availability
              <select name="availability" defaultValue={sp.availability ?? ""} className="field mt-1 py-2.5">
                <option value="">Any time</option>{AVAILABILITY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="text-[13px] font-bold text-ink-soft">Coins
              <select name="max" defaultValue={sp.max ?? ""} className="field mt-1 py-2.5">
                <option value="">Any amount</option><option value="affordable">Within my balance</option><option value="10">Up to 10</option><option value="20">Up to 20</option><option value="40">Up to 40</option>
              </select>
            </label>
          </div>
          <div className="flex gap-2">
            <Link href={`/explore${sp.q ? `?q=${encodeURIComponent(sp.q)}` : ""}`} className="btn-secondary btn-sm flex-1">Clear</Link>
            <button className="btn-primary btn-sm flex-1">Apply filters</button>
          </div>
        </form>
      )}

      <nav aria-label="Categories" className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Link href={href({ category: "" })} className={`chip shrink-0 ${!sp.category ? "chip-on" : ""}`}>All</Link>
        {categories.map((c) => (
          <Link key={c.id} href={href({ category: c.slug })} className={`chip shrink-0 ${sp.category === c.slug ? "chip-on" : ""}`} aria-current={sp.category === c.slug ? "true" : undefined}>{c.name}</Link>
        ))}
      </nav>

      <section className="mt-4 space-y-3" aria-live="polite">
        <p className="sr-only">{results.length} results</p>
        {results.map((l) => <ListingCard key={l.id} listing={l} />)}
        {results.length === 0 && (
          <EmptyState
            icon="search"
            title="No matches yet"
            body="Nobody in your community is offering this right now. Post a request and members with the skill can send you proposals."
            action={<Link href="/listings/new?kind=REQUEST" className="btn-primary">Post a request</Link>}
          />
        )}
      </section>

      {results.length > 0 && (
        <Link href="/listings/new?kind=REQUEST" className="card-tint mt-4 flex items-center justify-center gap-2 rounded-full py-4 font-bold">
          <Icon name="plusCircle" /> Post a request
        </Link>
      )}
    </Screen>
  );
}
