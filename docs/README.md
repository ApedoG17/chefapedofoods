# Chef Apedo Foods — Project Documentation Index

This `docs/` directory is the canonical architectural and specifications index for the **Chef Apedo Foods** platform.

## 📚 Reading Order

| Priority | Document | Purpose |
|:---:|:---|:---|
| **01** | [`MEMORY.md`](./MEMORY.md) | **30-second context briefing** on business rules, architecture, and current live status. |
| **02** | [`AGENTS.md`](./AGENTS.md) | Operating guidelines and non-negotiable constraints for AI engineering agents. |
| **03** | [`PRD.md`](./PRD.md) | Canonical Product Requirements Document (features, business rules, acceptance criteria). |
| **04** | [`ARCHITECTURE.md`](./ARCHITECTURE.md) | System shape, entity-relationship diagrams, API catalog, and payment/SMS flows. |
| **05** | [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | Visual design tokens, color palette, typography hierarchy, and motion guidelines. |
| **06** | [`COMPONENTS.md`](./COMPONENTS.md) | Locked UI component inventory (MealCard, CheckoutStepper, SplitPaymentCard, etc.). |
| **07** | [`RULES.md`](./RULES.md) | Strict coding standards (integer pesewas, dual-payment split, server-side rule enforcement). |
| **08** | [`TASKS.md`](./TASKS.md) | Full sprint backlog & roadmap tracking completed milestones. |
| **09** | [`SECURITY.md`](./SECURITY.md) | Row Level Security (RLS) policies, webhook signature verification, and PII protection. |
| **10** | [`TESTING.md`](./TESTING.md) | End-to-end integration test plans and golden path simulation checklists. |

---

## 🚀 Current Implementation Status

All core transaction and logistics phases are **fully developed, tested, and production-ready**:
- ✅ **Student Storefront:** Responsive guest checkout with dynamic Legon campus delivery fee calculations.
- ✅ **Real-Time KDS:** Kitchen Display System with live WebSocket orders and rider assignment.
- ✅ **Rider Logistics Portal (`/rider`):** 1-tap Google Maps routing, 1-tap phone calls, and mandatory cash/MoMo collection confirmation gate.
- ✅ **SMS Gateway Integration:** Agoo SMS integration powering dispatch alerts, tracking URLs, and marketing blasts.
- ✅ **Financial Reconciliation (`/admin/finance`):** Ledger tracking Hubtel online payments vs. rider-collected physical cash/MoMo.
- ✅ **Feedback & Review System (`/feedback/[orderId]`):** Automated post-delivery SMS with 1-5 star dish reviews.
