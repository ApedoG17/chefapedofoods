# Chef Apedo Foods — Design System / Foundations

**Direction:** Rich & premium — dark, warm background with a gold/amber accent, real food photography doing the color work, elegant/bold display headlines over a clean sans body.

**References used:** MELT (luxury ice cream site — dark chocolate hero, gold CTA, elegant serif logo/headline, cream secondary section), NOIR (single-origin coffee site — near-black cinematic hero, large serif headline, gold pill CTAs, small-caps sans label), brewns (coffee brand — dark hero, bold chunky sans headline, handwritten script accent word, clean product shots), and a dark glassmorphism OTP-verification UI pattern (frosted glass cards, gold focus states, dark backdrop).

## Color

| Token | Hex | Use |
|---|---|---|
| `bg-primary` | `#17110D` | Main dark background (hero, checkout, confirmation) |
| `surface` | `#241A13` | Cards, sections, nav bar on dark |
| `surface-glass` | `rgba(36,26,19,0.55)` + blur | Overlay cards (delivery slot picker, payment sheet) — echoes the OTP glass-card reference |
| `accent-gold` | `#C9A24C` | Primary CTA fill, active states, price highlights |
| `accent-gold-soft` | `#E7CE96` | Hover/glow, secondary accents |
| `bg-light` | `#F6EFE4` | Secondary/marketing sections (About, Delivery Info) — cream, not white |
| `ink-on-dark` | `#F6EFE4` | Text on dark surfaces |
| `ink-muted` | `#B7AA98` | Secondary text on dark |
| `ink-on-light` | `#231A12` | Text on cream sections |
| `status-available` | `#5F8F5A` | In-stock / available |
| `status-closed` | `#B4483B` | Out of stock / kitchen closed / excluded area |

Real food photography supplies most of the color in any given screen — the palette stays deliberately narrow so a photo of jollof or fried rice is always the brightest, warmest thing on the page.

## Typography

- **Display / headlines:** an elegant or bold serif (e.g. Fraunces, Playfair Display, or similar) for hero lines and section headers — "Authentic Ghanaian meals, made with care." should read like the NOIR/MELT references, not like a generic app.
- **Body / UI:** a clean, modern sans (e.g. Inter, General Sans, or similar) for nav, buttons, forms, prices, and all functional UI — matches what customers already expect from Bolt Food/ChekChek-style ordering flows.
- **Labels/eyebrows:** small-caps or letter-spaced sans, uppercase, used sparingly above headlines (e.g. "CHEF APEDO FOODS · SINCE 2026") — direct lift from the NOIR pattern.

## Components

- **Buttons:** pill-shaped, gold fill on dark backgrounds (`accent-gold` bg, `ink-on-light` text), outline/ghost variant for secondary actions. This is the MELT/NOIR CTA pattern, not a square corporate button.
- **Cards:** dark `surface` color, subtle 1px border in a slightly lighter tone, generous padding. Overlay/step cards (delivery slot, payment breakdown) use the `surface-glass` frosted treatment for a bit of the OTP reference's polish, without overusing it — this is an accent, not the whole UI.
- **Meal cards:** food photo as the dominant element, name in display type, price in gold, availability as a small status dot (green/red per the status colors above).
- **Status/progress (Order Status screen):** gold fill for completed steps, muted outline for pending — same visual language as the OTP's gold-outlined active state.

## Imagery

Real food photography only (already a locked rule) — shot warm and close, ideally with a dark or dark-chocolate backdrop so it reads consistently with the palette above, similar in spirit to MELT's product shots. No stock photography, no AI-generated food.

## Motion (light touch, not core to MVP)

- Soft fade/slide between checkout steps (Cart → Checkout → Payment → Confirmation), not hard page jumps
- Gold glow on CTA hover/press
- The frosted-glass reveal from the OTP reference is a nice-to-have for the payment/slot-picker overlay — not required for MVP, worth revisiting once the core flow is built and working

## What this doesn't decide yet

- Exact serif/sans font pairing (pick 1–2 candidates and test them against real meal photography before locking in)
- Logo treatment beyond typography (still using clean type in place of an invented mark, per earlier branding notes)
