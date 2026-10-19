import { db } from "@/lib/db";
import { currentAccount } from "@/lib/auth";
import { BottomNav } from "@/components/nav";
import { sweep } from "@/lib/services/exchanges";

// Lazy maintenance until a scheduler is in place: expiries and confirmation
// reminders. At most once a minute per server process, off the request path.
const SWEEP_EVERY_MS = 60_000;
let lastSweep = 0;
function maybeSweep() {
  if (Date.now() - lastSweep < SWEEP_EVERY_MS) return;
  lastSweep = Date.now();
  sweep().catch((e) => console.error("sweep failed", e));
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  maybeSweep();
  const account = await currentAccount();
  const unread = account ? await db.notification.count({ where: { accountId: account.id, readAt: null } }) : 0;
  return (
    <>
      {children}
      <BottomNav unread={unread} />
    </>
  );
}
