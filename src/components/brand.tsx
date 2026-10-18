import { useId } from "react";

/** Three-band arch — the "bridge". */
export function LogoMark({ size = 40 }: { size?: number }) {
  const id = useId();
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 64 40" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}a`} x1="0" x2="1"><stop offset="0" stopColor="#8fb9d6" /><stop offset="1" stopColor="#9fd3c7" /></linearGradient>
      </defs>
      <path d="M4 38a28 28 0 0 1 56 0" fill="none" stroke={`url(#${id}a)`} strokeWidth="7" strokeLinecap="round" />
      <path d="M15 38a17 17 0 0 1 34 0" fill="none" stroke="#b9d9df" strokeWidth="6" strokeLinecap="round" />
      <path d="M25 38a7 7 0 0 1 14 0" fill="none" stroke="#d3e9e6" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size * 1.4} />
      <span className="font-extrabold tracking-tight text-ink" style={{ fontSize: size }}>KindBridge</span>
    </span>
  );
}

/** Gold help coin with the arch embossed. */
export function Coin({ size = 24, className = "" }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}g`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#ffe9a3" /><stop offset=".45" stopColor="#f2c143" /><stop offset="1" stopColor="#c98a12" />
        </radialGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fbe08a" /><stop offset="1" stopColor="#a86d08" /></linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill={`url(#${id}r)`} />
      <circle cx="24" cy="24" r="18.5" fill={`url(#${id}g)`} />
      <path d="M13 31a11 11 0 0 1 22 0" fill="none" stroke="#a9700b" strokeWidth="3.4" strokeLinecap="round" opacity=".8" />
      <path d="M18 31a6 6 0 0 1 12 0" fill="none" stroke="#a9700b" strokeWidth="3" strokeLinecap="round" opacity=".8" />
      <path d="M13 30a11 11 0 0 1 22 0" fill="none" stroke="#fff3c4" strokeWidth="1.2" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export function CoinAmount({ value, size = 16, className = "" }: { value: number; size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 font-bold ${className}`}>
      <Coin size={size} /> {value}
    </span>
  );
}
