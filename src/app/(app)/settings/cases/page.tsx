import Link from "next/link";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { LocalTime } from "@/components/forms";
import { EmptyState, PageHeader, Screen } from "@/components/ui";

export const metadata = { title: "My support cases" };

const TONE: Record<string, string> = { OPEN: "bg-sky-100 text-sky-900", IN_REVIEW: "bg-amber-100 text-amber-900", RESOLVED: "bg-green-100 text-green-800", DISMISSED: "bg-gray-100 text-gray-700" };

export default async function Cases() {
  const { account } = await requireMember();
  const cases = await db.report.findMany({ where: { reporterId: account.id }, orderBy: { createdAt: "desc" } });
  return (
    <Screen>
      <PageHeader title="My support cases" back="/settings" />
      {cases.length === 0 ? <EmptyState icon="file" title="No cases" body="Reports and session reviews you open appear here." action={<Link href="/report" className="btn-primary">Report a problem</Link>} /> : (
        <ul className="space-y-2">
          {cases.map((c) => (
            <li key={c.id} className="card p-4">
              <div className="flex items-center justify-between"><span className="font-bold">{c.ref}</span><span className={`pill ${TONE[c.status]}`}>{c.status.replace("_", " ").toLowerCase()}</span></div>
              <p className="mt-1 text-[14px]">{c.category}</p>
              <p className="text-[12px] text-muted">Opened <LocalTime iso={c.createdAt.toISOString()} mode="relative" /></p>
              {c.resolution && <p className="mt-2 rounded-2xl bg-mist p-3 text-[14px]"><strong>Outcome:</strong> {c.resolution}</p>}
              {c.status === "RESOLVED" && <Link href={`/report?type=OTHER&id=${c.id}&category=Appeal`} className="mt-2 inline-block text-[13px] font-bold text-teal-700">Appeal this decision</Link>}
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}
