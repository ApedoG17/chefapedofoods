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

## Motion & Interaction Architecture

- **Floating 3D Heroes:** Smooth, continuous vertical floating bobbing (`y: [-10, 10, -10]` over 6s `easeInOut`) for isolated 3D food and packaging assets on Menu and Delivery heroes.
- **Continuous Marquee Ticker:** GPU-accelerated CSS translation (`translateX(-50%)` over 30s linear) on dual-duplicated content sets for 60fps zero-seam looping.
- **Fly-to-Cart Trajectory:** Dynamic calculation of element coordinates triggering an accelerated curved thumbnail trajectory into the floating navbar cart badge.
- **Cinematic Splash Sequence:** Physics-simulated broth bubbles, gold luxury typography fade-in, and video playback on first visit per browser session.
- **Step Transitions:** Soft fade/slide transitions across checkout steps and modal overlays.

## Finalized Branding & Typography Decisions

- **Typography Pairings:** Locked in Tailwind config:
  - `font-display`: High-impact, heavy uppercase display typography for editorial headlines (`leading-[0.85]`, `tracking-tighter`).
  - `font-sans`: Clean `Inter` typography for functional forms, nutrition notes, pricing rows, and button CTAs.
- **Logo Treatment:** Official circular gold crest (`bg-brand-yellow text-brand-dark`) featuring the clean `ca` monogram paired with the bold uppercase wordmark `CHEF APEDO FOODS`.
- **Primary Color Tokens (Tailwind System):**
  - `brand-red`: `#661014` / `#8B0000` (deep Ghanaian tomato stew burgundy)
  - `brand-yellow`: `#F59E0B` / `#FBBF24` (warm gold / amber accent)
  - `brand-cream`: `#FAF5EE` (warm, natural card & background tone)
  - `brand-dark`: `#17110D` (rich near-black dark chocolate surface)
