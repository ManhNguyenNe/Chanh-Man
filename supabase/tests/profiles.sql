-- Run as postgres on the dev database. Auth users and all fixtures are rolled back.
begin;

create temporary table qa_profile_users (
  label text primary key,
  id uuid not null unique default gen_random_uuid()
);
insert into qa_profile_users(label) values ('customer-a'), ('customer-b'), ('admin'), ('cascade');
grant select on qa_profile_users to authenticated;

do $$
declare target text;
begin
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'profiles' and c.relrowsecurity
  ) or not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'private' and c.relname = 'admin_users' and c.relrowsecurity
  ) then raise exception 'Profile/admin RLS missing'; end if;
  if has_table_privilege('anon', 'public.profiles', 'SELECT,INSERT,UPDATE,DELETE')
     or not has_table_privilege('authenticated', 'public.profiles', 'SELECT')
     or has_table_privilege('authenticated', 'public.profiles', 'INSERT,UPDATE,DELETE')
     or not has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE')
     or not has_column_privilege('authenticated', 'public.profiles', 'phone', 'UPDATE') then
    raise exception 'Profile table/column grants incorrect';
  end if;
  foreach target in array array['id', 'created_at', 'updated_at'] loop
    if has_column_privilege('authenticated', 'public.profiles', target, 'UPDATE') then
      raise exception 'Client may change profile column %', target;
    end if;
  end loop;
  if has_schema_privilege('anon', 'private', 'USAGE')
     or not has_schema_privilege('authenticated', 'private', 'USAGE')
     or has_table_privilege('anon', 'private.admin_users', 'SELECT,INSERT,UPDATE,DELETE')
     or has_table_privilege('authenticated', 'private.admin_users', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'Private admin access incorrect';
  end if;
  foreach target in array array[
    'private.profile_name_from_metadata(jsonb)',
    'private.handle_new_user()',
    'private.touch_profile()'
  ] loop
    if has_function_privilege('anon', target, 'EXECUTE')
       or has_function_privilege('authenticated', target, 'EXECUTE') then
      raise exception 'Internal profile helper callable: %', target;
    end if;
  end loop;
  foreach target in array array['private.is_admin()', 'public.get_my_role()'] loop
    if has_function_privilege('anon', target, 'EXECUTE')
       or not has_function_privilege('authenticated', target, 'EXECUTE') then
      raise exception 'Role helper grants incorrect: %', target;
    end if;
  end loop;
  if exists (
    select 1 from auth.users u left join public.profiles p on p.id = u.id where p.id is null
  ) then raise exception 'Existing Auth account missing backfilled profile'; end if;
end;
$$;

-- Metadata is display data only; malformed names must never break Auth signup.
do $$
declare metadata jsonb;
begin
  if private.profile_name_from_metadata('{"display_name":"  Nguyễn An  ","role":"admin"}') <> 'Nguyễn An'
     or private.profile_name_from_metadata(jsonb_build_object('display_name', repeat('a', 2))) <> repeat('a', 2)
     or private.profile_name_from_metadata(jsonb_build_object('display_name', repeat('a', 80))) <> repeat('a', 80) then
    raise exception 'Valid metadata name rejected or not trimmed';
  end if;
  foreach metadata in array array[
    null::jsonb, 'null'::jsonb, '{}'::jsonb, '[]'::jsonb, 'true'::jsonb,
    '{"display_name":null}'::jsonb, '{"display_name":true}'::jsonb,
    '{"display_name":123}'::jsonb, '{"display_name":[]}'::jsonb,
    '{"display_name":{}}'::jsonb, '{"display_name":" "}'::jsonb,
    '{"display_name":"a"}'::jsonb,
    jsonb_build_object('display_name', repeat('a', 81)),
    jsonb_build_object('display_name', E'\t\r\n ')
  ] loop
    if private.profile_name_from_metadata(metadata) is distinct from 'Khách hàng' then
      raise exception 'Malformed metadata name did not fall back: %', metadata;
    end if;
  end loop;
end;
$$;

insert into auth.users(id, raw_user_meta_data)
select id, case label
  when 'customer-a' then '{"display_name":"  Nguyễn An  ","role":"admin"}'::jsonb
  when 'customer-b' then '{"display_name":{"role":"admin"}}'::jsonb
  when 'admin' then '{"display_name":"Quản trị thử nghiệm"}'::jsonb
  else '{"display_name":" "}'::jsonb
end from qa_profile_users;

insert into private.admin_users(user_id)
select id from qa_profile_users where label in ('admin', 'cascade');

do $$
begin
  if (select count(*) from public.profiles p join qa_profile_users q on q.id = p.id) <> 4
     or not exists (
       select 1 from public.profiles p join qa_profile_users q on q.id = p.id
       where q.label = 'customer-a' and p.display_name = 'Nguyễn An' and p.phone is null
         and p.created_at is not null and p.updated_at is not null
     ) or not exists (
       select 1 from public.profiles p join qa_profile_users q on q.id = p.id
       where q.label = 'customer-b' and p.display_name = 'Khách hàng'
     ) or exists (
       select 1 from private.admin_users a join qa_profile_users q on q.id = a.user_id
       where q.label in ('customer-a', 'customer-b')
     ) then raise exception 'Auth profile trigger failed or metadata elevated role'; end if;
end;
$$;

insert into public.categories(id, slug, name, active) values
('qa-profiles-visible', 'qa-profiles-visible', 'QA profile visible', true),
('qa-profiles-hidden', 'qa-profiles-hidden', 'QA profile hidden', false);
insert into public.brands(id, slug, name, active) values
('qa-profiles-visible', 'qa-profiles-visible', 'QA profile visible', true),
('qa-profiles-hidden', 'qa-profiles-hidden', 'QA profile hidden', false);
insert into public.products(id, slug, name, image_url, category_id, brand_id, status) values
('qa-profiles-visible', 'qa-profiles-visible', 'QA visible', '/qa.png', 'qa-profiles-visible', 'qa-profiles-visible', 'active'),
('qa-profiles-draft', 'qa-profiles-draft', 'QA draft', '/qa.png', 'qa-profiles-visible', 'qa-profiles-visible', 'draft'),
('qa-profiles-archived', 'qa-profiles-archived', 'QA archived', '/qa.png', 'qa-profiles-visible', 'qa-profiles-visible', 'archived'),
('qa-profiles-category', 'qa-profiles-category', 'QA hidden category', '/qa.png', 'qa-profiles-hidden', 'qa-profiles-visible', 'active'),
('qa-profiles-brand', 'qa-profiles-brand', 'QA hidden brand', '/qa.png', 'qa-profiles-visible', 'qa-profiles-hidden', 'active');
insert into public.product_variants(id, product_id, sku, label, price, stock, active) values
('qa-profiles-visible', 'qa-profiles-visible', 'QA-PROFILE-VISIBLE', 'Visible', 1000, 0, true),
('qa-profiles-inactive', 'qa-profiles-visible', 'QA-PROFILE-INACTIVE', 'Inactive', 1000, 1, false),
('qa-profiles-draft', 'qa-profiles-draft', 'QA-PROFILE-DRAFT', 'Draft', 1000, 1, true),
('qa-profiles-archived', 'qa-profiles-archived', 'QA-PROFILE-ARCHIVED', 'Archived', 1000, 1, true),
('qa-profiles-category', 'qa-profiles-category', 'QA-PROFILE-CATEGORY', 'Hidden category', 1000, 1, true),
('qa-profiles-brand', 'qa-profiles-brand', 'QA-PROFILE-BRAND', 'Hidden brand', 1000, 1, true);
set constraints all immediate;

select set_config('request.jwt.claims', jsonb_build_object(
  'sub', (select id from qa_profile_users where label = 'customer-a'), 'role', 'authenticated',
  'user_metadata', jsonb_build_object('role', 'admin'), 'app_metadata', jsonb_build_object('role', 'admin')
)::text, true);
set local role authenticated;
do $$
declare user_id uuid; before_updated timestamptz; before_created timestamptz; affected integer; bad text;
begin
  select id into user_id from qa_profile_users where label = 'customer-a';
  if private.is_admin() or public.get_my_role() <> 'customer' then
    raise exception 'Forged role claims elevated customer';
  end if;
  if (select count(*) from public.profiles) <> 1
     or not exists (select 1 from public.profiles where id = user_id) then
    raise exception 'Customer can read another profile';
  end if;
  select updated_at, created_at into before_updated, before_created from public.profiles where id = user_id;
  update public.profiles set display_name = '  Tên mới  ', phone = '+84912345678' where id = user_id;
  get diagnostics affected = row_count;
  if affected <> 1 or not exists (
    select 1 from public.profiles where id = user_id and display_name = 'Tên mới' and phone = '+84912345678'
      and created_at = before_created and updated_at > before_updated
  ) then raise exception 'Own profile update, trim or timestamps failed'; end if;
  update public.profiles set phone = '12345678' where id = user_id;
  update public.profiles set phone = '+123456789012345' where id = user_id;
  update public.profiles set phone = null where id = user_id;
  foreach bad in array array['', E'\t\r\n ', 'a', repeat('a', 81)] loop
    begin
      update public.profiles set display_name = bad where id = user_id;
      raise exception 'Invalid display name accepted: %', bad;
    exception when check_violation then null; end;
  end loop;
  begin
    update public.profiles set display_name = null where id = user_id;
    raise exception 'Null display name accepted';
  exception when not_null_violation then null; end;
  foreach bad in array array['', '1234567', '1234567890123456', '+', '++12345678', '1234 5678', 'abcdefgh', '１２３４５６７８'] loop
    begin
      update public.profiles set phone = bad where id = user_id;
      raise exception 'Invalid phone accepted: %', bad;
    exception when check_violation then null; end;
  end loop;
  update public.profiles set display_name = 'Intrusion' where id = (select id from qa_profile_users where label = 'customer-b');
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Customer updated another profile'; end if;
  begin
    update public.profiles set id = (select id from qa_profile_users where label = 'customer-b') where id = user_id;
    raise exception 'Customer changed profile ID';
  exception when insufficient_privilege then null; end;
  begin
    update public.profiles set created_at = now() where id = user_id;
    raise exception 'Customer changed profile created_at';
  exception when insufficient_privilege then null; end;
  begin
    update public.profiles set updated_at = now() where id = user_id;
    raise exception 'Customer changed profile updated_at';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.profiles(id, display_name) values (user_id, 'Client insert');
    raise exception 'Customer inserted profile';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.profiles where id = user_id;
    raise exception 'Customer deleted profile';
  exception when insufficient_privilege then null; end;
  begin
    perform 1 from private.admin_users;
    raise exception 'Customer read admin membership';
  exception when insufficient_privilege then null; end;
  begin
    insert into private.admin_users(user_id) values (user_id);
    raise exception 'Customer granted self admin';
  exception when insufficient_privilege then null; end;
  if (select count(*) from public.categories where id like 'qa-profiles-%') <> 1
     or (select count(*) from public.brands where id like 'qa-profiles-%') <> 1
     or (select count(*) from public.products where id like 'qa-profiles-%') <> 1
     or (select count(*) from public.product_variants where id like 'qa-profiles-%') <> 1 then
    raise exception 'Customer catalog policy leaked hidden data';
  end if;
end;
$$;
reset role;

select set_config('request.jwt.claims', jsonb_build_object(
  'sub', (select id from qa_profile_users where label = 'customer-b'), 'role', 'authenticated'
)::text, true);
set local role authenticated;
do $$
begin
  if (select count(*) from public.profiles) <> 1
     or not exists (
       select 1 from public.profiles where id = (select id from qa_profile_users where label = 'customer-b')
         and display_name = 'Khách hàng'
     ) or public.get_my_role() <> 'customer' then
    raise exception 'Customer B profile isolation failed';
  end if;
end;
$$;
reset role;

select set_config('request.jwt.claims', jsonb_build_object(
  'sub', (select id from qa_profile_users where label = 'admin'), 'role', 'authenticated'
)::text, true);
set local role authenticated;
do $$
declare target text; affected integer;
begin
  if not private.is_admin() or public.get_my_role() <> 'admin' then raise exception 'Trusted admin not recognized'; end if;
  if (select count(*) from public.profiles) <> 1
     or not exists (select 1 from public.profiles where id = (select id from qa_profile_users where label = 'admin')) then
    raise exception 'Admin can read another customer profile';
  end if;
  update public.profiles set display_name = 'Admin intrusion' where id = (select id from qa_profile_users where label = 'customer-a');
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Admin updated another profile'; end if;
  if (select count(*) from public.categories where id like 'qa-profiles-%') <> 2
     or (select count(*) from public.brands where id like 'qa-profiles-%') <> 2
     or (select count(*) from public.products where id like 'qa-profiles-%') <> 5
     or (select count(*) from public.product_variants where id like 'qa-profiles-%') <> 6 then
    raise exception 'Admin cannot read entire catalog';
  end if;
  begin
    perform 1 from private.admin_users;
    raise exception 'Admin read membership table directly';
  exception when insufficient_privilege then null; end;
  foreach target in array array['categories', 'brands', 'products', 'product_variants'] loop
    begin
      execute format('update public.%I set id = id where id = %L', target, 'qa-profiles-visible');
      raise exception 'Admin wrote catalog directly: %', target;
    exception when insufficient_privilege then null; end;
  end loop;
end;
$$;
reset role;

delete from private.admin_users where user_id = (select id from qa_profile_users where label = 'admin');
set local role authenticated;
do $$
begin
  if private.is_admin() or public.get_my_role() <> 'customer'
     or exists (select 1 from public.products where id = 'qa-profiles-draft') then
    raise exception 'Revoked admin remains authorized with unchanged claims';
  end if;
end;
$$;
reset role;

select set_config('request.jwt.claims', '{}', true);
set local role authenticated;
do $$
begin
  if private.is_admin() or exists (select 1 from public.profiles) then
    raise exception 'Missing UID can access private profile/admin privilege';
  end if;
  begin
    perform public.get_my_role();
    raise exception 'Missing UID accepted by role RPC';
  exception when insufficient_privilege then null; end;
end;
$$;
reset role;

set local role anon;
do $$
begin
  begin
    perform 1 from public.profiles;
    raise exception 'Anonymous client read profiles';
  exception when insufficient_privilege then null; end;
  begin
    perform private.is_admin();
    raise exception 'Anonymous client called admin helper';
  exception when insufficient_privilege then null; end;
  begin
    perform public.get_my_role();
    raise exception 'Anonymous client called role RPC';
  exception when insufficient_privilege then null; end;
  if exists (select 1 from public.products where id = 'qa-profiles-draft')
     or exists (select 1 from public.product_variants where id = 'qa-profiles-inactive') then
    raise exception 'Anonymous catalog leaked hidden data';
  end if;
end;
$$;
reset role;

do $$
declare fixture_id uuid;
begin
  select id into fixture_id from qa_profile_users where label = 'customer-a';
  begin
    update public.profiles set id = gen_random_uuid() where id = fixture_id;
    raise exception 'Trusted write changed immutable profile ID';
  exception when check_violation then null; end;
  select id into fixture_id from qa_profile_users where label = 'cascade';
  delete from auth.users where id = fixture_id;
  if exists (select 1 from public.profiles where id = fixture_id)
     or exists (select 1 from private.admin_users where user_id = fixture_id) then
    raise exception 'Auth deletion did not cascade to profile/admin membership';
  end if;
end;
$$;

rollback;
select 'PASS: profile trigger, metadata fallback, validation, timestamps, ownership, admin role/catalog access, grants and cascades; fixtures rolled back' as result;
