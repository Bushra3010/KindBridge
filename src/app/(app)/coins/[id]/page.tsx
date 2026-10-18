import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { activityLabel, walletActivity } from "@/lib/services/wallet";
import { Avatar } from "@/components/avatar";
import { Coin } from "@/components/brand";
import { Icon } from "@/components/icons";
import { LocalTime } from "@/components/forms";
import { Note, PageHeader, Screen } from "@/components/ui";

export const metadata = { title: "Coin activity" };

export default async function CoinTx({ params }: { params: Promise<{ id: string }> }) {
  const { account, community } = await requireMember();
  const { id } = await params;
  const w = await walletActivity(community.id, account.id, 500);
  const idx = w.items.findIndex((a) => a.id === id);
  if (idx === -1) notFound(); // not one of the viewer's own transactions
  const a = w.items[idx];

  // Available balance before/after, replayed from the newest balance backwards.
  const after = w.available - w.items.slice(0, idx).reduce((s, x) => s + x.availableDelta, 0);
  const before = after - a.availableDelta;
  const ex = a.exchangeId ? await db.exchange.findUnique({ where: { id: a.exchangeId }, select: { ref: true, status: true } }) : null;
  const shown = a.net !== 0 ? a.net : a.reservedDelta || a.availableDelta;

  return (
    <Screen>
      <PageHeader title="Coin activity" back="/coins" />
      <div className="card-tint p-5">
        <div className="flex items-center gap-4">
          <Coin size={88} />
          <div>
            <p className="text-[44px] font-extrabold leading-none">{shown > 0 ? "+" : ""}{shown}</p>
            <p className="text-[17px] font-semibold">help coins {a.net === 0 ? (a.type === "RESERVE" ? "reserved" : "returned") : ""}</p>
          </div>
        </div>
        {ex && <p className="mt-4 flex items-center justify-center gap-2 rounded-full bg-white/70 py-2 text-[14px] font-bold"><Icon name="checkCircle" size={18} className="text-teal-700" /> {ex.status === "COMPLETED" ? "Completed" : ex.status.charAt(0) + ex.status.slice(1).toLowerCase().replace("_", " ")}</p>}
      </div>

      <div className="card mt-4 space-y-3 p-4">
        <div className="flex items-center gap-3">
          {a.counterpart ? <Avatar preset={a.counterpart.avatar} size={48} /> : <Coin size={44} />}
          <div>
            <p className="font-bold">{a.title}</p>
            <p className="text-[14px] text-muted">{activityLabel(a)}{a.counterpart && ` · with ${a.counterpart.displayName}`}</p>
          </div>
        </div>
        <p className="flex items-center gap-2 text-[14px] text-ink-soft"><Icon name="calendar" size={18} /> <LocalTime iso={a.createdAt.toISOString()} /></p>
        {ex && <p className="flex items-center gap-2 text-[14px] text-ink-soft"><Icon name="file" size={18} /> Reference {ex.ref}</p>}
      </div>

      <h2 className="h-section mb-2 mt-5">Coin balance breakdown</h2>
      <dl className="card divide-y divide-line">
        <div className="flex justify-between px-4 py-3"><dt className="text-ink-soft">Previous available</dt><dd className="font-bold">{before}</dd></div>
        <div className="flex justify-between px-4 py-3"><dt className="text-ink-soft">{a.availableDelta >= 0 ? "Added" : "Moved out"}</dt><dd className={`font-bold ${a.availableDelta > 0 ? "text-plus" : a.availableDelta < 0 ? "text-minus" : ""}`}>{a.availableDelta > 0 ? "+" : ""}{a.availableDelta}</dd></div>
        <div className="flex justify-between px-4 py-3"><dt className="font-bold">New available</dt><dd className="font-extrabold">{after}</dd></div>
      </dl>
      <div className="mt-4"><Note icon="lock">Only you can see your coin history.</Note></div>
      <div className="mt-6 space-y-2">
        {a.exchangeId && <Link href={`/exchanges/${a.exchangeId}`} className="btn-secondary w-full">View session</Link>}
        <Link href={`/report?type=OTHER&id=${a.id}&category=Coin+balance+question`} className="btn-primary w-full">Get support</Link>
      </div>
    </Screen>
  );
}
