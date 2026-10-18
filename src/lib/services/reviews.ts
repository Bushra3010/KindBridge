import { z } from "zod";
import { db, transaction } from "@/lib/db";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { REVIEW_PUBLISH_DAYS } from "@/lib/constants";
import { maskContacts, notify } from "./support";

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().max(500).default(""),
  thanks: z.string().trim().max(500).default(""),
});

/** One review per party, only for fully completed exchanges (PRD §6.5). */
export async function submitReview(authorId: string, exchangeId: string, input: unknown) {
  const r = reviewSchema.parse(input);
  return transaction(async (tx) => {
    const ex = await tx.exchange.findUnique({ where: { id: exchangeId } });
    if (!ex) throw notFound("Exchange");
    if (ex.requesterId !== authorId && ex.helperId !== authorId) throw forbidden();
    if (ex.status !== "COMPLETED") throw new AppError("Reviews open once a session is completed.");
    const subjectId = ex.requesterId === authorId ? ex.helperId : ex.requesterId;
    const existing = await tx.review.findUnique({ where: { exchangeId_authorId: { exchangeId, authorId } } });
    if (existing) throw new AppError("You've already reviewed this session.");
    await tx.review.create({ data: { exchangeId, authorId, subjectId, rating: r.rating, body: maskContacts(r.body), thanks: maskContacts(r.thanks) } });
    await notify(tx, subjectId, { type: "review_received", title: r.thanks ? "You got a thank-you note" : "You received a review", href: "/profile" });
  });
}

/** A review is public once both parties have reviewed, or 7 days after settlement. */
export async function publishedReviewsFor(subjectId: string) {
  const cutoff = new Date(Date.now() - REVIEW_PUBLISH_DAYS * 86_400_000);
  const reviews = await db.review.findMany({
    where: { subjectId },
    include: { exchange: { include: { reviews: { select: { id: true } } } }, author: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
  });
  return reviews.filter((r) => r.exchange.reviews.length >= 2 || (r.exchange.completedAt && r.exchange.completedAt < cutoff));
}

export async function reputation(subjectId: string) {
  const published = await publishedReviewsFor(subjectId);
  const completed = await db.exchange.count({ where: { helperId: subjectId, status: "COMPLETED" } });
  const avg = published.length ? published.reduce((s, r) => s + r.rating, 0) / published.length : null;
  return { completedHelp: completed, reviewCount: published.length, rating: avg ? Math.round(avg * 10) / 10 : null, reviews: published };
}
