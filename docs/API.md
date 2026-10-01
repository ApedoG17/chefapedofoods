# 🔌 API Guide
API endpoints, request/response formats, authentication, error handling and best practices for this project.

| 01 Purpose 🎯 | 02 Base Configuration ⚙️ |
| :--- | :--- |
| This document defines our API structure, endpoints, authentication, request/response formats, error handling and best practices. It ensures a consistent and secure way to build and integrate with our API. | • **Base URL (Dev):** `http://localhost:3000/api`<br>• **Base URL (Prod):** `https://chefapedofoods.com/api`<br>• **API Version:** `v1`<br>• **Response Format:** `JSON`<br>• **Content-Type:** `application/json`. |

| 03 Authentication 🔒 | 04 Common Headers 📄 |
| :--- | :--- |
| • Uses Supabase Auth tokens for secure routes<br>• **Format:** `Bearer <token>`<br>• Validate user permissions on the server side (Server Actions & Route Handlers)<br>• Internal services use `SUPABASE_SERVICE_ROLE_KEY`. | • `"Content-Type": "application/json"`<br>• `"Authorization": "Bearer <token>"`<br>• `"Accept": "application/json"`<br>• `"X-API-Key": "<agoo_key>"` (External). |

| 05 Endpoint Structure 🔗 | 06 Request & Response Format 🔄 |
| :--- | :--- |
| `/api/[resource]/[action]`<br><br>**Examples:**<br>• `GET /api/orders/[id]` (Fetch tracking)<br>• `POST /api/orders/manual` (Create order)<br>• `PATCH /api/admin/orders/[id]` (Update status)<br>• `POST /api/admin/marketing` (SMS Blast). | **Request (POST /api/admin/marketing):**<br>`{ "message": "Promo code..." }`<br><br>**Response (Success - 200):**<br>`{ "success": true, "count": 150 }`<br><br>**Response (Error - 400):**<br>`{ "error": "Message is required" }`. |

| 07 Error Handling ⚠️ | 08 Best Practices ✅ |
| :--- | :--- |
| • **200:** OK (Success)<br>• **400:** Bad Request (Invalid input)<br>• **401:** Unauthorized (Missing/invalid token)<br>• **403:** Forbidden (Insufficient permissions)<br>• **404:** Not Found (Resource doesn't exist)<br>• **500:** Internal Server Error. | • Use consistent naming conventions<br>• Return meaningful and consistent error messages<br>• **Execute external services atomically: only dispatch Agoo SMS notifications after receiving a `201 Created` confirmation from the Supabase database write.**<br>• **Leverage Supabase Realtime subscriptions for live proximity updates instead of building custom Server-Sent Events (SSE).**<br>• Document new endpoints<br>• Use appropriate HTTP methods (GET, POST, PATCH)<br>• Keep API controllers thin. |

---

## 📡 Registered Route Handlers

### Customer & Storefront Endpoints
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/orders` | Place a new customer order with line items | Public |
| `GET` | `/api/orders/[id]` | Fetch real-time status and timeline for order tracking | Public (UUID) |
| `POST` | `/api/promos/validate` | Validate coupon code against order total | Public |
| `POST` | `/api/feedback` | Submit post-delivery customer rating and review | Public (Order-scoped) |

### Kitchen & Admin Endpoints
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/admin/kitchen` | Fetch active kitchen orders stream for KDS | Admin Token |
| `PATCH` | `/api/admin/orders/[id]` | Update order lifecycle status (`preparing`, `ready_for_dispatch`, etc.) | Admin Token |
| `POST` | `/api/admin/orders/manual` | Record an in-person, phone, or manual MoMo order | Admin Token |
| `POST` | `/api/admin/marketing` | Broadcast transactional/promotional SMS via Agoo Gateway | Admin Token |
| `GET` | `/api/admin/riders` | Fetch active riders and assigned order counts | Admin Token |

### Rider & Logistics Endpoints
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/rider/orders` | Fetch orders assigned to the logged-in courier phone | Rider Auth |
| `POST` | `/api/rider/collect-payment` | Atomic cash/MoMo collection confirmation & delivery finalization | Rider Auth |

### External Webhooks & Third-Party Gateways
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/webhooks/hubtel` | Process Hubtel mobile money / card payment status callbacks | Webhook Signature |
| `POST` | `https://api.agoosms.com/v1/sms/send` | Outbound SMS gateway for transactional dispatch notices | `X-API-Key` |
