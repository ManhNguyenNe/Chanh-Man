-- User requested removal of the two demo tables outside BE_PLAN. No CASCADE.
do $$
begin
  if to_regclass('public.tasks') is not null then
    if (select count(*) from public.tasks) > 1 then
      raise exception 'Demo tasks changed since inspection; inspect before removal';
    end if;
    drop table public.tasks;
  end if;
  if to_regclass('public.products_legacy') is not null then
    if (select count(*) from public.products_legacy) > 3 then
      raise exception 'Legacy products changed since inspection; inspect before removal';
    end if;
    drop table public.products_legacy;
  end if;
end;
$$;

create sequence private.order_code_seq;
revoke all on sequence private.order_code_seq from public, anon, authenticated;

create table private.shop_settings (
  id integer primary key default 1 check (id = 1),
  shipping_fee numeric(15,0) not null check (shipping_fee between 0 and 999999999999999),
  updated_at timestamptz not null default now()
);
insert into private.shop_settings(id, shipping_fee) values (1, 30000);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('CM-' || nextval('private.order_code_seq')::text),
  user_id uuid not null references auth.users(id) on delete restrict,
  request_id uuid not null,
  request_payload jsonb not null check (jsonb_typeof(request_payload) = 'object'),
  shipping_address jsonb not null check (jsonb_typeof(shipping_address) = 'object'),
  subtotal numeric(15,0) not null check (subtotal between 0 and 999999999999999),
  shipping_fee numeric(15,0) not null check (shipping_fee between 0 and 999999999999999),
  total numeric(15,0) not null check (total between 0 and 999999999999999 and total = subtotal + shipping_fee),
  currency text not null default 'VND' check (currency = 'VND'),
  payment_method text not null default 'cod' check (payment_method = 'cod'),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid')),
  status text not null default 'pending' check (status in ('pending','confirmed','shipping','delivered','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, request_id),
  check ((status = 'delivered') = (payment_status = 'paid'))
);
create index orders_user_created_idx on public.orders(user_id, created_at desc, id);
create index orders_status_created_idx on public.orders(status, created_at desc, id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  variant_id text not null references public.product_variants(id) on delete restrict,
  sku text not null,
  product_name text not null,
  variant_label text not null,
  image_url text not null,
  unit_price numeric(15,0) not null check (unit_price between 1 and 999999999999999),
  quantity integer not null check (quantity between 1 and 999),
  unique(order_id, variant_id)
);
create index order_items_variant_idx on public.order_items(variant_id);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  from_status text check (from_status in ('pending','confirmed','shipping','delivered','cancelled')),
  to_status text not null check (to_status in ('pending','confirmed','shipping','delivered','cancelled')),
  actor_id uuid references auth.users(id) on delete set null,
  note text check (char_length(note) between 1 and 500),
  created_at timestamptz not null default clock_timestamp(),
  check ((from_status is null and to_status = 'pending')
    or (from_status is not null and ((from_status = 'pending' and to_status in ('confirmed','cancelled'))
    or (from_status = 'confirmed' and to_status in ('shipping','cancelled'))
    or (from_status = 'shipping' and to_status = 'delivered'))))
);
create index order_history_order_created_idx on public.order_status_history(order_id, created_at, id);
create index order_history_actor_idx on public.order_status_history(actor_id);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id text not null references public.product_variants(id) on delete restrict,
  order_id uuid references public.orders(id) on delete restrict,
  actor_id uuid references auth.users(id) on delete set null,
  quantity_delta integer not null check (quantity_delta <> 0),
  reason text not null check (reason in ('initial','order','cancel','adjustment')),
  note text check (char_length(note) between 1 and 500),
  created_at timestamptz not null default now(),
  check ((reason = 'order' and order_id is not null and quantity_delta < 0)
    or (reason = 'cancel' and order_id is not null and quantity_delta > 0)
    or (reason = 'initial' and order_id is null and quantity_delta > 0)
    or (reason = 'adjustment' and order_id is null))
);
create index inventory_variant_created_idx on public.inventory_movements(variant_id, created_at, id);
create index inventory_order_idx on public.inventory_movements(order_id);
create index inventory_actor_idx on public.inventory_movements(actor_id);
create unique index inventory_order_once_idx on public.inventory_movements(order_id, variant_id, reason)
  where reason in ('order','cancel');
