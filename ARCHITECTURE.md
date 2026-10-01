# Chef Apedo Foods — System Architecture

## Status
Tech stack and architecture are **locked and production-implemented**. This document captures the system shape, data model, payment architecture, messaging pipeline, and logistics workflows.

---

## 1. Technology Stack

| Layer | Technology | Purpose & Implementation Details |
|:---|:---|:---|
| **Frontend Framework** | **Next.js 14+ (App Router)** | Full-stack application unifying customer storefront, real-time KDS, and mobile rider portal. |
| **Language** | **TypeScript 5.0+** | Strict typing across database models, API payloads, and cart calculations. |
| **Styling** | **Tailwind CSS 3.4+** | Mobile-first, responsive dark/light thematic tokens (`#141414`, `#18110E`, `#FFB800`). |
| **Database & Auth** | **Supabase (PostgreSQL 15)** | Row Level Security (RLS), Supabase Auth for staff, and Realtime WebSocket subscriptions. |
| **Hosting & Edge** | **Vercel** | Edge runtime for API routes, automated branch deployments, and asset caching. |
| **Payments** | **Hubtel API + Manual MoMo** | Dual-lane: Hubtel for online mobile money/cards, with manual merchant MoMo/Cash on Delivery. |
| **Messaging** | **Agoo SMS Gateway** | High-throughput Ghanaian transactional SMS (`X-API-Key` auth, single & concurrent broadcast). |
| **Mapping & Location** | **Leaflet / OpenStreetMap + Landmark Fallback** | Dynamic GPS coordinate pin-dropping, campus landmark address resolution, and a 4-second tile-timeout fallback to a categorised `CAMPUS_LANDMARKS` selector (`lib/delivery/landmarks.ts`). |

---

## 2. Global System Topology

```
                              STUDENT / CUSTOMER
                                      │
                         (Phone / Browser / Leaflet GPS)
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │          VERCEL           │
                        │    Next.js Application    │
                        │ ───────────────────────── │
                        │  • Storefront UI          │
                        │  • Realtime KDS UI        │
                        │  • Rider Dispatch Portal  │
                        │  • REST API Route Handlers│
                        └─────────────┬─────────────┘
                ┌─────────────────────┼─────────────────────┐
                ▼                     ▼                     ▼
      ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
      │     SUPABASE     │  │   HUBTEL / MOMO  │  │     AGOO SMS     │
      │ • PostgreSQL 15  │  │ • MoMo (MTN/Tel) │  │ • Dispatch Alerts│
      │ • Row Level Sec  │  │ • Webhook Events │  │ • Tracking Links │
      │ • Realtime WS    │  │ • Card Gateway   │  │ • Review Links   │
      │ • Service Role   │  │                  │  │ • Mass Blasts    │
      └──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 3. Order Lifecycle & State Machine

```mermaid
stateDiagram-v2
    [*] --> AwaitingPayment : Customer places order
    AwaitingPayment --> Confirmed : Hubtel webhook verifies payment OR Manual order recorded
    Confirmed --> Preparing : Kitchen taps "Start Preparing"
    Preparing --> ReadyForDispatch : Kitchen marks meal cooked & packed
    ReadyForDispatch --> Dispatched : Kitchen assigns courier (/api/admin/orders/[id]/assign)
    Dispatched --> Delivered : Rider confirms delivery via /rider
    Delivered --> [*] : Delivery SMS triggers customer review loop

    AwaitingPayment --> Cancelled : Customer cancels within 60min window
    Confirmed --> Cancelled : Customer cancels before "Preparing"
```

### Automated SMS Notification Triggers:
1. **On Dispatch (`dispatched`):** System dispatches an instant Agoo SMS to customer's Ghana phone with a direct link to live GPS tracking (`/order/[id]`).
2. **On Delivery (`delivered`):** System fires a thank-you SMS containing a dedicated review link (`/feedback/[orderId]`).

---

## 4. Payment Architecture (Dual-Lane)

Chef Apedo operates a **dual-lane payment model** where food prepayment is isolated from physical courier fees:

```
Option A: Hubtel Online Prepayment (Instant MoMo / Card)
  Order created → Order.order_status = 'awaiting_payment'
        ↓
  Redirected to Hubtel Hosted Checkout (/api/payments/hubtel)
        ↓
  Student approves MoMo prompt on MTN, Telecel, or ATMoney
        ↓
  Hubtel webhook fires to /api/webhooks/hubtel
        ↓
  Server verifies responseCode === '0000' or status === 'Success'
        ↓
  Order.payment_status = 'paid', Order.order_status = 'confirmed'
        ↓
  KDS displays green "PAID" badge

