import Link from "next/link";
import { db } from "@/lib/db";
import { LocalTime } from "@/components/forms";

type Event = { id: string; actorId: string | null; action: string; targetType: string; targetId: string; data: string; createdAt: Date };

/** Display names for the actors of a set of audit events. */
export async function actorNames(events: { actorId: string | null }[]) {
  const ids = [...new Set(events.map((e) => e.actorId).filter((x): x is string => !!x))];
  const profiles = await db.profile.findMany({ where: { accountId: { in: ids } }, select: { accountId: true, displayName: true } });
  return Object.fromEntries(profiles.map((p) => [p.accountId, p.displayName]));
}

const label = (action: string) => action.replaceAll("_", " ");

function details(data: string) {
  try {
    const d = JSON.parse(data) as Record<string, unknown>;
    return Object.entries(d).filter(([, v]) => v !== undefined && v !== "" && typeof v !== "object").map(([k, v]) => `${k}: ${v}`).join(" · ");
  } catch {
    return "";
  }
}

export function AuditRows({ events, names }: { events: Event[]; names: Record<string, string> }) {
  if (events.length === 0) return <p className="text-[14px] text-muted">Nothing recorded yet.</p>;
  return (
    <div className="card divide-y divide-line">
      {events.map((e) => (
        <div key={e.id} className="px-4 py-3 text-[14px]">
          <div className="flex items-baseline justify-between gap-3">
            <p><span className="font-bold">{e.actorId ? (names[e.actorId] ?? "Unknown") : "System"}</span> · {label(e.action)}</p>
            <span className="shrink-0 text-[12px] text-muted"><LocalTime iso={e.createdAt.toISOString()} mode="relative" /></span>
          </div>
          <p className="text-[12px] text-muted">
            {e.targetType === "Account" ? <Link href={`/admin/members/${e.targetId}`} className="underline">{e.targetType}</Link> : e.targetType} {e.targetId}
            {details(e.data) && <> · {details(e.data)}</>}
          </p>
        </div>
      ))}
    </div>
  );
}
