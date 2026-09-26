# Chef Apedo Foods — Website Research & Product Planning

*A pre-launch planning document for building Chef Apedo Foods as a small food-ordering product, not just a website.*

**Status:** v2.2 — Phases A–D complete; technical stack locked (Next.js/TS/Tailwind, Supabase, Vercel, Paystack, 12/day capacity — §32); only exact delivery-zone fees remain open (§28) — Phase F (development) starts now

---

## Roadmap

**Phase A** — Market research ✅ **Phase B** — Business definition ✅ **Phase C** — Product requirements ✅ (user stories, business rules, database schema, MVP acceptance criteria — locked below) **Phase D** — UX / Information architecture — complete ✅: flows, sitemap, screen spec, Foundations, low-fi and high-fi UI for all 20 screens (10 core-transaction + 5 marketing + 5 admin), component library locked (§26–31) **Phase E** — UI (brand identity → Figma design → responsive layouts) **Phase F** — Development (frontend → backend → database → payment → order management) **Phase G** — Launch (testing → regulatory readiness → soft launch → iteration)

---

## 1. Product Vision

Chef Apedo Foods is a mobile-first, direct-to-customer ordering platform for freshly prepared Ghanaian meals. A customer can discover the brand, browse meals, customize an order, enter a delivery location, pay for the food, and get confirmation — without creating an account. In parallel, the chef gets enough control to manage incoming orders, kitchen availability, menu availability and fulfilment, running the whole thing solo at launch.

Strategic position: a **direct-to-customer Ghanaian food brand, not a marketplace** — competing on authentic food, simple ordering, transparent delivery and a personal brand experience.

## 2. Users

**Customer** — someone in Accra who wants a Ghanaian meal delivered, and values convenience, clear pricing, simple ordering, reliable delivery information and flexible payment.

- Primary (launch): people within the delivery radius
- Secondary: students, young professionals ordering off social media
- Later: people ordering for family; diaspora customers ordering for relatives in Ghana

**Business user (the chef)** — needs to receive orders, manage capacity, manage meal availability, prepare orders, update order status and monitor daily activity.

## 3. Customer Problems

- Wants real Ghanaian food (jollof, fried rice, rice & stew) without cooking it themselves
- Doesn't automatically trust a new online food seller
- Wants to order quickly on a phone and pay the way they normally do (MoMo)
- Wants delivery cost and timing known before committing
- **The WhatsApp trap:** manual, slow, error-prone ordering by text

## 4. Competitor Research

| Business | What it does |
| --- | --- |
| ChekChek | Customizable add-ons/quantities, delivery fee/ETA in cart, MoMo/cash, order tracking, loyalty points, currently advertises zero commission for vendors |
| Pomaa Go | Location-based discovery, ordering, payment, tracking; Volta and Greater Accra |
| CZIN | Made-to-order meals, portion/option selection, Paystack checkout, location-based delivery fees |
| Red Chilli | Authentic Ghanaian home cooking; pickup, delivery, catering |
| Waakye Supreme | Fully customizable bowl — base, proteins, wele, eggs, sauces |
| Chilli Ji | Publishes delivery fees by area, rising with distance |
| African Delight | Delivers within Accra, fee by distance |
| Hausa Cuisine | Authentic recipes, freshness, affordability, reliable service |
| Bolt Food (marketplace) | Reach + logistics + merchant analytics, but requires merchants to meet local legal/regulatory requirements and have suitable premises |

**Key takeaway:** customization (Size → Included Protein → Extra Protein) is the emerging UX pattern (ChekChek, Waakye Supreme); marketplace fees vary by provider rather than following one fixed industry rate.

## 5. Launch Menu & Pricing

Three meals at launch: **Jollof Rice**, **Fried Rice**, **Plain Rice & Stew** — each in three sizes with an included protein package.

| Size | Base Price | Included protein (choose one) |
| --- | --- | --- |
| Small | GH₵45 | 2 sausages **or** 2 eggs |
| Medium | GH₵70 | Chicken + egg **or** chicken + sausage |
| Large | GH₵90 | Chicken + 2 sausages **or** chicken + 2 eggs **or** chicken + sausage + egg **or** 2 chickens |

