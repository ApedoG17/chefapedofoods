# Security Architecture

Our security architecture relies on a strict separation of concerns across the client browser, the Next.js server, and the Supabase database.

## Client Layer (Next.js Frontend)
* **Zero Secrets:** The frontend only holds public keys (e.g., `NEXT_PUBLIC_SUPABASE_URL`). It never processes payments directly.
* **Input Sanitization:** React automatically escapes all text inputs (like landmark directions) to prevent Cross-Site Scripting (XSS) attacks.

## Server Layer (Next.js API Routes)
* **Secure Proxying:** The `/api/payments/hubtel` route acts as a secure proxy. It securely attaches the `HUBTEL_CLIENT_SECRET` via Basic Auth and initiates the payment, returning only a safe checkout URL to the client.
* **Webhook Verification:** The `/api/webhooks/hubtel` endpoint listens for incoming payment confirmations. It strictly checks the Hubtel response codes (`0000`) before updating the database to `paid`.

## Database Layer (Supabase PostgreSQL)
* **Row Level Security (RLS):** Policies prevent external malicious queries. The public API cannot delete orders or modify financial totals. 
* **Service Role Bypass:** The KDS and background webhooks use the Supabase Service Role key to bypass RLS securely from the server side, ensuring administrative actions are executed with full authority but hidden from the public internet.
