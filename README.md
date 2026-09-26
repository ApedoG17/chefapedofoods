# Chef Apedo Foods

Ordering website for Chef Apedo Foods — a home-based Ghanaian food delivery business in Accra.

**Start here:** [`docs/MEMORY.md`](./docs/MEMORY.md) for a 30-second summary, then [`docs/README.md`](./docs/README.md) for the full reading order (PRD, Architecture, Design System, Components, Rules, Tasks, Security, Testing). If you're an AI coding agent, also read [`docs/AGENTS.md`](./docs/AGENTS.md).

## Stack

Next.js + TypeScript + Tailwind CSS · Supabase (Postgres, Auth, Edge Functions, Storage) · Vercel · Paystack. See `docs/ARCHITECTURE.md` for the full picture.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Paystack (test) keys
npm run dev
```

Database: run the migration and seed in `supabase/migrations/` and `supabase/seed/` against your Supabase project (via the Supabase CLI or dashboard SQL editor). The seed's delivery-zone fees are **placeholder values** — see `docs/TASKS.md` §0.

## Current status

Phase F (development) just started. Repository is scaffolded per `docs/TASKS.md` §1; the core transaction (Menu → Customize → Cart → Checkout → Payment → Confirmation → Order Status) has not been implemented yet — the `app/(store)/` pages are placeholders describing what belongs on each screen.

## Build order

Follow `docs/TASKS.md` in order: data layer → core transaction → kitchen/admin → order status wiring → marketing pages → testing (golden path + 7 edge cases in `docs/TESTING.md`) → deployment.

**First milestone:** not "site looks done" — a real test order placed start to finish, paid successfully via Paystack, and received/processed by the chef from the admin side.
