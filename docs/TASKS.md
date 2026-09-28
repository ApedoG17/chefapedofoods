# Chef Apedo Foods — Build Tasks

Ordered per the "core transaction first" decision in the planning doc (§27): don't start with the homepage — start with the screens that actually move money.

## 0. Pre-build decisions (blockers)

- [x] Choose frontend stack/framework — **Next.js + TypeScript + Tailwind CSS**
- [x] Choose payment integration — **Hubtel & Manual MoMo/Cash** (dual-lane payment selection: Hubtel for online payment, plus manual MoMo / cash fallback)
- [x] Choose hosting/backend — **Vercel (app) + Supabase (Postgres, Auth, Edge Functions, Storage)**
- [x] Set the actual daily order capacity to launch with — **12 orders/day**, configurable, expected to increase with experience
- [ ] Set real delivery-zone fees — **still genuinely open**; only the GH₵10 starting point and the excluded-area list are locked. The software model (admin-configurable `DeliveryZone` table) is built to support this once real dispatch economics are known — see `ARCHITECTURE.md`
- [x] Finalize `RULES.md` stack-specific conventions — codified in `lib/business-rules/` and `RULES.md`

## 1. Repository & data layer

- [x] Scaffold the Next.js + TypeScript + Tailwind app (customer UI, admin UI, and API routes/server actions in one app, per `ARCHITECTURE.md`)
- [x] Set up the Supabase project (Postgres, Auth, Edge Functions, Storage) and connect it to the app
- [x] Set up the Paystack integration (test keys first) and the webhook endpoint for payment verification
- [x] Implement the schema from `ARCHITECTURE.md` (Customer, Address, Meal, MealSize, ProteinOption, ProteinPackage, PackageItem, Order, OrderItem, OrderItemProtein, DeliveryZone, KitchenSettings)
- [x] Seed the launch menu (3 meals × 3 sizes × included protein packages × extras, per `PRD.md`)
- [x] Seed delivery zones and the excluded-area list (fee values pending — see §0)

## 2. Core transaction flow (build and test this before anything else)

- [x] Meal Customization screen — size → included protein (scoped correctly per size) → extras → quantity → dynamic price
- [x] Cart — items, modifiers, subtotal, delivery-location entry, serviceability check, fee calculation, pay-now/pay-rider split
- [x] Checkout — customer details, delivery details, delivery-slot selection (respecting same-day cutoff and capacity)
- [x] Payment — MoMo integration, payment breakdown, success/failure handling
- [x] Order Confirmation — order number, summary, split payment display
- [x] Order Status — lifecycle tracker, cancellation flow (deadline + preparation-status checks)

## 3. Kitchen/admin (brought forward, not Phase 3)

- [x] Login (single chef account, email + password via Supabase Auth)
- [x] Dashboard — today's snapshot, kitchen open/closed, capacity used
- [x] Orders — list + filters by status
- [x] Order Details — full order view, status-appropriate action buttons only
- [x] Kitchen Controls — open/closed toggle, daily capacity setting, per-item/protein availability toggle

## 4. Marketing & Editorial Experience

- [x] Home (cinematic hero, statement section, featured meals, delivery coverage map, review testimonials)
- [x] Menu (browse & direct customization entry point, adaptive sticky category dock)
- [x] How It Works
- [x] About
- [x] Delivery Information (interactive coverage map, zone pricing guide, cutoff rules)
- [x] Contact (direct WhatsApp and customer support channels)
- [x] Cinematic Splash Sequence (`components/SplashSequence.tsx` with stew bubbling physics, video b-roll, and session memory)
- [x] Infinite Brand Marquee Ticker (seamless 60fps loop across duplicated tracks)
- [x] 2-Column Balanced Editorial Heroes with 3D Floating Assets (Menu Jollof bowl & Delivery packaging bowl)
- [x] Interactive Fly-to-Cart Trajectory Animation
- [x] 3-Column Global Footer with social brand SVGs & phone integration

## 5. Testing

- [x] Run the golden path end to end (see `TESTING.md` & `tests/integration/golden-path.test.ts`)
- [x] Run all 7 edge-case scenarios (excluded location, post-cutoff order, closed kitchen, out-of-stock protein, cancellation, etc.)

## 6. Regulatory (parallel track, not blocking development)

- [ ] FDA Food Hygiene Permit — Online Food Business category
- [ ] GRA tax registration (Modified Taxation Scheme, informal-sector food vendor scope)
- [ ] Business Name registration via the Registrar of Companies
