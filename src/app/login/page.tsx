import Link from "next/link";
import { login } from "@/app/actions";
import { ActionForm, Submit } from "@/components/forms";
import { Logo } from "@/components/brand";
import { PageHeader, Screen } from "@/components/ui";

export const metadata = { title: "Sign in" };

export default function Login() {
  return (
    <Screen nav={false}>
      <PageHeader title="" back="/" />
      <div className="mb-8 mt-4 text-center">
        <Logo size={30} />
        <h1 className="mt-6 text-[26px] font-extrabold">Welcome back</h1>
      </div>
      <ActionForm action={login} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" className="field" autoComplete="email" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" className="field" autoComplete="current-password" required />
        </div>
        <Submit>Sign in</Submit>
      </ActionForm>
      <p className="mt-6 text-center text-[14px]">New here? <Link href="/signup" className="font-bold text-teal-700">Create an account</Link></p>
    </Screen>
  );
}
