import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { postListing } from "@/app/actions";
import { AVAILABILITY_OPTIONS, DURATIONS } from "@/lib/constants";
import { ActionForm, Submit } from "@/components/forms";
import { Avatar } from "@/components/avatar";
import { Coin } from "@/components/brand";
import { Icon } from "@/components/icons";
import { FormatToggle } from "@/components/terms-fields";
import { Note, PageHeader, Screen } from "@/components/ui";

export const metadata = { title: "New listing" };

export default async function NewListing({ searchParams }: { searchParams: Promise<{ kind?: string; category?: string }> }) {
  const { profile } = await requireMember();
  const sp = await searchParams;
  const kind = sp.kind === "OFFER" ? "OFFER" : "REQUEST";
  const categories = await db.skillCategory.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  const isOffer = kind === "OFFER";

  return (
    <Screen>
      <PageHeader title={isOffer ? "What can you offer?" : "What do you need?"} back="/home" />
      <div className="card mb-4 flex items-center gap-3 p-4">
        <Avatar preset={profile.avatar} size={48} />
        <div>
          <p className="font-bold">{profile.displayName}</p>
          <p className="text-[13px] text-muted">Your username is shown, not your real name.</p>
        </div>
      </div>
      <ActionForm action={postListing} className="space-y-4">
        <input type="hidden" name="kind" value={kind} />
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" name="title" className="field" placeholder={isOffer ? "Spreadsheet basics" : "Help with my presentation"} required minLength={4} maxLength={80} />
        </div>
        <div>
          <label className="label" htmlFor="categoryId">Category</label>
          <select id="categoryId" name="categoryId" className="field" required defaultValue={categories.find((c) => c.slug === sp.category)?.id}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <p className="mt-1 text-[12px] text-muted">Only approved everyday categories. No medical, legal, financial, childcare or home-visit services.</p>
        </div>
        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={3} className="field" placeholder={isOffer ? "What you can help with and your experience level." : "I'd love feedback on a 5-minute talk."} required minLength={10} maxLength={800} />
          <p className="mt-1 text-[12px] text-muted">Don't include your address, phone number or real name.</p>
        </div>
        <FormatToggle />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="durationMin">Duration</label>
            <select id="durationMin" name="durationMin" className="field" defaultValue={30}>
              {DURATIONS.map((m) => <option key={m} value={m}>{m} min</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="coins">Help coins</label>
            <div className="relative">
              <Coin size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input id="coins" name="coins" type="number" min={1} max={500} defaultValue={10} className="field pl-11" required />
            </div>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="availability">Availability</label>
          <select id="availability" name="availability" className="field" defaultValue={profile.availability}>
            {AVAILABILITY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <Note>{isOffer ? "Coins are paid to you only after the other member confirms your help." : "Coins are reserved only when you accept a proposal, and released after you confirm the help."}</Note>
        <Submit>{isOffer ? "Publish offer" : "Publish request"} <Icon name="right" size={18} /></Submit>
      </ActionForm>
    </Screen>
  );
}
