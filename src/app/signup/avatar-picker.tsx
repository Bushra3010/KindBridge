"use client";

import { useState } from "react";
import { Avatar } from "@/components/avatar";

export function AvatarPicker({ keys, defaultValue = "a1" }: { keys: string[]; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <fieldset>
      <legend className="label">Choose an avatar</legend>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-2">
        {keys.map((k) => (
          <label key={k} className={`shrink-0 cursor-pointer rounded-full p-1 transition ${value === k ? "bg-teal-200 ring-2 ring-teal-700" : "hover:bg-white"}`}>
            <input type="radio" name="avatar" value={k} checked={value === k} onChange={() => setValue(k)} className="sr-only" />
            <Avatar preset={k} size={58} label={`Avatar ${k.slice(1)}`} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
