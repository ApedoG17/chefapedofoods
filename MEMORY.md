# Chef Apedo Foods — Fast Context (for AI agents)

Read this first for a 30-second summary; go to `PRD.md`/`ARCHITECTURE.md`/`DESIGN_SYSTEM.md` for full detail.

**What it is:** Solo home-based Ghanaian food delivery brand in Accra, cloud-kitchen model, pre-launch. Direct-to-customer, not a marketplace.

**Menu:** Jollof Rice, Fried Rice, Plain Rice & Stew. Sizes Small GH₵45 / Medium GH₵70 / Large GH₵90, each with an included protein package. Extra protein priced separately (Chicken +15, Sausage +4, Egg +4, Fish +4).

**Delivery:** Delivery-only, Accra minus 7 excluded areas (Kasoa, Teshie, Nungua, Ashaiman, Chorkor, Mamprobi, Abokobi). Fee starts GH₵10, varies by zone, always shown before payment.

**Payment split (critical, repeated everywhere for a reason):** food is prepaid online via Hubtel (covers MTN MoMo, Telecel Cash, and Card) or Manual MoMo; delivery fee is paid to the rider on arrival. Never merge these into one number in UI or copy. Order only becomes `Confirmed` after a verified Hubtel webhook — never on the client merely reaching the payment page.

**Hours:** ordering 6 AM–5 PM, same-day cutoff 10 AM, first delivery slot 11:30 AM, cancellation deadline 1 hour before the slot. Daily capacity: **12 orders**, configurable.

**Order lifecycle:** Awaiting Payment → Confirmed → Preparing → Ready for Dispatch → Dispatched → Delivered (or Cancelled). Automatic SMS notification fires on Dispatch.

**MVP has no customer accounts** — guest checkout only. Kitchen/admin dashboard IS in MVP (moved forward from "later" deliberately — solo chef needs it from day one).

**Visual direction & editorial polish:** dark, warm background + gold/amber accent, real food photography, bold display headlines (`font-display`) + clean sans body/UI. High-end motion layer: cinematic splash intro (`SplashSequence`), 60fps infinite marquee ticker, 2-column balanced heroes with floating 3D isolated food/packaging bowls, fly-to-cart physics, and a 3-column global footer with verified social SVGs. See `DESIGN_SYSTEM.md` for tokens and `COMPONENTS.md` for component library details.

**Stack (locked):** Next.js + TypeScript + Tailwind CSS, one app for customer + admin. Supabase (Postgres, Auth, Edge Functions, Storage). Hosted on Vercel. Payments via Hubtel + Manual MoMo fallback. SMS via Arkesel/Hubtel SMS. See `ARCHITECTURE.md` for the full diagram and payment flow.

**Still open:** exact delivery-zone fee table — only the GH₵10 starting point and the excluded-area list are real numbers; the `DeliveryZone` schema is admin-configurable specifically because this is unresolved. Don't invent zone fees.

**Golden path** (the thing that must work): Jollof → Medium → Chicken+Egg → extra chicken → Accra address → correct fee → 11:30 AM slot → MoMo payment → confirmation → chef sees it → status updates → customer sees status updates.