insert into public.inventory_movements(variant_id, quantity_delta, reason, note)
select id, stock, 'initial', 'Opening stock at BE-4 migration'
from public.product_variants where stock > 0;

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.inventory_movements enable row level security;
alter table private.shop_settings enable row level security;
revoke all on public.orders, public.order_items, public.order_status_history,
  public.inventory_movements, private.shop_settings from public, anon, authenticated;
grant select(id, code, user_id, request_id, shipping_address, subtotal, shipping_fee, total,
  currency, payment_method, payment_status, status, created_at, updated_at) on public.orders to authenticated;
grant select on public.order_items, public.order_status_history, public.inventory_movements to authenticated;
grant all on public.orders, public.order_items, public.order_status_history,
  public.inventory_movements, private.shop_settings to service_role;
grant usage, select on sequence private.order_code_seq to service_role;

create policy orders_owner_or_admin on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy order_items_owner_or_admin on public.order_items for select to authenticated
  using (exists(select 1 from public.orders o where o.id = order_id));
create policy order_history_owner_or_admin on public.order_status_history for select to authenticated
  using (exists(select 1 from public.orders o where o.id = order_id));
create policy inventory_admin_read on public.inventory_movements for select to authenticated
  using ((select private.is_admin()));
create policy shop_settings_no_client_access on private.shop_settings for all to anon, authenticated
  using (false) with check (false);

create function private.touch_order()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if (to_jsonb(new) - array['status','payment_status','updated_at'])
     is distinct from (to_jsonb(old) - array['status','payment_status','updated_at']) then
    raise exception 'Order snapshots are immutable' using errcode = '23514';
  end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
create trigger orders_updated_at before update on public.orders
for each row execute function private.touch_order();
create function private.touch_shop_settings()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
create trigger shop_settings_updated_at before update on private.shop_settings
for each row execute function private.touch_shop_settings();

-- Pure validation shared by quote/create: never accepts price or caller identity.
create function private.normalize_order_input(p_items jsonb, p_address jsonb, p_payment text)
returns jsonb language plpgsql immutable security invoker set search_path = '' as $$
declare
  line jsonb;
  selection jsonb;
  address jsonb := '{}'::jsonb;
  field text;
  address_value text;
  min_length integer;
  max_length integer;