**Extra protein** beyond the included package: Chicken +GH₵15, Sausage +GH₵4, Egg +GH₵4, Fish +GH₵4. Prices should eventually be admin-editable without a code change.

**Example:** Jollof Rice, Large (GH₵90), included Chicken + Egg + Sausage, extra chicken (+GH₵15) → food total **GH₵105**, delivery fee shown separately.

## 6. Delivery Coverage & Fees

Delivery-only. Covers Accra **except**: Kasoa, Teshie, Nungua, Ashaiman, Chorkor, Mamprobi, Abokobi. Checkout must be blocked when the destination falls outside the service area — copy along the lines of *"We deliver across Accra. Some locations are currently unavailable."*

Delivery fee **starts at GH₵10**, final amount depends on location, and must be shown to the customer **before payment**.

## 7. Ordering Hours & Delivery Slots

- Ordering window: **6:00 AM – 5:00 PM**
- Same-day order cutoff: **10:00 AM**
- First delivery slot: **11:30 AM**
- Delivery slots should be admin-configurable rather than hard-coded (e.g. 11:30, 12:30, 1:30, 2:30, each with its own capacity/status).

## 8. Payment Model

Food and delivery are paid differently — the split must be impossible to miss at checkout:

- **Food** — paid in advance, via **MTN MoMo** or **Telecel Cash**, to secure the order
- **Delivery** — paid to the rider on arrival

```
Food: GH₵70          Delivery: GH₵20
Pay now: GH₵70        Pay rider on delivery: GH₵20
```

Whether MoMo is integrated directly or via a gateway (Paystack \~1.95% local rate, or Hubtel) is still an implementation decision to compare.

## 9. Cancellation, Acceptance & Stock Policies

> **Cancellation:** Customers may cancel a confirmed order no later than one hour before the scheduled delivery time (for the 11:30 AM slot, by 10:30 AM). Eligible cancellations are refunded as soon as reasonably possible; late cancellations may see a delayed, partial, or no refund depending on preparation status. Once preparation has started, cancellation may no longer be possible.
> 
> **Order acceptance:** An order is confirmed only after successful food payment. Chef Apedo Foods may decline or pause new orders at daily capacity, on item unavailability, outside the service area, or during an operational issue — with notification and refund if payment was already taken.
> 
> **Out of stock:** A meal/protein may be marked unavailable when stock runs out or it can't be prepared for the selected slot. Unavailable options can't be added to new orders; if something becomes unavailable after ordering, the customer is contacted with an alternative or refund, and is never charged for what can't be fulfilled.

**Daily timeline:** 6:00 AM ordering opens → 10:00 AM same-day cutoff → 10:30 AM cancellation deadline for the 11:30 AM slot → 11:30 AM first delivery.

## 10. Kitchen Capacity

- **Kitchen: Open / Closed** master switch
- **Daily order capacity** (e.g. 15) — once reached, the site shows *"Today's orders are full"* and stops accepting new orders automatically; adjustable as efficiency improves

## 11. Order Status Lifecycle

```
Awaiting Payment → Confirmed → Preparing → Ready for Dispatch → Dispatched → Delivered
                                                                            ↘ Cancelled
```

Reflected in both the customer's order view and the kitchen dashboard.

## 12. Customer Journey (MVP)

Social media/WhatsApp → website → browse menu → select meal → select size → select included protein → add extra protein if wanted → add to cart → enter delivery location → system checks service area → delivery fee shown → choose delivery slot → review order (food total, delivery fee, pay-now vs. pay-on-delivery split) → pay via MoMo → order confirmed → chef prepares → rider collects → customer pays delivery fee to rider → delivered.

## 13. MVP Feature Breakdown

**Home** — brand story/value prop, access to menu, start-order CTA, delivery info, WhatsApp contact.

**Menu** — view meals and prices, select size, see included protein combinations, add optional extra proteins, add to cart.

**Cart** — view selected meals, change quantities, edit options, remove items, see food subtotal, delivery fee, total, and the pay-now vs. pay-on-delivery split.

**Checkout** — collects name, phone, delivery location/address, preferred delivery slot, payment method; validates the location is serviceable.

**Payment** — food portion only, via MTN MoMo or Telecel Cash; delivery fee explicitly marked as paid to the rider.

