# Chef Apedo Foods — Product Requirements Document (PRD)

## 1. Vision & Market Positioning

A mobile-first, direct-to-customer ordering and logistics platform for freshly prepared Ghanaian meals, built specifically for the University of Ghana, Legon campus and central Accra. 

Students and campus professionals can discover the brand, browse handcrafted midday staples, customize portions and protein pairings, pin their exact hostel/hall location, and complete checkout without creating an account. The cloud kitchen operates with an auto-updating Kitchen Display System (KDS), an integrated Rider Dispatch Portal, and automated transactional SMS notifications.

**Positioning:** A vertically integrated direct-to-consumer culinary brand, not a marketplace — competing on authentic small-batch food quality, transparent campus delivery rates, and a seamless mobile experience.

---

## 2. Target Users

- **Students & Campus Residents (Primary):** University of Ghana students living in on-campus and private hostels (Evandy, Pentagon, Bani, TF, traditional halls) requiring affordable, high-protein midday meals.
- **Campus Faculty & Accra Professionals (Secondary):** Faculty staff and office workers in East Legon, Airport Residential, and central Accra ordering hot lunches.
- **Head Chef / Kitchen Manager:** Solo culinary operator managing real-time orders, ingredient stock, daily capacity limits, and courier dispatch.
- **Dispatch Couriers (Riders):** Delivery personnel viewing their active assigned orders with 1-tap Google Maps directions and payment collection verification.

---

## 3. Menu, Sizes & Pricing (Locked Business Architecture)

Three handcrafted staples prepared fresh each morning in small batches: **Jollof Rice, Fried Rice, and Plain Rice & Stew**.

| Size Tier | Base Price | Included Protein Package (Choose 1) |
|:---|:---:|:---|
| **Small** | **GH₵ 45.00** | 2 Sausages OR 2 Eggs |
| **Medium** | **GH₵ 70.00** | Chicken + Egg OR Chicken + Sausage |
| **Large** | **GH₵ 90.00** | Chicken + 2 Sausages OR Chicken + 2 Eggs OR Chicken + Sausage + Egg OR 2 Chickens |

### Extra Protein Portions:
- **Fried Chicken Portion:** +GH₵ 15.00 (`1500` pesewas)
- **Extra Sausage:** +GH₵ 4.00 (`400` pesewas)
- **Hard-Boiled Egg:** +GH₵ 4.00 (`400` pesewas)
- **Fried Fish Steak:** +GH₵ 4.00 (`400` pesewas)

*Note: All prices are strictly stored and computed as integer pesewas.*

---

## 4. Delivery Logistics & Geospatial Distance Engine

Delivery-only service. Meals are cooked to order and dispatched hot in insulated bags. Delivery fees are computed dynamically via great-circle distance (Haversine formula) from our central South Legon Drive 6a kitchen hub (`lat: 5.6265, lng: -0.1706`):

| Distance Band | Fee (Pesewas) | Display Amount | Transit Guarantee |
|:---|:---:|:---:|:---:|
| **Central Campus & South Legon (0 – 3.0 km)** | `700` | **GH₵ 7.00** | 10 – 20 mins |
| **Extended Campus / East Legon / Shiashie (3.1 – 5.0 km)** | `900 – 1100` | **GH₵ 9.00 – 11.00** | 20 – 30 mins |
| **Airport / Dzorwulu (5.1 – 8.0 km)** | `1100 – 1700` | **GH₵ 11.00 – 17.00** | 25 – 35 mins |
| **Central Accra / Cantonments / Osu (8.1 – 12.0 km)** | `1700 – 2500` | **GH₵ 17.00 – 25.00** | 30 – 45 mins |
| **Outer Perimeter (12.1 – 15.0 km)** | `2500 – 3100` | **GH₵ 25.00 – 31.00** | 40 – 55 mins |

