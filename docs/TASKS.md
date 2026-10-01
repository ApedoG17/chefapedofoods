# Chef Apedo Foods — Build Tasks & Engineering Roadmap

Tracked per the core transaction first philosophy: money movement and operational integrity precede marketing polish.

---

## 0. Pre-build Architecture & Business Decisions (Closed)

- [x] Choose frontend stack/framework — **Next.js 14 (App Router) + TypeScript + Tailwind CSS**
- [x] Choose payment integration — **Hubtel API** (MTN MoMo, Telecel Cash, ATMoney, cards) + **Manual MoMo / Cash on Delivery fallback**
- [x] Choose messaging gateway — **Agoo SMS Gateway** (official Ghanaian SMS provider with high delivery rate)
- [x] Choose hosting/backend — **Vercel (App) + Supabase (PostgreSQL 15, Auth, Edge Functions, Realtime, Storage)**
- [x] Set daily order capacity — **12 orders/day launch ceiling**, dynamically adjustable via KDS
- [x] Set real delivery-zone fees — **Resolved with Legon Campus Delivery Pricing Schedule**:
  - Evandy Hostel: GH₵ 5.00
  - Pentagon Hostel: GH₵ 5.00
  - Main Campus (Balme / Night Market / Halls): GH₵ 7.00
  - East Legon / Shiashie: GH₵ 10.00
  - Airport Residential: GH₵ 12.00
  - Osu / Cantonments: GH₵ 15.00
  - Spintex / Batsonaa: GH₵ 20.00
  - *7 Excluded areas strictly blocked for food heat preservation*
- [x] Codify business rules & currency constraints — **Integer pesewas standard** enforced in `RULES.md` and `config/business.ts`

---

## 1. Repository & Data Layer (Completed)

- [x] Scaffold Next.js + TypeScript + Tailwind application
- [x] Supabase project configuration (Postgres tables, Auth, Service Role policies)
- [x] Migration `0001_initial_schema.sql` (Customers, Addresses, Meals, Sizes, Proteins, Orders, Delivery Zones)
- [x] Migration `0002_kitchen_display_and_tracking.sql` (KDS status enum, kitchen settings, address GPS coords)
- [x] Migration `0003_scaling_features.sql` (Riders table, Promo codes table, Reviews table)
- [x] Migration `0004_marketing_and_promos.sql` (Customer phone index, marketing broadcast support)
- [x] Migration `0005_financial_reconciliation.sql` (`payment_collected` BOOLEAN column & index on `public.orders`)
- [x] Seed launch menu (Jollof Rice, Fried Rice, Plain Rice & Stew across Small GH₵45 / Medium GH₵70 / Large GH₵90)

---

## 2. Core Transaction Flow (Completed)

- [x] **Meal Customization Engine:** Size selection (Small / Medium / Large) ➔ Included protein options scoped strictly to selected size ➔ Extra protein portions (Chicken +15, Sausage +4, Egg +4, Fish +4) ➔ Dynamic price calculation
- [x] **Interactive Cart:** Real-time quantity manipulation, customization review, subtotal calculation, dynamic location-based delivery disclaimer ("Calculated at checkout based on location")
- [x] **Checkout Pipeline:**
  - Guest customer validation (10-digit Ghana mobile number restriction & international dial code picker)
  - Interactive OpenStreetMap (Leaflet) pin-drop & campus landmark entry
  - Dynamic Geospatial Distance Engine (Haversine formula from South Legon Drive 6a kitchen hub at 5.6265, -0.1706; GH₵7 base for first 3km + GH₵2/km; 15km cutoff)
  - Dual-mode delivery timing (ASAP dynamic ETA window based on prep + transit time, and 30-min scheduled window picker with real-time Time Guard)
  - Promo code validation engine with real-time percentage deductions
- [x] **Dual-Payment Split Screen:**
  - Card 1: Food Total prepaid online via Hubtel or selected as Manual MoMo/Cash
  - Card 2: Courier Delivery Fee paid directly to rider upon doorstep arrival
- [x] **Live Order Tracking (`/order/[id]`):**
  - Celebration packing animation with physical box drop
  - Live progress stepper (Order Received ➔ Preparing ➔ Out for Delivery ➔ Delivered)
  - Responsive vertical timeline on mobile (w-0.5) and horizontal on desktop (h-0.5) preventing label overlap
  - Dynamic courier proximity alert with customer delivery address and landmark
  - Direct WhatsApp kitchen chat and live status indicator

---

## 3. Kitchen Display System (KDS) & Admin (/admin) (Completed)

