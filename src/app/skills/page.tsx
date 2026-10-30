import { JsonLd, pageGraph } from "@/components/json-ld";
import { PublicFooter } from "@/components/public-footer";
import { PageHeader } from "@/components/ui";
import { SKILL_AREAS, publicMetadata } from "@/lib/site";

const TITLE = "Skills you can share and learn";
const DESCRIPTION =
  "Everyday skills members share on KindBridge: language exchange, tech and laptop help, presentations, spreadsheets, creative feedback, career advice, music and plant care — traded for help coins.";

export const metadata = publicMetadata({ title: TITLE, description: DESCRIPTION, path: "/skills" });

export default function Skills() {
  return (
    <main className="mx-auto max-w-md px-4 pb-16 pt-4">
      <JsonLd data={pageGraph({ path: "/skills", name: TITLE, description: DESCRIPTION })} />
      <PageHeader title="Skills you can share" back="/" />
      <p className="text-[15px] text-ink-soft">
        On KindBridge you type your own skills — what you can offer and what you&apos;d like help with. These are the kinds of
        everyday help members trade for help coins.
      </p>
      <ul className="mt-6 space-y-3">
        {SKILL_AREAS.map((s) => (
          <li key={s.name} className="card p-4">
            <h2 className="font-bold">{s.name}</h2>
            <p className="mt-1 text-[14px] text-ink-soft">{s.text}</p>
          </li>
        ))}
      </ul>
      <PublicFooter />
    </main>
  );
}