Option B: Manual MoMo / Cash on Delivery
  Order created via /api/orders/manual
        ↓
  Order.order_status = 'awaiting_payment', Order.payment_status = 'unpaid'
        ↓
  Student sees merchant line number instructions and Cash on Delivery breakdown
        ↓
  Rider or Admin collects funds
        ↓
  Tapping "Mark as Received" or Rider "Collect Payment" sets:
  Order.payment_collected = TRUE & Order.payment_status = 'paid'
```

> [!IMPORTANT]
> **Hard Product Requirement:** "Food Prepayment" and "Courier Delivery Fee" are never summed into a single charge. Customers pay for meals online/direct to secure kitchen prep, and pay couriers upon doorstep delivery.

---

## 5. Logistics & Rider Portal Flow (`/rider`)

```
                  Rider logs in via authorized phone number
                                     │
                                     ▼
                  Rider Dashboard fetches assigned orders
                       (status === 'dispatched')
                                     │
                                     ▼
                ┌─────────────────────────────────────────┐
                │ 1-Tap Google Maps GPS Directions        │
                │ 1-Tap Direct Customer Phone Call (tel:) │
                └────────────────────┬────────────────────┘
                                     │
                                     ▼
                       Courier arrives at hostel
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
            Order Paid Online                Order Manual/Unpaid
                     │                               │
                     │                               ▼
                     │                 Prominent "COLLECT" Button
                     │                               │
                     │                               ▼
                     │                Modal displays exact GH₵ fee
                     │                               │
                     │                               ▼
                     │                Rider confirms physical cash/MoMo
                     │                               │
                     │                 /payment-collected route sets:
                     │                 • payment_collected = TRUE
                     │                 • payment_status = 'paid'
                     │                               │
                     └───────────────┬───────────────┘
                                     │
                                     ▼
                       Rider taps "MARK DELIVERED"
                                     │
                                     ▼
                 Order closed & automated Review SMS sent
```

---

## 5B. Geospatial Distance Logistics Engine & Dynamic Timing (`lib/delivery/`)

```
                         CUSTOMER PIN-DROP (MapPicker / Search)
                                          │
                                          ▼
                      GPS Coordinates Captured (lat, lng)
                                          │
                                          ▼
                  Haversine Great-Circle Distance from Kitchen
                    Anchor Point: South Legon Drive 6a (5.6265, -0.1706)
                                          │
                                          ▼
                   ┌──────────────────────┴──────────────────────┐
                   │                                             │
                   ▼                                             ▼
          distance <= 15.0 km                             distance > 15.0 km
                   │                                             │
                   ▼                                             ▼
        DYNAMIC PRICING FORMULA                          UNSERVICEABLE RADIUS
  Base Tier (0 – 3.0 km): GH₵ 7.00 (700p)             Quality heat guarantee blocks
  Extended: +GH₵ 2.00 (200p) per additional km        checkout with out-of-range alert
                   │
                   ▼
        DUAL-MODE TIMING ENGINE
  Mode 1 (ASAP): Prep (20m) + Transit (d*3m) + Buffer
  Mode 2 (Scheduled): 30-min window with Time Guard (UTC)
