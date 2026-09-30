import test from 'node:test'
import assert from 'node:assert/strict'
import { getCategoryFilters, listProducts } from '../src/services/productService.js'
const ids = (result) => result.items.map((p) => p.id)
test('category facets contain only category brands and colors', async () => {
  const pc = await getCategoryFilters('pc')
  assert.deepEqual(pc.brands, ['NVIDIA', 'AMD', 'Intel', 'Corsair', 'Kingston', 'Samsung', 'MSI', 'Cooler Master'])
  assert.deepEqual(pc.colors, ['Đen', 'Bạc', 'Xanh'])
  const phone = await getCategoryFilters('phone')
  assert.deepEqual(phone.colors, ['Cam', 'Tím', 'Trắng', 'Xanh', 'Đen'])
})
test('filters intersect across groups and combine colors within a group', async () => {
  assert.deepEqual(
    ids(
      await listProducts({
        category: 'laptop',
        brands: ['Apple'],
        colors: ['Xanh', 'Đen'],
        promotion: true,
        priceRange: '20-30',
      }),
    ),
    ['air-13'],
  )
  assert.equal(
    (await listProducts({ category: 'laptop', brands: ['Apple'], colors: ['Đen'], promotion: true })).total,
    0,
  )
})
test('price buckets use starting price and do not overlap', async () => {
  assert.deepEqual(ids(await listProducts({ category: 'laptop', brands: ['Apple'], priceRange: '20-30' })), ['air-13'])
  assert.deepEqual(ids(await listProducts({ category: 'laptop', brands: ['Apple'], priceRange: '30-40' })), ['air-15'])
  assert.deepEqual(ids(await listProducts({ category: 'laptop', brands: ['Apple'], priceRange: 'over-40' })), [
    'pro-14',
  ])
  assert.equal((await listProducts({ category: 'laptop', brands: ['Apple'], priceRange: 'under-20' })).total, 0)
})
test('sort applies to all results before pagination', async () => {
  const first = await listProducts({ category: 'laptop', brands: ['Apple'], sort: 'price-desc', limit: 2, page: 1 })
  const second = await listProducts({ category: 'laptop', brands: ['Apple'], sort: 'price-desc', limit: 2, page: 2 })
  assert.deepEqual(ids(first), ['pro-14', 'air-15'])
  assert.deepEqual(ids(second), ['air-13'])
  assert.equal(first.total, 3)
  assert.equal(second.total, 3)
  assert.equal((await listProducts({ category: 'laptop', brands: ['Apple'], limit: 2, page: 99 })).page, 2)
})
test('search combines with category and supports Vietnamese without accents', async () => {
  assert.equal((await listProducts({ category: 'phone', q: 'dien thoai' })).total, 8)
  assert.equal((await listProducts({ category: 'pc', q: 'dien thoai' })).total, 0)
})
test('promotion and stock filters return eligible products only', async () => {
  assert.deepEqual(ids(await listProducts({ brands: ['Apple'], promotion: true, inStock: true })), [
    'air-13',
    'iphone-17',
  ])
})
test('aborted query rejects instead of returning stale results', async () => {
  const controller = new AbortController()
  const request = listProducts({ signal: controller.signal })
  controller.abort()
  await assert.rejects(request, { name: 'AbortError' })
})
test('results are copies and sorting does not mutate default catalog order', async () => {
  const result = await listProducts({ sort: 'price-desc' })
  result.items[0].name = 'Changed'
  assert.equal((await listProducts()).items[0].name, 'MacBook Air 13 inch')
})

test('all categories span multiple pages with no duplicated IDs', async () => {
 for (const category of ['laptop', 'phone', 'pc']) {
  const first = await listProducts({ category, limit: 6, page: 1 })
  const second = await listProducts({ category, limit: 6, page: 2 })
  assert.equal(first.total, 8)
  assert.equal(first.items.length, 6)
  assert.equal(second.items.length, 2)
  assert.equal(new Set([...ids(first), ...ids(second)]).size, 8)
 }
})
test('expanded catalog contains valid variants, assets and sold-out fixtures', async () => {
 const { existsSync } = await import('node:fs')
 const result = await listProducts({ limit: 100 })
 assert.equal(result.total, 24)
 const variantIds = new Set()
 for (const product of result.items) {
  assert.ok(existsSync(new URL('../public' + product.image, import.meta.url)))
  assert.ok(product.colors.length > 0)
  assert.ok(product.variants.length > 0)
  for (const variant of product.variants) {
   assert.ok(!variantIds.has(variant.id))
   variantIds.add(variant.id)
   assert.ok(variant.price > 0 && Number.isInteger(variant.stock) && variant.stock >= 0)
  }
 }
 const inStock = await listProducts({ inStock: true, limit: 100 })
 assert.equal(inStock.total, 21)
 assert.ok(inStock.items.every((p) => p.variants.some((v) => v.stock > 0)))
 const budget = await listProducts({ category: 'phone', brands: ['Xiaomi'], priceRange: 'under-20', limit: 100 })
 assert.deepEqual(ids(budget), ['xiaomi-14', 'redmi-note'])
})
