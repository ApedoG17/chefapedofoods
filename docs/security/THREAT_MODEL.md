# Threat Model

## Threat 1: Forged Webhook Payloads
* **Attack:** A malicious actor sends a fake POST request to `/api/webhooks/hubtel` claiming an order was paid.
* **Mitigation:** The webhook handler validates the internal `clientReference` against existing unpaid database records. Future enhancements will include validating the Hubtel IP address or verifying the webhook cryptographic signature.

## Threat 2: KDS Dashboard Exposure
* **Attack:** A student discovers the `/admin` URL and attempts to mark their own unpaid order as "Completed" to get free food.
* **Mitigation:** The dashboard and its corresponding API routes (`/api/admin/orders`) require administrative session validation. Unauthorized requests are rejected with HTTP 401.

## Threat 3: Order Spam (Denial of Wallet)
* **Attack:** A bot submits hundreds of fake "Manual MoMo" orders, flooding the kitchen queue and wasting dispatch resources.
* **Mitigation:** The system includes a daily capacity limiter configurable in the admin settings. Supabase rate-limiting and Vercel edge protections prevent rapid automated submissions.

## Threat 4: Data Leakage via API
* **Attack:** An attacker queries the Supabase REST API directly to download all customer phone numbers and locations.
* **Mitigation:** Supabase RLS is configured to block `SELECT` statements on the `orders` table from anonymous public keys. Only the authenticated server environment can read the order list.
