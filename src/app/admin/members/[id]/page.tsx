import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { audit } from "@/lib/services/support";
import { ROLES } from "@/lib/services/admin";
import { adminSetRole } from "@/app/actions";
import { MemberActions } from "../member-actions";
import { Avatar } from "@/components/avatar";
import { ActionForm, LocalTime, Submit } from "@/components/forms";
import { Note, StatusPill } from "@/components/ui";
import { AuditRows, actorNames } from "../../audit/rows";
import { Transactions } from "../../coins/transactions";

export const metadata = { title: "Member" };

const ROLE_LABEL: Record<string, string> = { MEMBER: "Member", MODERATOR: "Moderator", COIN_ADMIN: "Coin admin", ADMIN: "Admin" };
const TXN_INCLUDE = { entries: { include: { coinAccount: { include: { account: { include: { profile: true } } } } } } } as const;

/** Account-level view for platform admins. Private chats and shared details stay out of scope; every view is audited. */
export default async function AdminMember({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireRole(["ADMIN"]);
  const { id } = await params;
  const a = await db.account.findUnique({
    where: { id },
    include: { profile: true, memberships: { include: { community: true }, orderBy: { createdAt: "asc" } }, coinAccounts: { include: { community: true } } },
  });
  if (!a) notFound();
  await audit(db, { actorId: me.id, action: "member_viewed", targetType: "Account", targetId: id });

  const [exchanges, listings, reportsAgainst, txns, events] = await Promise.all([
    db.exchange.findMany({ where: { OR: [{ requesterId: id }, { helperId: id }] }, include: { listing: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
    db.listing.count({ where: { ownerId: id, status: "OPEN" } }),
    db.report.findMany({ where: { targetType: "PROFILE", targetId: id }, orderBy: { createdAt: "desc" }, take: 10 }),
    db.ledgerTransaction.findMany({ where: { entries: { some: { coinAccount: { accountId: id } } } }, include: TXN_INCLUDE, orderBy: { createdAt: "desc" }, take: 20 }),
    db.auditEvent.findMany({ where: { targetType: "Account", targetId: id, action: { not: "member_viewed" } }, orderBy: { createdAt: "desc" }, take: 15 }),
  ]);
  const reversed = new Set((await db.ledgerTransaction.findMany({ where: { reversesId: { in: txns.map((t) => t.id) } }, select: { reversesId: true } })).map((t) => t.reversesId!));
  const names = await actorNames(events);
  const isSelf = me.id === id;

  return (
    <div className="space-y-6">
      <Link href="/admin/members" className="text-[14px] font-bold text-teal-700">← Members</Link>
      <header className="flex items-start gap-4">
        <Avatar preset={a.profile?.avatar} size={72} />
        <div className="min-w-0 flex-1">
          <h2 className="text-[22px] font-extrabold">{a.profile?.displayName ?? "(no profile yet)"} {a.profile && <span className="text-[15px] font-semibold text-muted">@{a.profile.username}</span>}</h2>
          <p className="text-[14px] text-ink-soft">{a.email} {a.emailVerifiedAt ? "· verified" : "· not verified"}</p>
          <p className="text-[13px] text-muted">Joined <LocalTime iso={a.createdAt.toISOString()} mode="date" /> · timezone {a.timezone}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="pill bg-sky-100 text-sky-900">{ROLE_LABEL[a.role] ?? a.role}</span>
            <span className={`pill ${a.status === "ACTIVE" ? "bg-teal-50 text-teal-800" : a.status === "SUSPENDED" ? "bg-orange-100 text-orange-900" : "bg-gray-100 text-gray-600"}`}>{a.status === "SUSPENDED" ? "blocked" : a.status === "CLOSED" ? "deleted" : a.status.toLowerCase()}</span>
            {a.profile?.paused && <span className="pill bg-gray-100 text-gray-700">paused</span>}
          </div>
        </div>
        {a.profile && a.status !== "CLOSED" && <Link href={`/u/${a.profile.username}`} className="btn-secondary btn-sm">Public profile</Link>}
      </header>

      {a.status !== "CLOSED" && !isSelf && (
        <div className="grid gap-3 md:grid-cols-2">
          <section className="card p-4">
            <h3 className="font-extrabold">Platform role</h3>
            <ActionForm action={adminSetRole} className="mt-2 space-y-2">
              <input type="hidden" name="accountId" value={a.id} />
              <select name="role" defaultValue={a.role} aria-label="Role" className="field">
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
              <input name="reason" required className="field" placeholder="Reason (recorded in the audit log)" />
              <Submit className="btn-primary btn-sm">Change role</Submit>
            </ActionForm>
          </section>
          <section className="card p-4">
            <h3 className="font-extrabold">Block or delete</h3>
            <p className="mb-3 text-[13px] text-muted">{a.status === "SUSPENDED" ? "This member is blocked and can't sign in." : "Blocking signs them out and stops sign-in; deleting removes the account."}</p>
            <MemberActions from="detail" m={{ id: a.id, status: a.status, role: a.role, label: a.profile?.displayName ?? a.email }} />
          </section>
        </div>
      )}
      {isSelf && <Note icon="info">This is your own account. Another admin has to change your role or status.</Note>}

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h3 className="h-section mb-2">Communities</h3>
          <div className="card divide-y divide-line">
            {a.memberships.map((m) => {
              const wallet = a.coinAccounts.find((c) => c.communityId === m.communityId);
              return (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3 text-[14px]">
                  <div className="flex-1"><p className="font-bold">{m.community.name}</p><p className="text-[12px] text-muted">{m.status.toLowerCase()} · {m.role.toLowerCase()}{m.viaInvite ? " · invite code" : ""}</p></div>
                  {wallet && <p className="text-right"><span className="font-extrabold">{wallet.available}</span> <span className="text-muted">coins</span>{wallet.reserved > 0 && <span className="block text-[12px] text-muted">{wallet.reserved} held</span>}</p>}
                </div>
              );
            })}
            {a.memberships.length === 0 && <p className="px-4 py-3 text-[14px] text-muted">No community.</p>}
          </div>
        </section>
        <section>
          <h3 className="h-section mb-2">Exchanges <span className="text-[13px] font-semibold text-muted">· {listings} open listing{listings === 1 ? "" : "s"}</span></h3>
          <div className="card divide-y divide-line">
            {exchanges.map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3 text-[14px]">
                <div className="min-w-0 flex-1"><p className="truncate font-bold">{e.ref} · {e.listing.title}</p><p className="text-[12px] text-muted">{e.helperId === id ? "Helper" : "Requester"} · <LocalTime iso={e.updatedAt.toISOString()} mode="relative" /></p></div>
                <StatusPill status={e.status} />
              </div>
            ))}
            {exchanges.length === 0 && <p className="px-4 py-3 text-[14px] text-muted">None yet.</p>}
          </div>
        </section>
      </div>

      <section>
        <h3 className="h-section mb-2">Reports about this member ({reportsAgainst.length})</h3>
        <div className="card divide-y divide-line">
          {reportsAgainst.map((r) => (
            <div key={r.id} className="px-4 py-3 text-[14px]"><p><span className="font-bold">{r.ref}</span> · {r.category} · {r.status.toLowerCase()}</p>{r.resolution && <p className="text-[12px] text-muted">{r.resolution}</p>}</div>
          ))}
          {reportsAgainst.length === 0 && <p className="px-4 py-3 text-[14px] text-muted">None.</p>}
        </div>
      </section>

      <section>
        <h3 className="h-section mb-2">Coin transactions</h3>
        <Transactions txns={txns} reversed={reversed} canReverse />
      </section>

      <section>
        <h3 className="h-section mb-2">Account history</h3>
        <AuditRows events={events} names={names} />
      </section>

      <Note icon="lock">Private chats, contact details and sharing grants aren&apos;t shown here. Moderators reach chats only through a case.</Note>
    </div>
  );
}
