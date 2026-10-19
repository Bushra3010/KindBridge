import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/auth";
import { resendCode, verifyEmail } from "@/app/actions";
import { CODE_MINUTES } from "@/lib/services/verification";
import { ActionForm, Submit } from "@/components/forms";
import { Icon } from "@/components/icons";
import { Screen } from "@/components/ui";

export const metadata = { title: "Verify your email" };

export default async function Verify() {
  const account = await currentAccount();
  if (!account) redirect("/login");
  if (["ADMIN", "COIN_ADMIN"].includes(account.role)) redirect("/admin");
  if (account.emailVerifiedAt) redirect("/onboarding/community");
  return <Screen nav={false}>
    <div className="mt-10 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-teal-100 text-teal-800"><Icon name="shieldCheck" size={30} /></div>
      <h1 className="mt-4 text-[26px] font-extrabold">Verify your email</h1>
      <p className="mt-2 text-ink-soft">Enter the 6-digit code sent to <strong>{account.email}</strong>. It expires in {CODE_MINUTES} minutes. If it hasn’t arrived, check spam or request a new code below.</p>
    </div>
    <ActionForm action={verifyEmail} className="mt-8 space-y-4">
      <label className="label" htmlFor="code">Verification code</label>
      <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} className="field text-center text-[24px] font-bold tracking-[.4em]" required />
      <Submit>Verify email</Submit>
    </ActionForm>
    <ActionForm action={resendCode} className="mt-3 text-center"><Submit className="btn-ghost">Send a new code</Submit></ActionForm>
    {!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production" && <p className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-3 text-center text-[13px] text-amber-900">Development: email isn’t configured, so the code is printed in the server console.</p>}
    <p className="mt-6 text-center text-[12px] text-muted">A verified email is a contact check, not an identity check.</p>
  </Screen>;
}
