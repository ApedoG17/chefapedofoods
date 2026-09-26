-- Launch menu seed — matches docs/PRD.md exactly. Meal/size/protein/price
-- data here is real and locked. Delivery zone fees below are PLACEHOLDER
-- values only — see docs/TASKS.md §0, do not treat as real before launch.

insert into meals (name, description, available) values
  ('Jollof Rice', 'Ghanaian-style jollof rice', true),
  ('Fried Rice', 'Ghanaian-style fried rice', true),
  ('Plain Rice & Stew', 'Plain rice served with stew', true);

-- Sizes + prices (pesewas) for each meal — repeat per meal id in practice;
-- shown once here for Jollof Rice as the pattern to follow for the other two.
insert into meal_sizes (meal_id, size, base_price_pesewas)
select id, 'small', 4500 from meals where name = 'Jollof Rice'
union all
select id, 'medium', 7000 from meals where name = 'Jollof Rice'
union all
select id, 'large', 9000 from meals where name = 'Jollof Rice';

insert into protein_options (name, additional_price_pesewas, available) values
  ('Chicken', 1500, true),
  ('Sausage', 400, true),
  ('Egg', 400, true),
  ('Fish', 400, true);

-- Included protein packages per size (example wiring for Medium Jollof):
-- insert into protein_packages (meal_size_id, name) values (<medium_size_id>, 'Chicken + Egg');
-- insert into protein_packages (meal_size_id, name) values (<medium_size_id>, 'Chicken + Sausage');
-- then package_items rows linking each package to its protein_options with quantity.
-- Left as a TODO to wire up against real generated IDs rather than guessing UUIDs here.

insert into kitchen_settings (open, daily_capacity, orders_today) values (true, 12, 0);

-- PLACEHOLDER delivery zones — fee values are not real, see docs/TASKS.md §0.
-- No frontend code should assume these numbers are final.
insert into delivery_zones (name, areas, fee_pesewas, active) values
  ('Zone A (placeholder)', array['East Legon'], 1000, true),
  ('Zone B (placeholder)', array['Osu', 'Cantonments'], 1500, true),
  ('Zone C (placeholder)', array['Spintex'], 2000, true);
