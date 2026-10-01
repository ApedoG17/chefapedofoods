# 🛡️ Security Guide
Security practices, configurations and guidelines for keeping this project and our users safe.

| 01 Purpose 🎯 | 02 Core Principles 💡 |
| :--- | :--- |
| This document outlines the security practices, policies and guidelines to protect our application, data and users. It establishes protocols to prevent data leaks, IDOR vulnerabilities, and injection attacks. | • Security by design, not as an afterthought<br>• Follow the principle of least privilege<br>• Protect user data and respect privacy<br>• Validate all inputs and external requests<br>• Keep dependencies and infrastructure updated. |

| 03 Authentication & Authorization 🔒 | 04 Environment & Secrets 🔑 |
| :--- | :--- |
| • Enforce data isolation: verify the logged-in user owns the data being accessed.<br>• Prevent Insecure Direct Object Reference (IDOR) by checking ownership before reading or modifying resources.<br>• Utilize Supabase Row Level Security (RLS) for absolute table-level isolation. | • Protect secrets and API keys: keep sensitive credentials hidden from unauthorized users.<br>• Ensure API keys and database service keys (`HUBTEL_*`, `SMS_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are never exposed in frontend code or committed to the repository.<br>• Move all secrets to secure environment variables. |

| 05 Validate & Sanitize Input 🧹 | 06 Secure Deployment 🚀 |
| :--- | :--- |
| • Check and clean any data users submit to make sure it's safe and won't harm the system.<br>• Add strict validation to prevent SQL injection and script injection.<br>• **Enforce strict localized regex patterns (e.g., Ghanaian telecom formats `^(?:0\|\+233)[2-59]\d{8}$`) via Zod to block malformed inputs.**<br>• Reject invalid data and enforce strict input types via TypeScript and Zod. | • Enforce HTTPS and ensure secrets are stored securely on Vercel.<br>• Restrict direct database access from the public internet.<br>• Block automated scripts and harmful users from exploiting the system to prevent abuse and bot attacks. |

| 07 API & Backend Security </> | 08 Incident Reporting 🚨 |
| :--- | :--- |
| • Implement rate limiting to prevent abuse<br>• Validate and sanitize all API inputs<br>• Use CORS with allowed origins only<br>• Return generic error messages to clients<br>• Audit authentication and authorization checks. | • Report security vulnerabilities immediately to `security@chefapedofoods.com`<br>• Do not disclose vulnerabilities publicly<br>• Provide clear steps to reproduce the issue<br>• SLA: 48h receipt acknowledgment, patch within 5 business days. |

---

## 📋 Supported Versions

| Version | Supported          |
| :--- | :---: |
| v1.0.x  | :white_check_mark: |
| < v1.0  | :x:                |

---

## 🔐 Architecture Security Details

* **Row Level Security (RLS):** All database tables are locked via Supabase RLS. Customers can only read and query their own specific order payloads via UUID identifiers.
* **Environment Variables & Key Isolation:** No secret keys (Agoo SMS API Key, Hubtel Client Secret, Supabase Service Role Key) are ever exposed to the client bundle. All external API mutations and webhooks occur strictly server-side via Next.js Route Handlers.
* **Input Validation & Sanitization:** All Ghanaian phone numbers (`233...`), order items, notes, and checkout parameters are strictly validated with Zod and sanitized before hitting PostgreSQL to prevent injection attacks.
* **Payment Gate Verification:** Webhooks from payment gateways are cryptographically validated before mutating order status to `confirmed`. Riders must confirm physical cash collection before marking orders as `delivered`.

---

## 🚨 Incident Reporting & Vulnerability Policy

If you discover a security vulnerability or data leak within the Chef Apedo Foods platform, please do not disclose it publicly.

Instead, report it directly to:
📧 **security@chefapedofoods.com**

- **Response SLA:** We acknowledge receipt of vulnerability reports within **48 hours**.
- **Remediation SLA:** We strive to release patches for confirmed issues within **5 business days**.
