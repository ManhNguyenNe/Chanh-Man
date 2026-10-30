-- Run as postgres on the dev database. Every Auth/catalog/cart fixture is rolled back.
begin;

create temporary table qa_cart_users (
  label text primary key,
  id uuid not null unique default gen_random_uuid()
);
insert into qa_cart_users(label) values ('customer-a'), ('customer-b'), ('admin'), ('cascade');
create temporary table qa_cart_requests (
  label text primary key,
  id uuid not null unique default gen_random_uuid()
);
insert into qa_cart_requests(label) values ('first'), ('skip-clamp'), ('empty'), ('cap'), ('boundary'), ('overflow'), ('direct'), ('cascade');
create temporary table qa_cart_invalid_requests (id uuid primary key);
grant select on qa_cart_users, qa_cart_requests to authenticated;
grant insert on qa_cart_invalid_requests to authenticated;

do $$
declare target text;
begin
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'cart_items' and c.relrowsecurity
  ) or not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'private' and c.relname = 'cart_merge_requests' and c.relrowsecurity
  ) then raise exception 'Cart/merge receipt RLS missing'; end if;
  if has_table_privilege('anon', 'public.cart_items', 'SELECT,INSERT,UPDATE,DELETE')
     or not has_table_privilege('authenticated', 'public.cart_items', 'SELECT')
     or not has_table_privilege('authenticated', 'public.cart_items', 'DELETE')
     or has_table_privilege('authenticated', 'public.cart_items', 'INSERT,UPDATE')
     or not has_column_privilege('authenticated', 'public.cart_items', 'user_id', 'INSERT')
     or not has_column_privilege('authenticated', 'public.cart_items', 'variant_id', 'INSERT')
     or not has_column_privilege('authenticated', 'public.cart_items', 'quantity', 'INSERT')
     or not has_column_privilege('authenticated', 'public.cart_items', 'quantity', 'UPDATE') then
    raise exception 'Cart table/column grants incorrect';
  end if;
  foreach target in array array['user_id', 'variant_id', 'created_at', 'updated_at'] loop
    if has_column_privilege('authenticated', 'public.cart_items', target, 'UPDATE') then
      raise exception 'Client may change protected cart column %', target;
    end if;
  end loop;
  foreach target in array array['created_at', 'updated_at'] loop
    if has_column_privilege('authenticated', 'public.cart_items', target, 'INSERT') then
      raise exception 'Client may forge cart column %', target;
    end if;
  end loop;
  if has_table_privilege('anon', 'private.cart_merge_requests', 'SELECT,INSERT,UPDATE,DELETE')
     or has_table_privilege('authenticated', 'private.cart_merge_requests', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'Client has direct merge receipt access';
  end if;
  if has_function_privilege('anon', 'private.touch_cart_item()', 'EXECUTE')
     or has_function_privilege('authenticated', 'private.touch_cart_item()', 'EXECUTE') then
    raise exception 'Internal cart trigger helper callable by client';
  end if;
  foreach target in array array[
    'public.get_my_cart()', 'public.merge_guest_cart(uuid,jsonb)', 'private.merge_guest_cart(uuid,jsonb)'
  ] loop
    if has_function_privilege('anon', target, 'EXECUTE')
       or not has_function_privilege('authenticated', target, 'EXECUTE') then
      raise exception 'Cart RPC grants incorrect: %', target;
    end if;
  end loop;
  if (select prosecdef from pg_proc where oid = 'public.get_my_cart()'::regprocedure)
     or (select prosecdef from pg_proc where oid = 'public.merge_guest_cart(uuid,jsonb)'::regprocedure)
     or not (select prosecdef from pg_proc where oid = 'private.merge_guest_cart(uuid,jsonb)'::regprocedure) then
    raise exception 'Cart function security mode incorrect';
  end if;
end;
$$;

insert into auth.users(id, raw_user_meta_data)
select id, '{"display_name":"QA cart","role":"admin"}'::jsonb from qa_cart_users;
insert into private.admin_users(user_id) select id from qa_cart_users where label = 'admin';

insert into public.categories(id, slug, name, active) values
('qa-cart-visible', 'qa-cart-visible', 'QA cart visible', true),
('qa-cart-hidden', 'qa-cart-hidden', 'QA cart hidden', false);
insert into public.brands(id, slug, name, active) values
('qa-cart-visible', 'qa-cart-visible', 'QA cart visible', true),
('qa-cart-hidden', 'qa-cart-hidden', 'QA cart hidden', false);
insert into public.products(id, slug, name, image_url, category_id, brand_id, status) values
('qa-cart-visible', 'qa-cart-visible', 'QA cart product', '/qa-cart-product.png', 'qa-cart-visible', 'qa-cart-visible', 'active'),
('qa-cart-draft', 'qa-cart-draft', 'QA secret draft', '/qa-secret.png', 'qa-cart-visible', 'qa-cart-visible', 'draft'),
('qa-cart-archived', 'qa-cart-archived', 'QA secret archived', '/qa-secret.png', 'qa-cart-visible', 'qa-cart-visible', 'archived'),
('qa-cart-category', 'qa-cart-category', 'QA secret category', '/qa-secret.png', 'qa-cart-hidden', 'qa-cart-visible', 'active'),
('qa-cart-brand', 'qa-cart-brand', 'QA secret brand', '/qa-secret.png', 'qa-cart-visible', 'qa-cart-hidden', 'active');
insert into public.product_variants(id, product_id, sku, label, price, stock, active, image_url) values
('qa-cart-a', 'qa-cart-visible', 'QA-CART-A', 'Variant A', 100, 10, true, '/qa-cart-variant.png'),
('qa-cart-b', 'qa-cart-visible', 'QA-CART-B', 'Variant B', 250, 5, true, null),
('qa-cart-cap', 'qa-cart-visible', 'QA-CART-CAP', 'Quantity cap', 1, 2000, true, null),
('qa-cart-overflow', 'qa-cart-visible', 'QA-CART-OVERFLOW', 'Money limit', 999999999999999, 999, true, null),
('qa-cart-sold-out', 'qa-cart-visible', 'QA-CART-SOLD-OUT', 'Sold out', 1000, 0, true, null),
('qa-cart-inactive', 'qa-cart-visible', 'QA-CART-INACTIVE', 'Secret inactive', 1000, 8, false, '/qa-secret.png'),
('qa-cart-draft', 'qa-cart-draft', 'QA-CART-DRAFT', 'Secret draft', 1000, 8, true, null),
('qa-cart-archived', 'qa-cart-archived', 'QA-CART-ARCHIVED', 'Secret archived', 1000, 8, true, null),
('qa-cart-category', 'qa-cart-category', 'QA-CART-CATEGORY', 'Secret category', 1000, 8, true, null),
('qa-cart-brand', 'qa-cart-brand', 'QA-CART-BRAND', 'Secret brand', 1000, 8, true, null);
set constraints all immediate;
create temporary table qa_cart_stock as select id, stock from public.product_variants where id like 'qa-cart-%';

insert into public.cart_items(user_id, variant_id, quantity)
select id, 'qa-cart-a', 1 from qa_cart_users where label in ('customer-b', 'admin', 'cascade');
insert into public.cart_items(user_id, variant_id, quantity)
select id, 'qa-cart-draft', 1 from qa_cart_users where label = 'admin';
insert into private.cart_merge_requests(user_id, request_id, payload)
select u.id, r.id, '[]'::jsonb from qa_cart_users u cross join qa_cart_requests r
where u.label = 'cascade' and r.label = 'cascade';

select set_config('request.jwt.claims', jsonb_build_object(
  'sub', (select id from qa_cart_users where label = 'customer-a'), 'role', 'authenticated',
  'user_metadata', jsonb_build_object('role', 'admin'), 'app_metadata', jsonb_build_object('role', 'admin')
)::text, true);
set local role authenticated;

do $$
declare owner_id uuid; before_created timestamptz; before_updated timestamptz; affected integer; bad integer; cart jsonb;
begin
  select id into owner_id from qa_cart_users where label = 'customer-a';
  cart := public.get_my_cart();
  if cart->'items' is distinct from '[]'::jsonb or (cart->>'count')::integer <> 0
     or (cart->>'total')::numeric <> 0 or jsonb_typeof(cart->'notices') is distinct from 'array' then
    raise exception 'Empty customer cart contract failed: %', cart;
  end if;
  if exists (select 1 from public.cart_items) then raise exception 'Customer A read another cart'; end if;
  insert into public.cart_items(user_id, variant_id, quantity) values (owner_id, 'qa-cart-a', 1);
  select created_at, updated_at into before_created, before_updated
  from public.cart_items where user_id = owner_id and variant_id = 'qa-cart-a';
  update public.cart_items set quantity = 2 where user_id = owner_id and variant_id = 'qa-cart-a';
  if not exists (
    select 1 from public.cart_items where user_id = owner_id and variant_id = 'qa-cart-a'
      and quantity = 2 and created_at = before_created and updated_at > before_updated
  ) then raise exception 'Own cart update/timestamps failed'; end if;
  foreach bad in array array[-1, 0, 1000] loop
    begin
      update public.cart_items set quantity = bad where user_id = owner_id and variant_id = 'qa-cart-a';
      raise exception 'Invalid cart quantity accepted: %', bad;
    exception when check_violation then null; end;
  end loop;
  begin
    update public.cart_items set quantity = null where user_id = owner_id and variant_id = 'qa-cart-a';
    raise exception 'Null cart quantity accepted';
  exception when not_null_violation then null; end;
  begin
    insert into public.cart_items(user_id, variant_id, quantity) values (owner_id, 'qa-cart-a', 1);
    raise exception 'Duplicate cart variant accepted';
  exception when unique_violation then null; end;
  begin
    insert into public.cart_items(user_id, variant_id, quantity) values (owner_id, 'qa-cart-unknown', 1);
    raise exception 'Unknown cart variant bypassed FK';
  exception when foreign_key_violation then null; end;
  begin
    insert into public.cart_items(user_id, variant_id, quantity)
    values ((select id from qa_cart_users where label = 'customer-b'), 'qa-cart-cap', 1);
    raise exception 'Forged cart owner accepted';
  exception when insufficient_privilege then null; end;
  begin
    update public.cart_items set user_id = (select id from qa_cart_users where label = 'customer-b') where user_id = owner_id;
    raise exception 'Client reassigned cart owner';
  exception when insufficient_privilege then null; end;
  begin
    update public.cart_items set variant_id = 'qa-cart-b' where user_id = owner_id;
    raise exception 'Client reassigned cart variant';
  exception when insufficient_privilege then null; end;
  begin
    update public.cart_items set created_at = now() where user_id = owner_id;
    raise exception 'Client forged cart created_at';
  exception when insufficient_privilege then null; end;
  begin
    update public.cart_items set updated_at = now() where user_id = owner_id;
    raise exception 'Client forged cart updated_at';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.cart_items(user_id, variant_id, quantity, created_at) values (owner_id, 'qa-cart-cap', 1, now());
    raise exception 'Client supplied cart created_at';
  exception when insufficient_privilege then null; end;
  update public.cart_items set quantity = 5 where user_id = (select id from qa_cart_users where label = 'customer-b');
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Customer updated another cart'; end if;
  delete from public.cart_items where user_id = (select id from qa_cart_users where label = 'customer-b');
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Customer deleted another cart'; end if;
  insert into public.cart_items(user_id, variant_id, quantity) values (owner_id, 'qa-cart-cap', 999);
  delete from public.cart_items where user_id = owner_id and variant_id = 'qa-cart-cap';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Owner cart delete failed'; end if;
  begin
    perform 1 from private.cart_merge_requests;
    raise exception 'Customer read merge receipts';
  exception when insufficient_privilege then null; end;
  begin
    insert into private.cart_merge_requests(user_id, request_id, payload) values (owner_id, gen_random_uuid(), '[]');
    raise exception 'Customer forged merge receipt';
  exception when insufficient_privilege then null; end;
end;
$$;

insert into public.cart_items(user_id, variant_id, quantity)
select (select id from qa_cart_users where label = 'customer-a'), variant_id, quantity
from (values ('qa-cart-b', 1), ('qa-cart-sold-out', 1), ('qa-cart-inactive', 2),
  ('qa-cart-draft', 1), ('qa-cart-archived', 1), ('qa-cart-category', 1), ('qa-cart-brand', 1)) v(variant_id, quantity);

do $$
declare cart jsonb; item jsonb; field text;
begin
  cart := public.get_my_cart();
  if jsonb_array_length(cart->'items') <> 8 or (cart->>'count')::integer <> 10 or (cart->>'total')::numeric <> 450
     or jsonb_array_length(cart->'notices') = 0 or (select count(*) from public.cart_items) <> 8 then
    raise exception 'Cart count/total/unavailable preservation failed: %', cart;
  end if;
  for item in select value from jsonb_array_elements(cart->'items') loop
    if item->>'variantId' in ('qa-cart-inactive', 'qa-cart-draft', 'qa-cart-archived', 'qa-cart-category', 'qa-cart-brand') then
      foreach field in array array['productId', 'name', 'image', 'label', 'price'] loop
        if item->field is distinct from 'null'::jsonb then raise exception 'Hidden cart field leaked: %', item; end if;
      end loop;
      if item->'available' is distinct from 'false'::jsonb or item->'stock' is distinct from '0'::jsonb then
        raise exception 'Hidden cart availability/stock leaked: %', item;
      end if;
    elsif item->>'variantId' = 'qa-cart-sold-out' then
      if item->>'name' <> 'QA cart product' or (item->>'price')::numeric <> 1000
         or item->'available' is distinct from 'false'::jsonb or item->'stock' is distinct from '0'::jsonb then
        raise exception 'Visible sold-out line lost metadata or counted as available: %', item;
      end if;
    elsif item->>'variantId' = 'qa-cart-a' then
      if item->>'productId' <> 'qa-cart-visible' or item->>'name' <> 'QA cart product'
         or item->>'image' <> '/qa-cart-variant.png' or item->>'label' <> 'Variant A'
         or (item->>'price')::numeric <> 100 or (item->>'stock')::integer <> 10
         or item->'available' is distinct from 'true'::jsonb or (item->>'quantity')::integer <> 2 then
        raise exception 'Visible variant mapping failed: %', item;
      end if;
    elsif item->>'variantId' = 'qa-cart-b' then
      if item->>'image' <> '/qa-cart-product.png' or item->'available' is distinct from 'true'::jsonb then
        raise exception 'Product image fallback/availability failed: %', item;
      end if;
    else raise exception 'Unexpected cart item: %', item;
    end if;
  end loop;
end;
$$;
reset role;

-- Reads must show current price/stock, without shrinking quantities or deleting hidden rows.
update public.product_variants set price = 300, stock = 1 where id = 'qa-cart-a';
set local role authenticated;
do $$
declare cart jsonb; item jsonb;
begin
  cart := public.get_my_cart();
  select value into item from jsonb_array_elements(cart->'items') where value->>'variantId' = 'qa-cart-a';
  if (cart->>'count')::integer <> 10 or (cart->>'total')::numeric <> 250
     or (item->>'quantity')::integer <> 2 or (item->>'price')::numeric <> 300
     or (item->>'stock')::integer <> 1 or item->'available' is distinct from 'false'::jsonb
     or not exists (select 1 from public.cart_items where variant_id = 'qa-cart-a' and quantity = 2)
     or (select count(*) from public.cart_items) <> 8 then raise exception 'Cart read normalized or used stale catalog'; end if;
end;
$$;
reset role;
update public.product_variants set price = 100, stock = 10 where id = 'qa-cart-a';

set local role authenticated;
do $$
declare result jsonb;
begin
  result := public.merge_guest_cart((select id from qa_cart_requests where label = 'first'),
    '[{"variantId":"qa-cart-b","quantity":2},{"variantId":"qa-cart-a","quantity":1.0},{"variantId":"qa-cart-b","quantity":1}]');
  if result->>'requestId' <> (select id::text from qa_cart_requests where label = 'first')
     or result->'replayed' is distinct from 'false'::jsonb or (result->>'count')::integer <> 14
     or (result->>'total')::numeric <> 1300
     or not exists (select 1 from public.cart_items where variant_id = 'qa-cart-a' and quantity = 3)
     or not exists (select 1 from public.cart_items where variant_id = 'qa-cart-b' and quantity = 4)
     or (select count(*) from public.cart_items) <> 8 then raise exception 'Duplicate merge/addition failed: %', result; end if;
  update public.cart_items set quantity = 4 where variant_id = 'qa-cart-a';
end;
$$;
reset role;

do $$
begin
  if not exists (
    select 1 from private.cart_merge_requests m join qa_cart_users u on u.id = m.user_id
      join qa_cart_requests r on r.id = m.request_id
    where u.label = 'customer-a' and r.label = 'first'
      and m.payload = '[{"variantId":"qa-cart-a","quantity":1},{"variantId":"qa-cart-b","quantity":3}]'::jsonb
      and m.created_at is not null
  ) then raise exception 'Merge receipt not canonical or not persisted'; end if;
end;
$$;

update public.product_variants set price = 150, stock = 6 where id = 'qa-cart-a';
update public.product_variants set active = false where id = 'qa-cart-b';
set local role authenticated;
do $$
declare result jsonb; item jsonb; before_cart jsonb;
begin
  result := public.merge_guest_cart((select id from qa_cart_requests where label = 'first'),
    '[{"variantId":"qa-cart-b","quantity":1},{"variantId":"qa-cart-a","quantity":1},{"variantId":"qa-cart-b","quantity":2}]');
  select value into item from jsonb_array_elements(result->'items') where value->>'variantId' = 'qa-cart-b';
  if result->'replayed' is distinct from 'true'::jsonb or (result->>'count')::integer <> 15
     or (result->>'total')::numeric <> 600 or item->'price' is distinct from 'null'::jsonb
     or not exists (select 1 from public.cart_items where variant_id = 'qa-cart-a' and quantity = 4)
     or not exists (select 1 from public.cart_items where variant_id = 'qa-cart-b' and quantity = 4) then
    raise exception 'Replay remerged payload or failed to return current cart: %', result;
  end if;
  before_cart := public.get_my_cart();
  begin
    perform public.merge_guest_cart((select id from qa_cart_requests where label = 'first'),
      '[{"variantId":"qa-cart-a","quantity":2},{"variantId":"qa-cart-b","quantity":3}]');
    raise exception 'Same request ID accepted different normalized payload';
  exception when invalid_parameter_value then
    if position('REQUEST_ID_REUSED' in sqlerrm) = 0 then raise exception 'Wrong request conflict error: %', sqlerrm; end if;
  end;
  if public.get_my_cart() is distinct from before_cart then raise exception 'Conflict changed cart'; end if;
end;
$$;
reset role;
update public.product_variants set price = 100, stock = 10 where id = 'qa-cart-a';
update public.product_variants set active = true where id = 'qa-cart-b';

set local role authenticated;
do $$
declare result jsonb; before_cart jsonb; request_id uuid; payload jsonb;
begin
  result := public.merge_guest_cart((select id from qa_cart_requests where label = 'skip-clamp'),
    '[{"variantId":"qa-cart-a","quantity":20},{"variantId":"qa-cart-b","quantity":20},
      {"variantId":"qa-cart-unknown","quantity":1},{"variantId":"qa-cart-sold-out","quantity":1},
      {"variantId":"qa-cart-inactive","quantity":1},{"variantId":"qa-cart-draft","quantity":1},
      {"variantId":"qa-cart-archived","quantity":1},{"variantId":"qa-cart-category","quantity":1},
      {"variantId":"qa-cart-brand","quantity":1},{"variantId":"qa-cart-cap","quantity":999}]');
  if result->'replayed' is distinct from 'false'::jsonb or (result->>'count')::integer <> 1021
     or (result->>'total')::numeric <> 3249 or jsonb_array_length(result->'notices') = 0
     or not exists (select 1 from public.cart_items where variant_id = 'qa-cart-a' and quantity = 10)
     or not exists (select 1 from public.cart_items where variant_id = 'qa-cart-b' and quantity = 5)
     or not exists (select 1 from public.cart_items where variant_id = 'qa-cart-cap' and quantity = 999)
     or not exists (select 1 from public.cart_items where variant_id = 'qa-cart-inactive' and quantity = 2)
     or not exists (select 1 from public.cart_items where variant_id = 'qa-cart-sold-out' and quantity = 1)
     or (select count(*) from public.cart_items) <> 9 then raise exception 'Merge skip/clamp/preservation failed: %', result; end if;
  result := public.merge_guest_cart((select id from qa_cart_requests where label = 'cap'), '[{"variantId":"qa-cart-cap","quantity":1}]');
  if jsonb_array_length(result->'notices') = 0
     or not exists (select 1 from public.cart_items where variant_id = 'qa-cart-cap' and quantity = 999) then
    raise exception 'Existing cart quantity exceeded 999';
  end if;
  update public.cart_items set quantity = 20 where variant_id = 'qa-cart-a';
  before_cart := public.get_my_cart();
  result := public.merge_guest_cart((select id from qa_cart_requests where label = 'empty'), '[]');
  if result->'replayed' is distinct from 'false'::jsonb
     or (result - 'requestId' - 'replayed') is distinct from before_cart then raise exception 'Empty merge normalized existing cart'; end if;
  result := public.merge_guest_cart((select id from qa_cart_requests where label = 'empty'), '[]');
  if result->'replayed' is distinct from 'true'::jsonb then raise exception 'Empty merge retry not recognized'; end if;

  -- Reject the whole payload before persisting a receipt or changing any line.
  foreach payload in array array[
    null::jsonb, 'null'::jsonb, '{}'::jsonb, 'true'::jsonb, '1'::jsonb, '"text"'::jsonb,
    '[null]'::jsonb, '[1]'::jsonb, '[[]]'::jsonb, '[{}]'::jsonb,
    '[{"variantId":"qa-cart-a"}]'::jsonb, '[{"quantity":1}]'::jsonb,
    '[{"variantId":null,"quantity":1}]'::jsonb, '[{"variantId":1,"quantity":1}]'::jsonb,
    '[{"variantId":"","quantity":1}]'::jsonb, '[{"variantId":"QA-CART-A","quantity":1}]'::jsonb,
    '[{"variantId":" qa-cart-a","quantity":1}]'::jsonb, '[{"variantId":"-qa-cart-a","quantity":1}]'::jsonb,
    jsonb_build_array(jsonb_build_object('variantId', repeat('a', 101), 'quantity', 1)),
    '[{"variantId":"qa-cart-a","quantity":null}]'::jsonb,
    '[{"variantId":"qa-cart-a","quantity":"1"}]'::jsonb,
    '[{"variantId":"qa-cart-a","quantity":true}]'::jsonb,
    '[{"variantId":"qa-cart-a","quantity":[]}]'::jsonb,
    '[{"variantId":"qa-cart-a","quantity":{}}]'::jsonb,
    '[{"variantId":"qa-cart-a","quantity":0}]'::jsonb,
    '[{"variantId":"qa-cart-a","quantity":-1}]'::jsonb,
    '[{"variantId":"qa-cart-a","quantity":1000}]'::jsonb,
    '[{"variantId":"qa-cart-a","quantity":1.5}]'::jsonb,
    '[{"variantId":"qa-cart-a","quantity":1e100}]'::jsonb,
    '[{"variantId":"qa-cart-a","quantity":999},{"variantId":"qa-cart-a","quantity":1}]'::jsonb,
    '[{"variantId":"qa-cart-a","quantity":1,"price":1}]'::jsonb,
    '[{"variantId":"qa-cart-a","quantity":1,"userId":"fake"}]'::jsonb,
    '[{"variantId":"qa-cart-a","quantity":1},{"variantId":"qa-cart-b","quantity":0}]'::jsonb,
    (select jsonb_agg(jsonb_build_object('variantId', 'qa-cart-a', 'quantity', 1)) from generate_series(1, 101)),
    jsonb_build_array(jsonb_build_object('variantId', 'qa-cart-a', 'quantity', 1, 'extra', repeat('x', 32768)))
  ] loop
    request_id := gen_random_uuid();
    insert into qa_cart_invalid_requests(id) values (request_id);
    begin
      perform public.merge_guest_cart(request_id, payload);
      raise exception 'Malformed merge payload accepted: %', left(payload::text, 300);
    exception when invalid_parameter_value then null; end;
    if public.get_my_cart() is distinct from before_cart then raise exception 'Malformed merge changed cart'; end if;
  end loop;
  begin
    perform public.merge_guest_cart(null, '[]');
    raise exception 'Null merge request ID accepted';
  exception when invalid_parameter_value then null; end;
end;
$$;
reset role;

do $$
begin
  if exists (select 1 from private.cart_merge_requests m join qa_cart_invalid_requests q on q.id = m.request_id) then
    raise exception 'Rejected merge left a receipt';
  end if;
  if exists (
    select 1 from public.product_variants v join qa_cart_stock s on s.id = v.id where v.stock <> s.stock
  ) then raise exception 'Cart reserved or mutated inventory'; end if;
  if (select quantity from public.cart_items where user_id = (select id from qa_cart_users where label = 'customer-b') and variant_id = 'qa-cart-a') <> 1 then
    raise exception 'Customer A operations mutated customer B cart';
  end if;
end;
$$;

select set_config('request.jwt.claims', jsonb_build_object(
  'sub', (select id from qa_cart_users where label = 'customer-b'), 'role', 'authenticated'
)::text, true);
set local role authenticated;
do $$
declare result jsonb; payload jsonb;
begin
  if (select count(*) from public.cart_items) <> 1 or (public.get_my_cart()->>'count')::integer <> 1 then
    raise exception 'Customer B cart isolation failed';
  end if;
  result := public.merge_guest_cart((select id from qa_cart_requests where label = 'first'), '[{"variantId":"qa-cart-a","quantity":1}]');
  if result->'replayed' is distinct from 'false'::jsonb or (result->>'count')::integer <> 2 then
    raise exception 'Request ID not scoped to authenticated owner';
  end if;
  select jsonb_agg(jsonb_build_object('variantId', 'qa-cart-a', 'quantity', 1)) into payload from generate_series(1, 100);
  result := public.merge_guest_cart((select id from qa_cart_requests where label = 'boundary'), payload);
  if (result->>'count')::integer <> 10 then raise exception '100 input lines rejected or not aggregated/capped'; end if;
  result := private.merge_guest_cart((select id from qa_cart_requests where label = 'direct'), '[]');
  if result->'replayed' is distinct from 'false'::jsonb or (result->>'count')::integer <> 10 then
    raise exception 'Private merge helper ownership/return contract failed';
  end if;
end;
$$;
reset role;

select set_config('request.jwt.claims', jsonb_build_object(
  'sub', (select id from qa_cart_users where label = 'admin'), 'role', 'authenticated'
)::text, true);
set local role authenticated;
do $$
declare cart jsonb; item jsonb; field text; affected integer;
begin
  if not private.is_admin() or not exists (select 1 from public.products where id = 'qa-cart-draft') then
    raise exception 'Admin fixture cannot see hidden catalog directly';
  end if;
  cart := public.get_my_cart();
  if (select count(*) from public.cart_items) <> 2 or (cart->>'count')::integer <> 2 or (cart->>'total')::numeric <> 100 then
    raise exception 'Admin cart privacy/total failed';
  end if;
  select value into item from jsonb_array_elements(cart->'items') where value->>'variantId' = 'qa-cart-draft';
  foreach field in array array['productId', 'name', 'image', 'label', 'price'] loop
    if item->field is distinct from 'null'::jsonb then raise exception 'Admin cart RPC leaked hidden metadata: %', item; end if;
  end loop;
  if item->'stock' is distinct from '0'::jsonb or item->'available' is distinct from 'false'::jsonb then
    raise exception 'Admin cart RPC leaked hidden inventory';
  end if;
  update public.cart_items set quantity = 1 where user_id = (select id from qa_cart_users where label = 'customer-a');
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Admin updated another cart'; end if;
  delete from public.cart_items where user_id = (select id from qa_cart_users where label = 'customer-a');
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Admin deleted another cart'; end if;
  begin
    perform 1 from private.cart_merge_requests;
    raise exception 'Admin directly read merge receipt table';
  exception when insufficient_privilege then null; end;
end;
$$;
reset role;

-- The safe-integer limit is on the full cart total, not merely each line.
delete from public.cart_items where user_id = (select id from qa_cart_users where label = 'customer-a');
update public.product_variants set price = 900719925474099 where id = 'qa-cart-overflow';
insert into public.cart_items(user_id, variant_id, quantity)
select id, v.variant_id, v.quantity from qa_cart_users cross join (values ('qa-cart-overflow', 10), ('qa-cart-cap', 1)) v(variant_id, quantity)
where label = 'customer-a';
select set_config('request.jwt.claims', jsonb_build_object(
  'sub', (select id from qa_cart_users where label = 'customer-a'), 'role', 'authenticated'
)::text, true);
set local role authenticated;
do $$
begin
  if (public.get_my_cart()->>'total')::numeric <> 9007199254740991 then raise exception 'MAX_SAFE_INTEGER cart total rejected or rounded'; end if;
  update public.cart_items set quantity = 2 where variant_id = 'qa-cart-cap';
  begin
    perform public.get_my_cart();
    raise exception 'Unsafe sum accepted by cart read';
  exception when numeric_value_out_of_range then null; end;
  delete from public.cart_items;
  begin
    perform public.merge_guest_cart((select id from qa_cart_requests where label = 'overflow'), '[{"variantId":"qa-cart-overflow","quantity":11}]');
    raise exception 'Unsafe total accepted by merge';
  exception when numeric_value_out_of_range then null; end;
  if exists (select 1 from public.cart_items) then raise exception 'Unsafe merge left partial cart rows'; end if;
end;
$$;
reset role;
do $$
begin
  if exists (select 1 from private.cart_merge_requests where user_id = (select id from qa_cart_users where label = 'customer-a')
    and request_id = (select id from qa_cart_requests where label = 'overflow')) then raise exception 'Unsafe merge left a receipt'; end if;
end;
$$;

select set_config('request.jwt.claims', '{}', true);
set local role authenticated;
do $$
begin
  if exists (select 1 from public.cart_items) then raise exception 'Missing UID read cart rows'; end if;
  begin
    perform public.get_my_cart();
    raise exception 'Missing UID accepted by cart read';
  exception when insufficient_privilege then null; end;
  begin
    perform public.merge_guest_cart(gen_random_uuid(), '[]');
    raise exception 'Missing UID accepted by public merge';
  exception when insufficient_privilege then null; end;
  begin
    perform private.merge_guest_cart(gen_random_uuid(), '[]');
    raise exception 'Missing UID accepted by private merge';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.cart_items(user_id, variant_id, quantity)
    values ((select id from qa_cart_users where label = 'customer-b'), 'qa-cart-cap', 1);
    raise exception 'Missing UID inserted cart row';
  exception when insufficient_privilege then null; end;
end;
$$;
reset role;

set local role anon;
do $$
begin
  begin
    perform 1 from public.cart_items;
    raise exception 'Anonymous client read carts';
  exception when insufficient_privilege then null; end;
  begin
    perform public.get_my_cart();
    raise exception 'Anonymous client called cart read';
  exception when insufficient_privilege then null; end;
  begin
    perform public.merge_guest_cart(gen_random_uuid(), '[]');
    raise exception 'Anonymous client called public merge';
  exception when insufficient_privilege then null; end;
  begin
    perform private.merge_guest_cart(gen_random_uuid(), '[]');
    raise exception 'Anonymous client called private merge';
  exception when insufficient_privilege then null; end;
end;
$$;
reset role;

do $$
declare fixture_id uuid; before_created timestamptz;
begin
  select id into fixture_id from qa_cart_users where label = 'customer-b';
  begin
    insert into public.cart_items(user_id, variant_id, quantity) values (gen_random_uuid(), 'qa-cart-cap', 1);
    raise exception 'Cart accepted an owner absent from Auth';
  exception when foreign_key_violation then null; end;
  begin
    update public.cart_items set user_id = (select id from qa_cart_users where label = 'customer-a') where user_id = fixture_id;
    raise exception 'Trusted write reassigned immutable cart owner';
  exception when check_violation then null; end;
  begin
    update public.cart_items set variant_id = 'qa-cart-cap' where user_id = fixture_id;
    raise exception 'Trusted write reassigned immutable cart variant';
  exception when check_violation then null; end;
  select created_at into before_created from public.cart_items where user_id = fixture_id and variant_id = 'qa-cart-a';
  update public.cart_items set created_at = now() - interval '1 year' where user_id = fixture_id and variant_id = 'qa-cart-a';
  if (select created_at from public.cart_items where user_id = fixture_id and variant_id = 'qa-cart-a') is distinct from before_created then
    raise exception 'Trusted write changed cart created_at';
  end if;
  begin
    delete from public.product_variants where id = 'qa-cart-a';
    raise exception 'Catalog delete removed a referenced cart variant';
  exception when foreign_key_violation then null; end;
  select id into fixture_id from qa_cart_users where label = 'cascade';
  delete from auth.users where id = fixture_id;
  if exists (select 1 from public.cart_items where user_id = fixture_id)
     or exists (select 1 from private.cart_merge_requests where user_id = fixture_id) then
    raise exception 'Auth deletion did not cascade to cart and receipt';
  end if;
  if exists (select 1 from public.product_variants v join qa_cart_stock s on s.id = v.id where v.stock <> s.stock) then
    raise exception 'Cart tests mutated inventory';
  end if;
end;
$$;

rollback;
select 'PASS: cart owner/admin isolation, CRUD/grants/constraints/timestamps, live catalog privacy, canonical idempotent merge, replay/conflict/input validation, stock/quantity caps, money limit/rollback and Auth cascades; all fixtures rolled back' as result;
