import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KindBridge",
    short_name: "KindBridge",
    description: "Share skills and find help in your community.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#e9f3f6",
    theme_color: "#e6f0f6",
    icons: [
      { src: "/icons/kindbridge-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/kindbridge-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
