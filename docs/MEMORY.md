# Chef Apedo Foods — Fast Context (for AI Agents)

Read this first for a 30-second summary; consult `PRD.md`, `ARCHITECTURE.md`, and `DESIGN_SYSTEM.md` for deep specifications.

---

## ⚡ Executive Summary & Mission
- **Brand:** Chef Apedo Foods — premium home-based Ghanaian culinary brand engineered for the University of Ghana, Legon campus and central Accra.
- **Model:** Cloud kitchen direct-to-consumer delivery service. Zero marketplace dependency.
- **Core Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase (PostgreSQL 15, Auth, Realtime) + Vercel + Hubtel API + Agoo SMS Gateway.

---

## 🍲 Menu, Sizes & Pricing (Integer Pesewas Standard)
- **Staples:** Jollof Rice, Fried Rice, Plain Rice & Stew.
- **Portion Tiers:**
  - Small: **GH₵ 45.00** (`4500` pesewas) — Includes 2 Sausages or 2 Eggs.
  - Medium: **GH₵ 70.00** (`7000` pesewas) — Includes Chicken + Egg or Chicken + Sausage.
  - Large: **GH₵ 90.00** (`9000` pesewas) — Includes Chicken + 2 Sausages, Chicken + 2 Eggs, Chicken + Sausage + Egg, or 2 Chickens.
- **Extra Proteins:** Chicken +GH₵15 (`1500`), Sausage +GH₵4 (`400`), Egg +GH₵4 (`400`), Fish +GH₵4 (`400`).

---

## 📍 Dynamic Campus Delivery Zones
- **Hostel Rates:**
  - **Evandy Hostel:** GH₵ 5.00 (`500` pesewas)
  - **Pentagon Hostel:** GH₵ 5.00 (`500` pesewas)
  - **Main Campus (Legon):** GH₵ 7.00 (`700` pesewas)
- **Accra Vicinity Rates:**
  - **East Legon / Shiashie:** GH₵ 10.00 (`1000` pesewas)
  - **Airport Residential:** GH₵ 12.00 (`1200` pesewas)
  - **Osu / Cantonments:** GH₵ 15.00 (`1500` pesewas)
  - **Spintex / Batsonaa:** GH₵ 20.00 (`2000` pesewas)
- **Strictly Excluded Areas (7):** *Kasoa, Teshie, Nungua, Ashaiman, Chorkor, Mamprobi, Abokobi* (enforced server-side to guarantee hot food delivery).

---

## 💳 Dual-Payment Split (Non-Negotiable Rule)
- Food total is prepaid online (Hubtel MoMo/Cards) or committed via Manual MoMo transfer.
- Delivery fee is paid directly to the dispatch courier on arrival.
- **NEVER** combine food total and courier fee into a single "Total: GH₵X" in UI, cart, or copy.
- Online orders only mark `Confirmed` after a verified Hubtel webhook (`responseCode: '0000'`).

---

## ⏰ Ordering Hours & Capacity Limits
- **Ordering Window:** 06:00 AM – 05:00 PM GMT.
- **Same-Day Cutoff:** 10:00 AM GMT (orders after this schedule for next day).
- **Delivery Slots:** 11:30 AM, 12:30 PM, 01:30 PM, 02:30 PM.
- **Cancellation Window:** Up to 1 hour before scheduled slot, provided cooking has not started.
- **Daily Capacity:** Launch ceiling of 12 orders/day, dynamically adjustable in the KDS.

---

## 🚀 Live Implemented Subsystems
1. **Student Storefront (`/`):** Full-bleed Design B meal cards, Leaflet OpenStreetMap pin drop, promo code discount engine, and live order tracking (`/order/[id]`) with celebratory physical unboxing animation.
2. **Kitchen Display System (`/admin`):** Realtime WebSocket queue, order progression, courier assignment, and live capacity toggles.
3. **Rider Logistics Portal (`/rider`):** Secure phone login, 1-tap Google Maps directions, 1-tap customer phone calling, and mandatory "Collect Payment" confirmation gate.
4. **Financial Reconciliation (`/admin/finance`):** Tracks Hubtel online settlements vs. physical rider cash collections using the `payment_collected` database column (Migration 0005).
5. **Agoo SMS Gateway Engine (`lib/notifications.ts`):** Fired on kitchen dispatch with tracking link, and on delivery with feedback link (`/feedback/[orderId]`).
6. **Mass SMS Marketing (`/admin/marketing`):** Blast broadcast tool sending concurrent promo messages to the customer database.
