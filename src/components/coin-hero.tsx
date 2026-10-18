import Link from "next/link";
import { Coin } from "./brand";
import { Icon } from "./icons";

export function CoinHero({ available, reserved, actions = true }: { available: number; reserved: number; actions?: boolean }) {
  return (
    <div className="coin-hero card-tint p-5">
      <div className="flex items-center gap-4">
        <Coin size={112} className="drop-shadow-[0_8px_14px_rgba(176,122,16,.3)]" />
        <div>
          <p className="text-[58px] font-semibold leading-none">{available}</p>
          <p className="text-[17px] font-semibold">Available help coins</p>
          {reserved > 0 && (
            <p className="mt-1 flex items-center gap-1 text-[14px] text-ink-soft">
              {reserved} reserved
              <span title="Held for booked sessions until you confirm the help" aria-label="Reserved coins are held for booked sessions until you confirm the help"><Icon name="info" size={15} /></span>
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link href="/explore?kind=OFFER&max=affordable" className="btn-secondary"><Icon name="search" size={18} /> Find help</Link>
          <Link href="/explore?kind=REQUEST" className="btn-secondary"><Icon name="userPlus" size={18} /> Earn coins</Link>
        </div>
      )}
    </div>
  );
}
