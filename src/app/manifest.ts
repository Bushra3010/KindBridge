import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${SITE_NAME} — Share skills, earn help coins`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    lang: "en-IN",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#e9f3f6",
    theme_color: "#e6f0f6",
    categories: ["social", "lifestyle", "education"],
    icons: [
      { src: "/icons/kindbridge-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/kindbridge-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
