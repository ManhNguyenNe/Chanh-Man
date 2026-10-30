-- Run each @step separately as postgres against the dev database.
-- Run each a/b pair concurrently, then its assertion. Always finish with cleanup.
-- These committed fixtures test real locking; claims simulate Auth and do not send email.

-- @step setup
begin;
do $$
begin
  if exists (select 1 from auth.users where id in (
      'b4000000-0000-4000-8000-00000000000a', 'b4000000-0000-4000-8000-00000000000b', 'b4000000-0000-4000-8000-00000000000c'))
    or exists (select 1 from public.products where id = 'qa-be4-concurrency')
    or exists (select 1 from public.product_variants where id in ('qa-be4-concurrency-a', 'qa-be4-concurrency-b'))
    or exists (select 1 from public.categories where id = 'qa-be4-concurrency')
    or exists (select 1 from public.brands where id = 'qa-be4-concurrency') then
    raise exception 'Concurrency fixture IDs already exist; inspect before running setup';
  end if;
end;
$$;
insert into auth.users(id, email_confirmed_at, is_anonymous, raw_user_meta_data) values
('b4000000-0000-4000-8000-00000000000a', now(), false, '{"display_name":"QA concurrency A","qa_fixture":"be4-concurrency-v1"}'),
('b4000000-0000-4000-8000-00000000000b', now(), false, '{"display_name":"QA concurrency B","qa_fixture":"be4-concurrency-v1"}'),
('b4000000-0000-4000-8000-00000000000c', now(), false, '{"display_name":"QA concurrency admin","qa_fixture":"be4-concurrency-v1"}');
insert into private.admin_users(user_id) values ('b4000000-0000-4000-8000-00000000000c');
insert into public.categories(id, slug, name, active) values ('qa-be4-concurrency', 'qa-be4-concurrency', 'QA concurrency', true);
insert into public.brands(id, slug, name, active) values ('qa-be4-concurrency', 'qa-be4-concurrency', 'QA concurrency', true);
insert into public.products(id, slug, name, image_url, category_id, brand_id, status)
values ('qa-be4-concurrency', 'qa-be4-concurrency', 'QA concurrency', '/qa-concurrency.png', 'qa-be4-concurrency', 'qa-be4-concurrency', 'active');
insert into public.product_variants(id, product_id, sku, label, price, stock, active) values
('qa-be4-concurrency-a', 'qa-be4-concurrency', 'QA-BE4-CONCURRENCY-A', 'Retry stock', 100, 3, true),
('qa-be4-concurrency-b', 'qa-be4-concurrency', 'QA-BE4-CONCURRENCY-B', 'Last item', 100, 1, true);
insert into public.inventory_movements(variant_id, quantity_delta, reason, note) values
('qa-be4-concurrency-a', 3, 'initial', 'BE-4 concurrency fixture'),
('qa-be4-concurrency-b', 1, 'initial', 'BE-4 concurrency fixture');
commit;
select 'setup committed' as result;

-- @step same_a
begin;
set local request.jwt.claims = '{"sub":"b4000000-0000-4000-8000-00000000000a","role":"authenticated"}';
set local role authenticated;
do $$
declare
  items jsonb := '[{"variantId":"qa-be4-concurrency-a","quantity":1}]';
  address jsonb := '{"recipientName":"QA Customer","phone":"0912345678","addressLine":"123 QA Street","province":"Ho Chi Minh"}';
  result jsonb;
begin
  result := public.create_order('b4100000-0000-4000-8000-000000000001', items, address,
    public.quote_order(items, address, 'cod')->>'fingerprint', 'cod');
  if not (result->>'replayed')::boolean then perform pg_sleep(1); end if;
end;
$$;
commit;
select 'same_a committed' as result;

-- @step same_b
begin;
set local request.jwt.claims = '{"sub":"b4000000-0000-4000-8000-00000000000a","role":"authenticated"}';
set local role authenticated;
do $$
declare
  items jsonb := '[{"variantId":"qa-be4-concurrency-a","quantity":1}]';
  address jsonb := '{"recipientName":"QA Customer","phone":"0912345678","addressLine":"123 QA Street","province":"Ho Chi Minh"}';
  result jsonb;
begin
  result := public.create_order('b4100000-0000-4000-8000-000000000001', items, address,
    public.quote_order(items, address, 'cod')->>'fingerprint', 'cod');
  if not (result->>'replayed')::boolean then perform pg_sleep(1); end if;
end;
$$;
commit;
select 'same_b committed' as result;

