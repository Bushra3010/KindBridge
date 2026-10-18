import Link from "next/link";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { Avatar } from "@/components/avatar";
import { Coin } from "@/components/brand";
import { Icon } from "@/components/icons";
import { LocalTime } from "@/components/forms";
import { EmptyState, PageHeader, Screen, StatusPill } from "@/components/ui";

export const metadata = { title: "Requests" };

export default async function Exchanges() {
  const { account } = await requireMember();
  const [rows, myListings] = await Promise.all([
    db.exchange.findMany({
      where: { OR: [{ requesterId: account.id }, { helperId: account.id }] },
      include: {
        listing: true,
        versions: { orderBy: { version: "desc" }, take: 1 },
        requester: { include: { profile: true } },
        helper: { include: { profile: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.listing.findMany({ where: { ownerId: account.id, status: { in: ["OPEN", "PAUSED"] } }, include: { _count: { select: { exchanges: { where: { status: "PROPOSED" } } } } }, orderBy: { createdAt: "desc" } }),
  ]);

  const needsMe = (e: (typeof rows)[number]) =>
    (e.status === "PROPOSED" && e.versions[0]?.authorId !== account.id) ||
    (e.status === "DELIVERED" && e.requesterId === account.id) ||
    (e.partialAmount !== null && ["IN_PROGRESS", "DELIVERED", "DISPUTED"].includes(e.status) && (e.requesterId === account.id ? !e.partialByReq : !e.partialByHelper));

  const groups = [
    { title: "Needs your response", items: rows.filter(needsMe) },
    { title: "Upcoming & active", items: rows.filter((e) => !needsMe(e) && ["ACCEPTED", "IN_PROGRESS", "DELIVERED", "DISPUTED"].includes(e.status)) },
    { title: "Waiting on others", items: rows.filter((e) => !needsMe(e) && e.status === "PROPOSED") },
    { title: "Past", items: rows.filter((e) => ["COMPLETED", "RESOLVED", "CANCELLED", "DECLINED", "WITHDRAWN", "EXPIRED"].includes(e.status)) },
  ];

  return (
    <Screen>
      <PageHeader title="Requests" right={<Link href="/listings/new?kind=REQUEST" className="btn-primary btn-sm"><Icon name="plus" size={16} /> New</Link>} />

      {myListings.length > 0 && (
        <section className="mb-6">
          <h2 className="h-section mb-3">Your listings</h2>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {myListings.map((l) => (
              <Link key={l.id} href={`/listings/${l.id}`} className="card w-52 shrink-0 p-4">
                <span className={`pill ${l.kind === "OFFER" ? "bg-teal-50 text-teal-800" : "bg-sky-50 text-sky-900"}`}>{l.kind === "OFFER" ? "Offer" : "Request"}{l.status === "PAUSED" && " · Booked"}</span>
                <p className="mt-2 truncate font-bold">{l.title}</p>
                <p className="text-[13px] text-muted">{l._count.exchanges} open proposal{l._count.exchanges === 1 ? "" : "s"}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {rows.length === 0 && (
        <EmptyState icon="chat" title="No exchanges yet" body="Proposals you send or receive, booked sessions and chats appear here." action={<Link href="/explore" className="btn-primary">Explore help</Link>} />
      )}

      {groups.filter((g) => g.items.length).map((g) => (
        <section key={g.title} className="mb-6">
          <h2 className="h-section mb-3">{g.title}</h2>
          <ul className="space-y-2">
            {g.items.map((e) => {
              const other = e.requesterId === account.id ? e.helper : e.requester;
              const iPay = e.requesterId === account.id;
              const last = e.messages[0];
              return (
                <li key={e.id}>
                  <Link href={`/exchanges/${e.id}`} className="card flex items-center gap-3 p-3.5">
                    <Avatar preset={other.profile?.avatar} size={48} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-bold">{other.profile?.displayName}</span>
                        <StatusPill status={e.status} />
                      </div>
                      <p className="truncate text-[14px] text-ink-soft">{e.listing.title}</p>
                      {last && <p className="truncate text-[12px] text-muted">{last.kind === "SYSTEM" ? "• " : ""}{last.body}</p>}
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 text-[14px] font-bold ${iPay ? "text-ink-soft" : "text-plus"}`}><Coin size={14} />{iPay ? "" : "+"}{e.versions[0]?.coins}</span>
                      <p className="text-[11px] text-muted"><LocalTime iso={e.updatedAt.toISOString()} mode="relative" /></p>
                    </div>
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
