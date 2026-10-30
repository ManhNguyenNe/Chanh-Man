import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import { products, categories } from '../src/services/mock/catalog.js'

// Configuration is declared from the fixture, never inferred from display labels.
const productOptions = {
  'air-13': { ram_gb: 16, storage_type: 'SSD', color: 'Xanh' },
  'iphone-pro': { color: 'Cam' },
  'pro-14': { ram_gb: 24, storage_type: 'SSD', color: 'Đen' },
  'rtx-5090': { memory_gb: 32, memory_type: 'GDDR7', edition: 'Founders Edition', color: 'Đen' },
  'iphone-17': { storage: '256GB' },
  'air-15': { ram_gb: 16, storage: '512GB', storage_type: 'SSD', color: 'Vàng' },
  'asus-vivobook': { processor: 'Core i5', ram_gb: 16, storage: '512GB', storage_type: 'SSD', color: 'Bạc' },
  'lenovo-ideapad': { processor: 'Ryzen 5', ram_gb: 16, storage: '512GB', storage_type: 'SSD', color: 'Xám' },
  'dell-inspiron': { processor: 'Core i7', ram_gb: 16, storage: '512GB', storage_type: 'SSD', color: 'Bạc' },
  'hp-pavilion': { processor: 'Core i5', ram_gb: 16, storage: '512GB', storage_type: 'SSD', color: 'Trắng' },
  'asus-rog': { processor: 'Ryzen 9', ram_gb: 32, storage: '1TB', storage_type: 'SSD', color: 'Đen' },
  'samsung-s24': { ram_gb: 8, storage: '256GB', color: 'Tím' },
  'samsung-a55': { ram_gb: 8, storage: '128GB', color: 'Xanh' },
  'xiaomi-14': { ram_gb: 12, storage: '256GB', color: 'Đen' },
  'redmi-note': { ram_gb: 8, storage: '128GB', color: 'Xanh' },
  'oppo-reno': { ram_gb: 8, storage: '256GB', color: 'Trắng' },
  'vivo-v30': { ram_gb: 12, storage: '256GB', color: 'Xanh' },
  'amd-ryzen': { cores: 8, threads: 16, socket: 'AM5', color: 'Bạc' },
  'intel-i5': { cores: 10, socket: 'LGA1700', color: 'Bạc' },
  'corsair-ram': { memory_gb: 32, modules: 2, module_gb: 16, memory_type: 'DDR5', speed_label: 'DDR5 6000', color: 'Đen' },
  'kingston-ssd': { storage: '1TB', storage_type: 'SSD', form_factor: 'M.2', interface: 'NVMe', pcie_version: '4.0', color: 'Xanh' },
  'samsung-ssd': { storage: '1TB', storage_type: 'SSD', form_factor: 'M.2', interface: 'NVMe', pcie_version: '4.0', color: 'Đen' },
  'msi-mainboard': { socket: 'AM5', memory_type: 'DDR5', form_factor: 'ATX', color: 'Đen' },
  'coolermaster-psu': { power_watts: 750, efficiency: '80 Plus Gold', color: 'Đen' },
}

