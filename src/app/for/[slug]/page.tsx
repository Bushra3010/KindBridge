import { notFound } from "next/navigation";
import { CoinAmount } from "@/components/brand";
import { JsonLd, pageGraph } from "@/components/json-ld";
import { PublicFooter } from "@/components/public-footer";
import { PageHeader } from "@/components/ui";
import { AUDIENCES, HOW_IT_WORKS, publicMetadata } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return AUDIENCES.map((a) => ({ slug: a.slug }));
}

const find = (slug: string) => AUDIENCES.find((a) => a.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = find((await params).slug);
  if (!a) return {};
  return publicMetadata({ title: a.title, description: a.description, path: `/for/${a.slug}` });
}

export default async function AudiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = find((await params).slug);
  if (!a) notFound();
  const path = `/for/${a.slug}`;
  return (
    <main className="mx-auto max-w-md px-4 pb-16 pt-4">
      <JsonLd data={pageGraph({ path, name: a.title, description: a.description })} />
      <PageHeader title={a.name} back="/" />

      <h2 className="text-[22px] font-extrabold leading-tight">{a.title}</h2>
      <p className="mt-3 text-[15px] text-ink-soft">{a.intro}</p>

      <h2 className="h-section mb-2 mt-8">Help members trade</h2>
      <ul className="card divide-y divide-line">
        {a.examples.map((e) => <li key={e} className="px-4 py-3 text-[14px]">{e}</li>)}
      </ul>

      <h2 className="h-section mb-2 mt-8">Why it works for {a.name.toLowerCase()}</h2>
      <ul className="space-y-3 text-[14px] text-ink-soft">
        <li className="card p-4"><p className="font-bold text-ink">Fair without being transactional</p><p className="mt-1">Members earn help coins for helping and spend them on help from anyone in the community. Coins are never bought, sold or cashed out.</p></li>
        <li className="card p-4"><p className="font-bold text-ink">Private by default</p><p className="mt-1">Everyone uses a username and avatar. Phone numbers and real names stay hidden unless a member chooses to share them with one person.</p></li>
        <li className="card p-4"><p className="font-bold text-ink">Safe places to meet</p><p className="mt-1">{a.meet}</p></li>
        <li className="card p-4"><p className="font-bold text-ink">Organizer and moderator tools</p><p className="mt-1">Organizers approve who joins. Members can report or block, and moderators resolve disputes with a full record of every coin movement.</p></li>
      </ul>

      <h2 className="h-section mb-2 mt-8">How an exchange works</h2>
      <ol className="list-decimal space-y-1.5 pl-5 text-[14px] text-ink-soft">
        {HOW_IT_WORKS.map((s) => <li key={s.name}><span className="font-bold text-ink">{s.name}.</span> {s.text}</li>)}
      </ol>
      <p className="mt-4 text-[14px] text-ink-soft">For example, an hour of spreadsheet help might be agreed at <CoinAmount value={20} size={14} className="text-ink" />.</p>

      <PublicFooter />
    </main>
  );
}
