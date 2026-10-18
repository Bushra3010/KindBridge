import { db } from "@/lib/db";
import { maybeGrantStarter } from "@/lib/services/membership";
import { transaction } from "@/lib/db";

let n = 0;

export async function community(opts: { starterGrant?: number; allocation?: number } = {}) {
  n++;
  const c = await db.community.create({
    data: { name: `Test ${n}`, slug: `test-${n}-${Date.now()}`, description: "", inviteCode: `CODE${n}${Date.now()}`, starterGrant: opts.starterGrant ?? 20, starterAllocation: opts.allocation ?? 10_000 },
  });
  const category = await db.skillCategory.upsert({
    where: { slug: "test-cat" },
    create: { slug: "test-cat", name: "Test", icon: "sparkle", maxCoins: 100 },
    update: {},
  });
  return { ...c, categoryId: category.id };
}

export async function member(communityId: string, opts: { role?: string; grant?: boolean } = {}) {
  n++;
  const a = await db.account.create({
    data: {
      email: `u${n}-${Date.now()}@test.dev`, passwordHash: "x", emailVerifiedAt: new Date(), role: opts.role ?? "MEMBER",
      profile: { create: { username: `user${n}${Date.now()}`, displayName: `User${n}`, onboardedAt: new Date() } },
    },
  });
  const m = await db.membership.create({ data: { accountId: a.id, communityId, status: "APPROVED", approvedAt: new Date() } });
  if (opts.grant !== false) await transaction((tx) => maybeGrantStarter(tx, m.id));
  return a;
}

export async function balance(communityId: string, accountId: string) {
  const a = await db.helpCoinAccount.findUnique({ where: { communityId_accountId: { communityId, accountId } } });
  return { available: a?.available ?? 0, reserved: a?.reserved ?? 0 };
}

export async function requestListing(ownerId: string, c: { id: string; categoryId: string }, coins = 20) {
  return db.listing.create({
    data: { communityId: c.id, ownerId, kind: "REQUEST", categoryId: c.categoryId, title: "Help with my presentation", description: "Feedback on a 5-minute talk", durationMin: 30, coins, format: "ONLINE", availability: "Weekends" },
  });
}

export async function offerListing(ownerId: string, c: { id: string; categoryId: string }, coins = 20) {
  return db.listing.create({
    data: { communityId: c.id, ownerId, kind: "OFFER", categoryId: c.categoryId, title: "Spreadsheet basics", description: "I can teach formulas and charts", durationMin: 30, coins, format: "ONLINE", availability: "Weekends" },
  });
}

export const terms = (coins = 20) => ({
  deliverable: "Feedback on one 5-minute presentation",
  durationMin: 30,
  coins,
  format: "ONLINE",
  scheduledAt: new Date(Date.now() + 2 * 86_400_000).toISOString(),
});
