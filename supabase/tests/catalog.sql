-- Run as postgres on the dev database. Every fixture is rolled back.
begin;

do $$
declare target text;
begin
  foreach target in array array['categories','brands','products','product_variants'] loop
    if not exists (
      select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = target and c.relrowsecurity
    ) then raise exception 'RLS missing: %', target; end if;
    if not has_table_privilege('anon', 'public.' || target, 'SELECT')
       or not has_table_privilege('authenticated', 'public.' || target, 'SELECT')
       or has_table_privilege('anon', 'public.' || target, 'INSERT,UPDATE,DELETE')
       or has_table_privilege('authenticated', 'public.' || target, 'INSERT,UPDATE,DELETE') then
      raise exception 'Catalog grants incorrect: %', target;
    end if;
  end loop;
  if has_schema_privilege('anon', 'private', 'USAGE')
     or has_table_privilege('authenticated', 'private.admin_users', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'Private schema or admin table is exposed to clients';
  end if;
end;
$$;

insert into public.categories(id,slug,name,active) values
('qa-catalog-visible','qa-catalog-visible','QA visible',true),
('qa-catalog-hidden','qa-catalog-hidden','QA hidden',false);
insert into public.brands(id,slug,name,active) values
('qa-catalog-visible','qa-catalog-visible','QA visible',true),
('qa-catalog-hidden','qa-catalog-hidden','QA hidden',false);
insert into public.products(id,slug,name,image_url,category_id,brand_id,status) values
('qa-catalog-visible','qa-catalog-visible','QA visible','/qa.png','qa-catalog-visible','qa-catalog-visible','active'),
('qa-catalog-draft','qa-catalog-draft','QA draft','/qa.png','qa-catalog-visible','qa-catalog-visible','draft'),
('qa-catalog-archived','qa-catalog-archived','QA archived','/qa.png','qa-catalog-visible','qa-catalog-visible','archived'),
('qa-catalog-category','qa-catalog-category','QA category hidden','/qa.png','qa-catalog-hidden','qa-catalog-visible','active'),
('qa-catalog-brand','qa-catalog-brand','QA brand hidden','/qa.png','qa-catalog-visible','qa-catalog-hidden','active');
insert into public.product_variants(id,product_id,sku,label,price,stock,active) values
('qa-catalog-visible','qa-catalog-visible','QA-VISIBLE','Visible sold out',1000,0,true),
('qa-catalog-inactive','qa-catalog-visible','QA-INACTIVE','Inactive',1000,1,false),
('qa-catalog-draft','qa-catalog-draft','QA-DRAFT','Draft',1000,1,true),
('qa-catalog-archived','qa-catalog-archived','QA-ARCHIVED','Archived',1000,1,true),
('qa-catalog-category','qa-catalog-category','QA-CATEGORY','Category hidden',1000,1,true),
('qa-catalog-brand','qa-catalog-brand','QA-BRAND','Brand hidden',1000,1,true);

-- Confirms deferred publication accepts a product and variants in one transaction.
set constraints all immediate;

do $$
begin
  begin
    update public.product_variants set stock = -1 where id = 'qa-catalog-visible';
    raise exception 'Negative stock accepted';
  exception when check_violation then null; end;
  begin
    update public.product_variants set price = 0 where id = 'qa-catalog-visible';
    raise exception 'Zero price accepted';
  exception when check_violation then null; end;
  begin
    update public.product_variants set price = 'NaN'::numeric where id = 'qa-catalog-visible';
    raise exception 'NaN price accepted';
  exception when check_violation then null; end;
  begin
    update public.product_variants set compare_at_price = 'NaN'::numeric where id = 'qa-catalog-visible';
    raise exception 'NaN reference price accepted';
  exception when check_violation then null; end;
  begin
    update public.product_variants set compare_at_price = 999 where id = 'qa-catalog-visible';
    raise exception 'Reference price below price accepted';
  exception when check_violation then null; end;
  begin
    update public.products set images = '[123]'::jsonb where id = 'qa-catalog-visible';
    raise exception 'Invalid images accepted';
  exception when check_violation then null; end;
  begin
    update public.products set needs = array['unknown'] where id = 'qa-catalog-visible';
    raise exception 'Unknown need accepted';
  exception when check_violation then null; end;
  begin
    update public.products set category_id = 'qa-does-not-exist' where id = 'qa-catalog-visible';
    raise exception 'Invalid category accepted';
  exception when foreign_key_violation then null; end;
  begin
    update public.products set image_url = null where id = 'qa-catalog-visible';
    raise exception 'Incomplete active product accepted';
  exception when check_violation then null; end;
  begin
    update public.products set id = 'qa-renamed' where id = 'qa-catalog-draft';
    raise exception 'Mutable product ID accepted';
  exception when check_violation then null; end;
  begin
    update public.product_variants set product_id = 'qa-catalog-draft' where id = 'qa-catalog-visible';
    raise exception 'Variant moved between products';
  exception when check_violation then null; end;
  begin
    update public.product_variants set active = false where id = 'qa-catalog-visible';
    raise exception 'Last active variant hidden';
  exception when check_violation then null; end;
  begin
    delete from public.product_variants where id = 'qa-catalog-visible';
    raise exception 'Last active variant deleted';
  exception when check_violation then null; end;
  begin
    insert into public.products(id,slug,name,image_url,category_id,brand_id,status)
    values('qa-catalog-no-variant','qa-catalog-no-variant','Invalid','/qa.png','qa-catalog-visible','qa-catalog-visible','active');
    raise exception 'Active product without variant accepted';
  exception when check_violation then null; end;
  begin
    delete from public.categories where id = 'qa-catalog-visible';
    raise exception 'Referenced category deleted';
  exception when foreign_key_violation then null; end;
  update public.brands set name = 'QA renamed' where id = 'qa-catalog-visible';
  if not exists (
    select 1 from public.brands where id = 'qa-catalog-visible' and updated_at > created_at
  ) then raise exception 'updated_at trigger failed'; end if;
end;
$$;

set local role anon;
do $$
begin
  if (select count(*) from public.products where id like 'qa-catalog-%') <> 1
     or not exists (select 1 from public.products where id = 'qa-catalog-visible') then
    raise exception 'Anonymous product RLS leaked hidden products';
  end if;
  if (select count(*) from public.product_variants where id like 'qa-catalog-%') <> 1
     or not exists (select 1 from public.product_variants where id = 'qa-catalog-visible' and stock = 0) then
    raise exception 'Anonymous variant RLS incorrect or sold-out variant hidden';
  end if;
  if exists (select 1 from public.categories where id = 'qa-catalog-hidden')
     or exists (select 1 from public.brands where id = 'qa-catalog-hidden') then
    raise exception 'Anonymous parent RLS leaked inactive rows';
  end if;
  begin
    update public.product_variants set stock = 99 where id = 'qa-catalog-visible';
    raise exception 'Anonymous stock write allowed';
  exception when insufficient_privilege then null; end;
end;
$$;
reset role;

set local role authenticated;
do $$
begin
  if (select count(*) from public.products where id like 'qa-catalog-%') <> 1
     or (select count(*) from public.product_variants where id like 'qa-catalog-%') <> 1 then
    raise exception 'Authenticated catalog RLS leaked rows';
  end if;
  begin
    insert into public.brands(id,slug,name) values('qa-client-write','qa-client-write','Client write');
    raise exception 'Authenticated catalog insert allowed';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.products where id = 'qa-catalog-visible';
    raise exception 'Authenticated catalog delete allowed';
  exception when insufficient_privilege then null; end;
end;
$$;
reset role;

set local role service_role;
insert into public.product_variants(id,product_id,sku,label,price)
values('qa-catalog-service','qa-catalog-draft','QA-SERVICE','Trusted writer',1000);
reset role;

rollback;
select 'PASS: catalog constraints, publication, timestamps, RLS and grants; fixtures rolled back' as result;