-- @step assert_same
do $$
begin
  if (select count(*) from public.orders where user_id = 'b4000000-0000-4000-8000-00000000000a'
      and request_id = 'b4100000-0000-4000-8000-000000000001') <> 1
    or (select stock from public.product_variants where id = 'qa-be4-concurrency-a') is distinct from 2
    or (select count(*) from public.inventory_movements where variant_id = 'qa-be4-concurrency-a' and reason = 'order') <> 1
    or (select sum(quantity_delta) from public.inventory_movements where variant_id = 'qa-be4-concurrency-a' and reason = 'order') is distinct from -1 then
    raise exception 'Concurrent same-request checkout duplicated order or stock debit';
  end if;
end;
$$;
select 'PASS: same request created one order and debited stock once' as result;

-- @step last_a
begin;
set local request.jwt.claims = '{"sub":"b4000000-0000-4000-8000-00000000000a","role":"authenticated"}';
set local role authenticated;
do $$
declare
  items jsonb := '[{"variantId":"qa-be4-concurrency-b","quantity":1}]';
  address jsonb := '{"recipientName":"QA Customer","phone":"0912345678","addressLine":"123 QA Street","province":"Ho Chi Minh"}';
begin
  perform public.create_order('b4200000-0000-4000-8000-00000000000a', items, address,
    public.quote_order(items, address, 'cod')->>'fingerprint', 'cod');
  perform pg_sleep(1);
exception when sqlstate 'P0001' then
  if sqlerrm <> 'OUT_OF_STOCK' then raise; end if;
end;
$$;
commit;
select 'last_a completed (success or OUT_OF_STOCK)' as result;

-- @step last_b
begin;
set local request.jwt.claims = '{"sub":"b4000000-0000-4000-8000-00000000000b","role":"authenticated"}';
set local role authenticated;
do $$
declare
  items jsonb := '[{"variantId":"qa-be4-concurrency-b","quantity":1}]';
  address jsonb := '{"recipientName":"QA Customer","phone":"0912345678","addressLine":"123 QA Street","province":"Ho Chi Minh"}';
begin
  perform public.create_order('b4200000-0000-4000-8000-00000000000b', items, address,
    public.quote_order(items, address, 'cod')->>'fingerprint', 'cod');
  perform pg_sleep(1);
exception when sqlstate 'P0001' then
  if sqlerrm <> 'OUT_OF_STOCK' then raise; end if;
end;
$$;
commit;
select 'last_b completed (success or OUT_OF_STOCK)' as result;

-- @step assert_last
do $$
begin
  if (select count(*) from public.orders where user_id in ('b4000000-0000-4000-8000-00000000000a', 'b4000000-0000-4000-8000-00000000000b')
      and request_id in ('b4200000-0000-4000-8000-00000000000a', 'b4200000-0000-4000-8000-00000000000b')) <> 1
    or (select stock from public.product_variants where id = 'qa-be4-concurrency-b') is distinct from 0
    or (select count(*) from public.inventory_movements where variant_id = 'qa-be4-concurrency-b' and reason = 'order') <> 1
    or (select sum(quantity_delta) from public.inventory_movements where variant_id = 'qa-be4-concurrency-b' and reason = 'order') is distinct from -1 then
    raise exception 'Two customers competing for last item did not produce exactly one order';
  end if;
end;
$$;
select 'PASS: only one customer purchased the last item; stock is zero' as result;

-- @step cancel_a
begin;
set local request.jwt.claims = '{"sub":"b4000000-0000-4000-8000-00000000000c","role":"authenticated"}';
set local role authenticated;
do $$
declare target uuid;
begin
  select id into strict target from public.orders where user_id = 'b4000000-0000-4000-8000-00000000000a'
    and request_id = 'b4100000-0000-4000-8000-000000000001';
  perform public.set_order_status(target, 'cancelled', 'Concurrent cancellation test');
  perform pg_sleep(1);
end;
$$;
commit;
select 'cancel_a committed' as result;

-- @step cancel_b
begin;
set local request.jwt.claims = '{"sub":"b4000000-0000-4000-8000-00000000000c","role":"authenticated"}';
set local role authenticated;
do $$
declare target uuid;
begin
  select id into strict target from public.orders where user_id = 'b4000000-0000-4000-8000-00000000000a'
    and request_id = 'b4100000-0000-4000-8000-000000000001';
  perform public.set_order_status(target, 'cancelled', 'Concurrent cancellation test');
  perform pg_sleep(1);
end;
$$;
commit;
select 'cancel_b committed' as result;

