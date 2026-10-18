import { requireMember } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions";
import { Icon } from "@/components/icons";
import { Screen } from "@/components/ui";

export const metadata = { title: "Awaiting approval" };

export default async function Pending() {
  const { membership, community } = await requireMember({ allowPending: true });
  if (membership.status === "APPROVED") redirect("/home");
  return (
    <Screen nav={false}>
      <div className="mt-16 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-sky-100 text-sky-900"><Icon name="clock" size={36} /></div>
        <h1 className="mt-5 text-[26px] font-extrabold">Request sent</h1>
        <p className="mx-auto mt-2 max-w-xs text-ink-soft">
          An organizer of <strong>{community.name}</strong> will review your membership. We'll notify you when you're in.
        </p>
        <p className="mx-auto mt-4 max-w-xs text-[13px] text-muted">Organizers see your username only — not your email or contact details.</p>
        <form action={logout} className="mt-10"><button className="btn-ghost">Sign out</button></form>
      </div>
    </Screen>
  );
}
