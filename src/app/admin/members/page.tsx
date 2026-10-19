import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/services/admin";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";
import { MemberActions } from "./member-actions";

export const metadata = { title: "Members" };

const PAGE = 30;
const ROLE_LABEL: Record<string, string> = { MEMBER: "Member", MODERATOR: "Moderator", COIN_ADMIN: "Coin admin", ADMIN: "Admin" };
const STATUS_TONE: Record<string, string> = { ACTIVE: "bg-teal-50 text-teal-800", SUSPENDED: "bg-orange-100 text-orange-900", CLOSED: "bg-gray-100 text-gray-600" };

export default async function AdminMembers({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; status?: string; page?: string }> }) {
  const me = await requireRole(["ADMIN"]);
  const { q = "", role = "", status = "", page = "1" } = await searchParams;
  const p = Math.max(1, Number(page) || 1);
  const where: Prisma.AccountWhereInput = {
    ...(q && { OR: [{ email: { contains: q, mode: "insensitive" } }, { profile: { username: { contains: q.toLowerCase() } } }, { profile: { displayName: { contains: q, mode: "insensitive" } } }] }),
    ...(role === "STAFF" ? { role: { not: "MEMBER" } } : role && { role }),
    ...(status && { status }),
  };
  const [rows, total] = await Promise.all([
    db.account.findMany({
      where,
      include: { profile: true, memberships: { where: { status: { in: ["APPROVED", "PENDING"] } }, include: { community: true } } },
      orderBy: { createdAt: "desc" },
      skip: (p - 1) * PAGE,
      take: PAGE,
    }),
    db.account.count({ where }),
  ]);
  const qs = (over: Record<string, string>) => new URLSearchParams({ q, role, status, ...over }).toString();

  return (
    <div>
      <form className="mb-4 flex flex-wrap gap-2" role="search">
        <div className="relative min-w-60 flex-1">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Search email, username or name" aria-label="Search members" className="field pl-12" />
        </div>
        <select name="role" defaultValue={role} aria-label="Role" className="field w-auto">
          <option value="">All roles</option>
          <option value="STAFF">All staff</option>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
        </select>
        <select name="status" defaultValue={status} aria-label="Status" className="field w-auto">
          <option value="">Any status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Blocked</option>
          <option value="CLOSED">Deleted</option>
        </select>
        <button className="btn-primary">Filter</button>
      </form>

      <p className="mb-2 text-[13px] text-muted">{total} account{total === 1 ? "" : "s"}</p>
      <div className="card divide-y divide-line overflow-visible">
        {rows.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-mist sm:flex-nowrap">
            <Link href={`/admin/members/${a.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar preset={a.profile?.avatar} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{a.profile?.displayName ?? "(no profile yet)"} <span className="font-normal text-muted">{a.profile && `@${a.profile.username}`}</span></p>
                <p className="truncate text-[12px] text-muted">{a.email} · {a.memberships.map((m) => `${m.community.name}${m.status === "PENDING" ? " (pending)" : m.role === "ORGANIZER" ? " (organizer)" : ""}`).join(", ") || "No community"}</p>
              </div>
              {a.role !== "MEMBER" && <span className="pill bg-sky-100 text-sky-900">{ROLE_LABEL[a.role] ?? a.role}</span>}
              <span className={`pill ${STATUS_TONE[a.status] ?? ""}`}>{a.status === "SUSPENDED" ? "blocked" : a.status === "CLOSED" ? "deleted" : a.status.toLowerCase()}</span>
            </Link>
            {a.id !== me.id && <MemberActions m={{ id: a.id, status: a.status, role: a.role, label: a.profile?.displayName ?? a.email }} />}
          </div>
        ))}
        {rows.length === 0 && <p className="px-4 py-6 text-[14px] text-muted">No accounts match.</p>}
      </div>
      {total > PAGE && (
        <div className="mt-3 flex justify-between">
          {p > 1 ? <Link href={`?${qs({ page: String(p - 1) })}`} className="btn-secondary btn-sm">← Newer</Link> : <span />}
          {p * PAGE < total && <Link href={`?${qs({ page: String(p + 1) })}`} className="btn-secondary btn-sm">Older →</Link>}
        </div>
      )}
    </div>
  );
}
