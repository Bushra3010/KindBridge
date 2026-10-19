import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/auth";
import { Coin, Logo } from "@/components/brand";
import { Icon } from "@/components/icons";
import { WelcomeArt } from "@/components/welcome-art";
import { Screen } from "@/components/ui";

export default async function Welcome() {
  if (await currentAccount()) redirect("/home");
  return (
    <Screen nav={false}>
      <div className="welcome-content flex min-h-[calc(100dvh-74px)] flex-col items-center text-center">
        <WelcomeArt />
        <div className="welcome-logo mt-4"><Logo size={34} /></div>
        <h1 className="welcome-title mt-5 text-[32px] font-extrabold leading-tight tracking-tight">A little help goes<br />a long way.</h1>
        <p className="mt-2 text-[16px] text-ink-soft">Share skills. Earn coins. Find support.</p>

        <ol className="welcome-steps mt-7 flex w-full items-start justify-center gap-2" aria-label="How it works">
          {[
            { icon: <Icon name="users" size={28} />, label: "Help someone", tone: "bg-sky-100 text-sky-900" },
            { icon: <Coin size={34} />, label: "Earn coins", tone: "bg-amber-50" },
            { icon: <Icon name="heart" size={28} />, label: "Get help", tone: "bg-teal-100 text-teal-800" },
          ].map((s, i) => (
            <li key={s.label} className="flex items-center gap-2">
              {i > 0 && <Icon name="right" size={16} className="mb-6 text-muted" />}
              <div className="flex w-20 flex-col items-center gap-2">
                <div className={`grid size-[72px] place-items-center rounded-full ${s.tone}`}>{s.icon}</div>
                <span className="text-[14px] font-bold leading-tight">{s.label}</span>
              </div>
            </li>
          ))}
        </ol>

        <div className="welcome-actions mt-auto w-full space-y-2.5 pt-8">
          <Link href="/signup" className="btn-primary w-full">Get started <Icon name="right" size={18} /></Link>
          <Link href="/login" className="btn-secondary w-full">I already have an account</Link>
          <p className="pt-1 text-[12px] text-muted">An 18+ community · <Link href="/rules" className="underline">Community rules</Link></p>
        </div>
      </div>
    </Screen>
  );
}