const variantOptions = {
  'air-13-256': { storage: '256GB' },
  'air-13-512': { storage: '512GB' },
  'iphone-pro-256': { storage: '256GB' },
  'iphone-pro-512': { storage: '512GB' },
  'pro-14-512': { storage: '512GB' },
  'pro-14-1tb': { storage: '1TB' },
  'rtx-5090-32': {},
  'iphone-17-lavender': { color: 'Tím' },
  'iphone-17-white': { color: 'Trắng' },
  'air-15-512': {},
  'asus-vivobook-standard': {},
  'asus-vivobook-extended': { warranty: 'extended-demo' },
  'lenovo-ideapad-standard': {},
  'lenovo-ideapad-extended': { warranty: 'extended-demo' },
  'dell-inspiron-standard': {},
  'dell-inspiron-extended': { warranty: 'extended-demo' },
  'hp-pavilion-standard': {},
  'hp-pavilion-extended': { warranty: 'extended-demo' },
  'asus-rog-standard': {},
  'asus-rog-extended': { warranty: 'extended-demo' },
  'samsung-s24-standard': {},
  'samsung-s24-extended': { warranty: 'extended-demo' },
  'samsung-a55-standard': {},
  'samsung-a55-extended': { warranty: 'extended-demo' },
  'xiaomi-14-standard': {},
  'xiaomi-14-extended': { warranty: 'extended-demo' },
  'redmi-note-standard': {},
  'redmi-note-extended': { warranty: 'extended-demo' },
  'oppo-reno-standard': {},
  'oppo-reno-extended': { warranty: 'extended-demo' },
  'vivo-v30-standard': {},
  'vivo-v30-extended': { warranty: 'extended-demo' },
  'amd-ryzen-standard': {},
  'amd-ryzen-extended': { warranty: 'extended-demo' },
  'intel-i5-standard': {},
  'intel-i5-extended': { warranty: 'extended-demo' },
  'corsair-ram-standard': {},
  'corsair-ram-extended': { warranty: 'extended-demo' },
  'kingston-ssd-standard': {},
  'kingston-ssd-extended': { warranty: 'extended-demo' },
  'samsung-ssd-standard': {},
  'samsung-ssd-extended': { warranty: 'extended-demo' },
  'msi-mainboard-standard': {},
  'msi-mainboard-extended': { warranty: 'extended-demo' },
  'coolermaster-psu-standard': {},
  'coolermaster-psu-extended': { warranty: 'extended-demo' },
}

const slug = (name) => name.toLowerCase().replaceAll(' ', '-')
const brands = [...new Set(products.map((product) => product.brand))].map((name) => ({ id: slug(name), name }))
const variants = products.flatMap((product) => product.variants)
const allowedNeeds = new Set(['study', 'work', 'game', 'creative', 'upgrade'])

function unique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} must be unique`)
}
function string(value, label) {
  assert.equal(typeof value, 'string', `${label} must be a string`)
  assert(value.trim().length > 0 && !value.includes('\0'), `${label} must be nonempty and contain no NUL`)
}
function strings(values, label) {
  assert(Array.isArray(values), `${label} must be an array`)
  values.forEach((value) => string(value, label))
}
function options(value, label) {
  assert(value && Object.getPrototypeOf(value) === Object.prototype, `${label} must be an object`)
  for (const [key, item] of Object.entries(value)) {
    string(key, label)
    if (typeof item === 'string') string(item, label)
    else assert(typeof item === 'number' && Number.isSafeInteger(item) && item > 0, `${label} has an invalid value`)
  }
}

assert.equal(categories.length, 3)
assert.equal(brands.length, 16)
assert.equal(products.length, 24)
assert.equal(variants.length, 46)
unique(categories.map((category) => category.id), 'category IDs')
unique(brands.map((brand) => brand.id), 'brand IDs/slugs')
unique(products.map((product) => product.id), 'product IDs/slugs')
unique(variants.map((variant) => variant.id), 'variant IDs')
unique(variants.map((variant) => `CM-${variant.id.toUpperCase()}`), 'SKUs')
assert.deepEqual(Object.keys(productOptions).sort(), products.map((product) => product.id).sort())
assert.deepEqual(Object.keys(variantOptions).sort(), variants.map((variant) => variant.id).sort())

for (const category of categories) {
  for (const field of ['id', 'name', 'caption', 'image', 'icon']) string(category[field], `category.${field}`)
}
for (const product of products) {
  for (const field of ['id', 'name', 'brand', 'category', 'image', 'badge', 'description']) string(product[field], `product.${field}`)
  assert(categories.some((category) => category.id === product.category), `Unknown category for ${product.id}`)
  strings(product.images ?? [], `${product.id}.images`)
  strings(product.specs, `${product.id}.specs`)
  strings(product.colors, `${product.id}.colors`)
  strings(product.needs, `${product.id}.needs`)
  assert(product.needs.every((need) => allowedNeeds.has(need)), `Unknown need for ${product.id}`)
  assert.equal(typeof product.promotion, 'boolean')
  assert(product.variants.length > 0, `${product.id} needs a variant before publishing`)
  options(productOptions[product.id], `${product.id}.options`)
  for (const variant of product.variants) {
    string(variant.id, 'variant.id')
    string(variant.label, 'variant.label')
    assert(Number.isSafeInteger(variant.price) && variant.price > 0 && variant.price <= 999999999999999, `Invalid price for ${variant.id}`)
    assert(Number.isInteger(variant.stock) && variant.stock >= 0 && variant.stock <= 2147483647, `Invalid stock for ${variant.id}`)
    options(variantOptions[variant.id], `${variant.id}.options`)
    options({ ...productOptions[product.id], ...variantOptions[variant.id] }, `${variant.id}.combinedOptions`)
  }
}

const textSql = (value) => `'${value.replaceAll("'", "''")}'`
const jsonSql = (value) => `${textSql(JSON.stringify(value))}::jsonb`
const arraySql = (values) => `ARRAY[${values.map(textSql).join(', ')}]::text[]`
function insert(table, columns, rows) {
  return `INSERT INTO public.${table} (${columns.join(', ')})\nVALUES\n${rows.map((row) => `  (${row.join(', ')})`).join(',\n')}\nON CONFLICT (id) DO NOTHING;`
}

