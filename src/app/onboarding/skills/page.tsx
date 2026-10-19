import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentAccount } from "@/lib/auth";
import { saveSkills } from "@/app/actions";
import { AVAILABILITY_OPTIONS } from "@/lib/constants";
import { ActionForm, Submit } from "@/components/forms";
import { Icon } from "@/components/icons";
import { SkillChips } from "@/components/skill-chips";
import { CustomSkills } from "@/components/custom-skills";
import { PageHeader, Screen } from "@/components/ui";

export const metadata = { title: "What can you share?" };

export default async function Skills({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const account = await currentAccount();
  if (!account) redirect("/login");
  const { next } = await searchParams;
  // Members are placed in the pilot community before skills; see /onboarding/community.
  if (!(await db.membership.findFirst({ where: { accountId: account.id, status: "APPROVED" } }))) redirect("/onboarding/community");
  const [categories, mine, custom] = await Promise.all([
    db.skillCategory.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    db.userSkill.findMany({ where: { accountId: account.id } }),
    db.customSkill.findMany({ where: { accountId: account.id }, orderBy: { id: "asc" } }),
  ]);
  const offer = mine.filter((s) => s.kind === "OFFER").map((s) => s.categoryId);
  const need = mine.filter((s) => s.kind === "NEED").map((s) => s.categoryId);
  const offerCustom = custom.filter((s) => s.kind === "OFFER").map((s) => s.name);
  const needCustom = custom.filter((s) => s.kind === "NEED").map((s) => s.name);

  return (
    <Screen nav={false}>
      <PageHeader
        title=""
        back={next}
        right={!next && (
          <div className="text-right text-[13px] font-semibold text-ink-soft">
            Step 2 of 2
            <div className="mt-1 flex items-center gap-1"><span className="size-2 rounded-full bg-teal-600" /><span className="h-0.5 w-5 bg-teal-200" /><span className="size-3 rounded-full bg-teal-600 ring-4 ring-teal-100" /></div>
          </div>
        )}
      />
      <ActionForm action={saveSkills} className="space-y-6">
        <input type="hidden" name="next" value={next ?? ""} />
        <section>
          <h1 className="text-[24px] font-extrabold">What can you share?</h1>
          <p className="mb-3 text-ink-soft">Select a few skills to get started.</p>
          <SkillChips name="offer" categories={categories} selected={offer} />
          <CustomSkills name="offerCustom" initial={offerCustom} label="Add another skill you can share" />
        </section>
        <section>
          <h2 className="text-[20px] font-extrabold">What would you like help with?</h2>
          <p className="mb-3 text-ink-soft">Choose a few areas where you'd like support.</p>
          <SkillChips name="need" categories={categories} selected={need} />
          <CustomSkills name="needCustom" initial={needCustom} label="Add something else you'd like help with" />
        </section>
        <section>
          <label htmlFor="availability" className="h-section mb-2 block">When are you available?</label>
          <div className="relative">
            <Icon name="calendar" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <select id="availability" name="availability" className="field appearance-none pl-12" defaultValue={account.profile?.availability ?? "Weekends"}>
              {AVAILABILITY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
            <Icon name="down" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </section>
        <div>
          <Submit>{next ? "Save" : "Continue"} <Icon name="right" size={18} /></Submit>
          <p className="mt-2 text-center text-[13px] text-muted">You can edit this later.</p>
        </div>
      </ActionForm>
    </Screen>
  );
}
