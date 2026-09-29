# Chef Apedo Foods — Coding Rules & Conventions

Stack is locked (Next.js + TypeScript + Tailwind, Supabase, Vercel, Hubtel + Manual MoMo — see `ARCHITECTURE.md`). Conventions below apply from the first commit.

## Stack-agnostic rules

- **Business rules live in one place.** The 10 rules in `PRD.md` (payment split, same-day cutoff, capacity, stock, excluded areas, cancellation window, refund-on-failure) should be enforced in a single shared module/service, not duplicated per screen or per endpoint. If a rule needs to change, it should change in one place.
- **Money is never a float.** Store and calculate all GH₵ amounts as integers (pesewas) or a fixed-point/decimal type — never native floating point.
- **Every price-affecting selection is explicit data, not a string.** Meal size, included protein choice, and extra proteins are structured selections tied to the schema in `ARCHITECTURE.md`, not free-text or hidden in a description field.
- **Delivery-fee and payment-split copy is never combined into a single "Total."** Anywhere a price is shown at checkout/cart/payment, "pay now" and "pay rider on delivery" must be visually and textually distinct — this is a product requirement, not a style preference.
- **No secrets or payment credentials in the repo.** MoMo/gateway keys go in environment variables / secrets management, never committed.
- **Naming should read like the business, not the database.** e.g. `orderStatus` values should match the lifecycle names in `PRD.md` (`Confirmed`, `Preparing`, `Ready for Dispatch`, `Dispatched`, `Delivered`, `Cancelled`) so there's no translation layer between code and the business rules doc.

## Next.js + TypeScript + Tailwind conventions

- **TypeScript strict mode on.** No `any` for order/payment/menu data — these types should mirror the schema in `ARCHITECTURE.md` directly (a `MealSize`, `ProteinOption`, `Order`, etc. type per table).
- **Server-side enforcement lives in API routes / server actions, not client components.** The business rules in `PRD.md` §10 (capacity, cutoff, excluded areas, stock, payment verification) are checked server-side before any state changes — a client component may reflect these states but never be the source of truth for them (see `SECURITY.md`).
- **File/folder structure:** customer routes and admin routes are separate route groups in the same Next.js app (e.g. `app/(customer)/...` and `app/(admin)/...`), sharing the same component library from `COMPONENTS.md` rather than duplicating UI.
- **Components map to `COMPONENTS.md` 1:1 where possible** — `MealCard`, `OptionRow`, `SplitPaymentCard`, `Badge`, `Button` (variant prop: `primary`/`ghost`/`disabled`), etc. A new visual pattern should be added to `COMPONENTS.md` before it's built, not after.
- **Tailwind tokens mirror `DESIGN_SYSTEM.md`** — define the color tokens (`bg-primary`, `surface`, `accent-gold`, etc.) in `tailwind.config` rather than using raw hex values inline.
- **Hubtel webhook handling** is a server-only route; verify the client credentials / auth before trusting any payload, and treat `Order.payment_status` as unset until that verification succeeds (see the payment flow in `ARCHITECTURE.md`).
- **Supabase access:** the admin dashboard uses Supabase Auth for the single chef login; customer-facing writes (placing an order) should go through a server action / API route, not direct client-side Supabase calls, so business-rule checks can't be bypassed.
- Linting/formatting (ESLint + Prettier), commit message convention, and branching model are not yet fixed — default to conventional commits and a simple trunk-based flow unless the founder has a preference.
