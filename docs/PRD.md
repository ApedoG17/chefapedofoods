# Chef Apedo Foods — Product Requirements Document

## Vision

A mobile-first, direct-to-customer ordering platform for freshly prepared Ghanaian meals. A customer can discover the brand, browse meals, customize an order, enter a delivery location, pay for the food, and get confirmation — without creating an account. The chef gets enough control to manage incoming orders, kitchen availability, menu availability and fulfilment, running solo at launch.

Positioning: a **direct-to-customer Ghanaian food brand, not a marketplace** — competing on authentic food, simple ordering, transparent delivery, and a personal brand experience, not on restaurant count or logistics infrastructure.

## Users

- **Customer** — primary: people within the delivery radius; secondary: students/young professionals ordering off social media; later: ordering for family, diaspora.
- **Business user (the chef)** — receives orders, manages capacity, manages availability, prepares orders, updates status.

## Menu & Pricing

Three meals at launch: **Jollof Rice, Fried Rice, Plain Rice & Stew**, each in three sizes with an included protein package.

| Size | Price | Included protein (choose one) |
|---|---|---|
| Small | GH₵45 | 2 sausages or 2 eggs |
| Medium | GH₵70 | Chicken+egg or chicken+sausage |
| Large | GH₵90 | Chicken+2 sausages / Chicken+2 eggs / Chicken+sausage+egg / 2 chickens |

Extra protein: Chicken +GH₵15, Sausage +GH₵4, Egg +GH₵4, Fish +GH₵4. Prices should be admin-editable, not hard-coded.

## Delivery

Delivery-only. Covers Accra **except** Kasoa, Teshie, Nungua, Ashaiman, Chorkor, Mamprobi, Abokobi. Fee starts at GH₵10, varies by location, must be shown before payment. Delivery-only excluded-area checkout blocking is a hard requirement.

## Hours & Slots

Ordering: 6:00 AM–5:00 PM. Same-day cutoff: 10:00 AM. First delivery slot: 11:30 AM. Slots must be admin-configurable, not hard-coded.

## Payment

Split model: **food paid in advance** (MTN MoMo / Telecel Cash — direct vs. gateway like Paystack/Hubtel still to decide), **delivery fee paid to the rider on arrival**. The split must always be shown separately, never combined into one "total."

## Policies (verbatim — treat as business logic, not copy)

- **Cancellation:** up to 1 hour before the scheduled slot (e.g. 10:30 AM for an 11:30 AM slot). Late cancellation may mean delayed/partial/no refund. No cancellation once preparation has started.
- **Order acceptance:** confirmed only after successful food payment. May be declined/paused for capacity, unavailability, out-of-area, or operational issues, with refund if already paid.
- **Out of stock:** unavailable items can't be ordered; if something becomes unavailable post-order, contact the customer with an alternative or refund — never charge for what can't be fulfilled.
- **Kitchen capacity:** Open/Closed switch + daily order cap; site auto-stops accepting orders at the cap.

## Order Lifecycle

```
Awaiting Payment → Confirmed → Preparing → Ready for Dispatch → Dispatched → Delivered
                                                                            ↘ Cancelled
```

## MVP Feature Scope

**Customer:** Home, Menu, Meal Customization, Cart, Checkout, Payment, Confirmation, Order Status, How It Works, About, Delivery Info, Contact — guest checkout only, no accounts.
**Kitchen/admin:** Login, Dashboard, Orders, Order Details, Kitchen Controls (open/closed, capacity, availability toggles).
**Explicitly not in MVP:** customer accounts, order history, loyalty, live GPS tracking, rider-dispatch API, analytics dashboard.

## Business Rules

1. Food orders require advance payment before confirmation.
2. Delivery payment is separate, paid to the rider on arrival.
3. Same-day orders close at 10:00 AM.
4. Orders can't be accepted when the kitchen is closed.
5. Orders can't be accepted once daily capacity is reached.
6. Out-of-stock meals/proteins can't be selected for new orders.
7. Delivery can't be selected for excluded locations.
8. Cancellation must occur within the permitted window.
9. Once an order enters active preparation, cancellation may be restricted.
10. If a paid order can't be fulfilled, notify the customer and initiate the refund.

## Core User Stories

**Customer:** browse meals; select size + included protein; add extra protein; see delivery fee before paying; pay via MTN MoMo or Telecel Cash; order without an account; receive confirmation; know the expected delivery time.
**Chef:** see new orders immediately; open/close the kitchen; mark items out of stock; update order status; limit daily capacity.

## MVP Acceptance Criteria — the Golden Path

> Open website → browse menu → choose Jollof → choose Medium → choose Chicken + Egg → add extra protein → enter an Accra delivery address → receive the correct delivery fee → choose the 11:30 AM slot → pay with a supported MoMo method → receive confirmation → chef sees the order → chef updates status → customer sees the updated status.

If this path works reliably end to end, the MVP is functional. See `TESTING.md` for the full scenario list.

## Sitemap

```
CUSTOMER                          ADMIN
├── Home                          ├── Login
├── Menu                          ├── Dashboard
│   ├── Meal Customization        ├── Orders
│   └── Cart                      │   └── Order Details
├── Checkout                      ├── Menu
│   ├── Customer Info             │   └── Availability
│   ├── Delivery Info             └── Kitchen Controls
│   ├── Delivery Slot
│   └── Payment
├── Order Confirmation
├── Order Status
├── How It Works
├── About
├── Delivery Information
└── Contact / WhatsApp
```

Full per-screen content specs live in the planning doc (Phase D, §27) — not duplicated here to avoid drift; pull from there when building each screen.
