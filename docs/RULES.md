# Chef Apedo Foods — Coding Rules & Conventions

Stack is locked (Next.js 14 + TypeScript + Tailwind, Supabase, Vercel, Hubtel + Manual MoMo, Agoo SMS — see `ARCHITECTURE.md`). Conventions below apply across the codebase.

---

## 1. Stack-Agnostic Business Rules

- **Business rules live in one place.** The core business rules in `PRD.md` (payment split, same-day cutoff, capacity, stock, excluded areas, cancellation window, refund-on-failure) must be enforced in shared modules (`config/business.ts` and `lib/delivery/`), not duplicated across UI components.
- **Money is never a float.** Store and calculate all GH₵ amounts as **integers (pesewas)** — never native floating point (`GH₵ 45.00` = `4500` pesewas).
- **Every price-affecting selection is explicit data, not a string.** Meal size, included protein choice, and extra proteins are structured selections tied to the relational schema in `ARCHITECTURE.md`, not free-text or descriptions.
- **Delivery fee and food total are NEVER combined into a single "Total: GH₵X".** Anywhere a price is shown (cart, checkout, payment cards, order confirmation), "Pay Now (Food)" and "Pay Rider (Delivery)" must be visually and textually separated.
- **No secrets in git.** Hubtel client keys, Supabase service-role keys, and Agoo SMS API tokens live strictly in `.env.local` or Vercel environment variables.
- **Naming reads like the business.** Order statuses must strictly match: `'awaiting_payment'`, `'confirmed'`, `'preparing'`, `'ready_for_dispatch'`, `'dispatched'`, `'delivered'`, `'cancelled'`.

---

## 2. Logistics & Rider Portal Conventions (`/rider`)

- **Mandatory Payment Gate for Unpaid Orders:** If an order has `payment_status !== 'paid'` or `payment_method === 'manual'`, the rider MUST NOT be presented with an un-gated "Delivered" button. They must be presented with a prominent yellow "Collect Payment: GH₵X.XX" button that triggers a confirmation modal.
- **Atomic Payment Collection:** Submitting payment collection must call `/api/admin/orders/[id]/payment-collected` to set `payment_collected = true` and `payment_status = 'paid'`, immediately followed by marking `order_status = 'delivered'`.

---

## 3. Messaging & Agoo SMS Gateway Conventions

- **Header Authentication:** The Agoo SMS API requires the key to be passed via the `X-API-Key` header (`X-API-Key: process.env.SMS_API_KEY`), not as a `Bearer` token.
- **CamelCase Payload:** Agoo payload attributes must use camelCase: `{ recipient: formattedPhone, senderId: process.env.SMS_SENDER_ID, message }`.
- **Recipient Sanitation:** Ghanaian phone numbers must be formatted to international format without the leading zero (e.g., `0241234567` ➔ `233241234567`).
- **Concurrent Broadcasts:** The `/v1/sms/send` endpoint delivers to a single recipient. Bulk marketing announcements must map over recipients and fire concurrent requests via `Promise.allSettled`.

---

## 4. Next.js + TypeScript + Tailwind Conventions

- **TypeScript strict mode on.** Zero `any` for order, payment, rider, or menu data. All interfaces mirror `types/database.ts` and Supabase schemas.
- **Server-side validation on API routes:** All critical checks (cutoff time at 10:00 AM GMT, excluded areas, daily order capacity ceiling) must be evaluated server-side before database write operations.
- **No Slug Conflicts in App Router:** Dynamic routes sharing a parent directory must share the exact same parameter name (e.g., use `[id]` consistently across `/api/admin/orders/[id]/...`).
- **Tailwind Tokens Mirror Design System:** Use curated design tokens (`brand-yellow`, `brand-red`, `brand-cream`, `#18110E`, `#141414`) rather than arbitrary inline hex codes or pure `#000000`.
- **Zero Raw Floats in UI:** Format all currency using the centralized `formatGHS(pesewas)` helper from `lib/pricing.ts`.
