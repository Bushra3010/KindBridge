// PRD §17 acceptance checks that can be proven at the service layer.
import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import * as ex from "@/lib/services/exchanges";
import * as ledger from "@/lib/services/ledger";
import * as disclosure from "@/lib/services/disclosure";
import * as safety from "@/lib/services/safety";
import * as admin from "@/lib/services/admin";
import { submitReview, reputation } from "@/lib/services/reviews";
import { searchListings } from "@/lib/services/listings";
import { balance, community, member, offerListing, requestListing, terms } from "./helpers";

async function bookedExchange(coins = 20) {
  const c = await community();
  const requester = await member(c.id);
  const helper = await member(c.id);
  const listing = await requestListing(requester.id, c, coins);
  const e = await ex.propose(helper.id, listing.id, terms(coins));
  await ex.accept(requester.id, e.id, 1);
  return { c, requester, helper, listing, e };
}

describe("§17.1–2 end-to-end session and onward spending", () => {
  it("reserves, settles, reviews, then spends earned coins with a different member", async () => {
    const { c, requester, helper, e } = await bookedExchange(20);
    expect(await balance(c.id, requester.id)).toEqual({ available: 0, reserved: 20 });

    await ex.markDelivered(helper.id, e.id);
    expect(await balance(c.id, helper.id)).toEqual({ available: 20, reserved: 0 }); // not paid yet
    await ex.confirmCompletion(requester.id, e.id);
    expect(await balance(c.id, requester.id)).toEqual({ available: 0, reserved: 0 });
    expect(await balance(c.id, helper.id)).toEqual({ available: 40, reserved: 0 });

    await submitReview(requester.id, e.id, { rating: 5, body: "Clear and kind" });
    await submitReview(helper.id, e.id, { rating: 5 });
    expect((await reputation(helper.id)).rating).toBe(5);
    await expect(submitReview(helper.id, e.id, { rating: 1 })).rejects.toThrow(/already reviewed/);

    // Helper spends earned coins with a third member.
    const third = await member(c.id);
    const offer = await offerListing(third.id, c, 40);
    const e2 = await ex.propose(helper.id, offer.id, terms(40));
    await ex.accept(third.id, e2.id, 1);
    await ex.markDelivered(third.id, e2.id);
    await ex.confirmCompletion(helper.id, e2.id);
    expect(await balance(c.id, third.id)).toEqual({ available: 60, reserved: 0 });
    expect((await ledger.reconcile(c.id)).ok).toBe(true);
  });
});

