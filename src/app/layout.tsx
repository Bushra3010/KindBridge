import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = {
  title: { default: "KindBridge", template: "%s · KindBridge" },
  description: "Share skills, earn help coins, and get useful help from your community — without revealing your identity.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#e6f0f6", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
