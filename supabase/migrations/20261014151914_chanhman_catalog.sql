-- Initial catalog for Chanh&Man. Auth/cart/orders follow in later BE_PLAN phases.
-- Preserve the existing UUID demo table on the selected dev project.
do $$
begin
  if to_regclass('public.products') is not null then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'products'
        and column_name = 'id' and data_type = 'uuid'
    ) and to_regclass('public.products_legacy') is null then
      alter table public.products rename to products_legacy;
      alter table public.products_legacy rename constraint products_pkey to products_legacy_pkey;
    else
      raise exception 'Existing products schema must be reviewed before applying catalog migration';
    end if;
  end if;
end;
$$;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table public.categories (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,99}$'),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,119}$'),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  caption text check (char_length(caption) <= 300),
  image_url text check (char_length(image_url) <= 2048),
  icon text check (char_length(icon) <= 80),
  sort_order integer not null default 0 check (sort_order >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.brands (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,99}$'),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,119}$'),
  name text not null unique check (char_length(btrim(name)) between 1 and 120),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,99}$'),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,119}$'),
  category_id text references public.categories(id) on delete restrict,
  brand_id text references public.brands(id) on delete restrict,
  name text check (char_length(btrim(name)) between 1 and 200),
  description text check (char_length(description) <= 10000),
  badge text check (char_length(badge) <= 120),
  image_url text check (char_length(btrim(image_url)) between 1 and 2048),
  images jsonb not null default '[]'::jsonb,
  specs jsonb not null default '[]'::jsonb,
  specifications jsonb not null default '[]'::jsonb,
  needs text[] not null default '{}',
  colors text[] not null default '{}',
  promotion boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_publish_fields check (
    status <> 'active' or
    (category_id is not null and brand_id is not null and name is not null and image_url is not null)
  ),
  constraint products_images_array check (
    jsonb_typeof(images) = 'array' and jsonb_array_length(images) <= 20
    and not jsonb_path_exists(images, '$[*] ? (@.type() != "string")')
    and octet_length(images::text) <= 45000
  ),
  constraint products_specs_array check (
    jsonb_typeof(specs) = 'array' and jsonb_array_length(specs) <= 20
    and not jsonb_path_exists(specs, '$[*] ? (@.type() != "string")')
    and octet_length(specs::text) <= 8000
  ),
  constraint products_specifications_array check (
    jsonb_typeof(specifications) = 'array' and jsonb_array_length(specifications) <= 60
    and not jsonb_path_exists(specifications, '$[*] ? (@.type() != "object")')
    and octet_length(specifications::text) <= 30000
  ),
  constraint products_needs_codes check (
    needs <@ array['study','work','game','creative','upgrade']::text[]
    and cardinality(needs) <= 5 and array_position(needs, null) is null
  ),
  constraint products_colors_array check (
    cardinality(colors) <= 20 and array_position(colors, null) is null
    and octet_length(colors::text) <= 2000
  )
);

create table public.product_variants (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,99}$'),
  product_id text not null references public.products(id) on delete restrict,
  sku text not null unique check (sku ~ '^[A-Z0-9][A-Z0-9_-]{0,119}$'),
  label text not null check (char_length(btrim(label)) between 1 and 200),
  options jsonb not null default '{}'::jsonb
    check (jsonb_typeof(options) = 'object' and octet_length(options::text) <= 4096),
  price numeric(15,0) not null check (price > 0),
  compare_at_price numeric(15,0) check (compare_at_price >= price),
  stock integer not null default 0 check (stock >= 0),
  image_url text check (char_length(btrim(image_url)) between 1 and 2048),
  active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_status_sort_idx on public.products(category_id, status, sort_order, id);
create index products_brand_idx on public.products(brand_id);
create index product_variants_product_active_idx on public.product_variants(product_id, active);

create function private.touch_catalog_row()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'Catalog IDs are immutable' using errcode = '23514';
  end if;
  new.created_at := old.created_at;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function private.touch_catalog_row() from public, anon, authenticated;

create trigger categories_updated_at before update on public.categories
for each row execute function private.touch_catalog_row();
create trigger brands_updated_at before update on public.brands
for each row execute function private.touch_catalog_row();
create trigger products_updated_at before update on public.products
for each row execute function private.touch_catalog_row();
create trigger product_variants_updated_at before update on public.product_variants
for each row execute function private.touch_catalog_row();

-- Serialize availability edits per product; ordinary price/stock updates do not take this lock.
create function private.lock_variant_product()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
  target_id text;
begin
  if tg_op = 'UPDATE' and new.product_id is distinct from old.product_id then
    raise exception 'A variant cannot move to another product' using errcode = '23514';
  end if;
  if tg_op = 'DELETE' then
    target_id := old.product_id;
  else
    target_id := new.product_id;
  end if;
  perform 1 from public.products where id = target_id for no key update;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function private.lock_variant_product() from public, anon, authenticated;

create trigger product_variants_lock_parent
before insert or update of active, product_id or delete on public.product_variants
for each row execute function private.lock_variant_product();

-- Deferred so a product and its variants can be inserted/published in one transaction.
create function private.require_active_variant()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
  target_id text;
begin
  if tg_table_name = 'products' then
    target_id := new.id;
  elsif tg_op = 'DELETE' then
    target_id := old.product_id;
  else
    target_id := new.product_id;
  end if;
  if exists (select 1 from public.products where id = target_id and status = 'active')
     and not exists (
       select 1 from public.product_variants where product_id = target_id and active
     ) then
    raise exception 'Active product % requires an active variant', target_id using errcode = '23514';
  end if;
  return null;
end;
$$;
revoke all on function private.require_active_variant() from public, anon, authenticated;

create constraint trigger products_require_active_variant
after insert or update of status on public.products
deferrable initially deferred
for each row execute function private.require_active_variant();

create constraint trigger variants_require_active_variant
after insert or update of active, product_id or delete on public.product_variants
deferrable initially deferred
for each row execute function private.require_active_variant();

alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;

revoke all on public.categories, public.brands, public.products, public.product_variants
from public, anon, authenticated;
grant select on public.categories, public.brands, public.products, public.product_variants
to anon, authenticated;
grant all on public.categories, public.brands, public.products, public.product_variants to service_role;

create policy categories_catalog_read on public.categories
for select to anon, authenticated using (active);
create policy brands_catalog_read on public.brands
for select to anon, authenticated using (active);
create policy products_catalog_read on public.products
for select to anon, authenticated using (
  status = 'active'
  and exists (select 1 from public.categories c where c.id = products.category_id and c.active)
  and exists (select 1 from public.brands b where b.id = products.brand_id and b.active)
);
create policy variants_catalog_read on public.product_variants
for select to anon, authenticated using (
  active and exists (
    select 1 from public.products p where p.id = product_variants.product_id
  )
);

comment on table public.categories is 'Chanh&Man catalog categories; inactive rows hidden from storefront.';
comment on table public.brands is 'Chanh&Man catalog brands; inactive rows hidden from storefront.';
comment on table public.products is 'Product content; active products require complete fields and an active variant.';
comment on table public.product_variants is 'Sellable SKU; VND price and available stock belong to the variant.';
comment on column public.product_variants.options is 'Explicit configuration such as ram/storage/color; do not parse label at runtime.';