- [x] Single-user secure chef authentication via Supabase Auth
- [x] Live Realtime order queue powered by Supabase WebSocket subscriptions
- [x] Dynamic order status transitions (Awaiting Payment ➔ Preparing ➔ Ready for Dispatch ➔ Dispatched)
- [x] Dispatch courier assignment dropdown
- [x] Kitchen Controls: Open/Closed master toggle, daily order capacity limiter
- [x] Menu Manager (`/admin/menu`): Real-time per-meal availability toggles
- [x] Responsive Admin Mobile Navbar with slide-down drawer for management on smartphones

---

## 4. Logistics & Rider Portal (/rider) (Completed)

- [x] Mobile-optimized courier login via authorized phone number lookup
- [x] Dedicated active delivery feed (couriers only see orders assigned to them)
- [x] 1-Tap Google Maps GPS navigation link to customer dropoff coordinates
- [x] 1-Tap direct phone call integration (`tel:`)
- [x] **Mandatory Payment Gate:** High-visibility "Collect Payment: GH₵X.XX" button and confirmation dialog for manual cash/MoMo orders before order can be finalized
- [x] Server-side `/api/admin/orders/[id]/payment-collected` endpoint marking `payment_collected: true` and `payment_status: paid`

---

## 5. Messaging, Feedback & Financial Reconciliation (Completed)

- [x] **Agoo SMS Gateway Integration:** High-reliability Ghanaian SMS infrastructure (`/v1/sms/send`, `X-API-Key` auth)
- [x] **Automated Dispatch SMS:** Sends live tracking URL directly to customer mobile upon kitchen dispatch
- [x] **Automated Delivery SMS:** Sends thank-you message with feedback link upon courier completion
- [x] **Customer Review Engine (`/feedback/[orderId]`):** 1-5 star rating and qualitative feedback stored in `reviews` table
- [x] **Mass Marketing Broadcast Engine (`/admin/marketing`):** Bulk SMS blast utility pushing promo announcements to past customer database
- [x] **Financial Ledger Dashboard (`/admin/finance`):**
  - KPI Cards: Gross Food Revenue, Hubtel Online MoMo/Cards, Manual MoMo/Cash, Courier Delivery Fees
  - Comprehensive transaction table with channel breakdown and payment status filtering
  - Optimistic "Mark as Received" reconciliation action for kitchen accounting

---

## 6. Marketing & Editorial Experience (Completed)

- [x] Cinematic Splash Screen (`SplashSequence`) with stew bubbling animation & session memory
- [x] 60fps Infinite Marquee Brand Ticker
- [x] Editorial Homepage with 3D floating isolated dish assets
- [x] **Design B Full-Bleed Menu Cards (`MealCard.tsx`):** High-contrast dark gradient overlay, star rating, clean white typography, and quick-add actions
- [x] Delivery Information guide (`/delivery`) with zone pricing and cutoff rules
- [x] About Us story (`/about`) and Contact channels (`/contact`)

---

## 7. Legal Documentation, Compliance, SEO & Production Polish (Completed)

- [x] **Customer Legal Policy Routes:** Built `/legal/privacy` (data collection map & cookie policy), `/legal/terms` (10-minute wait policy & cancellation parameters), and `/legal/refunds` (30-minute missing item claims).
- [x] **Root Legal & Security Documentation:** Created `PRIVACY.md`, `TERMS.md`, and `SECURITY.md` (responsible disclosure protocol, RLS notes, and supported versions).
- [x] **Checkout Consent Micro-Copy:** Embedded explicit Terms & Privacy agreement link directly beneath the primary Confirm Order CTA button in `checkout/page.tsx`.
- [x] **Dynamic Canonical Sitemap:** Implemented `app/sitemap.ts` generating `/sitemap.xml` mapping all campus store and legal pages.
- [x] **OpenGraph & Twitter Card Metadata:** Bulletproof metadata in `app/layout.tsx` coupled with dedicated 16:9 social share card (`public/opengraph-image.png`, `app/opengraph-image.png`).
- [x] **Branded Fallbacks:** Built custom 404 *"Plate Not Found"* screen (`app/not-found.tsx`) and fault-tolerant error boundary (`app/error.tsx`).
- [x] **Empty Tray Handling:** Added zero-order empty tray state in `checkout/page.tsx` with one-tap link back to `/menu`.
- [x] **Console Log Purge:** Removed all lingering `console.log` statements in notifications and admin views for pristine production console output.

---

## 8. Regulatory & Launch Operations (Next Milestone)

- [ ] FDA Food Hygiene Permit — Online Food Business category
- [ ] GRA tax registration (Modified Taxation Scheme for campus food services)
- [ ] Business Name registration via Registrar General's Department

