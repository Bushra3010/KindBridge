"use client";

import { useState } from "react";
import { DISCLOSURE_FIELDS } from "@/lib/constants";
import { Icon, type IconName } from "@/components/icons";
import { ActionForm, Submit } from "@/components/forms";
import type { ActionState } from "@/lib/action";

const ICONS: Record<string, IconName> = { FIRST_NAME: "user", PHOTO: "image", PHONE: "phone", MEETING_LOCATION: "pin" };

/** Share on your terms: pick fields → preview → confirm (PRD journey D). */
export function ShareDetails({
  action, exchangeId, recipient, values, alreadyShared,
}: {
  action: (p: ActionState, fd: FormData) => Promise<ActionState>;
  exchangeId: string;
  recipient: string;
  values: Record<string, string | null>;
  alreadyShared: string[];
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [preview, setPreview] = useState(false);
  const fields = Object.entries(DISCLOSURE_FIELDS);
  return (
    <ActionForm action={action} className="space-y-1">
      <input type="hidden" name="exchangeId" value={exchangeId} />
      {picked.map((f) => <input key={f} type="hidden" name="field" value={f} />)}
      {!preview ? (
        <>
          {fields.map(([key, f]) => {
            const value = values[key];
            const shared = alreadyShared.includes(key);
            return (
              <label key={key} className={`flex items-center gap-3 py-3 ${!value || shared ? "opacity-60" : "cursor-pointer"}`}>
                <Icon name={ICONS[key]} className="text-ink-soft" />
                <span className="flex-1">
                  <span className="block text-[15px] font-semibold">{f.label}</span>
                  <span className="block text-[12px] text-muted">{shared ? "Already shared" : value ? "Hidden" : "Not added yet — add it in Privacy & sharing"}</span>
                </span>
                <input
                  type="checkbox"
                  className="toggle"
                  disabled={!value || shared}
                  checked={shared || picked.includes(key)}
                  onChange={(e) => setPicked((p) => (e.target.checked ? [...p, key] : p.filter((x) => x !== key)))}
                  aria-label={`Share ${f.label}`}
                />
              </label>
            );
          })}
          <p className="pb-2 text-center text-[12px] text-muted">Recipients may save shared details.</p>
          <button type="button" className="btn-primary w-full" disabled={picked.length === 0} onClick={() => setPreview(true)}>Preview what {recipient} will see</button>
        </>
      ) : (
        <>
          <div className="rounded-2xl bg-mist p-4">
            <p className="mb-2 text-[13px] font-bold text-ink-soft">{recipient} will be able to see:</p>
            <dl className="space-y-1.5">
              {picked.map((k) => (
                <div key={k} className="flex justify-between gap-3 text-[14px]">
                  <dt className="text-muted">{DISCLOSURE_FIELDS[k as keyof typeof DISCLOSURE_FIELDS].label}</dt>
                  <dd className="truncate font-semibold">{k === "PHOTO" ? "Your photo" : values[k]}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="py-2 text-[13px] text-ink-soft">Only {recipient} gets access. You can stop future in-app access any time, but they may already have saved a copy. Sharing doesn't require them to share back.</p>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setPreview(false)}>Back</button>
            <Submit className="btn-primary flex-1">Share selected details</Submit>
          </div>
        </>
      )}
    </ActionForm>
  );
}