**Confirmation** — order number, order summary, food amount paid, delivery fee, expected delivery time, order status.

**Kitchen dashboard (business side)** — incoming orders (order number, customer name, phone, items, protein options, delivery location, slot, payment status); actions: Accept, Reject, Mark Preparing, Mark Ready, Mark Dispatched, Mark Delivered, Cancel; Kitchen Open/Closed switch; per-meal/protein Available/Out-of-Stock toggle; daily capacity counter (e.g. "Daily capacity: 15 / Orders received: 15 / Status: FULL").

## 14. WhatsApp Integration

A clear "Chat with us on WhatsApp" option on the homepage and in checkout/help areas — a human-support fallback, not the primary ordering path. The structured website checkout is the system of record.

## 15. Business Rules (consolidated)

1. Food orders require advance payment before confirmation.
2. Delivery payment is separate, paid to the rider on arrival.
3. Same-day orders close at 10:00 AM.
4. Orders cannot be accepted when the kitchen is closed.
5. Orders cannot be accepted once daily capacity is reached.
6. Out-of-stock meals/proteins cannot be selected for new orders.
7. Delivery cannot be selected for excluded locations.
8. Cancellation must occur within the permitted cancellation window.
9. Once an order has entered active preparation, cancellation may be restricted.
10. If a paid order can't be fulfilled, the customer must be notified and the applicable refund initiated.

## 16. Core User Stories

**Customer**

- Browse available Ghanaian meals to choose what to eat
- Select meal size and included protein combination to customize the order
- Add extra protein to get exactly what's wanted
- See the delivery fee before paying, so there are no surprises
- Pay via MTN MoMo or Telecel Cash to secure the order
- Order without creating an account, for fast checkout
- Receive an order confirmation to know the order went through
- Know the expected delivery time

**Chef**

- See new orders immediately to begin preparing them
- Mark the kitchen open or closed to control when customers can order
- Mark items out of stock so customers can't order unavailable food
- Update an order's status so customers know where it stands
- Limit daily order capacity to avoid over-committing

## 17. UX Requirements

- Delivery fee and the food/delivery payment split visible before payment — non-negotiable
- Same-day cutoff and "kitchen closed"/"today's orders full" states impossible to miss
- Mobile-first, guest checkout by default
- Food first on the homepage; founder story supports it, doesn't precede it
- Real food photography only

## 18. Database Schema

| Table | Key fields |
| --- | --- |
| **Customer** | id, name, phone |
| **Address** | id, customer_id, address, area, delivery_zone |
| **Meal** | id, name, description, available |
| **MealSize** | id, meal_id, size, base_price |
| **ProteinOption** | id, name, additional_price, available |
| **ProteinPackage** | id, meal_size_id, name |
| **PackageItem** | package_id, protein_id, quantity |
| **Order** | id, customer_id, address_id, delivery_slot, subtotal, delivery_fee, amount_paid, payment_method, payment_status, order_status, created_at |
| **OrderItem** | id, order_id, meal_id, size_id, quantity, base_price |
| **OrderItemProtein** | id, order_item_id, protein_id, quantity, additional_price |
| **DeliveryZone** | id, name, fee, active |

This structure lets the menu, pricing and delivery zones change later without redesigning the database.

## 19. Kitchen / Admin Dashboard — Phase 1

Covered in detail in §13. Sales charts, revenue reporting and customer analytics remain Phase 2/Later.

## 20. Branding Direction

- Name: **Chef Apedo Foods**; tone warm, personal, homegrown
- Possible taglines: *"Authentic Ghanaian meals, delivered."* / *"Made with care. Delivered with love."*
- Real food photography/video only, clean typography over an invented logo mark for now
- Homepage leads with food and an ordering CTA, founder story second

## 21. Content Requirements

- Founder/brand story (About + launch video), positioned after the food
- Real photos of every menu item, size and protein option
- Delivery coverage, fee explanation, cutoff times, cancellation policy
- Contact: WhatsApp, phone, social handles
- Terms & conditions, privacy policy, food-safety/regulatory info once confirmed (§23)

## 22. Technical Architecture

