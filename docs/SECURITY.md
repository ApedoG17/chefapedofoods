# Chef Apedo Foods — Security Notes

## Payments

- Never store raw MoMo PINs or card details — whatever integration is chosen (direct MTN/Telecel API or a gateway like Paystack/Hubtel), rely on their hosted/tokenized flow rather than handling raw payment credentials.
- API keys/secrets for whichever payment integration is chosen belong in environment variables or a secrets manager, never committed to the repo (see `RULES.md`).
- Payment status (`Order.payment_status`) should only ever be set to "paid" from a verified callback/webhook or a confirmed server-side check — never trust a client-side "payment succeeded" signal alone to confirm an order.

## Customer data (PII)

- Customer data collected is limited by design: name, phone, delivery address. No accounts, no stored payment credentials, no unnecessary data collection in MVP.
- Phone numbers and addresses should be treated as sensitive — access to the admin Orders/Order Details screens should require the chef's login (see Admin auth below), not be publicly reachable.
- If SMS/notification is added later, don't log full phone numbers in plaintext application logs.

## Admin access

- MVP is single-user (one chef) — a simple authenticated login is enough; no need to over-build role-based access control yet, but the login itself should still use standard practice (hashed passwords, no default/shared credentials, session expiry).
- Kitchen Controls (open/closed, capacity, availability) directly affects whether customers can order — treat this as a privileged action requiring the admin session, not a public endpoint.

## Business-logic integrity

- The business rules in `PRD.md` (same-day cutoff, capacity limit, excluded delivery areas, out-of-stock blocking) must be enforced **server-side**, not just hidden/disabled in the UI — a customer bypassing client-side checks (e.g. via direct API calls) should still be blocked by the same rules.
- Delivery-fee and price calculations should be computed server-side at checkout, never trusted from client input, to prevent a manipulated cart total.

## Not yet addressed (flag before launch)

- Rate limiting / abuse protection on the order-submission endpoint
- Terms & conditions / privacy policy content (tracked in `PRD.md`/planning doc, not yet drafted)
- Data retention policy for customer orders once the business has real order history
