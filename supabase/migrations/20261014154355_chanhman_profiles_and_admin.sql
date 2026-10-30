-- BE-2 database foundation: user-owned profiles and live admin membership.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null
    check (
      display_name = regexp_replace(display_name, '^[[:space:]]+|[[:space:]]+$', '', 'g')
      and char_length(display_name) between 2 and 80
    ),
  phone text check (phone ~ '^\+?[0-9]{8,15}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table private.admin_users enable row level security;
revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant update(display_name, phone) on public.profiles to authenticated;
grant all on public.profiles to service_role;

-- Admin membership is maintained only by trusted database administration.
revoke all on private.admin_users from public, anon, authenticated;
grant all on private.admin_users to service_role;

create function private.profile_name_from_metadata(metadata jsonb)
returns text language sql immutable security invoker set search_path = ''
as $$
  select case
    when jsonb_typeof(metadata -> 'display_name') = 'string'
      and char_length(trimmed_name) between 2 and 80
    then trimmed_name
    else 'Khách hàng'
  end
  from (
    select regexp_replace(metadata ->> 'display_name', '^[[:space:]]+|[[:space:]]+$', '', 'g') as trimmed_name
  ) names;
$$;
revoke all on function private.profile_name_from_metadata(jsonb)
from public, anon, authenticated, service_role;

create function private.touch_profile()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  new.display_name := regexp_replace(new.display_name, '^[[:space:]]+|[[:space:]]+$', '', 'g');
  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id then
      raise exception 'Profile user ID is immutable' using errcode = '23514';
    end if;
    new.created_at := old.created_at;
    new.updated_at := clock_timestamp();
  end if;
  return new;
end;
$$;
revoke all on function private.touch_profile() from public, anon, authenticated, service_role;

create trigger profiles_before_write before insert or update on public.profiles
for each row execute function private.touch_profile();

-- Auth signup has no user session yet. Definer rights let this internal trigger
-- insert the NEW auth.users ID without granting profile INSERT to clients.
create function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, private.profile_name_from_metadata(new.raw_user_meta_data));
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated, service_role;

create trigger chanhman_auth_user_created after insert on auth.users
for each row execute function private.handle_new_user();

-- Existing profiles, if any, are never overwritten.
insert into public.profiles(id, display_name)
select id, private.profile_name_from_metadata(raw_user_meta_data) from auth.users
on conflict (id) do nothing;

create function private.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1 from private.admin_users where user_id = (select auth.uid())
    );
$$;
revoke all on function private.is_admin() from public, anon, authenticated, service_role;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create function public.get_my_role()
returns text language plpgsql stable security invoker set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  return case when private.is_admin() then 'admin' else 'customer' end;
end;
$$;
revoke all on function public.get_my_role() from public, anon, authenticated, service_role;
grant execute on function public.get_my_role() to authenticated;

create policy profiles_owner_read on public.profiles
for select to authenticated using ((select auth.uid()) = id);
create policy profiles_owner_update on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Keep one SELECT policy per role/table: guest visibility stays unchanged,
-- authenticated callers additionally receive live admin visibility.
alter policy categories_catalog_read on public.categories to anon;
alter policy brands_catalog_read on public.brands to anon;
alter policy products_catalog_read on public.products to anon;
alter policy variants_catalog_read on public.product_variants to anon;

create policy categories_authenticated_read on public.categories
for select to authenticated using (active or (select private.is_admin()));
create policy brands_authenticated_read on public.brands
for select to authenticated using (active or (select private.is_admin()));
create policy products_authenticated_read on public.products
for select to authenticated using (
  (select private.is_admin())
  or (
    status = 'active'
    and exists (select 1 from public.categories c where c.id = products.category_id and c.active)
    and exists (select 1 from public.brands b where b.id = products.brand_id and b.active)
  )
);
create policy variants_authenticated_read on public.product_variants
for select to authenticated using (
  (select private.is_admin())
  or (active and exists (select 1 from public.products p where p.id = product_variants.product_id))
);

comment on table public.profiles is 'User-owned display name and phone; email, password and verification stay in Supabase Auth.';
comment on table private.admin_users is 'Trusted live admin membership; never authorize from user-editable metadata.';
comment on function public.get_my_role() is 'Authenticated caller own role from live database membership.';