begin
  if p_payment is distinct from 'cod' or p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) not between 1 and 100 or octet_length(p_items::text) > 32768 then
    raise exception 'VALIDATION_ERROR: items limit' using errcode = '22023';
  end if;
  for line in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(line) <> 'object' or not (line ?& array['variantId','quantity'])
       or line - array['variantId','quantity'] <> '{}'::jsonb
       or jsonb_typeof(line->'variantId') <> 'string' or jsonb_typeof(line->'quantity') <> 'number' then
      raise exception 'VALIDATION_ERROR: item shape' using errcode = '22023';
    end if;
    if (line->>'variantId') !~ '^[a-z0-9][a-z0-9-]{0,99}$'
       or (line->>'quantity')::numeric not between 1 and 999
       or trunc((line->>'quantity')::numeric) <> (line->>'quantity')::numeric then
      raise exception 'VALIDATION_ERROR: item value' using errcode = '22023';
    end if;
  end loop;
  select jsonb_agg(jsonb_build_object('variantId', variant_id, 'quantity', qty) order by variant_id collate "C")
  into selection from (
    select e->>'variantId' as variant_id, sum((e->>'quantity')::numeric)::integer as qty
    from jsonb_array_elements(p_items) e group by e->>'variantId'
  ) grouped;
  if exists(select 1 from jsonb_array_elements(selection) e where (e->>'quantity')::integer > 999) then
    raise exception 'VALIDATION_ERROR: grouped quantity' using errcode = '22023';
  end if;
  if p_address is not null then
    if jsonb_typeof(p_address) <> 'object' or octet_length(p_address::text) > 8192
      or p_address - array['recipientName','phone','addressLine','ward','province','note'] <> '{}'::jsonb then
      raise exception 'VALIDATION_ERROR: shipping address' using errcode = '22023';
    end if;
    foreach field in array array['recipientName','phone','addressLine','ward','province','note'] loop
      if (p_address ? field and jsonb_typeof(p_address->field) <> 'string')
        or (field in ('recipientName','phone','addressLine','province') and not (p_address ? field)) then
        raise exception 'VALIDATION_ERROR: address %', field using errcode = '22023';
      end if;
      address_value := regexp_replace(coalesce(p_address->>field,''), '^[[:space:]]+|[[:space:]]+$', '', 'g');
      min_length := case field when 'recipientName' then 2 when 'addressLine' then 5 when 'province' then 2 else 0 end;
      max_length := case field when 'phone' then 16 when 'addressLine' then 240 when 'note' then 500 else 80 end;
      if char_length(address_value) not between min_length and max_length
        or (field = 'phone' and address_value !~ '^\+?[0-9]{8,15}$') then
        raise exception 'VALIDATION_ERROR: address %', field using errcode = '22023';
      end if;
      address := address || jsonb_build_object(field, address_value);
    end loop;
  end if;
  return jsonb_build_object('items', selection, 'shippingAddress', case when p_address is null then null else address end,
    'paymentMethod', 'cod');
end;
$$;

create function private.get_shipping_fee()
returns numeric language plpgsql stable security definer set search_path = '' as $$
declare fee numeric;
begin
  if auth.uid() is null then raise exception 'UNAUTHENTICATED' using errcode = '42501'; end if;
  select shipping_fee into strict fee from private.shop_settings where id = 1;
  return fee;
end;
$$;

create function public.quote_order(p_items jsonb, p_shipping_address jsonb default null, p_payment_method text default 'cod')
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  payload jsonb;
  lines jsonb;
  issues jsonb;
  subtotal numeric;
  fee numeric;
  fingerprint text;
begin
  if auth.uid() is null then raise exception 'UNAUTHENTICATED' using errcode = '42501'; end if;
  payload := private.normalize_order_input(p_items, p_shipping_address, p_payment_method);
  fee := private.get_shipping_fee();
  with selected as (
    select e->>'variantId' as variant_id, (e->>'quantity')::integer as quantity
    from jsonb_array_elements(payload->'items') e
  ), visible as (
    select v.id, v.product_id, v.sku, p.name, v.label, coalesce(v.image_url,p.image_url) as image, v.price, v.stock
    from public.product_variants v join public.products p on p.id = v.product_id
    join public.categories c on c.id = p.category_id join public.brands b on b.id = p.brand_id
    where v.active and p.status = 'active' and c.active and b.active
  ), quoted as (
    select s.*, v.*, case when v.id is null then 'UNAVAILABLE' when s.quantity > v.stock then 'OUT_OF_STOCK' end as issue
    from selected s left join visible v on v.id = s.variant_id
  )
  select coalesce(jsonb_agg(jsonb_build_object('variantId',variant_id,'quantity',quantity,'productId',product_id,
    'sku',sku,'productName',name,'variantLabel',label,'image',image,'unitPrice',price,'stock',stock)
    order by variant_id collate "C") filter(where id is not null),'[]'::jsonb),
    coalesce(sum(price * quantity),0),
    coalesce(jsonb_agg(jsonb_build_object('variantId',variant_id,'code',issue) order by variant_id collate "C")
      filter(where issue is not null),'[]'::jsonb)
  into lines, subtotal, issues from quoted;
  if subtotal + fee > 999999999999999 then
    raise exception 'ORDER_TOTAL_LIMIT' using errcode = '22003';
  end if;
  select md5(jsonb_build_array(jsonb_agg(jsonb_build_array(e->>'variantId', e->'quantity', e->'unitPrice')
    order by e->>'variantId' collate "C"), fee, 'VND', 'cod')::text)
  into fingerprint from jsonb_array_elements(lines) e;
  return jsonb_build_object('items',lines,'subtotal',subtotal,'shippingFee',fee,'total',subtotal+fee,
    'currency','VND','paymentMethod','cod','shippingAddress',payload->'shippingAddress','issues',issues,'fingerprint',fingerprint);
