# Security Requirements

## 1. Authentication and Authorization
* **Admin Access:** The `/admin` dashboard and all `/api/admin/*` routes must be strictly protected. Only authorized administrators may access the Kitchen Display System (KDS) to view orders, alter menu stock, or trigger SMS notifications.
* **Database Access:** Client-side database queries must be restricted using Supabase Row Level Security (RLS). Anonymous users may only insert into the `orders` table and read the `menu` table.

## 2. Data Privacy and Integrity
* **Customer Data:** GPS coordinates, hostel room numbers, and phone numbers must be treated as PII (Personally Identifiable Information). This data must only be exposed to the KDS and authorized dispatch riders.
* **Payment Integrity:** The system must never trust client-side payment confirmations. All Hubtel online payments must be verified exclusively through secure, server-to-server webhook callbacks.

## 3. Infrastructure Security
* **Environment Variables:** Secret keys (Hubtel, Supabase Service Role, SMS API) must never be exposed to the browser. They must remain securely stored in Vercel environment variables and accessed only via server-side Next.js route handlers.
