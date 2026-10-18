import { db } from "@/lib/db";
import { currentAccount } from "@/lib/auth";
import { BottomNav } from "@/components/nav";
import { sweep } from "@/lib/services/exchanges";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const account = await currentAccount();
  // Lazy maintenance until a scheduler is in place: expiries and confirmation reminders.
  await sweep().catch((e) => console.error("sweep failed", e));
  const unread = account ? await db.notification.count({ where: { accountId: account.id, readAt: null } }) : 0;
  return (
    <>
      {children}
      <BottomNav unread={unread} />
    </>
  );
}