MVP as a well-built site with a structured order flow, evolving toward: chefapedofoods.com → ordering system → backend API → database → kitchen dashboard → sales analytics → inventory management → delivery management. No courier API needed at launch — manual "API-less" dispatch (request a rider once an order is confirmed) covers Phase 1.

## 23. Regulatory & Business Registration

- **FDA:** "Online Food Business" is a listed operation type; a valid Food Hygiene Permit is required before operating — complete before launch.
- **Tax:** GRA registration required; Modified Taxation Scheme covers food vendors in the informal-sector scope.
- **Business registration:** Business Name / sole proprietorship route via the Registrar of Companies.

## 24. Future Expansion (Phase 2 and later)

**Phase 2:** customer accounts, order history, reorder, saved addresses, reviews, loyalty. **Later:** live GPS tracking, automated rider-dispatch API, advanced analytics, inventory management, delivery-slot auto-optimization, expansion into currently-excluded areas.

## 25. MVP Acceptance Criteria — the Golden Path

The first version isn't ready until a test customer can reliably complete:

> Open website → browse menu → choose Jollof → choose Medium → choose Chicken + Egg → add extra protein → enter Accra delivery address → receive the correct delivery fee → choose the 11:30 AM slot → pay with a supported MoMo method → receive confirmation → chef sees the order → chef updates status → customer sees the updated status.

If that path works reliably end to end, the product is functional.

## 26. UX Flows & Information Architecture (Phase D)

**Customer flow** — social media/WhatsApp → Home → (Menu **or** About/Info) → select meal → select size → select included protein → optionally add extra protein → add to cart → Cart → review order → enter delivery location → serviceability check (if unserviceable: show message + WhatsApp fallback; if serviceable: calculate fee) → select delivery slot → review payment breakdown → choose MTN MoMo or Telecel Cash → make payment → (if it fails: retry/help; if it succeeds: confirm order) → order confirmation → order status (Preparing → Ready → Dispatched) → Delivered → customer pays the rider the delivery fee on arrival.

**Homepage structure** — Hero (Order Now) → Featured Meals (View Menu) → How It Works → Delivery Information → About Chef Apedo Foods → Social Proof/Reviews → a closing Order Now. Deliberately more than one path into the menu/order flow, not a single top-of-page button.

**Menu flow** — each of the three meals (Jollof Rice, Fried Rice, Plain Rice & Stew) follows the same path: choose size → choose protein package → add extras → Add to Cart → Cart.

**Checkout flow** — Cart → customer details → delivery address → delivery-area check → delivery fee → delivery slot → order summary (food amount + delivery fee) → payment breakdown ("Pay Now: GH₵XX" / "Pay Rider: GH₵XX") → choose MoMo/Telecel Cash → pay → confirmation. The customer should never have to guess what's paid now versus paid to the rider later.

**Cancellation flow** — from a confirmed order, the customer selects Cancel; the system checks whether cancellation is still allowed (current time vs. cancellation deadline, and whether the order has already entered preparation). If allowed: confirm cancellation → order cancelled → refund process → customer notified. If not allowed: show the cancellation policy/explanation instead.

**Chef/admin flow** — Admin login → Dashboard, split into three areas: Orders (view → select → Accept/Reject → Preparing → Ready → Dispatched → Delivered), Kitchen Status (Open/Closed), and Menu Status (Available/Out of Stock). The dashboard should surface a same-day snapshot at a glance — orders today, pending/preparing/ready/dispatched counts, kitchen open/closed, and capacity used (e.g. "8/15") — with no analytics layer yet.

**Complete system flow** — the customer's path (Website → Menu → Customize → Cart → Checkout → Payment → Confirmation → Order Status → Delivery → pay rider on arrival) and the chef's path (Dashboard → Orders → Accept/Reject → Preparing → Ready → Dispatched → Delivered) are two views of the same order moving through the lifecycle in §11 — the dashboard and the customer's order-status screen should always agree.

**Navigation decision:** the customer doesn't need a standalone "Order" page — ordering is the action that runs through Home → Menu → Cart → Checkout → Confirmation, not a destination in the nav. Primary navigation: **Home | Menu | How It Works | About | Contact**, with a persistent 🛒 Cart and a prominent **Order Now** button, rather than adding a separate "Order" nav item.

## 27. Sitemap & Screen Specification

**Customer sitemap**

