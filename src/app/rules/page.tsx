import { PageHeader } from "@/components/ui";

export const metadata = { title: "Community rules" };

const RULES: [string, string][] = [
  ["Adults only", "KindBridge is for members aged 18 and over."],
  ["Everyday help only", "No medical, legal, financial, hazardous, regulated, childcare or personal-care services. No private-home visits during the pilot — meet online or in an agreed shared space."],
  ["Never ask for passwords", "Tech help never requires someone's account passwords, PINs or one-time codes. Report anyone who asks."],
  ["Respect privacy", "Don't post addresses, phone numbers or real names in listings or reviews. Share details only through Share details, with one person at a time."],
  ["Coins are for help, not cash", "Help coins can't be bought, sold, withdrawn or transferred outside a confirmed exchange."],
  ["Be honest", "Confirm help you received, raise problems through the app, and write reviews that reflect the session."],
  ["We don't provide emergency help", "If you're in danger, contact local emergency services. KindBridge support triages reports within one business day during support hours."],
];

export default function Rules() {
  return (
    <main className="mx-auto max-w-md px-4 pb-16 pt-4">
      <PageHeader title="Community rules" back="/" />
      <ol className="space-y-3">
        {RULES.map(([t, b], i) => (
          <li key={t} className="card p-4">
            <p className="font-bold">{i + 1}. {t}</p>
            <p className="mt-1 text-[14px] text-ink-soft">{b}</p>
          </li>
        ))}
      </ol>
      <h2 className="h-section mb-2 mt-6">Meeting in a shared space</h2>
      <p className="text-[14px] text-ink-soft">Choose a public or common area such as a society clubhouse, campus library or coworking lounge. Tell someone where you'll be. You never need to share your home address.</p>
    </main>
  );
}