const sql = [
  '-- Generated by node supabase/generate-seed.mjs from src/services/mock/catalog.js.',
  '-- Demo prices, stock and warranty labels; these are not live retail offers.',
  '-- Existing rows are preserved, including stock and later development edits.',
  'BEGIN;',
  'SET LOCAL standard_conforming_strings = on;',
  insert('categories', ['id', 'slug', 'name', 'caption', 'image_url', 'icon', 'sort_order', 'active'], categories.map((category, index) => [
    textSql(category.id), textSql(category.id), textSql(category.name), textSql(category.caption), textSql(category.image), textSql(category.icon), index, 'true',
  ])),
  insert('brands', ['id', 'slug', 'name', 'active'], brands.map((brand) => [textSql(brand.id), textSql(brand.id), textSql(brand.name), 'true'])),
  insert('products', ['id', 'slug', 'category_id', 'brand_id', 'name', 'description', 'badge', 'image_url', 'images', 'specs', 'specifications', 'needs', 'colors', 'promotion', 'status', 'sort_order'], products.map((product, index) => [
    textSql(product.id), textSql(product.id), textSql(product.category), textSql(slug(product.brand)), textSql(product.name), textSql(product.description), textSql(product.badge), textSql(product.image), jsonSql(product.images ?? []), jsonSql(product.specs), jsonSql([]), arraySql(product.needs), arraySql(product.colors), String(product.promotion), textSql('active'), index,
  ])),
  insert('product_variants', ['id', 'product_id', 'sku', 'label', 'options', 'price', 'compare_at_price', 'stock', 'image_url', 'active', 'sort_order'], products.flatMap((product) => product.variants.map((variant, index) => [
    textSql(variant.id), textSql(product.id), textSql(`CM-${variant.id.toUpperCase()}`), textSql(variant.label), jsonSql({ ...productOptions[product.id], ...variantOptions[variant.id] }), variant.price, 'NULL', variant.stock, 'NULL', 'true', index,
  ]))),
  `-- Migrations run before seed on a fresh database. Bootstrap only untracked stock.
-- Separate lock/read statements also serialize a concurrent seed or stock transaction.
DO $$
BEGIN
  PERFORM 1 FROM public.product_variants ORDER BY id COLLATE "C" FOR NO KEY UPDATE;
  INSERT INTO public.inventory_movements (variant_id, quantity_delta, reason, note)
  SELECT v.id, v.stock, 'initial', 'Initial demo stock from catalog seed'
  FROM public.product_variants v
  WHERE v.stock > 0
    AND NOT EXISTS (SELECT 1 FROM public.inventory_movements m WHERE m.variant_id = v.id);
END;
$$;`,
  'COMMIT;',
].join('\n\n') + '\n'

await writeFile(new URL('./seed.sql', import.meta.url), sql, 'utf8')
console.log(`categories: ${categories.length}, brands: ${brands.length}, products: ${products.length}, variants: ${variants.length}`)
