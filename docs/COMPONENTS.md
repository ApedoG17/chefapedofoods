# Chef Apedo Foods — Component Library

Extracted from the high-fidelity core-transaction build (Menu → Customize → Cart → Checkout → Payment → Confirmation → Order Status). These are the reusable pieces the rest of the customer UI (and, adapted, the admin side) should be built from — not redesigned per screen.

**Not a component:** the tab bar and the dashed "state" pills (open/cutoff/closed, area toggle, payment-status toggle) that appear in the prototype are testing scaffolding only, used to demo states in one file. They are not part of the real product UI and shouldn't be carried into development.

---

## Layout & Chrome

**Top Nav** — brand wordmark (serif, left) + a cart indicator (gold-outlined pill, right), sticky to the top. Used on every customer screen except Confirmation/Order Status, which drop the nav in favor of focus.

**Screen header block** — eyebrow (small caps, gold, letter-spaced) → heading (serif, 24px) → subtext (dim, 12.5px). Used at the top of Menu, Customize, Cart, Confirmation.

**Checkout Stepper** — inline breadcrumb ("1 Cart · 2 Details · 3 Delivery · 4 Payment"), current step in gold-bold, others dim. Appears on every checkout-sequence screen (Details, Delivery, Slot, Payment) so the customer always knows where they are — this is the "continuous flow, not disconnected pages" decision made back in Phase D.

**Sticky CTA** — the primary action (Add to Cart / Continue / Pay) pinned to the bottom of the screen with a fade-up gradient behind it, so it's always reachable without scrolling. Used on Customize, Cart, Details, Delivery, Slot, Payment.

## Core Components

**Meal Card** — photo block (top, rounded), then name (serif) + availability badge on one line, price in gold below, CTA button beneath. Three states: available (gold "Customize" button), out of stock (badge switches to warn-red, button becomes disabled/ghost, label reads "Unavailable"), and — not yet built — a "selected/in cart" state, needed once Menu shows live cart contents.

**Option Row + Radio** — a row (label left, price or nothing right) with a circular radio indicator; selected state fills the dot gold. Used for size selection, included-protein selection, delivery-slot selection, and payment-method selection. One component, four uses — this consistency is the point of locking it now rather than styling each picker separately.

**Extra-Protein Stepper Row** — name + price on the left, a `− qty +` stepper on the right. Distinct from the radio pattern because extras are additive (0 or more), not a single choice.

**Card (generic container)** — the base surface used to group any related content (form fields, order summary, delivery info). Dark surface, 1px border, rounded corners, consistent padding. A section `lbl` (small caps, gold) sits at the top of a card when it needs a heading.

**Form Field** — single-line input or select, dark surface-2 background, border, rounded. No visual distinction yet between required/optional fields — worth deciding before the Checkout screens are finalized.

**Button** — three variants: **primary** (solid gold fill, used for the one main action per screen), **ghost** (gold outline, transparent fill, used for secondary actions like Edit/Remove/WhatsApp), **disabled** (muted border/text, no interaction — used for out-of-stock or blocked actions). A `sm` modifier shrinks padding/font for inline pairs (Edit/Remove, Try Again/WhatsApp).

**Badge** — small pill, two states: `ok` (green border/text — "Available") and `warn` (red border/text — "Out of stock," "Fully booked," excluded-area warnings). Same component drives Menu availability, Slot booking status, and error states.

**Split Payment Card** — a visually distinct card (gold border, not just a plain card) holding the "Pay now" / "Pay rider on delivery" pair. This is deliberately styled to stand apart from ordinary summary rows — per the repeated business rule, this distinction is UI-enforced, not left to copy alone. Used identically in Cart (once an address is entered), Payment, and Confirmation.

**Banner** — neutral informational strip (kitchen hours, delivery fee confirmation, order status ETA). Not for errors — see Warning Box.

**Warning Box** — red-bordered, red text, used specifically for blocking states: excluded delivery area, payment failure. Should always pair with a way forward (WhatsApp link, alternate action), never a dead end.

**Order Status Steps** — a vertical list of numbered circles connected implicitly by proximity; completed steps get a filled gold circle with a checkmark, current/future steps stay outlined and dim. Same visual language reused from the Payment-processing states (gold = done/success).

**Confirmation Checkmark** — a single large gold circle with a check, serif-adjacent weight, used once at the top of the Confirmation screen as the "this worked" moment.

## What's still undecided

- Icon set (none used yet — badges and text carry all status meaning so far; icons would be additive, not required)
- Empty-cart state (Cart screen currently assumes at least one item)
- Multi-item cart layout (only a single line item has been designed)
- Admin-side adaptation of these components (Kitchen Controls toggles, Order Details status buttons) — likely reuses Button/Card/Badge but hasn't been designed yet
