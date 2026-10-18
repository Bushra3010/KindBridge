# KindBridge

Members earn help coins by helping one neighbour and spend them on help from another — with private usernames, voluntary selective disclosure, and an append-only coin ledger. See [PRD.md](PRD.md) for the product spec and [App Design/](App%20Design) for the visual boards.

This repository is the **P0 community pilot**: a mobile-first web app.

## Quick start

```bash
npm install
cp .env.example .env
npx prisma db push        # create the local SQLite database
npm run db:seed           # demo community, members and history
npm run dev               # http://localhost:3000
```

Demo accounts (password `kindbridge123`):

| Email | Role |
| --- | --- |
| `nova18@kindbridge.dev` | Member + organizer of Lakeview Residents |
| `echo27@`, `pixel42@`, `muse14@`, `orbit09@kindbridge.dev` | Members |
| `safeharbor@kindbridge.dev` | Moderator (`/mod`) |

Lakeview's invite code is `KIND2026`. Without it, new members wait for organizer approval. Email delivery isn't wired up yet; in development the verification code is shown on the verify screen.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js dev server / production build / serve |
| `npm test` | Vitest acceptance suite (PRD §17) against a throwaway `prisma/test.db` |
| `npm run lint` | TypeScript type check |
| `npm run db:seed` | Seed an empty database |

## Stack

Next.js 15 (App Router, server actions) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 6 · SQLite in development (the schema avoids SQLite-only features so it ports to Postgres) · Zod · Vitest.

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
src/app/actions.ts          Server actions (all mutations)
src/app/(app)/…             Member screens (home, explore, requests, coins, profile…)
src/app/mod, /organizer     Moderator and organizer consoles
tests/acceptance.test.ts    PRD §17 checks
```

## How correctness is enforced

- **Ledger:** every operation is a transaction whose entries sum to zero, with a unique idempotency key. Member buckets are debited with a conditional `UPDATE … WHERE available >= n`, so concurrent overspends fail rather than race. `reconcile()` recomputes every balance from the entries; it runs on the moderation dashboard.
- **State machine:** each transition is a guarded `updateMany` on the current status, inside the same DB transaction as its coin movement. Replaying accept or confirm is a no-op.
- **Privacy:** `PrivateContact` is only read for another member through an active `DisclosureGrant`. Exchanges, listings, profiles and coin history 404 outside the viewer's community or participation.

## P0 status against the PRD

Implemented: onboarding (account, email code, 18+/rules, username and avatar, community join or approval, skills); listings, search and filters; proposals with versioned terms; atomic reservation; chat with polling; reschedule; deliver/confirm/settle; cancel-and-refund; partial settlement; disputes; moderator resolution with audit; no-response reminders and 7-day flag (no auto-settle); reviews with delayed publishing and private thank-you notes; selective disclosure with preview and revoke; blocking; reports and support cases; notifications; organizer approvals with small-count suppression; coin wallet and transaction details; account closure with pseudonymization.

Not done yet:
- Real email delivery and a scheduler. Sweeps run lazily on page loads for now.
- Rate limiting, at-rest encryption of `PrivateContact`, backup/restore drill, retention policy (PRD §14, §9).
- Browser E2E tests (Playwright), and a keyboard/screen-reader pass of core flows (§17.13).
- Coin-admin correction UI. The `coinReverse` action exists; the screen does not.
- P1: boosts, billing, subscriptions (design board 06 "Paid visibility" / "Boost checkout").
