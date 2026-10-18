// Illustrated avatar presets. Members pick one at signup; no photo is required.
const PRESETS: Record<string, { bg: [string, string]; skin: string; hair: string; style: "bun" | "short" | "wavy" | "cap" | "curly" | "bob" }> = {
  a1: { bg: ["#fde2d4", "#f6c8b6"], skin: "#f6d3bd", hair: "#3b2a24", style: "bun" },
  a2: { bg: ["#d8e6fb", "#b8cff2"], skin: "#efc8a6", hair: "#1f1a1c", style: "short" },
  a3: { bg: ["#e5def8", "#cfc3f0"], skin: "#f3d2b8", hair: "#2a2226", style: "bob" },
  a4: { bg: ["#d9f0e6", "#b9e2cf"], skin: "#e7b98f", hair: "#6b4426", style: "curly" },
  a5: { bg: ["#fbeccb", "#f3d79a"], skin: "#f1cfb4", hair: "#9a8a7a", style: "cap" },
  a6: { bg: ["#f9dbe6", "#f1bdd0"], skin: "#c99673", hair: "#2b1d18", style: "wavy" },
  a7: { bg: ["#d6eef2", "#b1dce4"], skin: "#8f5f43", hair: "#1a1414", style: "curly" },
  a8: { bg: ["#e9ecef", "#d3d9de"], skin: "#f5d6c0", hair: "#c6713a", style: "short" },
};
export const AVATAR_KEYS = Object.keys(PRESETS);

function Hair({ style, color }: { style: string; color: string }) {
  switch (style) {
    case "bun":
      return <><circle cx="32" cy="12" r="7" fill={color} /><path d="M17 31c0-10 6-15 15-15s15 5 15 15c-3-5-8-8-15-8s-12 3-15 8z" fill={color} /></>;
    case "short":
      return <path d="M17 30c-1-10 5-16 15-16s16 5 15 15c-2-4-6-7-11-7-3 0-6 2-9 2s-6 2-10 6z" fill={color} />;
    case "bob":
      return <path d="M15 40c-2-16 4-26 17-26s19 10 17 26h-5c1-8-1-14-4-16-4 2-10 3-16 3-3 3-4 8-4 13z" fill={color} />;
    case "curly":
      return <g fill={color}>{[[20, 22], [26, 17], [32, 15], [38, 17], [44, 22], [18, 28], [46, 28]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="6" />)}</g>;
    case "cap":
      return <><path d="M17 28c0-9 7-14 15-14s15 5 15 14z" fill="#e8e1d6" /><path d="M30 27h22c0 2-2 3-4 3H30z" fill="#d8cfc1" /><path d="M18 30c0 4 1 7 2 9-3-2-4-6-4-9z" fill={color} /></>;
    default:
      return <path d="M15 42c-2-18 5-28 17-28s19 10 17 28c-1-6-3-12-6-15-5 2-12 2-18 0-4 3-8 9-10 15z" fill={color} />;
  }
}

export function Avatar({ preset, size = 44, online, label }: { preset?: string | null; size?: number; online?: boolean; label?: string }) {
  const p = PRESETS[preset ?? "a1"] ?? PRESETS.a1;
  const id = `av-${preset}`;
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 64 64" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className="rounded-full">
        <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={p.bg[0]} /><stop offset="1" stopColor={p.bg[1]} /></linearGradient></defs>
        <circle cx="32" cy="32" r="32" fill={`url(#${id})`} />
        <path d="M12 64c1-11 9-17 20-17s19 6 20 17z" fill="#ffffff" opacity=".85" />
        <rect x="28" y="40" width="8" height="8" rx="3" fill={p.skin} />
        <ellipse cx="32" cy="31" rx="12.5" ry="14" fill={p.skin} />
        <Hair style={p.style} color={p.hair} />
        <circle cx="27" cy="32" r="1.6" fill="#2a1f1c" />
        <circle cx="37" cy="32" r="1.6" fill="#2a1f1c" />
        <path d="M28.5 37.5c2 1.8 5 1.8 7 0" stroke="#b5634f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="24.5" cy="36" r="2" fill="#f08f86" opacity=".35" />
        <circle cx="39.5" cy="36" r="2" fill="#f08f86" opacity=".35" />
      </svg>
      {online && <span className="absolute bottom-0 right-0 block rounded-full border-2 border-white bg-plus" style={{ width: size * 0.26, height: size * 0.26 }} />}
    </span>
  );
}
