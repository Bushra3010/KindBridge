import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Member, moderator and admin screens are private: keep every crawler out.
const PRIVATE = [
  "/admin", "/mod", "/organizer", "/onboarding", "/pending", "/verify",
  "/home", "/explore", "/coins", "/exchanges", "/listings", "/privacy$", "/privacy/",
  "/profile", "/report", "/settings", "/u/", "/updates", "/api/",
];

// Answer engines and AI assistants that cite sources. Listed explicitly so the
// public pages stay quotable even if a wildcard rule changes later.
const AI_CRAWLERS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "Bingbot", "DuckAssistBot", "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_CRAWLERS, allow: ["/", "/llms.txt"], disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
