# Chef Apedo Foods — Test Plan

## The Golden Path (must pass before anything is considered "done")

> Open website → browse menu → choose Jollof → choose Medium → choose Chicken + Egg → add extra protein → enter an Accra delivery address → receive the correct delivery fee → choose the 11:30 AM slot → pay with a supported MoMo method → receive confirmation → chef sees the order → chef updates status → customer sees the updated status.

## Edge-case scenarios (each should produce the correct, specified behavior — not just "not crash")

1. **Medium jollof with chicken and egg** — correct included-protein pricing, no double-charge for the included combo.
2. **Large fried rice with two chickens** — correct large-size included combo + correct extra-protein pricing if additional chicken is added on top.
3. **Delivery to an excluded location** (Kasoa, Teshie, Nungua, Ashaiman, Chorkor, Mamprobi, or Abokobi) — checkout blocked, message shown, WhatsApp fallback offered.
4. **Ordering after the 10:00 AM same-day cutoff** — same-day slot options hidden/disabled, next available ordering period offered instead — customer must not be able to proceed as if it were still same-day.
5. **Kitchen closed** — cart/checkout disabled site-wide with a clear "Kitchen currently closed" message.
6. **A protein marked out of stock** — that protein option is unselectable in Meal Customization; if it goes out of stock after an order was placed, the order-details/contact flow in `PRD.md` policy applies (alternative or refund, never silently substituted).
7. **Cancelling an order** — allowed and successful when within the window and before `Preparing`; blocked with the policy explanation otherwise (test both a cancel-before-deadline and a cancel-after-deadline case).

## Additional checks worth adding once the core flow works

- Daily capacity reached mid-day — site automatically stops accepting new orders and shows "Today's orders are full."
- Payment failure during checkout — customer can retry or gets a clear help path (WhatsApp), order is not left in a "Confirmed" state without successful payment.
- Delivery fee shown before payment in every case — no path through checkout should reach the payment screen without the customer having seen the fee.
- Pay-now vs. pay-rider amounts are never combined into a single "Total" anywhere in the UI (cart, checkout, payment, confirmation, order status).

## Out of scope for MVP testing

Live GPS tracking, loyalty/rewards, customer accounts/order history, automated rider-dispatch — not built in MVP, so not tested yet.
