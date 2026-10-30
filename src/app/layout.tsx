import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TITLE, SITE_URL, SITE_VERIFICATION } from "@/lib/site";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s · KindBridge" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  category: "community",
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    url: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
  verification: {
    google: SITE_VERIFICATION.google,
    yandex: SITE_VERIFICATION.yandex,
    other: SITE_VERIFICATION.bing ? { "msvalidate.01": SITE_VERIFICATION.bing } : undefined,
  },
  // Default for every route; public pages opt back in.
  robots: { index: false, follow: false },
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
    <html lang="en-IN"className={nunito.variable} data-theme="light" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