```
CHEF APEDO FOODS
├── Home
├── Menu
│   ├── Meal Details / Customization
│   └── Cart
├── Checkout
│   ├── Customer Details
│   ├── Delivery Details
│   ├── Delivery Slot
│   └── Payment
├── Order Confirmation
├── Order Status
├── How It Works
├── About
├── Delivery Information
└── Contact / WhatsApp
```

**Admin sitemap**

```
ADMIN
├── Login
├── Dashboard
├── Orders
│   └── Order Details
├── Menu
│   └── Availability
└── Kitchen Controls
```

**Global navigation** — Desktop: Logo · Home / Menu / How It Works / About / Delivery · persistent 🛒 Cart · **ORDER NOW** button. Mobile: Logo · 🛒 · ☰, with the hamburger menu holding Home, Menu, How It Works, About, Delivery Information, Contact — cart stays reachable at all times.

**Customer screen specs**

| # | Screen | Key content |
| --- | --- | --- |
| 01 | Home | Hero ("Authentic Ghanaian meals, made with care" + Order Now / View Menu) → Featured Meals (3 launch meals, each with image/name/starting price/availability/CTA) → How It Works (Choose → Customize → Pay → Delivered) → Why Chef Apedo Foods (freshly prepared, authentic, convenient, made with care) → Delivery section ("We deliver across Accra" + note on excluded areas + Check Delivery Areas CTA) → closing Order Now |
| 02 | Menu | "Today's Menu" header, optional live status ("🟢 Orders open until 10:00 AM"), meal cards (image, name, "From GH₵X", Customize CTA) for all three meals |
| 03 | Meal Customization | Size selector (radio, price per size) → included-protein choices scoped to the selected size → Add Extra Protein (priced, quantity controls) → Quantity stepper → sticky **ADD TO CART • GH₵\[dynamic total\]** |
| 04 | Cart | Line items with modifiers and per-item price → food subtotal → "Enter Delivery Location" prompt → once entered: subtotal, delivery fee, then a clearly separated **Pay Now** vs **Pay Rider on Arrival** split |
| 05 | Checkout — Step 1: Details | Full name, phone number |
| 05 | Checkout — Step 2: Delivery | Delivery area (select), address, additional directions; shows delivery fee once area is chosen; shows "❌ We currently don't deliver to this area — choose another location or contact us on WhatsApp" for excluded areas |
| 06 | Delivery Slot | List of slots (e.g. 11:30 AM, 12:30 PM, 1:30 PM) marked Available/Full; if past the same-day cutoff, shows "Same-day orders closed" and offers the next available ordering date instead of letting checkout continue |
| 07 | Payment | Header reinforcing "food is paid in advance to secure your order" → payment method choice (MTN MoMo / Telecel Cash) → breakdown (food subtotal, delivery fee, **Pay now** vs **Pay rider on delivery**) → CTA **PAY GH₵\[food total\]** |
| 08 | Order Confirmation | "✅ Order Confirmed", order number, order summary, delivery slot + location, payment breakdown (paid vs. due to rider), Track Order CTA, WhatsApp CTA |
| 09 | Order Status | Horizontal/vertical progress tracker through Confirmed → Preparing → Ready for Dispatch → Dispatched → Delivered, estimated delivery window, WhatsApp help link. No live map for MVP |
| 10 | How It Works | 6 numbered steps: choose meal → customize → pay for food → we prepare it → delivered → pay the rider |
| 11 | About | Founder story, why the business started, what Chef Apedo Foods means, "Our promise" (freshly prepared, authentic, careful, reliable). Kept secondary to the food, per the earlier UX rule |
| 12 | Delivery Information | Coverage statement, excluded-area list, delivery fee ("starting from GH₵10, depending on location"), the pay-rider-on-arrival rule, ordering hours, same-day cutoff, first delivery slot, cancellation info |
| 13 | Contact | WhatsApp, phone, Instagram, TikTok, plus a direct "Chat on WhatsApp" CTA |

**Admin screen specs**

