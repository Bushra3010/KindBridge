import Link from "next/link";
import { requireMember } from "@/lib/auth";
import { activityLabel, walletActivity } from "@/lib/services/wallet";
import { Avatar } from "@/components/avatar";
import { Coin } from "@/components/brand";
import { CoinHero } from "@/components/coin-hero";
import { Icon } from "@/components/icons";
import { LocalTime } from "@/components/forms";
import { EmptyState, Note, PageHeader, Screen } from "@/components/ui";

export const metadata = { title: "Your help coins" };

export default async function Coins() {
  const { account, community } = await requireMember();
  const w = await walletActivity(community.id, account.id);
  return (
    <Screen>
      <PageHeader title="Your help coins" />
      <CoinHero available={w.available} reserved={w.reserved} />
      <h2 className="h-section mb-3 mt-6">Recent activity</h2>
      {w.items.length === 0 ? (
        <EmptyState icon="history" title="No coin activity yet" body="Coins you earn, spend and reserve show up here." />
      ) : (
        <ul className="space-y-2">
          {w.items.map((a) => (
            <li key={a.id}>
              <Link href={`/coins/${a.id}`} className="card flex items-center gap-3 p-3.5">
                {a.counterpart ? <Avatar preset={a.counterpart.avatar} size={46} /> : <div className="grid size-[46px] place-items-center rounded-full bg-amber-50"><Coin size={30} /></div>}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{a.title}</p>
                  <p className="text-[13px] text-muted">{activityLabel(a)} · <LocalTime iso={a.createdAt.toISOString()} mode="relative" /></p>
                </div>
                <span className={`text-[18px] font-extrabold ${a.net > 0 ? "text-plus" : a.net < 0 ? "text-minus" : "text-muted"}`}>
                  {a.net > 0 ? `+${a.net}` : a.net < 0 ? `−${-a.net}` : <Icon name="lock" size={18} />}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="card-tint mt-4 flex items-center gap-3 p-4 text-[14px] font-semibold"><Icon name="users" /> Earn by helping. Spend on support.</div>
      <div className="mt-4"><Note icon="lock">Only you can see your coin history. Coins can't be bought, sold or withdrawn.</Note></div>
    </Screen>
  );
}
