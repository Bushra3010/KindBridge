// Demo data for local development. Every coin movement goes through the real
// services, so the seeded ledger reconciles like production data would.
import bcrypt from "bcryptjs";
import { db, transaction } from "../src/lib/db";
import { maybeGrantStarter } from "../src/lib/services/membership";
import * as ex from "../src/lib/services/exchanges";
import { submitReview } from "../src/lib/services/reviews";
import { reconcile } from "../src/lib/services/ledger";

const PASSWORD = "kindbridge123";

const CATEGORIES = [
  ["languages", "Languages", "languages", 40],
  ["technology", "Technology", "laptop", 40],
  ["presentations", "Presentations", "presentation", 40],
  ["creative", "Creative skills", "palette", 40],
  ["career", "Career practice", "briefcase", 40],
  ["everyday", "Everyday help", "wrench", 30],
  ["spreadsheets", "Spreadsheets", "sheet", 40],
  ["plants", "Plant care", "leaf", 30],
  ["music", "Music", "music", 40],
] as const;

async function main() {
  if (await db.account.count()) {
    console.log("Database already has data — run `npm run db:reset` to reseed.");
    return;
  }
  const cats = Object.fromEntries(
    await Promise.all(CATEGORIES.map(async ([slug, name, icon, maxCoins]) => [slug, await db.skillCategory.create({ data: { slug, name, icon, maxCoins } })])),
  );

  const lakeview = await db.community.create({
    data: { name: "Lakeview Residents", slug: "lakeview", description: "Local support and skills sharing in your area.", inviteCode: "KIND2026", joinPolicy: "APPROVAL" },
  });
  await db.community.create({
    data: { name: "City Learning Circle", slug: "city-learning", description: "Study groups, projects and skill exchange.", inviteCode: "LEARN2026", joinPolicy: "INVITE" },
  });

  const hash = await bcrypt.hash(PASSWORD, 11);
  const people = [
    { u: "Nova18", avatar: "a1", bio: "Curious mind. Happy to help.", role: "MEMBER", org: true, offer: ["presentations", "languages", "spreadsheets"], need: ["technology", "creative"] },
    { u: "Echo27", avatar: "a3", bio: "English tutor on weekends.", role: "MEMBER", offer: ["languages", "presentations"], need: ["plants"] },
    { u: "Pixel42", avatar: "a2", bio: "Spreadsheets and laptops.", role: "MEMBER", offer: ["spreadsheets", "technology"], need: ["languages"] },
    { u: "Muse14", avatar: "a5", bio: "Designer, plant parent.", role: "MEMBER", offer: ["creative", "plants"], need: ["career"] },
    { u: "Orbit09", avatar: "a6", bio: "Guitar for beginners.", role: "MEMBER", offer: ["music", "career"], need: ["spreadsheets"] },
    { u: "SafeHarbor", avatar: "a8", bio: "Community moderator.", role: "MODERATOR", offer: ["everyday"], need: [] },
  ];

  const ids: Record<string, string> = {};
  for (const p of people) {
    const a = await db.account.create({
      data: {
        email: `${p.u.toLowerCase()}@kindbridge.dev`, passwordHash: hash, emailVerifiedAt: new Date(), adultConfirmedAt: new Date(), rulesAcceptedAt: new Date(), role: p.role,
        profile: { create: { username: p.u.toLowerCase(), displayName: p.u, avatar: p.avatar, bio: p.bio, availability: "Weekends", onboardedAt: new Date() } },
        contact: { create: { firstName: p.u === "Nova18" ? "Asha" : null, meetingLocation: "Clubhouse lounge" } },
        skills: { create: [...p.offer.map((s) => ({ categoryId: cats[s].id, kind: "OFFER" })), ...p.need.map((s) => ({ categoryId: cats[s].id, kind: "NEED" }))] },
      },
    });
    ids[p.u] = a.id;
    const m = await db.membership.create({ data: { accountId: a.id, communityId: lakeview.id, status: "APPROVED", role: p.org ? "ORGANIZER" : "MEMBER", approvedAt: new Date(), viaInvite: true } });
    await transaction((tx) => maybeGrantStarter(tx, m.id));
  }

  const listing = (owner: string, kind: "OFFER" | "REQUEST", cat: string, title: string, description: string, coins = 20, durationMin = 30, format = "ONLINE") =>
    db.listing.create({ data: { communityId: lakeview.id, ownerId: ids[owner], kind, categoryId: cats[cat].id, title, description, coins, durationMin, format, availability: "Weekends" } });

  await listing("Echo27", "OFFER", "languages", "Practice spoken English", "Relaxed conversation practice for everyday situations.");
  await listing("Pixel42", "OFFER", "spreadsheets", "Spreadsheet basics", "Formulas, sorting and simple charts, step by step.");
  await listing("Muse14", "OFFER", "creative", "Portfolio feedback", "Honest feedback on a design or art portfolio.");
  await listing("Muse14", "OFFER", "plants", "Balcony plant check-up", "Help choosing plants and fixing watering routines.", 10, 30, "SHARED_SPACE");
  await listing("Orbit09", "OFFER", "music", "Beginner guitar chords", "Your first four chords and a simple strum.", 20, 30, "SHARED_SPACE");
  await listing("Pixel42", "REQUEST", "languages", "Hindi conversation practice", "Looking for a patient partner to practice basic Hindi.", 10);
  await listing("Orbit09", "REQUEST", "spreadsheets", "Set up a budget sheet", "Want a simple monthly budget template I can maintain.", 20, 45);

  // History: Nova18 helped Muse14 with a presentation, settled and reviewed.
  const pres = await listing("Muse14", "REQUEST", "presentations", "Presentation feedback", "Feedback on a 5-minute talk for a meetup.");
  const when = new Date(Date.now() + 3600_000).toISOString();
  const e1 = await ex.propose(ids.Nova18, pres.id, { deliverable: "Feedback on one 5-minute presentation", durationMin: 30, coins: 20, format: "ONLINE", scheduledAt: when, note: "I can help on Saturday." });
  await ex.accept(ids.Muse14, e1.id, 1);
  await ex.markDelivered(ids.Nova18, e1.id);
  await ex.confirmCompletion(ids.Muse14, e1.id);
  await submitReview(ids.Muse14, e1.id, { rating: 5, body: "Thoughtful, specific feedback. Really helped.", thanks: "Thank you so much — the talk went great!" });
  await submitReview(ids.Nova18, e1.id, { rating: 5, body: "Well prepared and receptive." });

  // Nova18 has an open request with a proposal waiting.
  const req = await listing("Nova18", "REQUEST", "technology", "Help setting up my new laptop", "Basic setup: browser, backups and a password manager. No passwords will be shared.");
  await ex.propose(ids.Pixel42, req.id, { deliverable: "Laptop setup walkthrough", durationMin: 30, coins: 20, format: "ONLINE", scheduledAt: new Date(Date.now() + 2 * 86_400_000).toISOString(), note: "Available Sunday afternoon." });

  // A pending membership request for the organizer queue.
  const newbie = await db.account.create({
    data: { email: "newbie@kindbridge.dev", passwordHash: hash, emailVerifiedAt: new Date(), adultConfirmedAt: new Date(), rulesAcceptedAt: new Date(), profile: { create: { username: "lumen5", displayName: "Lumen5", avatar: "a4", onboardedAt: new Date() } } },
  });
  await db.membership.create({ data: { accountId: newbie.id, communityId: lakeview.id, status: "PENDING" } });

  const r = await reconcile();
  console.log(`Seeded. Ledger ${r.ok ? "balanced" : "UNBALANCED"}:`, r.totals);
  console.log(`Sign in as nova18@kindbridge.dev (organizer), echo27@…, pixel42@…, safeharbor@… (moderator) — password: ${PASSWORD}`);
}

main().finally(() => db.$disconnect());
