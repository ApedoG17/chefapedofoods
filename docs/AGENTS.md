# Chef Apedo Foods — Instructions for AI Coding Agents

If you're an AI coding agent (e.g. Claude Code) working in this repo, read `MEMORY.md` first for fast context, then this file for how to operate.

## Before making changes

- Treat `PRD.md` as the source of truth for *what* to build and the business rules — don't invent or soften a rule (e.g. the payment split, the same-day cutoff, the cancellation window) even if a simpler implementation is tempting.
- Treat `ARCHITECTURE.md` as the source of truth for the data model and stack (Next.js + TypeScript + Tailwind, Supabase, Vercel, Paystack — all locked). If a task seems to need a schema change, check it against the existing tables first rather than improvising a new shape.
- Treat `DESIGN_SYSTEM.md` as the source of truth for visual decisions. Don't introduce new colors, fonts, or component styles without checking it first.
- If something in these docs conflicts with an instruction you're given, flag the conflict rather than silently picking one — these docs represent locked business decisions made with the founder, not suggestions.

## While building

- Build the core transaction flow before marketing pages, per `TASKS.md` — a working checkout matters more than a polished homepage at this stage.
- The 10 business rules in `PRD.md` should live in one shared module, not be re-implemented per screen (see `RULES.md`).
- Never combine "pay now" and "pay rider on delivery" into a single displayed total — this has been stated as a hard UX requirement multiple times across the planning process and is easy to accidentally collapse into "Total: GH₵X."
- Money is integer/fixed-point pesewas, not floats (see `RULES.md`).

## What NOT to do without asking

- Don't add customer accounts, loyalty, live GPS tracking, or an automated rider-dispatch API — these are explicitly out of MVP scope (`PRD.md`).
- Don't invent delivery-zone fees beyond the GH₵10 starting point — that's the one genuinely open item left (`TASKS.md` §0); the `DeliveryZone` table exists precisely so real numbers can be added later without a schema change.
- Don't mark an order `Confirmed` without a verified Paystack webhook — see the payment flow in `ARCHITECTURE.md`.
- Don't change the menu, pricing, or protein-package structure — these are locked business decisions (`PRD.md`).

## Keeping docs in sync

If you make an architecture or scope decision while building (e.g. the stack gets chosen, a payment gateway is picked), update the relevant doc (`ARCHITECTURE.md`, `TASKS.md` §0, `RULES.md`) in the same change — don't let this doc set drift from what the code actually does.
