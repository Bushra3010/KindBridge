"use client";

import { useState } from "react";
import { Icon } from "./icons";
import { CUSTOM_SKILL_MAX, CUSTOM_SKILL_MAX_LEN } from "@/lib/constants";

/** Free-text skills beyond the listed categories, submitted as repeated `name` fields. */
export function CustomSkills({ name, initial, label }: { name: string; initial: string[]; label: string }) {
  const [skills, setSkills] = useState(initial);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  function add() {
    const value = draft.trim().replace(/\s+/g, " ");
    if (!value) return;
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) return setError("You've already added that.");
    if (skills.length >= CUSTOM_SKILL_MAX) return setError(`You can add up to ${CUSTOM_SKILL_MAX}.`);
    setSkills([...skills, value]);
    setDraft("");
    setError("");
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          maxLength={CUSTOM_SKILL_MAX_LEN}
          onChange={(e) => { setDraft(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Something else? e.g. Baking"
          aria-label={label}
          className="field flex-1"
        />
        <button type="button" onClick={add} className="chip shrink-0 px-4" aria-label={`Add ${draft.trim() || "skill"}`}>
          <Icon name="plus" size={18} /> Add
        </button>
      </div>
      {error && <p role="alert" className="mt-1.5 text-[13px] font-semibold text-minus">{error}</p>}
      {skills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s} className="chip chip-on">
              <input type="hidden" name={name} value={s} />
              {s}
              <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} aria-label={`Remove ${s}`} className="-mr-1 grid size-5 place-items-center rounded-full hover:bg-white/50">
                <Icon name="x" size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