- **Pricing Formula:** GH₵ 7.00 (`700 pesewas`) base for first 3.0 km, plus GH₵ 2.00 (`200 pesewas`) per additional km (`Math.ceil(distance - 3.0)`).
- **Service Radius Limit:** Locations exceeding 15.0 km are strictly blocked at checkout to guarantee food arrives steaming hot.
- **Dynamic Timing:** Dual-mode ETA scheduling (Live dynamic ASAP window based on 20 min prep + transit time, and 30-min scheduled window picker with real-time Time Guard).

---

## 5. Operating Hours & Schedule

- **Daily Ordering Window:** 06:00 AM – 05:00 PM GMT.
- **Same-Day Order Cutoff:** **10:00 AM GMT**. Orders placed after 10:00 AM schedule automatically for next-day dispatch.
- **Delivery Time Slots:** 11:30 AM, 12:30 PM, 01:30 PM, 02:30 PM.
- **Cancellation Deadline:** Strictly up to 1 hour before the scheduled delivery slot (e.g., 10:30 AM for an 11:30 AM slot). No cancellations once kitchen status moves to `Preparing`.
- **Daily Capacity:** Initial ceiling of 12 orders/day, dynamically adjustable in the KDS.

---

## 6. Payment Architecture (Dual-Lane Split)

1. **Food Prepayment:** Paid in advance online via Hubtel (MTN MoMo, Telecel Cash, ATMoney, Debit/Credit Card) OR committed via Manual MoMo transfer to the merchant line.
2. **Courier Delivery Fee:** Paid directly to the dispatch rider upon physical arrival (cash or direct MoMo).
3. **Product Requirement:** The food total and courier fee are **never summed into a single "Total: GH₵X" charge**.
4. **Rider Payment Gate:** Couriers must tap "Collect Payment: GH₵X.XX" and verify receipt before the order can be marked `Delivered`.

---

## 7. Order Lifecycle State Machine

```
Awaiting Payment ➔ Confirmed ➔ Preparing ➔ Ready for Dispatch ➔ Dispatched ➔ Delivered
                                                                   ↘ Cancelled
```

- **SMS on Dispatch:** Fires automated Agoo SMS to customer with live GPS tracking link (`/order/[id]`).
- **SMS on Delivery:** Fires automated Agoo SMS with individualized feedback link (`/feedback/[orderId]`).

---

## 8. Complete System Sitemap

```
CUSTOMER STOREFRONT                ADMIN & KITCHEN (KDS)
├── / (Editorial Homepage)         ├── /admin/login (Supabase Auth)
├── /menu (Full-Bleed Menu)        ├── /admin (Realtime Order Queue)
│   └── /menu/[mealId] (Customizer)├── /admin/menu (Stock & Availability)
├── /cart (Order Review)           ├── /admin/finance (Reconciliation Ledger)
├── /checkout (3-Step Pipeline)    └── /admin/marketing (Mass SMS Blasts)
├── /order/[orderId] (Live Track)
├── /feedback/[orderId] (Review)   COURIER LOGISTICS
├── /delivery (Zone Guide)         └── /rider (Mobile Rider Dispatch Portal)
├── /about (Brand Story)
└── /contact (WhatsApp Support)
```

---

## 9. Core Business Rules

1. Food orders require advance payment or manual commitment before kitchen preparation begins.
2. Delivery payment is strictly separate and paid directly to the courier upon arrival.
3. Same-day orders close strictly at 10:00 AM GMT.
4. Orders are blocked when the kitchen master switch is toggled Closed.
5. Orders are blocked once the daily order capacity ceiling is reached.
6. Out-of-stock meals or protein options cannot be added to orders.
7. Delivery is strictly prohibited to the 7 excluded Accra zones.
8. Order cancellations are blocked within 1 hour of the delivery slot or once cooking has started.
9. Manual orders must be verified via the Rider Payment Gate or Finance Ledger before closing.
10. Unfulfillable paid orders automatically trigger full customer refunds.
