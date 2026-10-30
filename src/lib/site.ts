import type { Metadata } from "next";
import { LEGAL_LIVE, LEGAL_PAGES } from "./legal";

// Public facts about the site, shared by metadata, structured data, the
// sitemap, robots and the Open Graph image. Keep claims in step with the app.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kindbridge.co.in").replace(/\/+$/, "");

export const SITE_NAME = "KindBridge";
export const SITE_TAGLINE = "Give help. Find help.";
export const SITE_TITLE = "KindBridge — Skill sharing and neighbourly help with help coins";
export const SITE_DESCRIPTION =
  "KindBridge is a free community skill-sharing app for adults in India. Help a neighbour, earn help coins, and spend them on help from someone else — with a private username and no public contact details.";

export const SITE_KEYWORDS = [
  "KindBridge",
  "skill sharing app",
  "skill exchange",
  "time bank",
  "timebanking India",
  "help coins",
  "community help app",
  "neighbourhood help",
  "apartment society community app",
  "college community skill swap",
  "peer learning",
  "volunteer exchange",
  "barter skills",
  "help your neighbour",
];

/**
 * Official social and store profiles, used as schema.org `sameAs` so search
 * engines and AI assistants link them to KindBridge. Add each URL once it exists.
 */
export const SOCIAL_PROFILES: string[] = [
  // "https://www.instagram.com/kindbridge",
  // "https://www.linkedin.com/company/kindbridge",
  // "https://play.google.com/store/apps/details?id=…",
  // "https://apps.apple.com/app/…",
];

/** Search-engine ownership tokens, set per environment (see docs/seo.md). */
export const SITE_VERIFICATION = {
  google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  bing: process.env.BING_SITE_VERIFICATION || undefined,
  yandex: process.env.YANDEX_SITE_VERIFICATION || undefined,
};

/** Landing pages for the communities KindBridge is built for. */
export const AUDIENCES = [
  {
    slug: "apartment-societies",
    name: "Apartment societies",
    title: "Skill sharing app for apartment societies",
    description:
      "Turn your apartment society or housing complex into a neighbourhood help network. Residents help each other with everyday skills, earn help coins and keep phone numbers private.",
    intro:
      "Society WhatsApp groups make it easy to ask for help but hard to find the right person, agree a time or say thank you fairly. KindBridge gives residents one place to offer skills, ask for a hand and keep track of who helped whom.",
    examples: ["Spoken English or Hindi practice with a neighbour", "Setting up a new laptop or phone", "Balcony plant care tips", "Help with a spreadsheet or a résumé", "Beginner guitar or keyboard lessons"],
    meet: "Meet online or in a shared space such as the clubhouse, lobby or society garden. Nobody needs to visit anyone's flat.",
  },
  {
    slug: "colleges",
    name: "Colleges and universities",
    title: "Peer learning and skill exchange app for college students",
    description:
      "A skill exchange app for college and university communities. Students teach what they know, earn help coins and spend them on peer help with coding, presentations, languages and more.",
    intro:
      "Every campus is full of people who are great at something — and need help with something else. KindBridge lets students trade that help with help coins, so the person who helps you doesn't have to be the person you help back.",
    examples: ["Presentation and slide-deck reviews", "Spreadsheet and Excel help", "Coding and laptop troubleshooting", "Language exchange sessions", "Interview practice and career advice"],
    meet: "Meet online or in a shared campus space such as the library, canteen or common room.",
  },
  {
    slug: "coworking-spaces",
    name: "Coworking spaces and workplaces",
    title: "Skill sharing for coworking spaces and workplace communities",
    description:
      "Help members of your coworking space or workplace share skills with each other. Earn help coins for helping a colleague and spend them on help from another — free, private and moderated.",
    intro:
      "Coworking members and colleagues have a wide range of skills, but little way of knowing who can help with what. KindBridge makes those skills discoverable and gives everyone a fair way to give and receive help.",
    examples: ["Pitch deck and presentation feedback", "Spreadsheet models and formulas", "Design and creative feedback", "Career and résumé advice", "Language practice over lunch"],
    meet: "Meet online or in the lounge, a meeting room or another shared space at your workplace.",
  },
] as const;

/** Kinds of everyday help members share. Mirrors the app's skill areas. */
export const SKILL_AREAS: { name: string; text: string }[] = [
  { name: "Languages", text: "Conversation practice in English, Hindi and regional or foreign languages, help with pronunciation and writing." },
  { name: "Technology", text: "Setting up laptops and phones, app and software help, basic troubleshooting — never sharing passwords or one-time codes." },
  { name: "Presentations", text: "Structuring slide decks, design polish and rehearsing a talk or pitch." },
  { name: "Spreadsheets", text: "Excel and Google Sheets formulas, budgets, trackers and tidy tables." },
  { name: "Creative", text: "Drawing, design, photography, writing and craft feedback." },
  { name: "Career", text: "Résumé reviews, mock interviews and advice about studies or work." },
  { name: "Music", text: "Beginner lessons and practice tips for guitar, keyboard, singing and more." },
  { name: "Plants", text: "Balcony and indoor plant care, repotting and kitchen-garden tips." },
  { name: "Everyday", text: "Other everyday skills that fit the community rules — no medical, legal, financial, hazardous, regulated, childcare or personal-care services." },
];

