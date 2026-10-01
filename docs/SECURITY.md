# 🛡️ Security Policy

The Chef Apedo Foods engineering team takes the security of our customers' campus data seriously.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | :white_check_mark: |
| < v1.0  | :x:                |

## 🔐 Architecture Security
* **Row Level Security (RLS):** All database tables are locked via Supabase RLS. Customers can only read/write their own specific order payloads.
* **Environment Variables:** No secret keys (Agoo, Hubtel, Supabase Service Role) are exposed to the client. All external API mutations occur strictly server-side via Next.js Route Handlers.
* **Input Validation:** All phone numbers and checkout parameters are sanitized before hitting the PostgreSQL database to prevent injection attacks.

## 🚨 Reporting a Vulnerability
If you discover a security vulnerability or data leak within the platform, please do not disclose it publicly. 

Instead, report it directly to **security@chefapedofoods.com**. We will acknowledge receipt of your vulnerability report within 48 hours and strive to issue a patch within 5 business days.
