import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_TAGLINE } from "@/lib/site";

export const alt = "KindBridge — Share skills. Earn help coins. Find support in your community.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/design/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const steps = ["Help someone", "Earn coins", "Get help"];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 80px", background: "linear-gradient(135deg, #e6f0f6 0%, #e8f5f3 60%, #fff6dc 100%)", color: "#102635", fontFamily: "sans-serif" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={384} height={128} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>A little help goes a long way.</div>
          <div style={{ marginTop: 20, fontSize: 34, color: "#465c77" }}>Share skills with your community. Earn help coins. Find support.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 16 }}>
            {steps.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", padding: "12px 26px", borderRadius: 999, fontSize: 28, fontWeight: 700, background: ["#c3dfef", "#ffe9a8", "#d2ece6"][i] }}>{s}</div>
            ))}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#396773" }}>{SITE_TAGLINE}</div>
        </div>
      </div>
    ),
    size,
  );
}
