-- Run as postgres on the dev database. Claims below exercise SQL roles, not real Auth sessions.
-- Every Auth/catalog/cart/order fixture is rolled back; sequence values may have gaps.
begin;

create function pg_temp.assert_true(ok boolean, message text)
returns void language plpgsql security invoker as $$
begin
  if ok is distinct from true then raise exception 'ASSERT: %', message; end if;
end;
$$;
create function pg_temp.expect_error(command text, expected_state text, expected_message text default null)
returns void language plpgsql security invoker as $$
declare actual_state text; actual_message text;
begin
  begin
    execute command;
  exception when others then
    get stacked diagnostics actual_state = returned_sqlstate, actual_message = message_text;
  end;
  if actual_state is distinct from expected_state
     or (expected_message is not null and position(expected_message in coalesce(actual_message, '')) = 0) then
    raise exception 'Expected % / %, got % / %', expected_state, expected_message, actual_state, actual_message;
  end if;
end;
$$;

create temporary table qa_order_users(label text primary key, id uuid not null unique default gen_random_uuid());
insert into qa_order_users(label) values ('a'), ('b'), ('admin'), ('unverified'), ('anonymous');
create temporary table qa_order_state(label text primary key, data jsonb not null);
insert into qa_order_state values
('items', '[{"variantId":"qa-order-a","quantity":2},{"variantId":"qa-order-b","quantity":1}]'),
('address', '{"recipientName":"QA Customer","phone":"+84912345678","addressLine":"123 QA Street","province":"Ho Chi Minh","ward":"QA Ward","note":"Call before delivery"}'),
('request', to_jsonb(gen_random_uuid()));
grant select on qa_order_users to authenticated;
grant select, insert, update on qa_order_state to authenticated;

do $$
declare target text;
begin
  foreach target in array array['public.orders', 'public.order_items', 'public.order_status_history', 'public.inventory_movements', 'private.shop_settings'] loop
    perform pg_temp.assert_true((select relrowsecurity from pg_class where oid = target::regclass), target || ' RLS missing');
    perform pg_temp.assert_true(not has_table_privilege('anon', target, 'SELECT,INSERT,UPDATE,DELETE'), 'anon table access: ' || target);
    perform pg_temp.assert_true(not has_table_privilege('authenticated', target, 'INSERT,UPDATE,DELETE'), 'direct client DML: ' || target);
  end loop;
  perform pg_temp.assert_true(not has_column_privilege('authenticated', 'public.orders', 'request_payload', 'SELECT'), 'Request payload is exposed');
  perform pg_temp.assert_true(has_column_privilege('authenticated', 'public.orders', 'id', 'SELECT'), 'Order id cannot be selected');
  perform pg_temp.assert_true(not has_table_privilege('authenticated', 'private.shop_settings', 'SELECT'), 'Settings table exposed');
  foreach target in array array[
    'public.quote_order(jsonb,jsonb,text)', 'public.create_order(uuid,jsonb,jsonb,text,text)',
    'public.get_order(uuid)', 'public.set_order_status(uuid,text,text)', 'public.adjust_stock(text,integer,integer,text)'
  ] loop
    perform pg_temp.assert_true(not has_function_privilege('anon', target, 'EXECUTE'), 'Anon RPC: ' || target);
    perform pg_temp.assert_true(has_function_privilege('authenticated', target, 'EXECUTE'), 'Auth RPC missing: ' || target);
    perform pg_temp.assert_true(not (select prosecdef from pg_proc where oid = target::regprocedure), 'Public RPC is SECURITY DEFINER: ' || target);
  end loop;
  perform pg_temp.assert_true((select count(*) = 1 from private.shop_settings where id = 1), 'Missing singleton shop settings');
  perform pg_temp.assert_true(not exists (
    select 1 from public.product_variants v
    left join (select variant_id, sum(quantity_delta) as quantity from public.inventory_movements group by variant_id) m on m.variant_id = v.id
    where v.stock <> coalesce(m.quantity, 0)
  ), 'Existing stock is not reconciled with initial inventory ledger');
end;
$$;

insert into auth.users(id, email_confirmed_at, is_anonymous, raw_user_meta_data)
select id, case when label = 'unverified' then null else now() end, label = 'anonymous',
  '{"display_name":"QA order","role":"admin","email_verified":true}'::jsonb from qa_order_users;
