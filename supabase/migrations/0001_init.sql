-- Chef Apedo Foods — initial schema, mirrors docs/ARCHITECTURE.md
-- All money columns are integer pesewas (GH₵1 = 100 pesewas) — never float.

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null
);

create table delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  areas text[] not null default '{}',
  fee_pesewas integer not null, -- real values TBD, seed as placeholders only
  active boolean not null default true
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) not null,
  address text not null,
  area text not null,
  delivery_zone_id uuid references delivery_zones(id) not null
);

create table meals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  available boolean not null default true
);

create table meal_sizes (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid references meals(id) not null,
  size text not null check (size in ('small', 'medium', 'large')),
  base_price_pesewas integer not null
);

create table protein_options (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  additional_price_pesewas integer not null default 0,
  available boolean not null default true
);

create table protein_packages (
  id uuid primary key default gen_random_uuid(),
  meal_size_id uuid references meal_sizes(id) not null,
  name text not null
);

create table package_items (
  package_id uuid references protein_packages(id) not null,
  protein_id uuid references protein_options(id) not null,
  quantity integer not null default 1,
  primary key (package_id, protein_id)
);

create table kitchen_settings (
  id uuid primary key default gen_random_uuid(),
  open boolean not null default true,
  daily_capacity integer not null default 12, -- see docs/TASKS.md §0
  orders_today integer not null default 0
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) not null,
  address_id uuid references addresses(id) not null,
  delivery_slot text not null,
  subtotal_pesewas integer not null,
  delivery_fee_pesewas integer not null,
  amount_paid_pesewas integer not null default 0,
  payment_method text not null default 'paystack',
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'failed', 'refunded')),
  order_status text not null default 'awaiting_payment'
    check (order_status in (
      'awaiting_payment', 'confirmed', 'preparing',
      'ready_for_dispatch', 'dispatched', 'delivered', 'cancelled'
    )),
  paystack_reference text,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) not null,
  meal_id uuid references meals(id) not null,
  size_id uuid references meal_sizes(id) not null,
  quantity integer not null default 1,
  base_price_pesewas integer not null
);

create table order_item_proteins (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid references order_items(id) not null,
  protein_id uuid references protein_options(id) not null,
  quantity integer not null default 1,
  additional_price_pesewas integer not null default 0
);

-- order_status must only ever be set to 'confirmed' by the verified
-- Paystack webhook handler (see docs/ARCHITECTURE.md payment flow and
-- docs/SECURITY.md) — not enforced at the DB level here, enforce in
-- lib/orders + the webhook route.
