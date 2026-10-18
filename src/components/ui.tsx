import Link from "next/link";
import { Icon, type IconName } from "./icons";
import { EXCHANGE_STATUS_LABEL } from "@/lib/constants";

export function PageHeader({ title, back, right, subtitle }: { title: string; back?: string; right?: React.ReactNode; subtitle?: string }) {
  return (
    <header className="page-header mb-6 flex items-center gap-3 pt-2">
      {back && (
        <Link href={back} aria-label="Back" className="grid size-10 shrink-0 place-items-center rounded-full bg-white/80 text-ink shadow-sm hover:bg-white">
          <Icon name="left" />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="h-title truncate">{title}</h1>
        {subtitle && <p className="text-[14px] text-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function Screen({ children, nav = true }: { children: React.ReactNode; nav?: boolean }) {
  return <main className={`app-screen mx-auto w-full max-w-md px-5 pt-[max(env(safe-area-inset-top),24px)] ${nav ? "member-screen pb-32" : "auth-screen pb-10"}`}>{children}</main>;
}

export function Row({ href, icon, label, value, danger }: { href: string; icon: IconName; label: string; value?: React.ReactNode; danger?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3.5 transition hover:bg-mist ${danger ? "text-minus" : ""}`}>
      <Icon name={icon} className={danger ? "" : "text-ink-soft"} />
      <span className="flex-1 text-[15px] font-semibold">{label}</span>
      {value && <span className="text-[14px] text-muted">{value}</span>}
      <Icon name="right" size={18} className="text-muted" />
    </Link>
  );
}

export function EmptyState({ icon = "sparkle", title, body, action }: { icon?: IconName; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-3 grid size-14 place-items-center rounded-full bg-teal-50 text-teal-700"><Icon name={icon} size={26} /></div>
      <p className="text-[16px] font-bold">{title}</p>
      {body && <p className="mt-1 max-w-xs text-[14px] text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const STATUS_TONE: Record<string, string> = {
  PROPOSED: "bg-sky-100 text-sky-900",
  ACCEPTED: "bg-teal-100 text-teal-800",
  IN_PROGRESS: "bg-teal-100 text-teal-800",
  DELIVERED: "bg-amber-100 text-amber-900",
  COMPLETED: "bg-green-100 text-green-800",
  RESOLVED: "bg-green-100 text-green-800",
  DISPUTED: "bg-orange-100 text-orange-900",
};

export function StatusPill({ status }: { status: string }) {
  return <span className={`pill ${STATUS_TONE[status] ?? "bg-gray-100 text-gray-700"}`}>{EXCHANGE_STATUS_LABEL[status] ?? status}</span>;
}

export function Note({ icon = "info", children }: { icon?: IconName; children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-[13px] text-muted">
      <Icon name={icon} size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export const CATEGORY_ICON: Record<string, IconName> = {
  languages: "languages",
  technology: "laptop",
  presentations: "presentation",
  creative: "palette",
  career: "briefcase",
  everyday: "wrench",
  spreadsheets: "sheet",
  plants: "leaf",
  music: "music",
};
