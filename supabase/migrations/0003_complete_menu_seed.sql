-- Chef Apedo Foods — Complete menu seed migration
-- Implements Phase F Task 3 per the amended implementation plan.
-- Seeds meals, protein options, kitchen settings, delivery zones, sizes, and protein packages.

-- 1. Ensure the 3 launch meals exist
insert into meals (name, description, available)
values
  ('Jollof Rice', 'Ghanaian-style jollof rice', true),
  ('Fried Rice', 'Ghanaian-style fried rice', true),
  ('Plain Rice & Stew', 'Plain rice served with stew', true)
on conflict do nothing;

-- 2. Ensure the 4 protein options exist
insert into protein_options (name, additional_price_pesewas, available)
values
  ('Chicken', 1500, true),
  ('Sausage', 400, true),
  ('Egg', 400, true),
  ('Fish', 400, true)
on conflict do nothing;

-- 3. Ensure initial kitchen_settings row exists
insert into kitchen_settings (open, daily_capacity, orders_today, orders_date)
select true, 12, 0, current_date
where not exists (select 1 from kitchen_settings);

-- 4. Ensure initial delivery_zones exist (starting point GH₵10, real zone fees configurable)
insert into delivery_zones (name, areas, fee_pesewas, active)
select 'Zone A (East Legon)', array['East Legon', 'Shiashie'], 1000, true
where not exists (select 1 from delivery_zones where name = 'Zone A (East Legon)');

insert into delivery_zones (name, areas, fee_pesewas, active)
select 'Zone B (Osu / Cantonments)', array['Osu', 'Cantonments', 'Labone'], 1500, true
where not exists (select 1 from delivery_zones where name = 'Zone B (Osu / Cantonments)');

insert into delivery_zones (name, areas, fee_pesewas, active)
select 'Zone C (Spintex)', array['Spintex', 'Batsonaa'], 2000, true
where not exists (select 1 from delivery_zones where name = 'Zone C (Spintex)');

-- 5. Ensure all 3 meals have Small, Medium, Large sizes
insert into meal_sizes (meal_id, size, base_price_pesewas)
select m.id, s.size, s.price
from meals m
cross join (
  values
    ('small', 4500),
    ('medium', 7000),
    ('large', 9000)
) as s(size, price)
where not exists (
  select 1 from meal_sizes ms where ms.meal_id = m.id and ms.size = s.size
);

-- 6. Populate protein packages for every meal_size
-- Small sizes: "2 Sausages" OR "2 Eggs"
insert into protein_packages (meal_size_id, name)
select ms.id, p.name
from meal_sizes ms
cross join (
  values
    ('2 Sausages'),
    ('2 Eggs')
) as p(name)
where ms.size = 'small'
and not exists (
  select 1 from protein_packages pp where pp.meal_size_id = ms.id and pp.name = p.name
);

-- Medium sizes: "Chicken + Egg" OR "Chicken + Sausage"
insert into protein_packages (meal_size_id, name)
select ms.id, p.name
from meal_sizes ms
cross join (
  values
    ('Chicken + Egg'),
    ('Chicken + Sausage')
) as p(name)
where ms.size = 'medium'
and not exists (
  select 1 from protein_packages pp where pp.meal_size_id = ms.id and pp.name = p.name
);

-- Large sizes: "Chicken + 2 Sausages", "Chicken + 2 Eggs", "Chicken + Sausage + Egg", "2 Chickens"
insert into protein_packages (meal_size_id, name)
select ms.id, p.name
from meal_sizes ms
cross join (
  values
    ('Chicken + 2 Sausages'),
    ('Chicken + 2 Eggs'),
    ('Chicken + Sausage + Egg'),
    ('2 Chickens')
) as p(name)
where ms.size = 'large'
and not exists (
  select 1 from protein_packages pp where pp.meal_size_id = ms.id and pp.name = p.name
);

-- 7. Link package_items to protein_options with quantities
-- '2 Sausages' -> Sausage (qty 2)
insert into package_items (package_id, protein_id, quantity)
select pp.id, po.id, 2
from protein_packages pp
cross join protein_options po
where pp.name = '2 Sausages' and po.name = 'Sausage'
on conflict (package_id, protein_id) do nothing;

-- '2 Eggs' -> Egg (qty 2)
insert into package_items (package_id, protein_id, quantity)
select pp.id, po.id, 2
from protein_packages pp
cross join protein_options po
where pp.name = '2 Eggs' and po.name = 'Egg'
on conflict (package_id, protein_id) do nothing;

-- 'Chicken + Egg' -> Chicken (qty 1), Egg (qty 1)
insert into package_items (package_id, protein_id, quantity)
select pp.id, po.id, 1
from protein_packages pp
cross join protein_options po
where pp.name = 'Chicken + Egg' and po.name in ('Chicken', 'Egg')
on conflict (package_id, protein_id) do nothing;

-- 'Chicken + Sausage' -> Chicken (qty 1), Sausage (qty 1)
insert into package_items (package_id, protein_id, quantity)
select pp.id, po.id, 1
from protein_packages pp
cross join protein_options po
where pp.name = 'Chicken + Sausage' and po.name in ('Chicken', 'Sausage')
on conflict (package_id, protein_id) do nothing;

-- 'Chicken + 2 Sausages' -> Chicken (qty 1), Sausage (qty 2)
insert into package_items (package_id, protein_id, quantity)
select pp.id, po.id, 1
from protein_packages pp
cross join protein_options po
where pp.name = 'Chicken + 2 Sausages' and po.name = 'Chicken'
on conflict (package_id, protein_id) do nothing;

insert into package_items (package_id, protein_id, quantity)
select pp.id, po.id, 2
from protein_packages pp
cross join protein_options po
where pp.name = 'Chicken + 2 Sausages' and po.name = 'Sausage'
on conflict (package_id, protein_id) do nothing;

-- 'Chicken + 2 Eggs' -> Chicken (qty 1), Egg (qty 2)
insert into package_items (package_id, protein_id, quantity)
select pp.id, po.id, 1
from protein_packages pp
cross join protein_options po
where pp.name = 'Chicken + 2 Eggs' and po.name = 'Chicken'
on conflict (package_id, protein_id) do nothing;

insert into package_items (package_id, protein_id, quantity)
select pp.id, po.id, 2
from protein_packages pp
cross join protein_options po
where pp.name = 'Chicken + 2 Eggs' and po.name = 'Egg'
on conflict (package_id, protein_id) do nothing;

-- 'Chicken + Sausage + Egg' -> Chicken (qty 1), Sausage (qty 1), Egg (qty 1)
insert into package_items (package_id, protein_id, quantity)
select pp.id, po.id, 1
from protein_packages pp
cross join protein_options po
where pp.name = 'Chicken + Sausage + Egg' and po.name in ('Chicken', 'Sausage', 'Egg')
on conflict (package_id, protein_id) do nothing;

-- '2 Chickens' -> Chicken (qty 2)
insert into package_items (package_id, protein_id, quantity)
select pp.id, po.id, 2
from protein_packages pp
cross join protein_options po
where pp.name = '2 Chickens' and po.name = 'Chicken'
on conflict (package_id, protein_id) do nothing;
