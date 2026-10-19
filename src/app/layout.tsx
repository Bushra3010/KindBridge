import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = {
  title: { default: "KindBridge", template: "%s · KindBridge" },
  description: "Share skills, earn help coins, and get useful help from your community — without revealing your identity.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e6f0f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1a22" },
  ],
};

// Applies the saved theme (cookie kb_theme: light | dark | system) before first
// paint so dark-mode users never see a light flash. Kept tiny and inline.
const THEME_SCRIPT = `(function(){try{var d=document.documentElement,m=document.cookie.match(/(?:^|; )kb_theme=(light|dark|system)/),p=m?m[1]:"light",q=matchMedia("(prefers-color-scheme: dark)");function a(){d.dataset.theme=(p==="dark"||(p==="system"&&q.matches))?"dark":"light"}d.dataset.themePref=p;a();q.addEventListener("change",function(){p=d.dataset.themePref||p;if(p==="system")a()})}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable} data-theme="light" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
