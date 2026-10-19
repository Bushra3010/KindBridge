import { redirect } from "next/navigation";
import { db, transaction } from "@/lib/db";
import { currentAccount } from "@/lib/auth";
import { logout } from "@/app/actions";
import { joinDefaultCommunity, maybeGrantStarter } from "@/lib/services/membership";
import { Icon } from "@/components/icons";
import { Screen } from "@/components/ui";

export const metadata = { title: "Getting you set up" };

/**
 * Members never pick or apply to a community. Anyone without an approved
 * membership is placed in the pilot community here and sent on; only a member
 * who was removed or declined sees this screen.
 */
export default async function JoinCommunity() {
  const account = await currentAccount();
  if (!account) redirect("/login");
  if (!account.emailVerifiedAt) redirect("/verify");
  const approved = await db.membership.findFirst({ where: { accountId: account.id, status: "APPROVED" } });
  // Existing members previously waiting for OTP may not have received their grant.
  if (approved && !approved.starterGranted) await transaction(tx => maybeGrantStarter(tx, approved.id));
  if (approved || (await joinDefaultCommunity(account.id))) redirect(account.profile?.onboardedAt ? "/home" : "/onboarding/skills");

  const removed = (await db.membership.count({ where: { accountId: account.id } })) > 0;
  return (
    <Screen nav={false}>
      <div className="mt-16 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-sky-100 text-sky-900"><Icon name="users" size={36} /></div>
        <h1 className="mt-5 text-[26px] font-extrabold">{removed ? "Your access was removed" : "KindBridge isn't open yet"}</h1>
        <p className="mx-auto mt-2 max-w-xs text-ink-soft">
          {removed ? "If you think that's a mistake, contact support." : "We're not taking new members right now. Please check back soon."}
        </p>
        <form action={logout} className="mt-10"><button className="btn-ghost">Sign out</button></form>
      </div>
    </Screen>
  );
}
