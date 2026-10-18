import { Coin } from "./brand";

/** Scalable artwork so the welcome illustration stays crisp on every screen. */
export function WelcomeArt() {
  return (
    <div className="welcome-art" aria-hidden="true">
      <div className="welcome-halo" />
      <svg className="welcome-bridge" viewBox="0 0 420 260" fill="none">
        <defs>
          <linearGradient id="welcome-arch" x1="20" y1="80" x2="400" y2="230" gradientUnits="userSpaceOnUse"><stop stopColor="#9ec9e9" /><stop offset="1" stopColor="#c1e5d9" /></linearGradient>
        </defs>
        <path d="M35 230a175 175 0 0 1 350 0" stroke="url(#welcome-arch)" strokeWidth="33" />
        <path d="M83 230a127 127 0 0 1 254 0" stroke="url(#welcome-arch)" strokeWidth="29" />
        <path d="M126 230a84 84 0 0 1 168 0" stroke="url(#welcome-arch)" strokeWidth="26" />
      </svg>
      <div className="welcome-stage"><span /><span /></div>
      <Coin size={132} className="welcome-coin" />
      <span className="art-sparkle sparkle-one">✧</span><span className="art-sparkle sparkle-two">✦</span>
    </div>
  );
}
