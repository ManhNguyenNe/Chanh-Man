import assert from 'node:assert/strict'
import process from 'node:process'
import { products, categories } from '../src/services/mock/catalog.js'

const baseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY
assert(baseUrl && key, 'Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY')
assert(key.startsWith('sb_publishable_'), 'Use a publishable key for this anonymous API check')

async function request(path, method = 'GET', body) {
  const response = await fetch(new URL('/rest/v1/' + path, baseUrl), {
    method,
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  })
  const data = await response.json()
  return { response, data }
}
async function read(path) {
  const { response, data } = await request(path)
  assert.equal(response.status, 200, 'Catalog read failed: ' + JSON.stringify(data))
  assert(Array.isArray(data), 'Expected catalog rows')
  return data
}

const categoryRows = await read('categories?select=id,active&limit=1000')
const brandRows = await read('brands?select=id,active&limit=1000')
const productRows = await read('products?select=id,category_id,brand_id,status&limit=1000')
const variantRows = await read('product_variants?select=id,product_id,price,stock,active&limit=1000')
const productIds = new Set(productRows.map((row) => row.id))
const categoryIds = new Set(categoryRows.map((row) => row.id))
const brandIds = new Set(brandRows.map((row) => row.id))
const variantIds = new Set(variantRows.map((row) => row.id))
assert(categoryRows.every((row) => row.active))
assert(brandRows.every((row) => row.active))
assert(productRows.every((row) => row.status === 'active' && categoryIds.has(row.category_id) && brandIds.has(row.brand_id)))
assert(variantRows.every((row) =>
  row.active && productIds.has(row.product_id) &&
  Number.isSafeInteger(row.price) && row.price > 0 &&
  Number.isInteger(row.stock) && row.stock >= 0,
))
assert(categories.every((row) => categoryIds.has(row.id)), 'Seed categories missing')
assert(products.every((row) => productIds.has(row.id)), 'Seed products missing')
assert(products.flatMap((row) => row.variants).every((row) => variantIds.has(row.id)), 'Seed variants missing')
assert(productRows.every((row) => variantRows.some((variant) => variant.product_id === row.id)))
assert(variantRows.some((row) => row.stock === 0), 'Sold-out variants should remain visible')
assert.equal((await read('products?select=id&status=neq.active')).length, 0)
assert.equal((await read('product_variants?select=id&active=eq.false')).length, 0)

// Mutations target a nonexistent ID or invalid empty row, leaving catalog data intact.
for (const [path, method, body] of [
  ['product_variants?id=eq.qa-api-does-not-exist', 'PATCH', { stock: 0 }],
  ['products?id=eq.qa-api-does-not-exist', 'DELETE', undefined],
  ['brands', 'POST', {}],
]) {
  const { response, data } = await request(path, method, body)
  assert([401, 403].includes(response.status), 'Anonymous mutation must be rejected')
  assert.equal(data.code, '42501', 'Expected a privilege denial')
}
const profiles = await request('profiles?select=id,display_name,phone')
assert([401, 403].includes(profiles.response.status), 'Anonymous profile read must be denied')
assert.equal(profiles.data.code, '42501')
const role = await request('rpc/get_my_role', 'POST', {})
assert([401, 403, 404].includes(role.response.status), 'Role RPC requires authentication')
assert(['42501', 'PGRST202'].includes(role.data.code), 'Role RPC must reject anonymous callers')
const cart = await request('cart_items?select=user_id,variant_id,quantity')
assert([401, 403].includes(cart.response.status), 'Anonymous cart read must be denied')
assert.equal(cart.data.code, '42501')
for (const [path, body] of [
  ['rpc/get_my_cart', {}],
  ['rpc/merge_guest_cart', { p_request_id: '00000000-0000-0000-0000-000000000001', p_items: [] }],
  ['rpc/quote_order', { p_items: [] }],
  ['rpc/get_order', { p_order_id: '00000000-0000-0000-0000-000000000001' }],
  ['rpc/create_order', { p_request_id: '00000000-0000-0000-0000-000000000001', p_items: [], p_shipping_address: {}, p_quote_fingerprint: '' }],
  ['rpc/set_order_status', { p_order_id: '00000000-0000-0000-0000-000000000001', p_status: 'cancelled' }],
  ['rpc/adjust_stock', { p_variant_id: 'qa-api-does-not-exist', p_target_stock: 0, p_expected_stock: 0, p_note: 'Permission test' }],
]) {
  const reply = await request(path, 'POST', body)
  assert([401, 403, 404].includes(reply.response.status), `${path} requires authentication`)
  assert(['42501', 'PGRST202'].includes(reply.data.code), `${path} must reject anonymous callers`)
}
for (const table of ['orders', 'order_items', 'order_status_history', 'inventory_movements']) {
  const reply = await request(`${table}?select=id`)
  assert([401, 403].includes(reply.response.status), `${table} read must be denied to anonymous callers`)
  assert.equal(reply.data.code, '42501')
}
for (const table of ['tasks', 'products_legacy']) {
  const reply = await request(`${table}?select=id`)
  assert.equal(reply.response.status, 404, `${table} should be removed`)
  assert.equal(reply.data.code, 'PGRST205')
}
const privateResponse = await fetch(new URL('/rest/v1/admin_users?select=user_id', baseUrl), {
  headers: { apikey: key, 'Accept-Profile': 'private' },
  signal: AbortSignal.timeout(15000),
})
assert.equal(privateResponse.status, 406, 'Private schema must not be exposed through Data API')
assert.equal((await privateResponse.json()).code, 'PGRST106')
console.log('PASS: anonymous Data API reads catalog, rejects writes, protects profiles/cart/orders/admin RPCs; demo tables removed')
console.log(JSON.stringify({
  categories: categoryRows.length, brands: brandRows.length,
  products: productRows.length, variants: variantRows.length,
}))
