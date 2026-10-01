# 📄 Code Style Guide
Standards and conventions for writing clean, consistent and maintainable code in this project.

| 01 Purpose 🎯 | 02 General Principles 💡 |
| :--- | :--- |
| This document defines the coding standards, conventions, and best practices to keep our codebase clean, consistent, and easy to maintain. It applies to all human developers and AI coding agents. | • Write clean, readable and self-explanatory code<br>• Keep it simple and avoid premature optimization<br>• Follow consistency over personal preference<br>• Prefer clarity over cleverness<br>• Make code easy to maintain and scale. |

| 03 Technology & Stack ⚙️ | 04 File & Folder Structure 📁 |
| :--- | :--- |
| • Next.js 14+ (App Router)<br>• TypeScript for strict typing<br>• Tailwind CSS for all styling<br>• React functional components with hooks<br>• ESLint and Prettier for formatting. | • Use `kebab-case` for folders (e.g., `user-profile`)<br>• Use `PascalCase` for React components<br>• Use `camelCase` for variables and functions<br>• Keep components small and focused<br>• Group related files together. |

| 05 Naming Conventions 🏷️ | 06 Code Formatting  </> |
| :--- | :--- |
| • **Components:** `PascalCase` (e.g., `MealCard.tsx`)<br>• **Files:** `kebab-case` (e.g., `seed-data.ts`)<br>• **Functions:** `camelCase` (e.g., `getDeliveryFee`)<br>• **Variables:** `camelCase` (e.g., `isCartEmpty`)<br>• **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`)<br>• **Env Vars:** `UPPER_SNAKE_CASE`. | • Use Prettier for consistent formatting<br>• 2 spaces for indentation<br>• Single quotes for strings<br>• Trailing commas where possible<br>• Line length: 100 characters max<br>• Run formatter before committing. |

| 07 Components 🧩 | 08 Comments & Documentation 📝 |
| :--- | :--- |
| • Use functional components with TypeScript<br>• Keep components small and reusable<br>• Use descriptive props and types<br>• **Use React Portals or native `<dialog>` elements for modals, dropdowns, and slide-out carts to avoid nested DOM z-index conflicts.**<br>• Move complex logic to custom hooks<br>• Keep UI, logic and data fetching separated. | • Write meaningful comments (tell *why*, not *what*)<br>• Use JSDoc for complex functions and types<br>• Document non-obvious logic and decisions<br>• Keep README and docs up to date<br>• Remove outdated or unnecessary comments. |

---

## 🍽️ Chef Apedo Foods Specific Conventions

### 1. Integer Pesewas Financial Standard
- **No floating-point currency calculations:** Store, calculate, and pass all currency values as integer pesewas (`GH₵ 45.00` = `4500`).
- Always format currency at the UI presentation boundary using `formatGHS(pesewas)` from `lib/pricing.ts`.

### 2. Dual-Lane Payment Presentation
- **Never merge food and delivery fees into a single total:** "Pay Now (Food)" and "Pay Rider on Delivery" must remain distinctly separated in all UI states (Cart, Checkout, Confirmation, and SMS receipts).

### 3. Order Lifecycle Status Identifiers
- Status strings are strictly typed enums: `'awaiting_payment'`, `'confirmed'`, `'preparing'`, `'ready_for_dispatch'`, `'dispatched'`, `'rider_arriving'`, `'delivered'`, `'cancelled'`.

### 4. Design System Tokens
- Reference semantic Tailwind tokens configured in `tailwind.config.ts`: `brand-yellow` (`#FFB800`), `brand-red` (`#E53935`), `brand-cream` (`#FFF8F0`), surface darks (`#18110E`, `#141414`).
