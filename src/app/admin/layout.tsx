import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";

export const metadata = { title: { default: "Admin", template: "%s · Admin · KindBridge" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireRole(["ADMIN", "COIN_ADMIN"]);
  const name = me.profile?.displayName ?? "Administrator";
  return (
    <div className="admin-shell">
      <a href="#admin-content" className="admin-skip-link">Skip to content</a>
      <AdminNav role={me.role} name={name} avatar={me.profile?.avatar} />
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="flex items-center gap-2 text-sm text-muted"><Icon name="shieldCheck" size={17} /><span>Administration</span><span className="px-1 text-line">/</span><span className="font-bold text-ink">KindBridge</span></div>
          <Link href="/admin/profile" className="flex items-center gap-3 rounded-full p-1.5 hover:bg-white"><span className="hidden text-sm font-bold sm:block">{name}</span><Avatar preset={me.profile?.avatar} size={34} /><span className="sr-only">My admin profile</span></Link>
        </header>
        <main id="admin-content" className="admin-content" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}
