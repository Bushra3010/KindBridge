import { useId } from "react";
import Image from "next/image";

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
    <Image
      src="/design/logo.png"
      alt="KindBridge"
      width={512}
      height={171}
      priority
      className="inline-block h-auto max-w-full"
      style={{ width: size * 9 }}
    />
  );
}

/** Gold help coin with the arch embossed. */
export function Coin({ size = 24, className = "" }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={`help-coin ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}edge`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#fff5ca" /><stop offset=".24" stopColor="#daa344" /><stop offset=".5" stopColor="#ffda72" /><stop offset=".78" stopColor="#a36a0c" /><stop offset="1" stopColor="#edb747" /></linearGradient>
        <linearGradient id={`${id}face`} x1=".15" y1="0" x2=".85" y2="1"><stop stopColor="#fff6c9" /><stop offset=".25" stopColor="#ffe098" /><stop offset=".58" stopColor="#f4bd42" /><stop offset="1" stopColor="#db920e" /></linearGradient>
        <linearGradient id={`${id}rim`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff9dc" /><stop offset=".5" stopColor="#e5a320" /><stop offset="1" stopColor="#fff0ad" /></linearGradient>
      </defs>
      <ellipse cx="48" cy="51" rx="41" ry="46" fill={`url(#${id}edge)`} />
      {[24, 31, 38, 45, 52, 59, 66, 73].map(y => <path key={y} d={`M8 ${y}l7 2`} stroke="#93600c" opacity=".35" />)}
      <ellipse cx="53" cy="48" rx="40" ry="45" fill={`url(#${id}face)`} stroke="#a96b0d" strokeWidth="1.2" />
      <ellipse cx="53" cy="48" rx="36.5" ry="41.5" fill="none" stroke={`url(#${id}rim)`} strokeWidth="3" />
      <ellipse cx="53" cy="48" rx="32" ry="37" fill="none" stroke="#b8790e" strokeWidth=".8" />
      <path d="M31 61V51a22 24 0 0 1 44 0v10M41 61V51a12 14 0 0 1 24 0v10" fill="none" stroke="#a66a0b" strokeWidth="6" strokeLinecap="round" />
      <path d="M30 59V49a22 24 0 0 1 44 0v10M40 59V49a12 14 0 0 1 24 0v10" fill="none" stroke="#ffdc7d" strokeWidth="3.7" strokeLinecap="round" />
      <path d="M29 29c5-10 14-16 25-16" fill="none" stroke="#fff9df" strokeWidth="2.5" strokeLinecap="round" opacity=".9" />
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
