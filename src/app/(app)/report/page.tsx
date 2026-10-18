import { requireMember } from "@/lib/auth";
import { submitReport } from "@/app/actions";
import { REPORT_CATEGORIES } from "@/lib/constants";
import { ActionForm, Submit } from "@/components/forms";
import { Note, PageHeader, Screen } from "@/components/ui";

export const metadata = { title: "Report a problem" };

const WHAT: Record<string, string> = { LISTING: "this listing", PROFILE: "this profile", EXCHANGE: "this session", MESSAGE: "this message", REVIEW: "this review" };

export default async function Report({ searchParams }: { searchParams: Promise<{ type?: string; id?: string; category?: string }> }) {
  await requireMember();
  const { type = "OTHER", id = "", category } = await searchParams;
  const categories = category && !REPORT_CATEGORIES.includes(category) ? [category, ...REPORT_CATEGORIES] : REPORT_CATEGORIES;
  return (
    <Screen>
      <PageHeader title={WHAT[type] ? `Report ${WHAT[type]}` : "Report a problem"} back="/settings" />
      <ActionForm action={submitReport} className="card space-y-4 p-4">
        <input type="hidden" name="targetType" value={type} />
        <input type="hidden" name="targetId" value={id} />
        <div>
          <label className="label" htmlFor="category">What went wrong?</label>
          <select id="category" name="category" className="field" defaultValue={category}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div>
          <label className="label" htmlFor="explanation">Details <span className="font-normal text-muted">(optional)</span></label>
          <textarea id="explanation" name="explanation" rows={4} className="field" maxLength={1000} placeholder="What happened, and when?" />
        </div>
        <Submit>Send report</Submit>
        <Note>The other member isn't told who reported. Coin holds remain until resolved. If you're in danger, contact local emergency services.</Note>
      </ActionForm>
    </Screen>
  );
}
