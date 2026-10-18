import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/auth";
import { Coin, Logo } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Screen } from "@/components/ui";

export default async function Welcome() {
  if (await currentAccount()) redirect("/home");
  return (
    <Screen nav={false}>
      <div className="flex min-h-[calc(100dvh-60px)] flex-col items-center text-center">
        <div className="relative mt-6 flex h-56 w-full items-end justify-center overflow-hidden">
          <div className="absolute bottom-0 h-[220px] w-[340px] rounded-t-full border-[26px] border-b-0 border-sky-100" />
          <div className="absolute bottom-0 h-[160px] w-[240px] rounded-t-full border-[22px] border-b-0 border-teal-100" />
          <div className="absolute bottom-0 h-3 w-72 rounded-full bg-sky-100/80 blur-md" />
          <Coin size={128} className="relative mb-6 drop-shadow-[0_12px_18px_rgba(176,122,16,.35)]" />
        </div>
        <div className="mt-4"><Logo size={36} /></div>
        <h1 className="mt-5 text-[30px] font-extrabold leading-tight tracking-tight">A little help goes<br />a long way.</h1>
        <p className="mt-2 text-[16px] text-ink-soft">Share skills. Earn coins. Find support.</p>

        <ol className="mt-8 flex w-full items-start justify-center gap-2" aria-label="How it works">
          {[
            { icon: <Icon name="users" size={28} />, label: "Help someone", tone: "bg-sky-100 text-sky-900" },
            { icon: <Coin size={34} />, label: "Earn coins", tone: "bg-amber-50" },
            { icon: <Icon name="heart" size={28} />, label: "Get help", tone: "bg-teal-100 text-teal-800" },
          ].map((s, i) => (
            <li key={s.label} className="flex items-center gap-2">
              {i > 0 && <Icon name="right" size={16} className="mb-6 text-muted" />}
              <div className="flex w-20 flex-col items-center gap-2">
                <div className={`grid size-16 place-items-center rounded-full ${s.tone}`}>{s.icon}</div>
                <span className="text-[14px] font-bold leading-tight">{s.label}</span>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-auto w-full space-y-3 pt-10">
          <Link href="/signup" className="btn-primary w-full">Get started <Icon name="right" size={18} /></Link>
          <Link href="/login" className="btn-secondary w-full">I already have an account</Link>
          <p className="pt-1 text-[12px] text-muted">An 18+ community · <Link href="/rules" className="underline">Community rules</Link></p>
        </div>
      </div>
    </Screen>
  );
}