insert into private.admin_users(user_id) select id from qa_order_users where label = 'admin';
insert into public.categories(id, slug, name, active) values ('qa-order', 'qa-order', 'QA order category', true);
insert into public.brands(id, slug, name, active) values ('qa-order', 'qa-order', 'QA order brand', true);
insert into public.products(id, slug, name, image_url, category_id, brand_id, status) values
('qa-order-visible', 'qa-order-visible', 'QA original product', '/qa-order-product.png', 'qa-order', 'qa-order', 'active'),
('qa-order-hidden', 'qa-order-hidden', 'QA SECRET PRODUCT', '/qa-secret.png', 'qa-order', 'qa-order', 'draft');
insert into public.product_variants(id, product_id, sku, label, price, stock, active, image_url) values
('qa-order-a', 'qa-order-visible', 'QA-ORDER-A', 'Original variant A', 100, 10, true, '/qa-order-variant.png'),
('qa-order-b', 'qa-order-visible', 'QA-ORDER-B', 'Original variant B', 250, 5, true, null),
('qa-order-sold-out', 'qa-order-visible', 'QA-ORDER-SOLD-OUT', 'Sold out', 1000, 0, true, null),
('qa-order-hidden', 'qa-order-hidden', 'QA-ORDER-HIDDEN', 'QA SECRET VARIANT', 1000, 8, true, '/qa-secret.png'),
('qa-order-overflow', 'qa-order-visible', 'QA-ORDER-OVERFLOW', 'Overflow', 999999999999999, 999, true, null);
set constraints all immediate;
insert into public.cart_items(user_id, variant_id, quantity)
select id, 'qa-order-a', case when label = 'a' then 5 else 4 end from qa_order_users where label in ('a', 'b');
insert into public.cart_items(user_id, variant_id, quantity)
select id, variant_id, 1 from qa_order_users cross join (values ('qa-order-b'), ('qa-order-sold-out')) v(variant_id) where label = 'a';
insert into qa_order_state select 'fee', to_jsonb(shipping_fee) from private.shop_settings where id = 1;

select set_config('request.jwt.claims', jsonb_build_object(
  'sub', (select id from qa_order_users where label = 'a'), 'role', 'authenticated',
  'user_metadata', jsonb_build_object('role', 'admin', 'email_verified', true),
  'app_metadata', jsonb_build_object('role', 'admin')
)::text, true);
set local role authenticated;

