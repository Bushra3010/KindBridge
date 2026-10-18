import Link from "next/link";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { markAllRead } from "@/app/actions";
import { Coin } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { LocalTime } from "@/components/forms";
import { EmptyState, PageHeader, Screen } from "@/components/ui";

export const metadata = { title: "Updates" };

const ICON: Record<string, IconName | "coin"> = { REQUESTS: "chat", COINS: "coin", COMMUNITY: "users", SAFETY: "shield" };
const TABS = [["", "All"], ["REQUESTS", "Requests"], ["COINS", "Coins"], ["COMMUNITY", "Community"]] as const;

export default async function Updates({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { account } = await requireMember();
  const { tab = "" } = await searchParams;
  const items = await db.notification.findMany({
    where: { accountId: account.id, ...(tab && { category: tab }) },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const groups = [
    { title: "Today", items: items.filter((n) => n.createdAt >= today) },
    { title: "Earlier", items: items.filter((n) => n.createdAt < today) },
  ];
  const unread = items.some((n) => !n.readAt);

  return (
    <Screen>
      <PageHeader title="Updates" back="/home" right={unread && <form action={markAllRead}><button className="btn-ghost btn-sm">Mark all read</button></form>} />
      <nav className="mb-4 flex gap-2 overflow-x-auto" aria-label="Filter updates">
        {TABS.map(([v, l]) => <Link key={v} href={v ? `/updates?tab=${v}` : "/updates"} className={`chip shrink-0 ${tab === v ? "chip-on" : ""}`}>{l}</Link>)}
      </nav>
      {items.length === 0 && <EmptyState icon="bell" title="You're all caught up" body="Proposals, bookings, coin updates and community news show up here." />}
      {groups.filter((g) => g.items.length).map((g) => (
        <section key={g.title} className="mb-5">
          <h2 className="h-section mb-2">{g.title}</h2>
          <ul className="space-y-2">
            {g.items.map((n) => {
              const icon = ICON[n.category] ?? "bell";
              return (
                <li key={n.id}>
                  <Link href={n.href} className={`card flex items-center gap-3 p-3.5 ${n.category === "COMMUNITY" ? "card-tint" : ""}`}>
                    <div className="grid size-11 shrink-0 place-items-center rounded-full bg-sky-50 text-teal-700">{icon === "coin" ? <Coin size={30} /> : <Icon name={icon} />}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold leading-snug">{n.title}</p>
                      {n.body && <p className="truncate text-[13px] text-ink-soft">{n.body}</p>}
                      <p className="text-[12px] text-muted"><LocalTime iso={n.createdAt.toISOString()} mode="relative" /></p>
                    </div>
                    {!n.readAt && <span className="size-2.5 shrink-0 rounded-full bg-teal-600" aria-label="Unread" />}
                    <Icon name="right" size={18} className="text-muted" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </Screen>
  );
}
