-- A finite upper bound also rejects PostgreSQL numeric NaN.
alter table public.product_variants
  add constraint product_variants_price_finite check (price <= 999999999999999),
  add constraint product_variants_compare_price_finite check (compare_at_price <= 999999999999999);