do $$
declare items jsonb; address jsonb; quote jsonb; reordered jsonb; bad jsonb; fee numeric; too_many jsonb;
begin
  select data into items from qa_order_state where label = 'items';
  select data into address from qa_order_state where label = 'address';
  select (data #>> '{}')::numeric into fee from qa_order_state where label = 'fee';
  quote := public.quote_order(items, address, 'cod');
  perform pg_temp.assert_true(jsonb_array_length(quote->'items') = 2 and quote->'issues' = '[]'::jsonb, 'Valid quote shape');
  perform pg_temp.assert_true((quote->>'subtotal')::numeric = 450 and (quote->>'shippingFee')::numeric = fee and (quote->>'total')::numeric = 450 + fee, 'Server quote money');
  perform pg_temp.assert_true(length(quote->>'fingerprint') > 0, 'Missing quote fingerprint');
  reordered := public.quote_order('[{"variantId":"qa-order-b","quantity":1},{"variantId":"qa-order-a","quantity":1.0},{"variantId":"qa-order-a","quantity":1}]', address, 'cod');
  perform pg_temp.assert_true(reordered->>'fingerprint' = quote->>'fingerprint', 'Quote fingerprint depends on duplicate grouping/order');
  insert into qa_order_state values ('quote', quote);
  perform pg_temp.assert_true((select stock = 10 from public.product_variants where id = 'qa-order-a'), 'Quote reserved stock');
  perform pg_temp.assert_true(not exists (select 1 from public.orders), 'Quote created an order');

  foreach bad in array array[
    'null'::jsonb, '{}'::jsonb, '[]'::jsonb, '[null]'::jsonb,
    '[{"variantId":"qa-order-a","quantity":0}]'::jsonb,
    '[{"variantId":"qa-order-a","quantity":1000}]'::jsonb,
    '[{"variantId":"qa-order-a","quantity":1.5}]'::jsonb,
    '[{"variantId":"qa-order-a","quantity":"1"}]'::jsonb,
    '[{"variantId":"qa-order-a","quantity":null}]'::jsonb,
    '[{"variantId":"qa-order-a","quantity":1,"price":1}]'::jsonb,
    '[{"variantId":"qa-order-a","quantity":1,"userId":"spoof"}]'::jsonb,
    '[{"variantId":"QA-INVALID","quantity":1}]'::jsonb,
    '[{"variantId":"qa-order-a","quantity":999},{"variantId":"qa-order-a","quantity":1}]'::jsonb
  ] loop
    perform pg_temp.expect_error(format('select public.quote_order(%L::jsonb, %L::jsonb, ''cod'')', bad, address), '22023');
  end loop;
  select jsonb_agg(jsonb_build_object('variantId', 'qa-order-a', 'quantity', 1)) into too_many from generate_series(1, 101);
  perform pg_temp.expect_error(format('select public.quote_order(%L::jsonb, %L::jsonb, ''cod'')', too_many, address), '22023');
  quote := public.quote_order(too_many - 100, address, 'cod');
  perform pg_temp.assert_true((quote->'items'->0->>'quantity')::integer = 100, '100 raw lines should normalize successfully');
  select jsonb_agg(jsonb_build_object('variantId', 'qa-order-a', 'quantity', ('1.' || repeat('0', 400))::numeric))
    into too_many from generate_series(1, 100);
  perform pg_temp.expect_error(format('select public.quote_order(%L::jsonb, %L::jsonb, ''cod'')', too_many, address), '22023');
  perform pg_temp.expect_error(format('select public.quote_order(%L::jsonb, %L::jsonb, ''card'')', items, address), '22023');
  foreach bad in array array[
    address || '{"recipientName":"X"}', address || '{"phone":"not-a-phone"}', address || '{"addressLine":"X"}',
    address || '{"province":"X"}', address || '{"userId":"spoof"}', address || jsonb_build_object('note', repeat('x', 501)),
    address || jsonb_build_object('ward', repeat('x', 81)), address || '{"recipientName":3}'
  ] loop
    perform pg_temp.expect_error(format('select public.quote_order(%L::jsonb, %L::jsonb, ''cod'')', items, bad), '22023');
  end loop;
  quote := public.quote_order('[{"variantId":"qa-order-hidden","quantity":1},{"variantId":"qa-order-sold-out","quantity":1},{"variantId":"qa-order-unknown","quantity":1}]', address, 'cod');
  perform pg_temp.assert_true(jsonb_array_length(quote->'issues') = 3, 'Unavailable quote must identify every invalid line');
  perform pg_temp.assert_true(position('SECRET' in quote::text) = 0 and position('/qa-secret.png' in quote::text) = 0, 'Quote leaked hidden catalog');
  perform pg_temp.expect_error(format('select public.quote_order(%L::jsonb, %L::jsonb, ''cod'')', '[{"variantId":"qa-order-overflow","quantity":2}]', address), '22003');
end;
$$;
reset role;

-- User-editable metadata and a valid-looking JWT cannot turn an unverified/anonymous Auth row into a buyer.
do $$
declare target uuid;
begin
  for target in select id from qa_order_users where label in ('unverified', 'anonymous') loop
    perform set_config('request.jwt.claims', jsonb_build_object('sub', target, 'role', 'authenticated', 'is_anonymous', false, 'email_verified', true)::text, true);
    set local role authenticated;
    perform pg_temp.expect_error(format('select public.create_order(%L::uuid, %L::jsonb, %L::jsonb, %L, ''cod'')',
      gen_random_uuid(), (select data from qa_order_state where label = 'items'), (select data from qa_order_state where label = 'address'),
      (select data->>'fingerprint' from qa_order_state where label = 'quote')), '42501');
    reset role;
  end loop;
end;
$$;

select set_config('request.jwt.claims', jsonb_build_object('sub', (select id from qa_order_users where label = 'a'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
declare created jsonb; old_quote jsonb; address jsonb; request_id uuid;
begin
  select data into old_quote from qa_order_state where label = 'quote';
  select data into address from qa_order_state where label = 'address';
  select (data #>> '{}')::uuid into request_id from qa_order_state where label = 'request';
  created := public.create_order(request_id,
    '[{"variantId":"qa-order-b","quantity":1},{"variantId":"qa-order-a","quantity":1},{"variantId":"qa-order-a","quantity":1.0}]',
    address, old_quote->>'fingerprint', 'cod');
  perform pg_temp.assert_true(created->>'id' is not null and created->>'code' is not null and created->>'status' = 'pending', 'Create order identity/status');
  perform pg_temp.assert_true((created->>'replayed')::boolean = false, 'New order marked replay');
  perform pg_temp.assert_true(not (created ? 'request_payload') and not (created ? 'requestPayload'), 'Create exposed request payload');
  perform pg_temp.assert_true(jsonb_array_length(created->'items') = 2, 'Create did not group duplicate lines');
  insert into qa_order_state values ('order-a', created);
  perform pg_temp.assert_true((select quantity = 3 from public.cart_items where variant_id = 'qa-order-a'), 'Checkout did not subtract bought quantity');
  perform pg_temp.assert_true(not exists (select 1 from public.cart_items where variant_id = 'qa-order-b'), 'Fully purchased cart line remains');
  perform pg_temp.assert_true((select quantity = 1 from public.cart_items where variant_id = 'qa-order-sold-out'), 'Checkout cleared unrelated cart line');
  perform pg_temp.expect_error('select request_payload from public.orders', '42501');
  perform pg_temp.expect_error(format('select public.set_order_status(%L::uuid, ''cancelled'', ''Spoofed admin'')', created->>'id'), '42501');
  perform pg_temp.expect_error('select public.adjust_stock(''qa-order-a'', 100, 8, ''Spoofed admin'')', '42501');
  perform pg_temp.expect_error('update public.orders set total = 1', '42501');
  perform pg_temp.expect_error('delete from public.order_items', '42501');
  perform pg_temp.expect_error('delete from public.order_status_history', '42501');
  perform pg_temp.expect_error('delete from public.inventory_movements', '42501');
  perform pg_temp.expect_error('update public.product_variants set stock = 999 where id = ''qa-order-a''', '42501');
  perform pg_temp.assert_true(not exists (select 1 from public.inventory_movements), 'Customer can read inventory ledger');
end;
$$;
reset role;

do $$
declare selected_order_id uuid; buyer_id uuid;
begin
  select (data->>'id')::uuid into selected_order_id from qa_order_state where label = 'order-a';
  select id into buyer_id from qa_order_users where label = 'a';
  perform pg_temp.assert_true((select user_id = buyer_id and subtotal = 450 and total = subtotal + shipping_fee and currency = 'VND' and payment_method = 'cod' and payment_status = 'unpaid' from public.orders where id = selected_order_id), 'Stored owner/money/payment');
  perform pg_temp.assert_true((select unit_price = 100 and quantity = 2 and sku = 'QA-ORDER-A' and product_name = 'QA original product' and variant_label = 'Original variant A' and image_url = '/qa-order-variant.png' from public.order_items where order_id = selected_order_id and variant_id = 'qa-order-a'), 'Variant snapshot');
  perform pg_temp.assert_true((select image_url = '/qa-order-product.png' from public.order_items where order_id = selected_order_id and variant_id = 'qa-order-b'), 'Product image fallback snapshot');
  perform pg_temp.assert_true((select stock = 8 from public.product_variants where id = 'qa-order-a') and (select stock = 4 from public.product_variants where id = 'qa-order-b'), 'Order stock debit');
  perform pg_temp.assert_true((select count(*) = 2 and sum(quantity_delta) = -3 from public.inventory_movements m where m.order_id = selected_order_id and reason = 'order'), 'Order inventory debit ledger');
  perform pg_temp.assert_true((select count(*) = 1 from public.order_status_history h where h.order_id = selected_order_id and from_status is null and to_status = 'pending' and actor_id = buyer_id), 'Initial order history');
  perform pg_temp.assert_true((select quantity = 4 from public.cart_items where user_id = (select id from qa_order_users where label = 'b') and variant_id = 'qa-order-a'), 'Checkout touched another customer cart');
end;
$$;

select set_config('request.jwt.claims', jsonb_build_object('sub', (select id from qa_order_users where label = 'b'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
declare other_id uuid; created jsonb; quote jsonb; items jsonb := '[{"variantId":"qa-order-b","quantity":1}]'; address jsonb;
begin
  select (data->>'id')::uuid into other_id from qa_order_state where label = 'order-a';
  select data into address from qa_order_state where label = 'address';
  perform pg_temp.assert_true(not exists (select 1 from public.orders) and not exists (select 1 from public.order_items) and not exists (select 1 from public.order_status_history), 'Customer B sees customer A order rows');
  perform pg_temp.expect_error(format('select public.get_order(%L::uuid)', other_id), 'P0002', 'NOT_FOUND');
  perform pg_temp.expect_error(format('select public.get_order(%L::uuid)', gen_random_uuid()), 'P0002', 'NOT_FOUND');
  quote := public.quote_order(items, address, 'cod');
  created := public.create_order((select (data #>> '{}')::uuid from qa_order_state where label = 'request'), items, address, quote->>'fingerprint', 'cod');
  perform pg_temp.assert_true((created->>'id')::uuid <> other_id and (created->>'replayed')::boolean = false, 'Request ID is not scoped to its owner');
  perform pg_temp.assert_true((select count(*) = 1 from public.orders), 'Customer B order ownership visibility');
  insert into qa_order_state values ('order-b', created);
end;
$$;
reset role;

-- Retry must return the old order before rechecking the current price/availability or cleaning cart again.
update public.product_variants set price = 150, sku = 'QA-ORDER-A-CHANGED', label = 'Changed variant A' where id = 'qa-order-a';
update public.products set name = 'Changed product', image_url = '/qa-changed.png', status = 'draft' where id = 'qa-order-visible';
update public.cart_items set quantity = 7 where user_id = (select id from qa_order_users where label = 'a') and variant_id = 'qa-order-a';
select set_config('request.jwt.claims', jsonb_build_object('sub', (select id from qa_order_users where label = 'a'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
declare replay jsonb; request_id uuid; items jsonb; address jsonb; fingerprint text; original jsonb;
begin
  select (data #>> '{}')::uuid into request_id from qa_order_state where label = 'request';
  select data into items from qa_order_state where label = 'items';
  select data into address from qa_order_state where label = 'address';
  select data->>'fingerprint' into fingerprint from qa_order_state where label = 'quote';
  select data into original from qa_order_state where label = 'order-a';
  replay := public.create_order(request_id, items, address, fingerprint, 'cod');
  perform pg_temp.assert_true(replay->>'id' = original->>'id' and (replay->>'replayed')::boolean = true, 'Same request did not replay old order');
  perform pg_temp.assert_true(replay->'items' = original->'items', 'Order snapshots followed changed catalog');
  perform pg_temp.assert_true((select quantity = 7 from public.cart_items where variant_id = 'qa-order-a'), 'Replay subtracted cart a second time');
  perform pg_temp.assert_true((select count(*) = 1 from public.orders), 'Replay created a duplicate order');
  perform pg_temp.assert_true(public.get_order((original->>'id')::uuid)->'items' = original->'items', 'Detail lost hidden catalog snapshot');
  perform pg_temp.expect_error(format('select public.create_order(%L::uuid, %L::jsonb, %L::jsonb, %L, ''cod'')', request_id,
    '[{"variantId":"qa-order-a","quantity":1}]', address, fingerprint), '22023', 'REQUEST_CONFLICT');
  perform pg_temp.expect_error(format('select public.create_order(%L::uuid, %L::jsonb, %L::jsonb, %L, ''cod'')', request_id,
    items, address || '{"addressLine":"999 Changed Street"}', fingerprint), '22023', 'REQUEST_CONFLICT');
end;
$$;
reset role;
update public.products set status = 'active' where id = 'qa-order-visible';

select set_config('request.jwt.claims', jsonb_build_object('sub', (select id from qa_order_users where label = 'a'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
declare items jsonb; address jsonb; quote jsonb; error_detail text; actual_message text; caught boolean := false;
begin
  select data into items from qa_order_state where label = 'items';
  select data into address from qa_order_state where label = 'address';
  begin
    perform public.create_order(gen_random_uuid(), items, address, (select data->>'fingerprint' from qa_order_state where label = 'quote'), 'cod');
  exception when sqlstate 'P0001' then
    get stacked diagnostics error_detail = pg_exception_detail, actual_message = message_text;
    perform pg_temp.assert_true(position('PRICE_CHANGED' in actual_message) > 0, 'Wrong stale-price error');
    perform pg_temp.assert_true(length(error_detail) > 0 and jsonb_typeof(error_detail::jsonb) = 'object', 'PRICE_CHANGED lacks fresh quote detail');
    caught := true;
  end;
  perform pg_temp.assert_true(caught, 'Stale quote accepted');
  quote := public.quote_order('[{"variantId":"qa-order-sold-out","quantity":1}]', address, 'cod');
  perform pg_temp.expect_error(format('select public.create_order(%L::uuid, %L::jsonb, %L::jsonb, %L, ''cod'')', gen_random_uuid(),
    '[{"variantId":"qa-order-sold-out","quantity":1}]', address, quote->>'fingerprint'), 'P0001', 'OUT_OF_STOCK');
  perform pg_temp.assert_true((select count(*) = 1 from public.orders) and (select quantity = 7 from public.cart_items where variant_id = 'qa-order-a'), 'Failed checkout left order/cart writes');
end;
$$;
reset role;

-- An overflow while returning stock must leave the order, ledger and history untouched.
update public.product_variants set stock = 2147483647 where id = 'qa-order-b';
select set_config('request.jwt.claims', jsonb_build_object('sub', (select id from qa_order_users where label = 'admin'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
declare cancelled_id uuid;
begin
  select (data->>'id')::uuid into cancelled_id from qa_order_state where label = 'order-b';
  perform pg_temp.expect_error(format('select public.set_order_status(%L::uuid, ''cancelled'', ''Overflow check'')', cancelled_id), '22003');
  perform pg_temp.assert_true((select status = 'pending' and payment_status = 'unpaid' from public.orders where id = cancelled_id), 'Failed cancellation changed order');
  perform pg_temp.assert_true(not exists (select 1 from public.inventory_movements where order_id = cancelled_id and reason = 'cancel'), 'Failed cancellation left ledger');
  perform pg_temp.assert_true((select count(*) = 1 from public.order_status_history where order_id = cancelled_id), 'Failed cancellation left history');
end;
$$;
reset role;
update public.product_variants set stock = 3 where id = 'qa-order-b';

select set_config('request.jwt.claims', jsonb_build_object('sub', (select id from qa_order_users where label = 'admin'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
declare first_id uuid; cancelled_id uuid; quote jsonb; before_count bigint;
begin
  select (data->>'id')::uuid into first_id from qa_order_state where label = 'order-a';
  select (data->>'id')::uuid into cancelled_id from qa_order_state where label = 'order-b';
  perform pg_temp.assert_true((select count(*) = 2 from public.orders where id in (first_id, cancelled_id)), 'Admin cannot see both orders');
  perform pg_temp.assert_true((select count(*) = 3 from public.order_items where order_id in (first_id, cancelled_id))
    and (select count(*) = 2 from public.order_status_history where order_id in (first_id, cancelled_id)), 'Admin cannot read item/history rows');
  perform pg_temp.assert_true(public.get_order(first_id)->>'id' = first_id::text, 'Admin detail lookup');
  perform pg_temp.assert_true(exists (select 1 from public.inventory_movements where reason = 'order'), 'Admin cannot read ledger');
  perform pg_temp.expect_error('select * from private.shop_settings', '42501');
  perform pg_temp.expect_error('select request_payload from public.orders', '42501');
  perform pg_temp.expect_error('update public.orders set status = ''delivered''', '42501');
  quote := public.quote_order('[{"variantId":"qa-order-hidden","quantity":1}]', (select data from qa_order_state where label = 'address'), 'cod');
  perform pg_temp.assert_true(position('SECRET' in quote::text) = 0 and jsonb_array_length(quote->'issues') = 1, 'Admin checkout can buy/expose hidden product');

  perform public.set_order_status(first_id, 'confirmed', null);
  select count(*) into before_count from public.order_status_history where order_id = first_id;
  perform public.set_order_status(first_id, 'confirmed', null);
  perform pg_temp.assert_true((select count(*) = before_count from public.order_status_history where order_id = first_id), 'Repeated status created duplicate history');
  perform public.set_order_status(first_id, 'shipping', 'Handed to carrier');
  perform pg_temp.expect_error(format('select public.set_order_status(%L::uuid, ''cancelled'', ''Too late'')', first_id), '22023');
  perform public.set_order_status(first_id, 'delivered', 'Delivery confirmed');
  perform pg_temp.assert_true((select status = 'delivered' and payment_status = 'paid' from public.orders where id = first_id), 'Delivered COD not atomically paid');
  perform pg_temp.expect_error(format('select public.set_order_status(%L::uuid, ''pending'', null)', first_id), '22023');
  perform pg_temp.assert_true((select stock = 8 from public.product_variants where id = 'qa-order-a'), 'Delivery debited stock again');
  perform pg_temp.expect_error(format('select public.set_order_status(%L::uuid, ''cancelled'', null)', cancelled_id), '22023');
  perform public.set_order_status(cancelled_id, 'cancelled', 'Customer requested cancellation');
  perform public.set_order_status(cancelled_id, 'cancelled', 'Repeated delivery of request');
  perform pg_temp.assert_true((select stock = 4 from public.product_variants where id = 'qa-order-b'), 'Cancellation did not restore exactly once');
  perform pg_temp.assert_true((select status = 'cancelled' and payment_status = 'unpaid' from public.orders where id = cancelled_id), 'Cancelled COD payment');
  perform pg_temp.assert_true((select count(*) = 1 and sum(quantity_delta) = 1 from public.inventory_movements where order_id = cancelled_id and reason = 'cancel'), 'Cancellation ledger duplicate/missing');
  perform pg_temp.assert_true((select count(*) = 2 from public.order_status_history where order_id = cancelled_id), 'Cancellation history duplicate/missing');
  perform pg_temp.expect_error(format('select public.set_order_status(%L::uuid, ''confirmed'', null)', cancelled_id), '22023');

  perform public.adjust_stock('qa-order-a', 11, 8, 'Physical stock recount');
  perform pg_temp.assert_true((select stock = 11 from public.product_variants where id = 'qa-order-a'), 'Admin adjustment stock');
  perform pg_temp.assert_true((select count(*) = 1 and sum(quantity_delta) = 3 from public.inventory_movements where variant_id = 'qa-order-a' and reason = 'adjustment'), 'Adjustment ledger delta');
  perform pg_temp.expect_error('select public.adjust_stock(''qa-order-a'', 12, 8, ''Stale recount'')', '40001', 'CONFLICT');
  perform pg_temp.expect_error('select public.adjust_stock(''qa-order-a'', -1, 11, ''Negative target'')', '22023');
end;
$$;
reset role;

-- Relational constraints preserve order snapshots and financial history even for trusted SQL writes.
do $$
declare first_id uuid;
begin
  select (data->>'id')::uuid into first_id from qa_order_state where label = 'order-a';
  perform pg_temp.expect_error(format('delete from auth.users where id = %L::uuid', (select id from qa_order_users where label = 'a')), '23503');
  perform pg_temp.expect_error('delete from public.product_variants where id = ''qa-order-a''', '23503');
  perform pg_temp.expect_error(format('delete from public.orders where id = %L::uuid', first_id), '23503');
  perform pg_temp.expect_error('update private.shop_settings set shipping_fee = ''NaN''::numeric where id = 1', '23514');
  perform pg_temp.expect_error('update private.shop_settings set shipping_fee = -1 where id = 1', '23514');
  perform pg_temp.expect_error('update public.inventory_movements set quantity_delta = 0 where variant_id = ''qa-order-a''', '23514');
  perform pg_temp.assert_true((select count(*) = 2 from public.orders where user_id in (select id from qa_order_users)), 'Failures created extra orders');
  perform pg_temp.assert_true((select count(*) = 3 from public.inventory_movements where reason = 'order' and order_id in (select id from public.orders where user_id in (select id from qa_order_users))), 'Retry/transition wrote additional order debits');
  perform pg_temp.assert_true((select stock = 11 from public.product_variants where id = 'qa-order-a'), 'Failed adjustment changed stock');
end;
$$;

select set_config('request.jwt.claims', '{}', true);
set local role anon;
select pg_temp.expect_error('select id from public.orders', '42501');
select pg_temp.expect_error('select * from public.order_items', '42501');
select pg_temp.expect_error('select * from public.order_status_history', '42501');
select pg_temp.expect_error('select * from public.inventory_movements', '42501');
select pg_temp.expect_error('select public.quote_order(''[]''::jsonb, null, ''cod'')', '42501');
select pg_temp.expect_error('select public.get_order(gen_random_uuid())', '42501');
reset role;
set local role authenticated;
select pg_temp.expect_error('select public.quote_order(''[]''::jsonb, null, ''cod'')', '42501');
select pg_temp.expect_error('select public.get_order(gen_random_uuid())', '42501');
reset role;

rollback;
select 'PASS: orders/RLS/grants, trusted buyer verification, quote validation/privacy/money, atomic snapshots/stock/cart, idempotency/conflicts, status/payment/cancellation, inventory adjustments, and history constraints; all fixtures rolled back' as result;