| # | Screen | Key content |
| --- | --- | --- |
| A1 | Login | Email/phone + password. No customer accounts exist in the MVP — this login is for the chef only |
| A2 | Dashboard | Today's snapshot (orders, pending, preparing, ready, dispatched counts), Kitchen Open/Closed indicator, capacity used (e.g. "12/15"), list of incoming orders |
| A3 | Orders | Order rows (ID, customer name, meal + size + protein, slot, payment status, View action); filters by All / Pending / Preparing / Ready / Dispatched / Delivered / Cancelled |
| A4 | Order Details | Full customer, delivery, food, payment and status info; action buttons that change based on current status (Accept/Reject → Start Preparing → Mark Ready → Dispatch → Delivered) rather than showing every action at once |
| A5 | Kitchen Controls | Kitchen Open/Closed toggle, daily capacity setting + orders-today/remaining counters, per-meal and per-protein Available/Out-of-Stock toggles |

**MVP screen priority**

*Customer — all Essential:* Home, Menu, Meal Customization, Cart, Checkout, Payment, Confirmation, Order Status. *Important (supporting):* How It Works, About, Delivery Info, Contact. *Admin — all Essential:* Login, Dashboard, Orders, Order Details, Kitchen Controls.

**UX decision — continuous flow:** the ordering path (Menu → Customize → Cart → Checkout → Payment → Confirmation) should feel like one continuous flow, not disconnected pages — a progress indicator (e.g. "1. Cart → 2. Details → 3. Delivery → 4. Payment") gives the customer a sense of place without adding complexity.

**Build order:** design the core transaction first — **Meal Customization → Cart → Checkout → Payment → Confirmation → Order Status** — since that's the actual product. Marketing pages (Home, How It Works, About, Delivery, Contact) get designed around that once the transaction works. Admin comes last.

**Figma frame plan**

```
CHEF APEDO FOODS
├── 01. Foundations
├── 02. Customer Flow
│   ├── Menu · Customization · Cart · Checkout · Payment · Confirmation · Order Status
├── 03. Marketing Pages
│   ├── Home · How It Works · About · Delivery · Contact
└── 04. Admin
    ├── Login · Dashboard · Orders · Order Details · Kitchen Controls
```

**Design process for Phase D → E:** Foundations (visual direction — color, type, components) → low-fidelity structure wireframes → test the ordering flow → mobile-first (acquisition is TikTok/Instagram/WhatsApp; desktop comes after) → high-fidelity UI (brand colors, typography, buttons, cards, food imagery, responsive desktop) → click-prototype and test before any code is written.

**Prototype test scenarios** (these expose whether the flow actually works, before coding):

- Medium jollof with chicken and egg
- Large fried rice with two chickens
- Delivery to an excluded location
- Ordering after the 10 AM same-day cutoff
- Kitchen closed
- A protein out of stock
- Cancelling an order

## 28. Still Open

- **Exact delivery fee by zone** — the only genuinely unresolved blocker. The GH₵10 starting point and the excluded-area list are locked; the software model (admin-configurable delivery zones) is built specifically to hold real numbers once dispatch economics are known — see §32.
- Who physically handles delivery day to day (manual rider request per order for now)
- What causes abandoned orders / what makes customers reorder — worth real research once live

Resolved: frontend stack, payment integration, hosting/backend, and launch daily capacity — see §32.

---

## 29. Foundations — Visual Direction (locked)

**Direction:** rich & premium — dark, warm background with a gold/amber accent, real food photography doing the color work, an elegant/bold display headline over a clean sans body. Drawn from real references (a luxury ice cream site, a moody single-origin coffee site, a bold coffee brand, and a dark glassmorphism UI pattern) rather than chosen blind.

- **Color:** near-black warm brown background (`#17110D`), dark surface cards (`#241A13`), gold accent (`#C9A24C`) for CTAs/prices/active states, cream secondary sections (`#F6EFE4`) for About/Delivery Info-style pages — palette stays narrow so food photography supplies most of the color.
- **Typography:** distinctive serif/display font for headlines, clean sans for body/UI/nav — matches the confirmed pairing decision.
- **Components:** pill-shaped gold CTAs on dark backgrounds, dark cards with subtle borders, a frosted-glass treatment reserved for overlay moments (delivery-slot picker, payment sheet) rather than the whole UI.
- **Imagery:** real food photography, shot warm and close, ideally against a dark backdrop for consistency with the palette.
- **Motion (later, not MVP-blocking):** soft transitions between checkout steps, gold glow on CTA interaction, glass-reveal on the payment/slot overlay.

