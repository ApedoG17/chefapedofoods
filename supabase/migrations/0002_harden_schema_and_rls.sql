-- Chef Apedo Foods — Schema hardening, atomic daily capacity, and RLS policies
-- Implements Phase F Task 2 per the amended implementation plan.

-- 1. Ensure orders has unique Paystack reference, cancellation details, and refund tracking
create unique index if not exists idx_orders_paystack_ref
  on orders (paystack_reference)
  where paystack_reference is not null;

alter table orders
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancellation_reason text,
  add column if not exists refund_status text not null default 'none'
    check (refund_status in ('none', 'pending', 'refunded', 'failed')),
  add column if not exists paystack_refund_reference text;

-- 2. Snapshot included protein package name on order items for historical integrity
alter table order_items
  add column if not exists included_protein_package_name text not null default '';

-- 3. Date tracking and atomic daily capacity function for kitchen_settings
alter table kitchen_settings
  add column if not exists orders_date date not null default current_date;

-- Function: Atomically check capacity, handle daily reset, and increment orders_today
create or replace function increment_kitchen_orders()
returns boolean
language plpgsql
security definer
as $$
declare
  v_open boolean;
  v_capacity integer;
  v_orders_today integer;
  v_date date;
begin
  select open, daily_capacity, orders_today, orders_date
  into v_open, v_capacity, v_orders_today, v_date
  from kitchen_settings
  limit 1
  for update;

  if not found or not v_open then
    return false;
  end if;

  -- Reset counter if date has advanced
  if v_date < current_date then
    v_orders_today := 0;
    v_date := current_date;
  end if;

  if v_orders_today >= v_capacity then
    return false;
  end if;

  update kitchen_settings
  set orders_today = v_orders_today + 1,
      orders_date = v_date;

  return true;
end;
$$;

-- Function: Storefront check if kitchen is accepting orders (does not expose raw capacity/count)
create or replace function is_kitchen_accepting_orders()
returns boolean
language plpgsql
security definer
stable
as $$
declare
  v_open boolean;
  v_capacity integer;
  v_orders_today integer;
  v_date date;
begin
  select open, daily_capacity, orders_today, orders_date
  into v_open, v_capacity, v_orders_today, v_date
  from kitchen_settings
  limit 1;

  if not found or not v_open then
    return false;
  end if;

  if v_date < current_date then
    return true;
  end if;

  return v_orders_today < v_capacity;
end;
$$;

-- 4. Performance Indexes
create index if not exists idx_orders_customer_id on orders(customer_id);
create index if not exists idx_orders_address_id on orders(address_id);
create index if not exists idx_orders_status on orders(order_status);
create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_order_item_proteins_item_id on order_item_proteins(order_item_id);
create index if not exists idx_meal_sizes_meal_id on meal_sizes(meal_id);
create index if not exists idx_protein_packages_size_id on protein_packages(meal_size_id);
create index if not exists idx_package_items_package_id on package_items(package_id);

-- 5. Enable Row Level Security (RLS) on all 12 tables
alter table customers enable row level security;
alter table delivery_zones enable row level security;
alter table addresses enable row level security;
alter table meals enable row level security;
alter table meal_sizes enable row level security;
alter table protein_options enable row level security;
alter table protein_packages enable row level security;
alter table package_items enable row level security;
alter table kitchen_settings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_item_proteins enable row level security;

-- 6. Public read policies (anon role) — read active menu & active delivery zones only
-- Note: kitchen_settings has NO public SELECT. Storefront uses is_kitchen_accepting_orders().
create policy "Public can read available meals"
  on meals for select
  to anon
  using (available = true);

create policy "Public can read meal sizes"
  on meal_sizes for select
  to anon
  using (true);

create policy "Public can read available protein options"
  on protein_options for select
  to anon
  using (available = true);

create policy "Public can read protein packages"
  on protein_packages for select
  to anon
  using (true);

create policy "Public can read package items"
  on package_items for select
  to anon
  using (true);

create policy "Public can read active delivery zones"
  on delivery_zones for select
  to anon
  using (active = true);

-- 7. Explicit Admin Authorization & Policies
-- Ordinary authenticated users do NOT get admin access. Only verified users in admin_users.
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);
alter table admin_users enable row level security;

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from admin_users where id = auth.uid()
  );
$$;

create policy "Admin can read admin_users"
  on admin_users for select
  to authenticated
  using (is_admin());

create policy "Admin full access customers"
  on customers for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admin full access delivery_zones"
  on delivery_zones for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admin full access addresses"
  on addresses for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admin full access meals"
  on meals for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admin full access meal_sizes"
  on meal_sizes for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admin full access protein_options"
  on protein_options for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admin full access protein_packages"
  on protein_packages for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admin full access package_items"
  on package_items for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admin full access kitchen_settings"
  on kitchen_settings for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admin full access orders"
  on orders for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admin full access order_items"
  on order_items for all to authenticated using (is_admin()) with check (is_admin());

create policy "Admin full access order_item_proteins"
  on order_item_proteins for all to authenticated using (is_admin()) with check (is_admin());

-- Note: Trusted server-side operations (order creation, Paystack webhooks) use the
-- Supabase service_role client, which automatically bypasses RLS in Postgres.

