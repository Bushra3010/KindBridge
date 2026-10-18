import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/auth";
import { signup } from "@/app/actions";
import { ActionForm, Submit } from "@/components/forms";
import { AVATAR_KEYS } from "@/components/avatar";
import { Icon } from "@/components/icons";
import { PageHeader, Screen } from "@/components/ui";
import { AvatarPicker } from "./avatar-picker";

export const metadata = { title: "Create your account" };

export default async function Signup() {
  const a = await currentAccount();
  if (a) redirect(a.emailVerifiedAt ? "/home" : "/verify");
  return (
    <Screen nav={false}>
      <PageHeader title="" back="/" />
      <div className="text-center">
        <h1 className="text-[26px] font-extrabold">Create your account</h1>
        <p className="mt-1 text-ink-soft">Your real name stays private.</p>
      </div>
      <ActionForm action={signup} className="mt-6 space-y-4">
        <AvatarPicker keys={AVATAR_KEYS} />
        <div>
          <label className="label" htmlFor="username">Username</label>
          <div className="relative">
            <Icon name="user" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input id="username" name="username" className="field pl-12" placeholder="Nova18" autoComplete="username" required minLength={3} maxLength={20} pattern="[A-Za-z][A-Za-z0-9_]*" aria-describedby="username-hint" />
          </div>
          <p id="username-hint" className="mt-1 text-[12px] text-muted">Shown to others instead of your name. Avoid using your real name.</p>
        </div>
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <div className="relative">
            <Icon name="file" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input id="email" name="email" type="email" className="field pl-12" placeholder="you@example.com" autoComplete="email" required />
          </div>
          <p className="mt-1 text-[12px] text-muted">Private. Used only for sign-in and verification.</p>
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <Icon name="lock" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input id="password" name="password" type="password" className="field pl-12" autoComplete="new-password" minLength={8} required />
          </div>
        </div>
        <label className="flex items-start gap-3 rounded-2xl bg-white/60 p-3 text-[14px]">
          <input type="checkbox" name="adult" className="mt-0.5 size-5 accent-teal-700" required />
          <span>I am 18+ and accept the <Link href="/rules" className="font-bold text-teal-700 underline" target="_blank">community rules</Link></span>
        </label>
        <Submit>Create account <Icon name="right" size={18} /></Submit>
        <p className="text-center text-[13px] text-muted">You'll verify your email to continue.</p>
      </ActionForm>
      <p className="mt-6 text-center text-[14px]">Already a member? <Link href="/login" className="font-bold text-teal-700">Sign in</Link></p>
    </Screen>
  );
}