end;
$$;

-- Explicit owner check is also required when invoked from a definer transaction.
create function public.get_order(p_order_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare result jsonb;
begin
  if auth.uid() is null then raise exception 'UNAUTHENTICATED' using errcode = '42501'; end if;
  select jsonb_build_object('id',o.id,'code',o.code,'userId',o.user_id,'requestId',o.request_id,
    'shippingAddress',o.shipping_address,'subtotal',o.subtotal,'shippingFee',o.shipping_fee,'total',o.total,
    'currency',o.currency,'paymentMethod',o.payment_method,'paymentStatus',o.payment_status,
    'status',o.status,'createdAt',o.created_at,'updatedAt',o.updated_at,
    'items',(select coalesce(jsonb_agg(jsonb_build_object('variantId',i.variant_id,'sku',i.sku,
      'productName',i.product_name,'variantLabel',i.variant_label,'image',i.image_url,
      'unitPrice',i.unit_price,'quantity',i.quantity) order by i.variant_id collate "C"),'[]'::jsonb)
      from public.order_items i where i.order_id = o.id),
    'history',(select coalesce(jsonb_agg(jsonb_build_object('fromStatus',h.from_status,'toStatus',h.to_status,
      'actorId',h.actor_id,'note',h.note,'createdAt',h.created_at) order by h.created_at,h.id),'[]'::jsonb)
      from public.order_status_history h where h.order_id = o.id))
  into result from public.orders o
  where o.id = p_order_id and (o.user_id = auth.uid() or private.is_admin());
  if result is null then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  return result;
end;
$$;

create function private.create_order(p_request_id uuid, p_items jsonb, p_shipping_address jsonb,
  p_quote_fingerprint text, p_payment_method text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  caller_id uuid := auth.uid();
  payload jsonb;
  previous public.orders%rowtype;
  quote jsonb;
  order_id uuid;
  line jsonb;
  cart_quantity integer;
  locked_count integer;
begin
  if caller_id is null then raise exception 'UNAUTHENTICATED' using errcode = '42501'; end if;
  if not exists(select 1 from auth.users where id = caller_id and email_confirmed_at is not null
    and not coalesce(is_anonymous,false) and (banned_until is null or banned_until <= now())) then
    raise exception 'EMAIL_NOT_VERIFIED' using errcode = '42501';
  end if;
  if p_request_id is null or p_shipping_address is null or p_quote_fingerprint is null
    or p_quote_fingerprint !~ '^[a-f0-9]{32}$' then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  payload := private.normalize_order_input(p_items, p_shipping_address, p_payment_method)
    || jsonb_build_object('quoteFingerprint',p_quote_fingerprint);
  perform pg_advisory_xact_lock(hashtextextended('chanhman-order:' || caller_id::text || ':' || p_request_id::text,0));
  select * into previous from public.orders where user_id = caller_id and request_id = p_request_id;
  if found then
    if previous.request_payload <> payload then raise exception 'REQUEST_CONFLICT' using errcode = '22023'; end if;
    return public.get_order(previous.id) || jsonb_build_object('replayed',true);
  end if;

  -- NO KEY UPDATE serializes stock while allowing cart FK KEY SHARE locks.
  -- All catalog writers must follow variants -> products -> categories -> brands -> settings.
  perform v.id from public.product_variants v where v.id in
    (select e->>'variantId' from jsonb_array_elements(payload->'items') e)
    order by v.id collate "C" for no key update;
  get diagnostics locked_count = row_count;
  if locked_count <> jsonb_array_length(payload->'items') then
    raise exception 'OUT_OF_STOCK' using errcode = 'P0001';
  end if;
  perform p.id from public.products p where p.id in
    (select v.product_id from public.product_variants v where v.id in
      (select e->>'variantId' from jsonb_array_elements(payload->'items') e))
    order by p.id collate "C" for share;
  perform c.id from public.categories c where c.id in
    (select p.category_id from public.products p join public.product_variants v on v.product_id = p.id
      where v.id in (select e->>'variantId' from jsonb_array_elements(payload->'items') e))
    order by c.id collate "C" for share;
  perform b.id from public.brands b where b.id in
    (select p.brand_id from public.products p join public.product_variants v on v.product_id = p.id
      where v.id in (select e->>'variantId' from jsonb_array_elements(payload->'items') e))
    order by b.id collate "C" for share;
  perform id from private.shop_settings where id = 1 for share;
  quote := public.quote_order(payload->'items', payload->'shippingAddress', 'cod');
  if jsonb_array_length(quote->'issues') > 0 then
    raise exception 'OUT_OF_STOCK' using errcode = 'P0001', detail = quote::text;
  end if;
  if quote->>'fingerprint' <> p_quote_fingerprint then
    raise exception 'PRICE_CHANGED' using errcode = 'P0001', detail = quote::text;
  end if;
  insert into public.orders(user_id,request_id,request_payload,shipping_address,subtotal,shipping_fee,total)
  values(caller_id,p_request_id,payload,payload->'shippingAddress',(quote->>'subtotal')::numeric,
    (quote->>'shippingFee')::numeric,(quote->>'total')::numeric) returning id into order_id;
  for line in select value from jsonb_array_elements(quote->'items') loop
    insert into public.order_items(order_id,variant_id,sku,product_name,variant_label,image_url,unit_price,quantity)
    values(order_id,line->>'variantId',line->>'sku',line->>'productName',line->>'variantLabel',line->>'image',
      (line->>'unitPrice')::numeric,(line->>'quantity')::integer);
    update public.product_variants set stock = stock - (line->>'quantity')::integer where id = line->>'variantId';
    insert into public.inventory_movements(variant_id,order_id,actor_id,quantity_delta,reason)
    values(line->>'variantId',order_id,caller_id,-(line->>'quantity')::integer,'order');
  end loop;
  insert into public.order_status_history(order_id,to_status,actor_id) values(order_id,'pending',caller_id);
  -- Subtract purchased quantities under cart locks; replay never cleans the cart twice.
  for line in select value from jsonb_array_elements(payload->'items') loop
    select quantity into cart_quantity from public.cart_items
      where user_id = caller_id and variant_id = line->>'variantId' for update;
    if found then
      if cart_quantity <= (line->>'quantity')::integer then
        delete from public.cart_items where user_id = caller_id and variant_id = line->>'variantId';
      else
        update public.cart_items set quantity = quantity - (line->>'quantity')::integer
          where user_id = caller_id and variant_id = line->>'variantId';
      end if;
    end if;
  end loop;
  return public.get_order(order_id) || jsonb_build_object('replayed',false);
end;
$$;

create function private.set_order_status(p_order_id uuid, p_status text, p_note text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  previous public.orders%rowtype;
  item record;
  note text := nullif(regexp_replace(p_note,'^[[:space:]]+|[[:space:]]+$','','g'),'');
begin
  if auth.uid() is null or not private.is_admin() then raise exception 'FORBIDDEN' using errcode = '42501'; end if;
  if p_status is null or p_status not in ('pending','confirmed','shipping','delivered','cancelled')
    or char_length(p_note) > 500 then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;
  select * into previous from public.orders where id = p_order_id for update;
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  if previous.status = p_status then return public.get_order(p_order_id); end if;
  if not ((previous.status = 'pending' and p_status in ('confirmed','cancelled'))
    or (previous.status = 'confirmed' and p_status in ('shipping','cancelled'))
    or (previous.status = 'shipping' and p_status = 'delivered')) then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = '22023';
  end if;
  if p_status = 'cancelled' then
    if note is null then raise exception 'CANCELLATION_NOTE_REQUIRED' using errcode = '22023'; end if;
    perform v.id from public.product_variants v join public.order_items i on i.variant_id = v.id
      where i.order_id = p_order_id order by v.id collate "C" for no key update of v;
    for item in select variant_id, quantity from public.order_items where order_id = p_order_id order by variant_id collate "C" loop
      update public.product_variants set stock = stock + item.quantity where id = item.variant_id;
      insert into public.inventory_movements(variant_id,order_id,actor_id,quantity_delta,reason,note)
      values(item.variant_id,p_order_id,auth.uid(),item.quantity,'cancel',note);
    end loop;
  end if;
  update public.orders set status = p_status, payment_status = case when p_status = 'delivered' then 'paid' else 'unpaid' end
    where id = p_order_id;
  insert into public.order_status_history(order_id,from_status,to_status,actor_id,note)
  values(p_order_id,previous.status,p_status,auth.uid(),note);
  return public.get_order(p_order_id);
end;
$$;

create function private.adjust_stock(p_variant_id text, p_target_stock integer, p_expected_stock integer, p_note text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  current_stock integer;
  note text := regexp_replace(p_note,'^[[:space:]]+|[[:space:]]+$','','g');
begin
  if auth.uid() is null or not private.is_admin() then raise exception 'FORBIDDEN' using errcode = '42501'; end if;
  if p_target_stock is null or p_expected_stock is null or p_target_stock < 0 or p_expected_stock < 0
    or note is null or char_length(note) not between 1 and 500 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  select stock into current_stock from public.product_variants where id = p_variant_id for no key update;
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0002'; end if;
  if current_stock <> p_expected_stock then raise exception 'CONFLICT' using errcode = '40001'; end if;
  if current_stock <> p_target_stock then
    update public.product_variants set stock = p_target_stock where id = p_variant_id;
    insert into public.inventory_movements(variant_id,actor_id,quantity_delta,reason,note)
    values(p_variant_id,auth.uid(),p_target_stock-current_stock,'adjustment',note);
  end if;
  return jsonb_build_object('variantId',p_variant_id,'stock',p_target_stock);
end;
$$;

create function public.create_order(p_request_id uuid, p_items jsonb, p_shipping_address jsonb,
  p_quote_fingerprint text, p_payment_method text default 'cod')
returns jsonb language sql security invoker set search_path = '' as $$
  select private.create_order(p_request_id,p_items,p_shipping_address,p_quote_fingerprint,p_payment_method);
$$;
create function public.set_order_status(p_order_id uuid, p_status text, p_note text default null)
returns jsonb language sql security invoker set search_path = '' as $$
  select private.set_order_status(p_order_id,p_status,p_note);
$$;
create function public.adjust_stock(p_variant_id text, p_target_stock integer, p_expected_stock integer, p_note text)
returns jsonb language sql security invoker set search_path = '' as $$
  select private.adjust_stock(p_variant_id,p_target_stock,p_expected_stock,p_note);
$$;

revoke all on function private.touch_order(), private.touch_shop_settings() from public, anon, authenticated, service_role;
revoke all on function private.normalize_order_input(jsonb,jsonb,text), private.get_shipping_fee(),
  public.quote_order(jsonb,jsonb,text), public.get_order(uuid),
  private.create_order(uuid,jsonb,jsonb,text,text), public.create_order(uuid,jsonb,jsonb,text,text),
  private.set_order_status(uuid,text,text), public.set_order_status(uuid,text,text),
  private.adjust_stock(text,integer,integer,text), public.adjust_stock(text,integer,integer,text)
from public, anon, authenticated;
grant execute on function private.normalize_order_input(jsonb,jsonb,text), private.get_shipping_fee(),
  public.quote_order(jsonb,jsonb,text), public.get_order(uuid),
  private.create_order(uuid,jsonb,jsonb,text,text), public.create_order(uuid,jsonb,jsonb,text,text),
  private.set_order_status(uuid,text,text), public.set_order_status(uuid,text,text),
  private.adjust_stock(text,integer,integer,text), public.adjust_stock(text,integer,integer,text)
to authenticated;
