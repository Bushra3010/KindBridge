"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { logout } from "@/app/actions";
import { Logo } from "./brand";
import { Avatar } from "./avatar";
import { Icon, type IconName } from "./icons";

const SECTIONS: { href: string; label: string; icon: IconName; adminOnly?: boolean }[] = [
  { href: "/admin", label: "Overview", icon: "home" },
  { href: "/admin/members", label: "Members", icon: "users", adminOnly: true },
  { href: "/admin/communities", label: "Communities", icon: "compass", adminOnly: true },
  { href: "/admin/coins", label: "Coin ledger", icon: "award" },
  { href: "/admin/audit", label: "Audit log", icon: "history" },
  { href: "/mod", label: "Moderation", icon: "shieldCheck" },
];

export function AdminNav({ role, name, avatar }: { role: string; name: string; avatar?: string | null }) {
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const roleLabel = role === "ADMIN" ? "Platform admin" : "Coin admin";
  const navigation = <>
    <Link href="/admin" className="admin-brand" aria-label="KindBridge admin overview" onClick={() => dialog.current?.close()}><Logo size={23} /></Link>
    <div className="admin-workspace"><span className="grid size-9 place-items-center rounded-xl bg-teal-100 text-teal-800"><Icon name="shieldCheck" /></span><div><p className="font-extrabold">Admin workspace</p><p className="text-xs text-muted">{roleLabel}</p></div></div>
    <p className="admin-nav-label">WORKSPACE</p>
    <nav aria-label="Admin sections" className="space-y-1">
      {SECTIONS.filter(t => !t.adminOnly || role === "ADMIN").map(t => {
        const active = t.href === "/admin" ? path === t.href : path.startsWith(t.href);
        return <Link key={t.href} href={t.href} onClick={() => dialog.current?.close()} aria-current={active ? "page" : undefined} className={`admin-nav-link ${active ? "is-active" : ""}`}><Icon name={t.icon} size={20} /><span>{t.label}</span>{active && <span className="ml-auto size-1.5 rounded-full bg-teal-700" />}</Link>;
      })}
    </nav>
    <div className="mt-7 border-t border-line pt-5">
      <p className="admin-nav-label">ACCOUNT</p>
      <Link href="/admin/profile" onClick={() => dialog.current?.close()} aria-current={path === "/admin/profile" ? "page" : undefined} className={`admin-nav-link ${path === "/admin/profile" ? "is-active" : ""}`}><Icon name="user" />My profile</Link>
      <Link href="/home" className="admin-nav-link"><Icon name="left" />Community app</Link>
    </div>
    <div className="admin-sidebar-footer">
      <Link href="/admin/profile" onClick={() => dialog.current?.close()} className="flex min-w-0 items-center gap-3 rounded-xl p-2 hover:bg-mist"><Avatar preset={avatar} size={38} /><div className="min-w-0"><p className="truncate text-sm font-extrabold">{name}</p><p className="text-xs text-muted">{roleLabel}</p></div></Link>
      <form action={logout}><button className="admin-nav-link w-full"><Icon name="logout" size={18} />Sign out</button></form>
    </div>
  </>;
  return <>
    <aside className="admin-sidebar">{navigation}</aside>
    <div className="admin-mobile-bar"><button type="button" className="btn-secondary btn-sm" aria-label="Open admin sidebar" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>Menu</button><Logo size={20} /></div>
    <dialog ref={dialog} className="admin-drawer" aria-label="Admin navigation" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="admin-drawer-content"><button type="button" className="admin-drawer-close" aria-label="Close admin sidebar" onClick={() => dialog.current?.close()}><Icon name="x" /></button>{navigation}</div>
    </dialog>
  </>;
}
