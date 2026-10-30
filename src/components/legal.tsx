import type { Metadata } from "next";
import { JsonLd, pageGraph } from "@/components/json-ld";
import { PublicFooter } from "@/components/public-footer";
import { PageHeader } from "@/components/ui";
import { LEGAL, LEGAL_LABELS, LEGAL_LIVE, type LegalField } from "@/lib/legal";
import { publicMetadata } from "@/lib/site";

/** Public-page metadata, but kept out of search results until the details are final. */
export function legalMetadata(opts: { title: string; description: string; path: string }): Metadata {
  const m = publicMetadata(opts);
  return LEGAL_LIVE ? m : { ...m, robots: { index: false, follow: true } };
}

/** An operator detail, or a highlighted blank while it is still unknown. */
export function F({ k }: { k: LegalField }) {
  const v = LEGAL[k];
  if (!v) return <mark className="rounded bg-amber-100 px-1 text-amber-900">[to be confirmed: {LEGAL_LABELS[k]}]</mark>;
  if (/^[^\s@]+@[^\s@]+$/.test(v)) return <a href={`mailto:${v}`} className="font-semibold text-teal-700 underline">{v}</a>;
  return <>{v}</>;
}

export function LegalPage({ title, path, description, children }: { title: string; path: string; description: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-md px-4 pb-16 pt-4">
      <JsonLd data={pageGraph({ path, name: title, description })} />
      <PageHeader title={title} back="/" />
      {!LEGAL_LIVE && (
        <p role="note" className="mb-5 rounded-2xl bg-amber-100 p-3 text-[13px] font-semibold text-amber-900">
          Draft — this page is being finalised and is not yet in effect.
        </p>
      )}
      <p className="text-[13px] text-muted">Effective date: <F k="effectiveDate" /></p>
      <div className="legal-prose mt-4 space-y-6 text-[14px] leading-relaxed text-ink-soft">{children}</div>
      <PublicFooter cta={false} />
    </main>
  );
}

export function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-2">
      <h2 className="text-[17px] font-extrabold text-ink">{title}</h2>
      {children}
    </section>
  );
}

/** Mobile-friendly two-column table. */
export function Rows({ rows }: { rows: [React.ReactNode, React.ReactNode][] }) {
  return (
    <dl className="card divide-y divide-line">
      {rows.map(([k, v], i) => (
        <div key={i} className="px-4 py-3">
          <dt className="font-bold text-ink">{k}</dt>
          <dd className="mt-0.5">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return <ul className="list-disc space-y-1.5 pl-5">{items.map((it, i) => <li key={i}>{it}</li>)}</ul>;
}
