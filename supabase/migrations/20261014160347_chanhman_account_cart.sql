-- BE-3: account cart and idempotent guest-cart import. Cart never reserves stock.
create table public.cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  variant_id text not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity between 1 and 999),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(user_id, variant_id)
);
create index cart_items_variant_idx on public.cart_items(variant_id);

create table private.cart_merge_requests (
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'array' and jsonb_array_length(payload) <= 100),
  created_at timestamptz not null default now(),
  primary key(user_id, request_id)
);

alter table public.cart_items enable row level security;
alter table private.cart_merge_requests enable row level security;
revoke all on public.cart_items from public, anon, authenticated;
grant select, delete on public.cart_items to authenticated;
grant insert(user_id, variant_id, quantity) on public.cart_items to authenticated;
grant update(quantity) on public.cart_items to authenticated;
grant all on public.cart_items to service_role;
revoke all on private.cart_merge_requests from public, anon, authenticated;
grant all on private.cart_merge_requests to service_role;

create policy cart_owner_read on public.cart_items
for select to authenticated using ((select auth.uid()) = user_id);
create policy cart_owner_insert on public.cart_items
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy cart_owner_update on public.cart_items
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy cart_owner_delete on public.cart_items
for delete to authenticated using ((select auth.uid()) = user_id);
create policy cart_merge_requests_no_client_access on private.cart_merge_requests
for all to anon, authenticated using (false) with check (false);

create function private.touch_cart_item()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id or new.variant_id is distinct from old.variant_id then
    raise exception 'Cart ownership and variant are immutable' using errcode = '23514';
  end if;
  new.created_at := old.created_at;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function private.touch_cart_item() from public, anon, authenticated, service_role;
create trigger cart_items_updated_at before update on public.cart_items
for each row execute function private.touch_cart_item();

-- Explicit owner/catalog filters also protect this result when a private definer
-- function calls it. Account reads preserve unavailable rows rather than deleting them.
create function public.get_my_cart()
returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  cart_lines jsonb;
  cart_count bigint;
  cart_total numeric;
  cart_notices jsonb;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  with lines as (
    select ci.variant_id, ci.quantity, ci.created_at,
      visible.product_id, visible.name, visible.image, visible.label, visible.price,
      coalesce(visible.stock, 0) as stock,
      (visible.id is not null and ci.quantity <= visible.stock) as available
    from public.cart_items ci
    left join (
      select v.id, v.product_id, p.name,
        coalesce(v.image_url, p.image_url) as image, v.label, v.price, v.stock
      from public.product_variants v
      join public.products p on p.id = v.product_id
      join public.categories c on c.id = p.category_id
      join public.brands b on b.id = p.brand_id
      where v.active and p.status = 'active' and c.active and b.active
    ) visible on visible.id = ci.variant_id
    where ci.user_id = caller_id
  )
  select
    coalesce(jsonb_agg(jsonb_build_object(
      'variantId', variant_id, 'quantity', quantity, 'productId', product_id,
      'name', name, 'image', image, 'label', label, 'price', price,
      'stock', stock, 'available', available
    ) order by created_at, variant_id), '[]'::jsonb),
    coalesce(sum(quantity), 0),
    coalesce(sum(case when available then price * quantity else 0 end), 0),
    coalesce(jsonb_agg(jsonb_build_object(
      'variantId', variant_id,
      'code', case when product_id is null then 'UNAVAILABLE'
        when stock = 0 then 'OUT_OF_STOCK' else 'STOCK_CHANGED' end,
      'message', case when product_id is null then 'Phiên bản này hiện không còn bán.'
        when stock = 0 then 'Phiên bản này hiện đã hết hàng.'
        else 'Số lượng trong giỏ vượt tồn kho hiện tại. Vui lòng điều chỉnh.' end
    ) order by created_at, variant_id) filter (where not available), '[]'::jsonb)
  into cart_lines, cart_count, cart_total, cart_notices
  from lines;
  if cart_total > 9007199254740991 or cart_count > 9007199254740991 then
    raise exception 'Cart total exceeds JavaScript safe integer range' using errcode = '22003';
  end if;
  return jsonb_build_object(
    'items', cart_lines, 'count', cart_count, 'total', cart_total, 'notices', cart_notices
  );
end;
$$;
revoke all on function public.get_my_cart() from public, anon, authenticated, service_role;
grant execute on function public.get_my_cart() to authenticated;