-- @step assert_cancel
do $$
declare target uuid;
begin
  select id into strict target from public.orders where user_id = 'b4000000-0000-4000-8000-00000000000a'
    and request_id = 'b4100000-0000-4000-8000-000000000001';
  if (select stock from public.product_variants where id = 'qa-be4-concurrency-a') is distinct from 3
    or (select count(*) from public.inventory_movements where order_id = target and reason = 'cancel') <> 1
    or (select sum(quantity_delta) from public.inventory_movements where order_id = target and reason = 'cancel') is distinct from 1
    or (select count(*) from public.order_status_history where order_id = target and to_status = 'cancelled') <> 1
    or not exists (select 1 from public.orders where id = target and status = 'cancelled' and payment_status = 'unpaid') then
    raise exception 'Concurrent cancellation restored stock or recorded history more than once';
  end if;
end;
$$;
select 'PASS: concurrent cancellation restored stock once and added one cancellation history' as result;

-- @step cleanup
begin;
do $$
declare
  fixture_users uuid[] := array['b4000000-0000-4000-8000-00000000000a', 'b4000000-0000-4000-8000-00000000000b', 'b4000000-0000-4000-8000-00000000000c']::uuid[];
  fixture_variants text[] := array['qa-be4-concurrency-a', 'qa-be4-concurrency-b'];
  fixture_orders uuid[];
begin
  if (select count(*) from auth.users where id = any(fixture_users)) <> 3
    or exists (select 1 from auth.users where id = any(fixture_users) and raw_user_meta_data->>'qa_fixture' is distinct from 'be4-concurrency-v1')
    or exists (select 1 from public.product_variants where id = any(fixture_variants) and product_id <> 'qa-be4-concurrency')
    or exists (select 1 from public.product_variants where product_id = 'qa-be4-concurrency' and not (id = any(fixture_variants)))
    or exists (select 1 from public.cart_items where variant_id = any(fixture_variants) and not (user_id = any(fixture_users)))
    or exists (select 1 from public.orders where user_id = any(fixture_users) and request_id not in (
      'b4100000-0000-4000-8000-000000000001', 'b4200000-0000-4000-8000-00000000000a', 'b4200000-0000-4000-8000-00000000000b')) then
    raise exception 'Cleanup identity guard failed; inspect fixture data before deletion';
  end if;
  select coalesce(array_agg(id), '{}'::uuid[]) into fixture_orders from public.orders where user_id = any(fixture_users);
  if exists (select 1 from public.order_items where order_id = any(fixture_orders) and not (variant_id = any(fixture_variants)))
    or exists (select 1 from public.order_items where variant_id = any(fixture_variants) and not (order_id = any(fixture_orders))) then
    raise exception 'Cleanup found non-fixture order references';
  end if;
  delete from public.order_status_history where order_id = any(fixture_orders);
  delete from public.inventory_movements where order_id = any(fixture_orders) or variant_id = any(fixture_variants);
  delete from public.order_items where order_id = any(fixture_orders);
  delete from public.orders where id = any(fixture_orders);
  delete from public.cart_items where user_id = any(fixture_users);
  delete from auth.users where id = any(fixture_users);
  update public.products set status = 'draft' where id = 'qa-be4-concurrency';
  delete from public.product_variants where id = any(fixture_variants);
  delete from public.products where id = 'qa-be4-concurrency';
  delete from public.categories where id = 'qa-be4-concurrency';
  delete from public.brands where id = 'qa-be4-concurrency';
  if exists (select 1 from auth.users where id = any(fixture_users))
    or exists (select 1 from public.profiles where id = any(fixture_users))
    or exists (select 1 from private.admin_users where user_id = any(fixture_users))
    or exists (select 1 from public.cart_items where user_id = any(fixture_users))
    or exists (select 1 from private.cart_merge_requests where user_id = any(fixture_users))
    or exists (select 1 from public.orders where id = any(fixture_orders))
    or exists (select 1 from public.order_items where order_id = any(fixture_orders))
    or exists (select 1 from public.order_status_history where order_id = any(fixture_orders))
    or exists (select 1 from public.inventory_movements where variant_id = any(fixture_variants))
    or exists (select 1 from public.product_variants where id = any(fixture_variants))
    or exists (select 1 from public.products where id = 'qa-be4-concurrency')
    or exists (select 1 from public.categories where id = 'qa-be4-concurrency')
    or exists (select 1 from public.brands where id = 'qa-be4-concurrency') then
    raise exception 'Concurrency fixture cleanup incomplete';
  end if;
end;
$$;
commit;
select 'PASS: all committed concurrency fixtures removed' as result;