```

### Operational Rules:
1. **Kitchen Anchor Point:** `lat: 5.6265, lng: -0.1706` at South Legon Drive 6a (`CHEF_APEDO_KITCHEN`).
2. **Formula:** `feePesewas = 700 + Math.ceil(distanceKm - 3.0) * 200` (for distance > 3.0 km). Under 3.0 km, flat `700` pesewas (GH₵ 7.00).
3. **Hard Ceiling:** Orders beyond 15.0 km are automatically barred from checkout to ensure food arrives steaming hot.
4. **ETA Calculation:** ASAP Mode predicts arrival by dynamically summing 20 minutes kitchen prep + transit time (`Math.max(10, Math.round(distanceKm * 3))` mins) + 5–10 min buffer.
5. **Decoupled Dual-Lane Settlement:** Food total is paid online (Hubtel) or reserved via manual MoMo; the dynamic geospatial delivery fee is paid directly to the dispatch rider upon arrival.

---

## 6. Complete Database Schema (PostgreSQL)

```mermaid
erDiagram
    customers ||--o{ orders : places
    customers ||--o{ addresses : owns
    addresses ||--o{ orders : ships_to
    delivery_zones ||--o{ addresses : maps
    meals ||--o{ meal_sizes : has
    meals ||--o{ order_items : references
    meal_sizes ||--o{ order_items : specifies
    orders ||--o{ order_items : contains
    order_items ||--o{ order_item_proteins : adds
    protein_options ||--o{ order_item_proteins : selects
    riders ||--o{ orders : delivers
    promo_codes ||--o{ orders : discounts
    orders ||--o{ reviews : evaluates
```

### Table Definitions

#### `orders`
- `id` (UUID, Primary Key)
- `customer_id` (UUID, FK -> `customers.id`)
- `address_id` (UUID, FK -> `addresses.id`)
- `delivery_slot` (TEXT, e.g., "11:30 AM")
- `subtotal_pesewas` (BIGINT, integer pesewas)
- `delivery_fee_pesewas` (BIGINT, integer pesewas)
- `amount_paid_pesewas` (BIGINT, integer pesewas)
- `payment_method` (`'hubtel'` | `'manual'`)
- `payment_status` (`'unpaid'` | `'paid'` | `'failed'`)
- `payment_collected` (BOOLEAN, default `FALSE` — Migration 0005)
- `order_status` (`'awaiting_payment'` | `'confirmed'` | `'preparing'` | `'ready_for_dispatch'` | `'dispatched'` | `'delivered'` | `'cancelled'`)
- `rider_id` (UUID, FK -> `riders.id`, nullable)
- `promo_code_id` (UUID, FK -> `promo_codes.id`, nullable)
- `paystack_reference` (TEXT, unique transaction ref)
- `created_at` (TIMESTAMPTZ)

#### `riders`
- `id` (UUID, Primary Key)
- `name` (TEXT)
- `phone` (TEXT, Unique)
- `active` (BOOLEAN, default `TRUE`)
- `created_at` (TIMESTAMPTZ)

#### `promo_codes`
- `id` (UUID, Primary Key)
- `code` (TEXT, Unique, uppercase)
- `discount_percentage` (INT, e.g. 20 for 20% off food)
- `max_uses` (INT)
- `current_uses` (INT, default 0)
- `active` (BOOLEAN, default `TRUE`)

#### `reviews`
- `id` (UUID, Primary Key)
- `order_id` (UUID, FK -> `orders.id`, Unique)
- `customer_name` (TEXT)
- `rating` (INT, 1 to 5)
- `comment` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ)

#### `delivery_zones`
- `id` (UUID, Primary Key)
- `name` (TEXT, e.g. "Evandy Hostel", "Pentagon", "Main Campus")
- `areas` (TEXT[], array of matching string keywords)
- `fee_pesewas` (BIGINT, integer pesewas)
- `active` (BOOLEAN, default `TRUE`)

#### `meals`, `meal_sizes`, `protein_options`, `protein_packages`, `package_items`
Relational catalog architecture ensuring that food bases (Small GH₵45 / Medium GH₵70 / Large GH₵90) are strictly coupled with allowable protein combinations and extra additions without unstructured strings.

---

## 7. Operational & Security Policies

1. **Server-Side Enforcement:** Validation rules (cutoff time at 10:00 AM GMT, excluded delivery zones, max order capacity) are strictly executed on API route handlers before committing writes to PostgreSQL.
2. **Row Level Security:** Public clients cannot arbitrarily query or alter orders belonging to other phone numbers; the admin service-role key is isolated strictly to authenticated API endpoints.
3. **Database Indexing:** Indexed on `orders(payment_collected)` where `payment_collected = FALSE` for instantaneous ledger loading in the finance dashboard.

---

## 8. Legal, Compliance & Metadata Architecture

```
Legal, SEO & Fallback Topology
│
├── 📜 Regulatory Documents (Root & Store Endpoints)
│   ├── PRIVACY.md ➔ /legal/privacy (Data Minimization & Cookie Policy)
│   ├── TERMS.md ➔ /legal/terms (10-minute dropoff timeout & courier hand-off)
│   ├── /legal/refunds (30-minute perishable item claim policy)
│   └── SECURITY.md (Vulnerability reporting to security@chefapedofoods.com)
│
├── 🌐 SEO & Social Unfurling
│   ├── app/sitemap.ts ➔ /sitemap.xml (All canonical campus store & policy routes)
│   ├── app/layout.tsx (Template metadata, canonical alternates, Twitter Card)
│   └── public/opengraph-image.png (1200x675 16:9 preview card)
│
└── 🛡️ Resilient Error Boundaries
    ├── app/not-found.tsx (Plate Not Found branded 404 page)
    └── app/error.tsx (Client-side crash isolation with reset action)
```


---

## 9. Platform Resilience Features

Three hardening features were implemented post-MVP to prepare the platform for high-volume campus traffic:

### 9.1 Operating Hours Guard

- **File:** `lib/operating-hours.ts` - `ASAP_HOURS = { open: "08:00", close: "15:00" }`, `OPERATING_TIMEZONE = "Africa/Accra"`, `getAsapOperatingStatus()` returns server-time status.
- **Endpoint:** `GET /api/operating-hours` (force-dynamic, `no-store` headers) - returns `{ isOpen, currentTimeGMT, message }` using server wall-clock time.
- **Enforcement:** `POST /api/orders` and `POST /api/orders/manual` reject ASAP orders outside 08:00-15:00 GMT with HTTP 409 and `{ error: "ASAP_CLOSED" }`.
- **UX:** Checkout fetches `/api/operating-hours` on mount; shows a friendly amber closed-alert, suggests scheduled slots, and disables Pay button.
- **Scheduling distinction:** Scheduled pre-orders use 06:00-17:00 GMT with same-day cutoff at 10:00 GMT; the ASAP guard does not affect scheduled orders.

### 9.2 Abandoned Payment Expiry & Late Reconciliation

- **Migration:** `supabase/migrations/0006_order_expiry_and_reconciliation.sql` - adds `expires_at TIMESTAMPTZ` and `manual_review_required BOOLEAN DEFAULT FALSE`.
- **Expiration logic:** `lib/orders/expiration.ts` - `checkAndExpireOrder()` checks Hubtel before cancelling.
- **Lazy check:** `GET /api/orders/[id]` triggers `checkAndExpireOrder()` before returning data.
- **Proactive sweep:** Vercel Cron `*/10 * * * *` at `/api/cron/expire-orders`.
- **Late reconciliation:** Late Hubtel webhooks for cancelled orders set `manual_review_required = true`.
- **Order tracker UI:** Cancelled status renders an EXPIRED card with Reorder and WhatsApp CTAs.

### 9.3 Map Tile Network Timeout & Landmark Fallback

- **Landmark data:** `lib/delivery/landmarks.ts` - `CAMPUS_LANDMARKS: CampusLandmark[]` (30+ entries, 6 categories). `filterLandmarks(query, category)` enables instant client-side search.
- **Timeout:** `MapPicker.tsx` starts a 4-second timeout on mount. `TileMonitor` listens for `tileload`/`tileerror` Leaflet events. Timer cleared on tile success and unmount.
- **Fallback UI:** Category filter tabs, instant text search, GPS geolocation button. Selecting a landmark feeds exact lat/lng into `calculateDistanceDeliveryFee()` and `calculateDistanceETA()`.
- **Geolocation errors:** `PERMISSION_DENIED` and `POSITION_UNAVAILABLE` show inline guidance.

