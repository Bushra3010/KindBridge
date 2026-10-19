"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "./icons";

type Pref = "light" | "dark" | "system";
const OPTIONS: { value: Pref; label: string; icon: IconName }[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "monitor" },
];

/** Light / dark / follow-the-device switch. Saved in a cookie on this device and applied instantly. */
export function ThemePicker() {
  const [pref, setPref] = useState<Pref>("light");
  useEffect(() => setPref((document.documentElement.dataset.themePref as Pref) || "light"), []);

  function choose(p: Pref) {
    setPref(p);
    document.cookie = `kb_theme=${p}; path=/; max-age=31536000; samesite=lax`;
    const root = document.documentElement;
    root.dataset.themePref = p;
    root.dataset.theme = p === "dark" || (p === "system" && matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  }

  return (
    <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-2">
      {OPTIONS.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={pref === o.value} onClick={() => choose(o.value)} className={`chip w-full justify-center ${pref === o.value ? "chip-on" : ""}`}>
          <Icon name={o.icon} size={18} /> {o.label}
        </button>
      ))}
    </div>
  );
}
