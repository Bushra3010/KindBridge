import { DURATIONS } from "@/lib/constants";
import { DateTimeField } from "./forms";
import { Coin } from "./brand";
import { Icon } from "./icons";

type Defaults = { deliverable?: string; durationMin?: number; coins?: number; format?: string; scheduledAt?: string; materials?: string; note?: string };

/** Fields for proposing or revising exchange terms (PRD §6.3). */
export function TermsFields({ d = {}, maxCoins, showNote = true }: { d?: Defaults; maxCoins: number; showNote?: boolean }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="label" htmlFor="deliverable">Deliverable</label>
        <input id="deliverable" name="deliverable" className="field" defaultValue={d.deliverable} placeholder="Feedback on one 5-minute presentation" required minLength={3} maxLength={300} />
      </div>
      <FormatToggle defaultValue={d.format} />
      <DateTimeField name="scheduledAt" defaultValue={d.scheduledAt} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="durationMin">Duration</label>
          <div className="relative">
            <Icon name="clock" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <select id="durationMin" name="durationMin" className="field appearance-none pl-11" defaultValue={d.durationMin ?? 30}>
              {DURATIONS.map((m) => <option key={m} value={m}>{m} min</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="coins">Help coins</label>
          <div className="relative">
            <Coin size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input id="coins" name="coins" type="number" inputMode="numeric" min={1} max={maxCoins} step={1} className="field pl-11" defaultValue={d.coins ?? 10} required />
          </div>
        </div>
      </div>
      <p className="-mt-2 text-[12px] text-muted">Guide: about 10 coins per 30 minutes of everyday help. Max {maxCoins} in this category.</p>
      <div>
        <label className="label" htmlFor="materials">Materials needed <span className="font-normal text-muted">(optional)</span></label>
        <input id="materials" name="materials" className="field" defaultValue={d.materials} placeholder="Slides link, laptop…" maxLength={300} />
      </div>
      {showNote && (
        <div>
          <label className="label" htmlFor="note">Message <span className="font-normal text-muted">(optional)</span></label>
          <textarea id="note" name="note" rows={2} className="field" defaultValue={d.note} placeholder="I can help on Saturday." maxLength={500} />
        </div>
      )}
    </div>
  );
}

export function FormatToggle({ defaultValue = "ONLINE" }: { defaultValue?: string }) {
  return (
    <fieldset>
      <legend className="label">Format</legend>
      <div className="grid grid-cols-2 gap-2">
        {([["ONLINE", "Online", "video"], ["SHARED_SPACE", "Shared space", "pin"]] as const).map(([v, l, i]) => (
          <span key={v}>
            <input type="radio" name="format" id={`format-${v}`} value={v} defaultChecked={defaultValue === v} className="peer-chip sr-only" />
            <label htmlFor={`format-${v}`} className="chip w-full cursor-pointer justify-center py-3 text-[14px]"><Icon name={i} size={18} /> {l}</label>
          </span>
        ))}
      </div>
    </fieldset>
  );
}
