import { CoinAmount } from "@/components/brand";
import { Icon } from "@/components/icons";
import { JsonLd, howItWorksGraph } from "@/components/json-ld";
import { PublicFooter } from "@/components/public-footer";
import { PageHeader } from "@/components/ui";
import { FAQ, HOW_IT_WORKS, publicMetadata } from "@/lib/site";

export const metadata = publicMetadata({
  title: "How it works — skill sharing with help coins",
  description:
    "How KindBridge works: join your community, list your skills, help a neighbour to earn help coins and spend them on help from someone else. Free, 18+, with private usernames. Answers to common questions.",
  path: "/how-it-works",
});

export default function HowItWorks() {
  return (
    <main className="mx-auto max-w-md px-4 pb-16 pt-4">
      <JsonLd data={howItWorksGraph()} />
      <PageHeader title="How KindBridge works" back="/" />

      <section aria-labelledby="summary">
        <h2 id="summary" className="sr-only">In short</h2>
        <p className="text-[15px] text-ink-soft">
          <strong className="text-ink">KindBridge is a free skill-sharing app for adults in your community.</strong>{" "}
          You help one member and earn help coins, then spend those coins on help from anyone else — no direct swap
          needed. Your real name and contact details stay private unless you choose to share them.
        </p>
        <div className="card mt-4 p-4 text-[14px] text-ink-soft">
          <p className="font-bold text-ink">Example</p>
          <p className="mt-1">
            PlantWizard helps a neighbour with balcony plants and earns <CoinAmount value={20} size={14} className="text-ink" />.
            Later, PlantWizard spends those coins on spreadsheet help from SheetExpert, who can spend them on someone else&apos;s help.
          </p>
        </div>
      </section>

      <h2 className="h-section mb-2 mt-8">Step by step</h2>
      <ol className="space-y-3">
        {HOW_IT_WORKS.map((s, i) => (
          <li key={s.name} id={`step-${i + 1}`} className="card flex gap-3 p-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-teal-100 font-bold text-teal-800">{i + 1}</span>
            <div>
              <h3 className="font-bold">{s.name}</h3>
              <p className="mt-1 text-[14px] text-ink-soft">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="h-section mb-2 mt-8">Frequently asked questions</h2>
      <div className="space-y-2">
        {FAQ.map((f) => (
          <details key={f.q} className="card group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">
              <h3>{f.q}</h3>
              <Icon name="right" size={18} className="shrink-0 text-muted transition group-open:rotate-90" />
            </summary>
            <p className="mt-2 text-[14px] text-ink-soft">{f.a}</p>
          </details>
        ))}
      </div>

      <PublicFooter />
    </main>
  );
}