/** Public, indexable routes. Everything else is behind sign-in. */
export const PUBLIC_ROUTES: { path: string; changeFrequency: "weekly" | "monthly" | "yearly"; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.9 },
  { path: "/skills", changeFrequency: "monthly", priority: 0.8 },
  ...AUDIENCES.map((a) => ({ path: `/for/${a.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  { path: "/rules", changeFrequency: "monthly", priority: 0.6 },
  { path: "/signup", changeFrequency: "yearly", priority: 0.7 },
  { path: "/login", changeFrequency: "yearly", priority: 0.3 },
  // Listed once the operator details are complete (see src/lib/legal.ts).
  ...(LEGAL_LIVE ? LEGAL_PAGES.map((p) => ({ path: p.path, changeFrequency: "yearly" as const, priority: 0.4 })) : []),
];

/** Question-and-answer pairs used on /how-it-works and in FAQPage structured data. */
export const FAQ: { q: string; a: string }[] = [
  {
    q: "What is KindBridge?",
    a: "KindBridge is a community skill-sharing app. Members offer everyday skills — like language practice, laptop setup, spreadsheets, plant care or music — and exchange help using help coins instead of money. You earn coins by helping one member and spend them on help from another; no direct swap between the same two people is needed.",
  },
  {
    q: "How do help coins work?",
    a: "Help coins are an internal community unit. Approved members receive a one-time starter grant. When you agree an exchange, the coins are reserved from the requester's balance, and they move to the helper once the requester confirms the help was delivered. If the exchange is cancelled, reserved coins are refunded. Every movement is recorded in an append-only ledger you can review in your wallet.",
  },
  {
    q: "Can I buy, sell or cash out help coins?",
    a: "No. Help coins cannot be bought, sold, withdrawn or redeemed for cash. They only move between members through a confirmed help exchange.",
  },
  {
    q: "Is KindBridge free?",
    a: "Yes. The current community pilot is free to join and use, and no fee is taken from help-coin transfers.",
  },
  {
    q: "Is KindBridge a time bank?",
    a: "It works on a similar idea. Like timebanking, members help each other and are credited for it. On KindBridge the helper and requester agree a coin amount for each task before it starts, rather than counting strictly by the hour.",
  },
  {
    q: "Do other members see my real name or phone number?",
    a: "No. You use a username and an illustrated avatar. Your real name and contact details stay private until you choose to share a specific detail with one specific person, and you can revoke that sharing later.",
  },
  {
    q: "Who can join KindBridge?",
    a: "Adults aged 18 and over. You verify your email with a one-time code, agree to the community rules, and join a community such as an apartment society, college or coworking space. Some communities need organizer approval.",
  },
  {
    q: "What kind of help can I offer or ask for?",
    a: "Everyday help such as language practice, tech and laptop help, presentations, spreadsheets, creative skills, career advice, music and plant care. Medical, legal, financial, hazardous, regulated, childcare and personal-care services are not allowed.",
  },
  {
    q: "Where do exchanges happen?",
    a: "Online, or in an agreed shared space such as a society clubhouse, campus library or coworking lounge. Private-home visits are not permitted during the pilot, and you never need to share your home address.",
  },
  {
    q: "What happens if something goes wrong in an exchange?",
    a: "You can reschedule, cancel for a refund, settle part of the coins, or raise a dispute from the exchange screen. Moderators review disputes and reports, and you can block or report any member at any time. KindBridge is not an emergency service — in danger, contact local emergency services.",
  },
];

export const HOW_IT_WORKS: { name: string; text: string }[] = [
  { name: "Create your account", text: "Sign up with your email, verify it with a six-digit code, confirm you are 18 or older, and pick a username and avatar." },
  { name: "Join your community", text: "Join your apartment society, college or workplace community. Once approved you receive starter help coins." },
  { name: "List your skills", text: "Add what you can offer and what you'd like help with, or browse offers and requests from other members." },
  { name: "Agree the terms", text: "Send or accept a proposal with the task, time, place and coin amount. The coins are reserved when the proposal is accepted." },
  { name: "Help and get confirmed", text: "Meet online or in a shared space. When the requester confirms delivery, the reserved coins move to the helper." },
  { name: "Spend your coins", text: "Use the coins you earned to get help from any other member, and leave a review after each exchange." },
];

/**
 * Metadata for an indexable public page. Next.js replaces (not merges) nested
 * objects like openGraph, so each public page gets the full set here.
 */
export function publicMetadata({ title, description, path }: { title?: string; description: string; path: string }): Metadata {
  const ogTitle = title ? `${title} · ${SITE_NAME}` : SITE_TITLE;
  const images = [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${SITE_NAME} — share skills, earn help coins, find support` }];
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN", url: path, title: ogTitle, description, images },
    twitter: { card: "summary_large_image", title: ogTitle, description, images },
  };
}
