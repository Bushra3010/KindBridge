"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";
import { Coin } from "./brand";

const TABS: { href: string; label: string; icon: IconName | "coin"; match: string[] }[] = [
  { href: "/home", label: "Home", icon: "home", match: ["/home"] },
  { href: "/explore", label: "Explore", icon: "compass", match: ["/explore", "/listings", "/u/"] },
  { href: "/exchanges", label: "Requests", icon: "chat", match: ["/exchanges"] },
  { href: "/coins", label: "Coins", icon: "coin", match: ["/coins"] },
  { href: "/profile", label: "Profile", icon: "user", match: ["/profile", "/privacy", "/settings", "/updates"] },
];

export function BottomNav({ unread = 0 }: { unread?: number }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 pb-[max(env(safe-area-inset-bottom),10px)]">
      <div className="mx-auto flex max-w-md items-center justify-between gap-1 rounded-full border border-white/70 bg-white/90 p-1.5 shadow-[0_8px_30px_-10px_rgb(29_54_64/.25)] backdrop-blur mx-3 sm:mx-auto">
        {TABS.map((t) => {
          const active = t.match.some((m) => path.startsWith(m));
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-12 items-center justify-center gap-1.5 rounded-full transition ${active ? "flex-[1.6] bg-gradient-to-r from-teal-100 to-sky-100 px-3 text-teal-800" : "flex-1 text-ink-soft hover:bg-mist"}`}
            >
              {t.icon === "coin" ? <Coin size={22} /> : <Icon name={t.icon} size={22} />}
              <span className={active ? "text-[13px] font-bold" : "sr-only"}>{t.label}</span>
              {t.href === "/profile" && unread > 0 && !active && (
                <span className="absolute right-3 top-2.5 size-2.5 rounded-full bg-minus ring-2 ring-white" aria-label={`${unread} unread updates`} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
