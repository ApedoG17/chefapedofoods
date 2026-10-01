# 🗄️ Database Guide
Schema design, setup, conventions and best practices for managing our database in this project.

| 01 Purpose 🎯 | 02 Database Stack 📚 |
| :--- | :--- |
| This document outlines the database setup, schema design, conventions and best practices for this project. It ensures our data is structured, secure, scalable and easy to maintain. | • **Primary DB:** PostgreSQL (via Supabase)<br>• **Client:** `@supabase/supabase-js`<br>• **Environments:** Development, Staging, Production<br>• **Realtime:** Supabase Realtime Channels for KDS. |

| 03 Setup & Configuration ⚙️ | 04 Schema Design Principles 🏗️ |
| :--- | :--- |
| • Create a Supabase project instance<br>• Set environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)<br>• Configure database access controls<br>• Connect the app to the database. | • Keep schema simple and normalized<br>• Use meaningful and consistent naming<br>• Define clear relationships (one-to-one, one-to-many)<br>• Add indexes for frequently queried fields<br>• Include `created_at` and `updated_at` timestamps. |

| 05 Naming Conventions 🏷️ | 06 Migrations & Seeding 🔄 |
| :--- | :--- |
| • **Table names:** `snake_case` (e.g., `user_profiles`)<br>• **Column names:** `snake_case` (e.g., `created_at`)<br>• **Enum values:** `UPPER_SNAKE_CASE`<br>• Use plural names for tables (e.g., `orders`, `riders`)<br>• Avoid reserved keywords. | • Use SQL migration files for schema changes (e.g., `0005_financial_reconciliation.sql`)<br>• Keep migrations in version control<br>• Seed essential data for development/testing<br>• Avoid editing old migrations<br>• Test migrations in a clean environment. |

| 07 Data Security & Access 🔒 | 08 Useful Commands 💻 |
| :--- | :--- |
| • Use environment variables for credentials<br>• Enable Row Level Security (RLS) using Supabase<br>• Follow least privilege access (restrict `anon` key)<br>• Validate and sanitize all user inputs<br>• Avoid storing sensitive data in plain text. | • `npx supabase init`<br>• `npx supabase start`<br>• `npx supabase db push`<br>• `npx supabase gen types typescript --local > types/database.ts` |

---

## 🏛️ Core Schema Entities (Chef Apedo Foods)

| Table | Purpose | Key Columns & Relations |
| :--- | :--- | :--- |
| `orders` | Core transaction entity tracking customer orders | `id` (UUID), `customer_name`, `customer_phone`, `delivery_location`, `delivery_zone_id`, `food_total_pesewas`, `delivery_fee_pesewas`, `status`, `payment_status`, `payment_method`, `rider_id`, `created_at` |
| `order_items` | Individual meal line items within an order | `id`, `order_id` (FK ➔ `orders.id`), `menu_item_id` (FK ➔ `menu_items.id`), `portion_size`, `protein_package_id`, `extra_proteins`, `item_price_pesewas`, `quantity` |
| `menu_items` | Available dishes (e.g., Jollof, Fried Rice, Waakye) | `id`, `name`, `description`, `base_price_pesewas`, `image_url`, `is_available`, `category` |
| `protein_packages` | Included protein selections per meal | `id`, `menu_item_id`, `name`, `extra_price_pesewas` |
| `delivery_zones` | University of Ghana campus zones & rates | `id`, `zone_name`, `zone_code`, `delivery_fee_pesewas`, `is_active` |
| `riders` | Registered campus dispatch couriers | `id`, `name`, `phone`, `vehicle_type`, `is_active`, `current_orders_count` |
| `feedback` | Customer post-delivery dish reviews | `id`, `order_id` (FK ➔ `orders.id`), `rating` (1-5), `comment`, `created_at` |
| `finance_ledger` | Daily payment reconciliation ledger | `id`, `order_id`, `food_amount_pesewas`, `delivery_amount_pesewas`, `collected_by`, `reconciled` |

---

## 🔄 Migration History (`supabase/migrations/`)

1. `0001_init.sql` — Initial schema definitions for orders, order items, and delivery zones.
2. `0002_harden_schema_and_rls.sql` — RLS policies, indexing, and cascade delete guards.
3. `0003_complete_menu_seed.sql` — Production seed data for menu items and protein configurations.
4. `0004_scaling_operations.sql` — Rider portal, live order queue indexing, and kitchen display feeds.
5. `0005_financial_reconciliation.sql` — End-of-day cash and MoMo balancing ledger.