-- Definer rights are needed only for private receipts and atomic owned-cart writes.
-- Every identity is taken from auth.uid(); neither payload nor caller supplies user_id.
create function private.merge_guest_cart(p_request_id uuid, p_items jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  item jsonb;
  item_quantity numeric;
  canonical_payload jsonb;
  saved_payload jsonb;
  inserted_rows integer;
  entry record;
  available_stock integer;
  merged_quantity integer;
  merge_notices jsonb := '[]'::jsonb;
  result jsonb;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_request_id is null or jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'INVALID_ITEMS: request ID and item array are required' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) > 100 or octet_length(p_items::text) > 32768 then
    raise exception 'INVALID_ITEMS: at most 100 rows and 32KB are allowed' using errcode = '22023';
  end if;
  for item in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(item) is distinct from 'object' then
      raise exception 'INVALID_ITEMS: each row must be an object' using errcode = '22023';
    end if;
    if jsonb_typeof(item -> 'variantId') is distinct from 'string'
      or jsonb_typeof(item -> 'quantity') is distinct from 'number'
      or item - array['variantId','quantity']::text[] <> '{}'::jsonb
      or (item ->> 'variantId') !~ '^[a-z0-9][a-z0-9-]{0,99}$' then
      raise exception 'INVALID_ITEMS: only valid variantId and quantity are allowed' using errcode = '22023';
    end if;
    item_quantity := (item ->> 'quantity')::numeric;
    if item_quantity <> trunc(item_quantity) or item_quantity < 1 or item_quantity > 999 then
      raise exception 'INVALID_ITEMS: quantity must be an integer between 1 and 999' using errcode = '22023';
    end if;
  end loop;

  if exists (
    select 1 from jsonb_array_elements(p_items) e
    group by e ->> 'variantId'
    having sum((e ->> 'quantity')::numeric) > 999
  ) then
    raise exception 'INVALID_ITEMS: combined quantity exceeds 999' using errcode = '22023';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'variantId', variant_id, 'quantity', quantity
  ) order by variant_id collate "C"), '[]'::jsonb)
  into canonical_payload
  from (
    select e ->> 'variantId' as variant_id, sum((e ->> 'quantity')::numeric)::integer as quantity
    from jsonb_array_elements(p_items) e
    group by e ->> 'variantId'
  ) normalized;

  insert into private.cart_merge_requests(user_id, request_id, payload)
  values(caller_id, p_request_id, canonical_payload)
  on conflict(user_id, request_id) do nothing;
  get diagnostics inserted_rows = row_count;
  if inserted_rows = 0 then
    -- A concurrent INSERT waits on the unique key; this next statement sees its commit.
    select payload into saved_payload from private.cart_merge_requests
    where user_id = caller_id and request_id = p_request_id;
    if saved_payload is distinct from canonical_payload then
      raise exception 'REQUEST_ID_REUSED: this request ID has a different payload' using errcode = '22023';
    end if;
    -- Retry must not re-apply amounts, even if catalog/cart state has changed.
    return public.get_my_cart() || jsonb_build_object('requestId', p_request_id, 'replayed', true);
  end if;

  for entry in
    select e ->> 'variantId' as variant_id, (e ->> 'quantity')::integer as quantity
    from jsonb_array_elements(canonical_payload) e
    order by (e ->> 'variantId') collate "C"
  loop
    available_stock := null;
    -- Cart import uses current visibility/stock snapshots and never locks or changes stock.
    select v.stock into available_stock
    from public.product_variants v
    join public.products p on p.id = v.product_id
    join public.categories c on c.id = p.category_id
    join public.brands b on b.id = p.brand_id
    where v.id = entry.variant_id and v.active and p.status = 'active' and c.active and b.active;
    if available_stock is null or available_stock = 0 then
      merge_notices := merge_notices || jsonb_build_array(jsonb_build_object(
        'variantId', entry.variant_id, 'code', 'MERGE_SKIPPED',
        'message', 'Phiên bản không còn bán hoặc hết hàng chưa được thêm từ giỏ khách.'
      ));
      continue;
    end if;
    insert into public.cart_items as current_cart(user_id, variant_id, quantity)
    values(caller_id, entry.variant_id, least(entry.quantity, available_stock))
    on conflict(user_id, variant_id) do update
      set quantity = least(current_cart.quantity + entry.quantity, available_stock, 999)
    returning quantity into merged_quantity;
    if merged_quantity < entry.quantity or merged_quantity = least(available_stock, 999) then
      merge_notices := merge_notices || jsonb_build_array(jsonb_build_object(
        'variantId', entry.variant_id, 'code', 'MERGE_LIMIT_REACHED',
        'message', 'Số lượng trong giỏ đã đạt giới hạn tồn kho hoặc 999 sản phẩm.'
      ));
    end if;
  end loop;

  result := public.get_my_cart();
  result := jsonb_set(result, '{notices}', (result -> 'notices') || merge_notices);
  return result || jsonb_build_object('requestId', p_request_id, 'replayed', false);
end;
$$;
revoke all on function private.merge_guest_cart(uuid, jsonb) from public, anon, authenticated, service_role;
grant execute on function private.merge_guest_cart(uuid, jsonb) to authenticated;

create function public.merge_guest_cart(p_request_id uuid, p_items jsonb)
returns jsonb language sql security invoker set search_path = ''
as $$
  select private.merge_guest_cart(p_request_id, p_items);
$$;
revoke all on function public.merge_guest_cart(uuid, jsonb) from public, anon, authenticated, service_role;
grant execute on function public.merge_guest_cart(uuid, jsonb) to authenticated;

comment on table public.cart_items is 'Owned variant quantities; live catalog supplies prices and stock; no inventory reservation.';
comment on table private.cart_merge_requests is 'Canonical payload receipts make guest-cart import idempotent per user/request.';
comment on function public.get_my_cart() is 'Preserves owned unavailable rows, hides their catalog metadata, excludes unavailable lines from total.';
comment on function public.merge_guest_cart(uuid, jsonb) is 'Merge current caller guest quantities once per request ID; clear guest storage only after committed response.';
