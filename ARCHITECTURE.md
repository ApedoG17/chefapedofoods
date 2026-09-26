# Chef Apedo Foods — Architecture

## Status

Tech stack is **locked**. This doc captures the data model, system shape, and the locked infrastructure decisions.

## Stack (locked)

| Layer | Decision |
|---|---|
| Frontend framework | Next.js + React + TypeScript |
| Styling | Tailwind CSS |
| Backend / database | Supabase (PostgreSQL, Auth, Edge Functions, Storage) |
| Hosting | Vercel |
| Payments | Paystack (covers MTN MoMo, Telecel, AirtelTigo mobile money, plus card, at ~1.95% per local transaction) |

Customer site and admin interface live in **one Next.js application**, not separate apps:

```
Chef Apedo Foods
├── Customer Website
│   ├── Home
│   ├── Menu
│   ├── Cart
│   ├── Checkout
│   └── Order Status
└── Admin
    ├── Dashboard
    ├── Orders
    ├── Menu
    └── Kitchen
```

**Why this stack:** Next.js handles customer UI, admin UI, and server-side logic (API routes / server actions) in one app, so there's no separate frontend/backend to stand up for an MVP. Supabase gives Postgres + Auth + Edge Functions + Storage on one platform, comfortably inside its free tier for MVP scale. Vercel is the natural deploy target for Next.js. Paystack means **one** payment integration covers MTN MoMo, Telecel, and AirtelTigo, rather than building and maintaining two separate direct mobile-money integrations for a solo-run business.

## System Diagram

```
                    CUSTOMER (phone / browser)
                              │
                              ↓
                    ┌───────────────────┐
                    │      VERCEL       │
                    │    Next.js App    │
                    │  Customer UI      │
                    │  Admin UI         │
                    │  Checkout         │
                    └─────────┬─────────┘
              ┌───────────────┼────────────────┐
              ↓                ↓                ↓
       ┌────────────┐  ┌─────────────┐  ┌──────────────┐
       │  Supabase  │  │  Paystack   │  │   WhatsApp   │
       │ PostgreSQL │  │ MoMo/Card   │  │   Support    │
       │ Auth       │  │ Webhooks    │  │              │
       │ Functions  │  │             │  │              │
       │ Storage    │  │             │  │              │
       └────────────┘  └─────────────┘  └──────────────┘
```

MVP does **not** need a courier/rider-dispatch API — Phase 1 delivery is manual ("API-less"): a rider is requested from a local courier once an order is confirmed. Automated dispatch (Yango/Quik-style) is a Later item.

## Payment Flow (Paystack)

```
Order placed → Order.status = Awaiting Payment
      ↓
Paystack checkout (food amount only)
      ↓
Customer authorizes via MTN / Telecel / AirtelTigo (or card)
      ↓
Paystack webhook fires
      ↓
Server verifies the webhook and payment status
      ↓
Order.payment_status = paid, Order.status = Confirmed
      ↓
Chef dashboard shows the order
```

**Critical rule:** the order is marked `Confirmed` only when the server verifies a successful Paystack webhook — never because the customer merely reached or submitted the payment page. This is the same "server-side, not client-trusted" rule already in `SECURITY.md`, now tied to a concrete implementation.

## Data Model

| Table | Key fields |
|---|---|
| Customer | id, name, phone |
| Address | id, customer_id, address, area, delivery_zone |
| Meal | id, name, description, available |
| MealSize | id, meal_id, size, base_price |
| ProteinOption | id, name, additional_price, available |
| ProteinPackage | id, meal_size_id, name |
| PackageItem | package_id, protein_id, quantity |
| Order | id, customer_id, address_id, delivery_slot, subtotal, delivery_fee, amount_paid, payment_method, payment_status, order_status, paystack_reference, created_at |
| OrderItem | id, order_id, meal_id, size_id, quantity, base_price |
| OrderItemProtein | id, order_item_id, protein_id, quantity, additional_price |
| DeliveryZone | id, name, areas, fee, active |
| KitchenSettings | id, open, daily_capacity, orders_today |

Note the `Meal → MealSize → ProteinPackage → PackageItem` chain — this is what lets Base → Protein → Add-ons customization (and future menu changes) happen without redesigning the schema. `DeliveryZone` is deliberately admin-editable (name, areas covered, fee, active flag) rather than hard-coded — see `PRD.md` for why exact per-zone fees are still open.

## Remaining Open Item

- **Exact delivery-zone fee table.** The software model (zone-based, admin-configurable) is locked; the actual numbers per zone are not — they depend on real dispatch economics not yet established. Do not invent placeholder numbers to "complete" this table; the GH₵10 starting fee and the excluded-area list are the only locked figures.

Everything else previously open (frontend, payment, hosting, daily capacity) is now decided — see `TASKS.md` §0 for the closed-out blocker list.

## System Flow (order lifecycle, end to end)

Customer completes checkout → Paystack payment verified via webhook (see above) → `Order.payment_status = paid`, `order_status = Confirmed` → chef dashboard shows it immediately → chef Accepts → `Preparing` → `Ready for Dispatch` → rider requested manually → `Dispatched` → `Delivered`. Cancellation, if within the allowed window and before `Preparing`, moves the order to `Cancelled` and triggers the Paystack refund path.

Kitchen capacity and hours are enforced **before** checkout is allowed to proceed (same-day cutoff, kitchen open/closed, daily capacity, delivery-area check) — these are gates on the Cart/Checkout screens, not just admin-side settings, and should be enforced server-side too (see `SECURITY.md`).

## Still Undecided

- **Admin auth:** simple single-user login via Supabase Auth is enough for MVP (one chef, no roles/permissions needed yet)
- **Notifications:** how "instant notification to the chef on new order" is implemented (Supabase realtime subscription in the dashboard vs. push/SMS) — realtime-in-dashboard is the natural first choice given the stack, but not yet confirmed
