# KindBridge

Members earn help coins by helping one neighbour and spend them on help from another — with private usernames, voluntary selective disclosure, and an append-only coin ledger. See [PRD.md](PRD.md) for the product spec and [App Design/](App%20Design) for the visual boards.

This repository is the **P0 community pilot**: a mobile-first web app.

## Quick start

```bash
npm install
cp .env.example .env       # fill in your Supabase Postgres connection strings
npx prisma db push        # create the tables in the "app" schema
npm run db:seed           # creates the admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev               # http://localhost:3000
```

Then sign in as the admin at `/admin`. The community everyone joins is created automatically on the first signup (rename it under Communities). Members type their own skills, and listings are filed under a built-in "General" category that caps each listing at 60 coins.

For throwaway demo data instead (members, listings and history; password `kindbridge123`), run `npm run db:seed:demo` on an empty database. Never use it on a database with real members.

Members verify their email with a six-digit OTP, then join the oldest community (or `DEFAULT_COMMUNITY_SLUG`), receive approval and starter coins, and choose their skills. Codes expire after 15 minutes; resends have a 60-second cooldown and codes lock after five failed attempts. Verify `kindbridge.co.in` in Resend, configure a Sending-only `RESEND_API_KEY` in Vercel production, and set `EMAIL_FROM` to `KindBridge <noreply@kindbridge.co.in>` before deploying. Development without an API key logs codes locally; production requires real email delivery.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js dev server / production build / serve |
| `npm test` | Vitest acceptance suite (PRD §17) against the throwaway `app_test` schema |
| `npm run lint` | TypeScript type check |
| `npm run db:seed` | Create the platform admin from `.env` |
| `npm run db:seed:demo` | Load demo members and history into an empty database |

## Stack

Next.js 15 (App Router, server actions) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 6 · Postgres on Supabase · Zod · Vitest.

## Layout

```
prisma/schema.prisma        Data model (PRD §13)
prisma/seed.ts              Demo data, created through the real services
src/lib/services/
  ledger.ts                 Double-entry help-coin ledger, idempotency, reconciliation
  exchanges.ts              Proposal → accept/reserve → deliver → confirm/settle, cancel, partial, disputes, sweeps
  membership.ts             Joining, organizer approval, capped starter grants
  disclosure.ts             Field- and recipient-specific sharing grants
  listings.ts               Listings, community-scoped search and ranking, suggestions
  reviews.ts, safety.ts     Reviews/reputation; blocks, reports, moderation
  admin.ts                  Role changes, communities, block/delete (ADMIN-only, audited)
src/app/actions.ts          Server actions (all mutations)
src/app/(app)/…             Member screens (home, explore, requests, coins, profile…)
src/app/mod, /organizer     Moderator and organizer consoles
src/app/admin               Platform admin console
tests/acceptance.test.ts    PRD §17 checks
```

## How correctness is enforced

- **Ledger:** every operation is a transaction whose entries sum to zero, with a unique idempotency key. Member buckets are debited with a conditional `UPDATE … WHERE available >= n`, so concurrent overspends fail rather than race. `reconcile()` recomputes every balance from the entries; it runs on the moderation dashboard.
- **State machine:** each transition is a guarded `updateMany` on the current status, inside the same DB transaction as its coin movement. Replaying accept or confirm is a no-op.
- **Privacy:** `PrivateContact` is only read for another member through an active `DisclosureGrant`. Exchanges, listings, profiles and coin history 404 outside the viewer's community or participation.

## P0 status against the PRD

Implemented: onboarding (account, email code, 18+/rules, username and avatar, community join or approval, skills); listings, search and filters; proposals with versioned terms; atomic reservation; chat with polling; reschedule; deliver/confirm/settle; cancel-and-refund; partial settlement; disputes; moderator resolution with audit; no-response reminders and 7-day flag (no auto-settle); reviews with delayed publishing and private thank-you notes; selective disclosure with preview and revoke; blocking; reports and support cases; notifications; organizer approvals with small-count suppression; coin wallet and transaction details; account closure with pseudonymization; admin console (`/admin`: overview, member search with role changes, block/unblock and delete, communities, per-community reconciliation with audited coin reversals, audit log).

Not done yet:
- Real email delivery and a scheduler. Sweeps run lazily on page loads for now.
- Rate limiting, at-rest encryption of `PrivateContact`, backup/restore drill, retention policy (PRD §14, §9).
- Browser E2E tests (Playwright), and a keyboard/screen-reader pass of core flows (§17.13).
- P1: boosts, billing, subscriptions (design board 06 "Paid visibility" / "Boost checkout").