Full token table and component notes live in `DESIGN_SYSTEM.md` in the project docs set (§30).

## 30. Project Docs Set (for development / AI-assisted coding)

Before Phase F (development) starts, a `docs/` folder was created to carry this planning work into the actual repo, so a developer or an AI coding agent (e.g. Claude Code) has full context without re-reading this entire document:

`README.md` · `PRD.md` · `ARCHITECTURE.md` · `DESIGN_SYSTEM.md` · `COMPONENTS.md` · `RULES.md` · `TASKS.md` · `SECURITY.md` · `TESTING.md` · `MEMORY.md` (fast-context summary) · `AGENTS.md` (AI agent operating instructions)

This document remains the canonical business record; the docs set is the distilled, dev-facing version of it and should be kept in sync if anything here changes.

## 31. Component Library (locked)

Extracted from the high-fidelity core-transaction build: Top Nav, Screen Header block, Checkout Stepper, Sticky CTA, Meal Card (available/out-of-stock states), Option Row + Radio (reused across size/protein/slot/payment-method pickers), Extra-Protein Stepper Row, generic Card, Form Field, Button (primary/ghost/disabled/sm), Badge (ok/warn), Split Payment Card (gold-bordered, used everywhere the pay-now/pay-rider split appears), Banner, Warning Box, Order Status Steps, Confirmation Checkmark.

Full spec with anatomy and states lives in `COMPONENTS.md`. Explicitly flagged as **not yet designed**: empty-cart state, multi-item cart layout, icon set, and the admin-side adaptation of these components.

## 32. Technical Stack (locked)

| Layer | Decision |
| --- | --- |
| Frontend | Next.js + React + TypeScript + Tailwind CSS — customer site and admin interface in **one** application |
| Backend / database | Supabase — PostgreSQL, Auth, Edge Functions, Storage |
| Hosting | Vercel |
| Payments | Paystack — one integration covering MTN MoMo, Telecel, and AirtelTigo mobile money plus card, at \~1.95% per local transaction, rather than building separate direct MTN/Telecel integrations |
| Daily capacity | **12 orders/day** at launch — a starting operational ceiling, not permanent; configurable, expected to rise with experience |

**Payment flow:** order placed → `Awaiting Payment` → Paystack checkout (food amount only) → customer authorizes via MoMo/card → Paystack webhook fires → **server verifies the webhook** → `Order.payment_status = paid`, `order_status = Confirmed` → chef dashboard shows it. The order is never marked `Confirmed` just because the customer reached the payment page — verification is server-side, matching the existing security rules.

**Why this stack:** Next.js covers customer UI, admin UI, and server-side logic in one app — no separate frontend/backend to stand up for an MVP. Supabase's free tier comfortably covers MVP scale. Vercel is the natural Next.js deploy target. Paystack means one integration instead of two separate direct mobile-money integrations for a solo-run business — reassess direct MTN/Telecel integration later if volume or economics justify it.

Full system diagram and data model live in `ARCHITECTURE.md` (updated to match). `RULES.md` now has Next.js/Tailwind/Supabase-specific conventions instead of a placeholder.

---

### Next steps — Phase F: repository, schema, core transaction

Design (Phase D) and the technical stack (§32) are both closed. Only one blocker remains: **exact delivery-zone fees** (§28) — not needed to start building, since the `DeliveryZone` table is admin-configurable by design. Phase F starts now:

1. Scaffold the Next.js + TypeScript + Tailwind repo (customer + admin routes in one app) and connect Supabase + Paystack (test keys)
2. Implement the database schema from `ARCHITECTURE.md`/§32, seed the launch menu and delivery zones
3. Build the core transaction first, per `TASKS.md` — Meal Customization → Cart → Checkout → Payment → Confirmation → Order Status — then kitchen/admin, then marketing pages
4. Run the golden path and all 7 edge-case scenarios (`TESTING.md`) against the real build
5. Regulatory track (FDA, GRA, business registration) runs in parallel, per `TASKS.md` §6
6. Regulatory track (`TASKS.md` §6 — FDA, GRA, business registration) can run in parallel, it doesn't block development starting