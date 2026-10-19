import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db, transaction } from "@/lib/db";
import { AppError, forbidden, notFound } from "@/lib/errors";

export const listingSchema = z.object({
  kind: z.enum(["OFFER", "REQUEST"]),
  categoryId: z.string().optional(), // members don't pick one; see generalCategory()
  title: z.string().trim().min(4, "Add a short title").max(80),
  description: z.string().trim().min(10, "Add a little more detail").max(800),
  durationMin: z.coerce.number().int().min(15).max(240),
  coins: z.coerce.number().int().min(1).max(500),
  format: z.enum(["ONLINE", "SHARED_SPACE"]),
  availability: z.string().trim().min(1).max(80),
});

/**
 * Members don't choose a category when posting; listings are filed under this
 * built-in one, which also sets the per-listing coin ceiling. It's inactive so
 * it never appears as a skill chip or explore filter.
 */
async function generalCategory(tx: Prisma.TransactionClient) {
  return tx.skillCategory.upsert({
    where: { slug: "general" },
    create: { slug: "general", name: "General", icon: "sparkle", maxCoins: 60, active: false },
    update: {},
  });
}

export async function createListing(ownerId: string, input: unknown) {
  const data = listingSchema.parse(input);
  return transaction(async (tx) => {
    const m = await tx.membership.findFirst({ where: { accountId: ownerId, status: "APPROVED" } });
    if (!m) throw new AppError("You can post once your community membership is approved.");
    const category = data.categoryId ? await tx.skillCategory.findUnique({ where: { id: data.categoryId } }) : await generalCategory(tx);
    if (!category || (data.categoryId && !category.active)) throw new AppError("Choose one of the approved service categories.");
    if (data.coins > category.maxCoins) throw new AppError(`Listings are capped at ${category.maxCoins} coins in the pilot.`);
    return tx.listing.create({ data: { ...data, categoryId: category.id, ownerId, communityId: m.communityId } });
  });
}

export async function setListingStatus(ownerId: string, listingId: string, status: "OPEN" | "CLOSED") {
  const l = await db.listing.findUnique({ where: { id: listingId } });
  if (!l) throw notFound("Listing");
  if (l.ownerId !== ownerId) throw forbidden();
  if (l.status === "REMOVED") throw new AppError("This listing was removed by a moderator.");
  if (status === "OPEN") {
    const active = await db.exchange.count({ where: { listingId, status: { in: ["ACCEPTED", "IN_PROGRESS", "DELIVERED", "DISPUTED"] } } });
    if (active) throw new AppError("This listing has a booked session. Reopen it after the session ends.");
  }
  return db.listing.update({ where: { id: listingId }, data: { status } });
}

export type SearchFilters = {
  q?: string;
  category?: string;
  kind?: "OFFER" | "REQUEST";
  format?: "ONLINE" | "SHARED_SPACE";
  availability?: string;
  maxCoins?: number;
};

/**
 * Community-scoped discovery. Ranking: relevance, then owner availability,
 * then a boost for newer members (exploration). Coin balance is never used.
 */
export async function searchListings(viewerId: string, communityId: string, f: SearchFilters) {
  const where: Prisma.ListingWhereInput = {
    communityId,
    status: "OPEN",
    owner: { status: "ACTIVE", blocks: { none: { blockedId: viewerId } }, blockedBy: { none: { blockerId: viewerId } } },
    ...(f.category && { category: { slug: f.category } }),
    ...(f.kind && { kind: f.kind }),
    ...(f.format && { format: f.format }),
    ...(f.availability && { availability: f.availability }),
    ...(f.maxCoins && { coins: { lte: f.maxCoins } }),
  };
  const rows = await db.listing.findMany({
    where,
    include: { category: true, owner: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const terms = (f.q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const scored = rows
    .map((l) => {
      const hay = `${l.title} ${l.description} ${l.category.name}`.toLowerCase();
      const hits = terms.filter((t) => hay.includes(t)).length;
      if (terms.length && hits === 0) return null;
      const titleHits = terms.filter((t) => l.title.toLowerCase().includes(t)).length;
      const available = l.owner.profile?.paused ? 0 : 1;
      const isNew = Date.now() - l.owner.createdAt.getTime() < 21 * 86_400_000 ? 0.5 : 0;
      return { listing: l, score: hits * 2 + titleHits + available * 3 + isNew };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.score - a.score || b.listing.createdAt.getTime() - a.listing.createdAt.getTime());

  return scored.map((s) => s.listing);
}

/** Requests matching the viewer's declared offered skills, with a reason (PRD §12). */
export async function opportunitiesFor(accountId: string, communityId: string) {
  const skills = await db.userSkill.findMany({ where: { accountId, kind: "OFFER" }, include: { category: true } });
  if (skills.length === 0) return [];
  const listings = await db.listing.findMany({
    where: { communityId, status: "OPEN", kind: "REQUEST", ownerId: { not: accountId }, categoryId: { in: skills.map((s) => s.categoryId) } },
    include: { category: true, owner: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  return listings.map((l) => ({ listing: l, why: `Matches your ${l.category.name} skill` }));
}

/** Active offers the viewer can afford right now (spend suggestions). */
export async function affordableOffers(accountId: string, communityId: string, available: number) {
  return db.listing.findMany({
    where: { communityId, status: "OPEN", kind: "OFFER", ownerId: { not: accountId }, coins: { lte: available } },
    include: { category: true, owner: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}