describe("§17.3 concurrent acceptances", () => {
  it("never overspends a balance", async () => {
    const c = await community();
    const requester = await member(c.id); // 20 coins
    const h1 = await member(c.id), h2 = await member(c.id);
    const l1 = await offerListing(h1.id, c, 15), l2 = await offerListing(h2.id, c, 15);
    const e1 = await ex.propose(requester.id, l1.id, terms(15));
    const e2 = await ex.propose(requester.id, l2.id, terms(15));
    const results = await Promise.allSettled([ex.accept(h1.id, e1.id, 1), ex.accept(h2.id, e2.id, 1)]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((r) => r.status === "rejected") as PromiseRejectedResult;
    expect(rejected.reason.code).toBe("INSUFFICIENT_BALANCE");
    expect(await balance(c.id, requester.id)).toEqual({ available: 5, reserved: 15 });
    expect((await ledger.reconcile(c.id)).ok).toBe(true);
  });

  it("never books a one-off listing twice", async () => {
    const c = await community();
    const owner = await member(c.id);
    const a = await member(c.id), b = await member(c.id);
    const listing = await requestListing(owner.id, c, 10);
    const ea = await ex.propose(a.id, listing.id, terms(10));
    const eb = await ex.propose(b.id, listing.id, terms(10));
    const results = await Promise.allSettled([ex.accept(owner.id, ea.id, 1), ex.accept(owner.id, eb.id, 1)]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await balance(c.id, owner.id)).toEqual({ available: 10, reserved: 10 });
  });

  it("leaves the proposal unaccepted when the balance is insufficient", async () => {
    const c = await community();
    const requester = await member(c.id);
    const helper = await member(c.id);
    const listing = await requestListing(requester.id, c, 30);
    const e = await ex.propose(helper.id, listing.id, terms(30));
    await expect(ex.accept(requester.id, e.id, 1)).rejects.toThrow(/need 30 coins but have 20/);
    const after = await db.exchange.findUniqueOrThrow({ where: { id: e.id } });
    expect(after.status).toBe("PROPOSED");
    expect((await db.listing.findUniqueOrThrow({ where: { id: listing.id } })).status).toBe("OPEN");
  });
});

describe("§17.4 replayed reserve/confirm", () => {
  it("creates no duplicate ledger movements", async () => {
    const { c, requester, helper, e } = await bookedExchange(20);
    await ex.accept(requester.id, e.id, 1);
    await ex.markDelivered(helper.id, e.id);
    await Promise.allSettled([ex.confirmCompletion(requester.id, e.id), ex.confirmCompletion(requester.id, e.id)]);
    await ex.confirmCompletion(requester.id, e.id);
    const txs = await db.ledgerTransaction.findMany({ where: { exchangeId: e.id } });
    expect(txs.map((t) => t.type).sort()).toEqual(["RESERVE", "SETTLE"]);
    expect(await balance(c.id, helper.id)).toEqual({ available: 40, reserved: 0 });
  });

  it("treats a replayed ledger key as a no-op", async () => {
    const { c, requester, e } = await bookedExchange(20);
    const again = await db.$transaction((tx) => ledger.reserve(tx, { communityId: c.id, payerId: requester.id, amount: 20, exchangeId: e.id, actorId: requester.id }));
    expect(again.replayed).toBe(true);
    expect(await balance(c.id, requester.id)).toEqual({ available: 0, reserved: 20 });
  });
});

describe("§17.5 cancel before work", () => {
  it("restores the full reservation exactly once and reopens the listing", async () => {
    const { c, requester, helper, listing, e } = await bookedExchange(20);
    await ex.cancel(helper.id, e.id, "Something came up");
    await expect(ex.cancel(requester.id, e.id, "again")).rejects.toThrow();
    expect(await balance(c.id, requester.id)).toEqual({ available: 20, reserved: 0 });
    expect((await db.listing.findUniqueOrThrow({ where: { id: listing.id } })).status).toBe("OPEN");
    expect((await ledger.reconcile(c.id)).ok).toBe(true);
  });

  it("blocks cancellation once work has started", async () => {
    const { requester, helper, e } = await bookedExchange(20);
    await ex.start(helper.id, e.id);
    await expect(ex.cancel(requester.id, e.id, "nope")).rejects.toThrow(/partial amount or open a dispute/);
  });
});

describe("§17.6 partial work", () => {
  it("settlement plus refund equals the held amount", async () => {
    const { c, requester, helper, e } = await bookedExchange(20);
    await ex.start(helper.id, e.id);
    await ex.proposePartial(helper.id, e.id, 12);
    await expect(ex.approvePartial(helper.id, e.id, 12)).rejects.toThrow(/other member/);
    await expect(ex.approvePartial(requester.id, e.id, 10)).rejects.toThrow(/changed/);
    await ex.approvePartial(requester.id, e.id, 12);
    const done = await db.exchange.findUniqueOrThrow({ where: { id: e.id } });
    expect(done.settled + done.refunded).toBe(20);
    expect(await balance(c.id, requester.id)).toEqual({ available: 8, reserved: 0 });
    expect(await balance(c.id, helper.id)).toEqual({ available: 32, reserved: 0 });
  });

  it("moderator resolution enforces the held amount and is audited", async () => {
    const { c, requester, helper, e } = await bookedExchange(20);
    const mod = await member(c.id, { role: "MODERATOR", grant: false });
    await ex.openDispute(requester.id, e.id, "No-show", "They didn't join");
    await expect(ex.moderatorResolve(mod.id, e.id, 25, "x", "")).rejects.toThrow(/between 0 and 20/);
    await expect(ex.moderatorResolve(requester.id, e.id, 0, "x", "")).rejects.toThrow();
    await ex.moderatorResolve(mod.id, e.id, 0, "Helper did not attend", "Chat log reviewed");
    expect(await balance(c.id, requester.id)).toEqual({ available: 20, reserved: 0 });
    expect(await db.auditEvent.count({ where: { targetId: e.id, action: "exchange_resolved" } })).toBe(1);
    expect((await ledger.reconcile(c.id)).ok).toBe(true);
    void helper;
  });
});

describe("§17.7 no response", () => {
  it("reminds and flags but never settles automatically", async () => {
    const { c, requester, helper, e } = await bookedExchange(20);
    await ex.markDelivered(helper.id, e.id);
    const t0 = Date.now();
    await ex.sweep(new Date(t0 + 25 * 3600_000));
    await ex.sweep(new Date(t0 + 73 * 3600_000));
    await ex.sweep(new Date(t0 + 8 * 86_400_000));
    const after = await db.exchange.findUniqueOrThrow({ where: { id: e.id } });
    expect(after.status).toBe("DELIVERED");
    expect(after.flaggedAt).not.toBeNull();
    expect(after.remindersSent).toBe(2);
    expect(await balance(c.id, helper.id)).toEqual({ available: 20, reserved: 0 });
    expect(await balance(c.id, requester.id)).toEqual({ available: 0, reserved: 20 });
    expect(await db.report.count({ where: { targetId: e.id } })).toBe(1);
  });
});

describe("§17.8–9 access control and disclosure", () => {
  it("only participants can act on an exchange", async () => {
    const { c, e } = await bookedExchange(20);
    const outsider = await member(c.id);
    await expect(ex.markDelivered(outsider.id, e.id)).rejects.toThrow(/access/);
    await expect(disclosure.grant(outsider.id, e.id, ["PHONE"])).rejects.toThrow(/access/);
  });

  it("discovery is restricted to the member's community", async () => {
    const c1 = await community(), c2 = await community();
    const a = await member(c1.id), b = await member(c2.id);
    await requestListing(b.id, c2);
    expect(await searchListings(a.id, c1.id, {})).toHaveLength(0);
    const other = await requestListing(b.id, c2);
    await expect(ex.propose(a.id, other.id, terms())).rejects.toThrow(/approved membership/);
  });

  it("shares one field with one person, hides it from others, and revokes", async () => {
    const { c, requester, helper, e } = await bookedExchange(20);
    await db.privateContact.create({ data: { accountId: helper.id, firstName: "Asha", phone: "+91 98765 43210" } });
    await disclosure.grant(helper.id, e.id, ["FIRST_NAME"]);
    expect(await disclosure.visibleContact(requester.id, helper.id)).toEqual({ FIRST_NAME: "Asha" });
    const outsider = await member(c.id);
    expect(await disclosure.visibleContact(outsider.id, helper.id)).toEqual({});
    const g = await db.disclosureGrant.findFirstOrThrow({ where: { ownerId: helper.id } });
    await disclosure.revoke(helper.id, g.id);
    expect(await disclosure.visibleContact(requester.id, helper.id)).toEqual({});
  });
});

describe("§17.10 blocking", () => {
  it("stops new proposals but preserves structured resolution", async () => {
    const { c, requester, helper, e } = await bookedExchange(20);
    await safety.block(requester.id, helper.id);
    const another = await requestListing(requester.id, c, 5);
    await expect(ex.propose(helper.id, another.id, terms(5))).rejects.toThrow(/can't send proposals/);
    await ex.markDelivered(helper.id, e.id);
    await ex.openDispute(requester.id, e.id, "Help not delivered", "");
    expect((await db.exchange.findUniqueOrThrow({ where: { id: e.id } })).status).toBe("DISPUTED");
  });
});

describe("§7 starter grants & corrections", () => {
  it("grants once and respects the community allocation cap", async () => {
    const c = await community({ starterGrant: 20, allocation: 40 });
    const a = await member(c.id), b = await member(c.id), d = await member(c.id);
    expect((await balance(c.id, a.id)).available).toBe(20);
    expect((await balance(c.id, b.id)).available).toBe(20);
    expect((await balance(c.id, d.id)).available).toBe(0); // cap reached
    expect(await ledger.issuedStarterTotal(db, c.id)).toBe(40);
  });

  it("corrections use reversing entries", async () => {
    const c = await community();
    const a = await member(c.id);
    const grant = await db.ledgerTransaction.findFirstOrThrow({ where: { idempotencyKey: `starter:${c.id}:${a.id}` } });
    await db.$transaction((tx) => ledger.reverse(tx, { transactionId: grant.id, actorId: a.id, reason: "Duplicate account" }));
    expect((await balance(c.id, a.id)).available).toBe(0);
    expect(await db.ledgerTransaction.count({ where: { OR: [{ id: grant.id }, { reversesId: grant.id }] } })).toBe(2);
    expect((await ledger.reconcile(c.id)).ok).toBe(true);
  });

  it("audited corrections refuse double reversals and coins held by open exchanges", async () => {
    const { c, requester, e } = await bookedExchange(10);
    const coinAdmin = await member(c.id, { role: "COIN_ADMIN", grant: false });
    const hold = await db.ledgerTransaction.findFirstOrThrow({ where: { exchangeId: e.id, type: "RESERVE" } });
    await expect(db.$transaction((tx) => ledger.correct(tx, { transactionId: hold.id, actorId: coinAdmin.id, reason: "test" }))).rejects.toThrow(/still open/);

    const grant = await db.ledgerTransaction.findFirstOrThrow({ where: { idempotencyKey: `starter:${c.id}:${requester.id}` } });
    await ex.cancel(requester.id, e.id, "Plans changed");
    await db.$transaction((tx) => ledger.correct(tx, { transactionId: grant.id, actorId: coinAdmin.id, reason: "Duplicate account" }));
    await expect(db.$transaction((tx) => ledger.correct(tx, { transactionId: grant.id, actorId: coinAdmin.id, reason: "again" }))).rejects.toThrow(/already been reversed/);
    expect(await db.auditEvent.count({ where: { action: "ledger_reversed", targetId: grant.id, actorId: coinAdmin.id } })).toBe(1);
    expect((await ledger.reconcile(c.id)).ok).toBe(true);
  });
});

describe("§10 platform admin", () => {
  it("only admins change roles, never their own, and every change is audited", async () => {
    const c = await community();
    const boss = await member(c.id, { role: "ADMIN", grant: false });
    const mod = await member(c.id, { role: "MODERATOR", grant: false });
    const target = await member(c.id);
    await expect(admin.setRole(mod.id, target.id, "ADMIN", "promote myself a friend")).rejects.toThrow(/access/);
    await expect(admin.setRole(boss.id, boss.id, "MEMBER", "step down")).rejects.toThrow(/own role/);
    await expect(admin.setRole(boss.id, target.id, "MODERATOR", "")).rejects.toThrow(/reason/);
    await admin.setRole(boss.id, target.id, "MODERATOR", "Pilot moderator");
    expect((await db.account.findUniqueOrThrow({ where: { id: target.id } })).role).toBe("MODERATOR");
    const ev = await db.auditEvent.findFirstOrThrow({ where: { action: "role_changed", targetId: target.id } });
    expect(JSON.parse(ev.data)).toMatchObject({ from: "MEMBER", to: "MODERATOR", reason: "Pilot moderator" });
  });

  it("categories and communities are validated, unique and audited", async () => {
    const c = await community();
    const boss = await member(c.id, { role: "ADMIN", grant: false });
    const slug = `cooking-${Date.now()}`;
    const cat = await admin.saveCategory(boss.id, null, { name: "Cooking", slug, icon: "heart", maxCoins: 30, active: true });
    await expect(admin.saveCategory(boss.id, null, { name: "Cooking 2", slug, icon: "heart", maxCoins: 30, active: true })).rejects.toThrow(/already used/);
    await expect(admin.saveCategory(boss.id, cat.id, { name: "Cooking", slug, icon: "heart", maxCoins: 0, active: true })).rejects.toThrow(/ceiling/);
    await admin.saveCategory(boss.id, cat.id, { name: "Cooking", slug, icon: "heart", maxCoins: 50, active: false });
    expect(await db.skillCategory.findUniqueOrThrow({ where: { id: cat.id } })).toMatchObject({ maxCoins: 50, active: false });

    const input = { name: "Riverside", slug: `riverside-${Date.now()}`, description: "", inviteCode: `RIVER${Date.now() % 100000}`, joinPolicy: "INVITE" as const, starterGrant: 15, starterAllocation: 500 };
    const made = await admin.saveCommunity(boss.id, null, input);
    await expect(admin.saveCommunity(boss.id, null, { ...input, slug: `other-${Date.now()}` })).rejects.toThrow(/invite code is already used/);
    const member1 = await member(c.id, { grant: false });
    await expect(admin.saveCommunity(member1.id, made.id, { ...input, starterGrant: 99 })).rejects.toThrow(/access/);
    expect(await db.auditEvent.count({ where: { actorId: boss.id, action: { in: ["category_created", "category_updated", "community_created"] } } })).toBe(3);
  });
});

describe("§10 admin block and delete", () => {
  it("deletes a fresh account outright and closes one with history", async () => {
    const c = await community();
    const boss = await member(c.id, { role: "ADMIN", grant: false });
    const fresh = await db.account.create({ data: { email: `fresh-${Date.now()}@test.dev`, passwordHash: "x", profile: { create: { username: `fresh${Date.now()}`, displayName: "Fresh" } } } });
    expect(await admin.deleteAccount(boss.id, fresh.id, "spam signup")).toBe("deleted");
    expect(await db.account.findUnique({ where: { id: fresh.id } })).toBeNull();

    const veteran = await member(c.id); // has a starter grant in the ledger
    expect(await admin.deleteAccount(boss.id, veteran.id, "requested by email")).toBe("closed");
    const closed = await db.account.findUniqueOrThrow({ where: { id: veteran.id }, include: { profile: true } });
    expect(closed.status).toBe("CLOSED");
    expect(closed.email).toMatch(/@kindbridge\.invalid$/);
    expect(closed.profile?.displayName).toBe("Former member");
    expect((await ledger.reconcile(c.id)).ok).toBe(true);
    expect(await db.auditEvent.count({ where: { actorId: boss.id, action: { in: ["account_deleted", "account_closed_by_admin"] } } })).toBe(2);
  });

  it("refuses unsafe deletes and blocks", async () => {
    const { c, requester } = await bookedExchange(10);
    const boss = await member(c.id, { role: "ADMIN", grant: false });
    const otherAdmin = await member(c.id, { role: "ADMIN", grant: false });
    const mod = await member(c.id, { role: "MODERATOR", grant: false });
    await expect(admin.deleteAccount(boss.id, requester.id, "x")).rejects.toThrow(/open exchange/);
    await expect(admin.deleteAccount(boss.id, otherAdmin.id, "x")).rejects.toThrow(/admin role/);
    await expect(admin.deleteAccount(boss.id, boss.id, "x")).rejects.toThrow(/your own/);
    await expect(admin.deleteAccount(mod.id, requester.id, "x")).rejects.toThrow(/access/);
    await expect(safety.setAccountStatus(mod.id, boss.id, "SUSPENDED", "x")).rejects.toThrow(/access/);
    await expect(safety.setAccountStatus(boss.id, boss.id, "SUSPENDED", "x")).rejects.toThrow(/own account/);

    const gone = await member(c.id);
    await admin.deleteAccount(boss.id, gone.id, "test");
    await expect(safety.setAccountStatus(boss.id, gone.id, "ACTIVE", "undo")).rejects.toThrow(/deleted/);
  });
});

describe("§6.3 terms versions", () => {
  it("only the latest version can be accepted, by the non-author", async () => {
    const c = await community();
    const requester = await member(c.id);
    const helper = await member(c.id);
    const listing = await requestListing(requester.id, c, 10);
    const e = await ex.propose(helper.id, listing.id, terms(10));
    await expect(ex.accept(helper.id, e.id, 1)).rejects.toThrow(/other member/);
    await ex.revise(requester.id, e.id, terms(8));
    await expect(ex.accept(helper.id, e.id, 1)).rejects.toThrow(/terms changed/);
    await ex.accept(helper.id, e.id, 2);
    expect(await balance(c.id, requester.id)).toEqual({ available: 12, reserved: 8 });
  });
});
