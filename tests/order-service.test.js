import test from 'node:test'
import assert from 'node:assert/strict'
import { quoteOrder, createOrder, getMyOrder, listMyOrders, shippingFee } from '../src/services/orderService.js'
import { demoPassword, signIn, signOut } from '../src/services/authService.js'
import { findVariant, getProduct, listProducts } from '../src/services/productService.js'
import { clearPurchasedCart, getCart } from '../src/services/cartService.js'
import { products } from '../src/services/mock/catalog.js'

test('COD validates and reprices, commits stock once, isolates orders and preserves data on failures', async () => {
  const local = new Map()
  const session = new Map()
  let blockedKey = ''
  const storage = (map) => ({
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => { if (key === blockedKey) throw new Error('blocked'); map.set(key, value) },
    removeItem: (key) => map.delete(key),
  })
  globalThis.localStorage = storage(local)
  globalThis.sessionStorage = storage(session)
  const variant = products[0].variants[0]
  const originalPrice = variant.price
  const address = { fullName: 'Khách dùng thử', phone: '0901234567', street: '123 Đường mẫu', ward: 'Phường mẫu', city: 'Thành phố mẫu', note: '' }
  const items = [{ variantId: variant.id, quantity: 2 }]
  const payload = async (requestId = crypto.randomUUID(), selection = items) => {
    const quote = await quoteOrder({ items: selection, shippingAddress: address, paymentMethod: 'cod' })
    return { items: selection, shippingAddress: address, paymentMethod: 'cod', quoteFingerprint: quote.fingerprint, requestId }
  }
  try {
    await assert.rejects(createOrder(await payload()), { code: 'UNAUTHENTICATED' })
    await assert.rejects(listMyOrders(), { code: 'UNAUTHENTICATED' })
    await signIn({ email: 'customer@chanhman.test', password: demoPassword })
    assert.deepEqual(await listMyOrders(), [])
    for (const selection of [[], [{ variantId: variant.id, quantity: 1.5 }], [{ variantId: variant.id, quantity: 0 }], [{ variantId: variant.id, quantity: 1000 }]])
      await assert.rejects(quoteOrder({ items: selection, paymentMethod: 'cod' }), { code: 'VALIDATION_ERROR' })
    await assert.rejects(createOrder({ ...await payload(), shippingAddress: { ...address, phone: 'bad', street: 'x' } }), (error) =>
      error.code === 'VALIDATION_ERROR' && Boolean(error.fieldErrors.phone && error.fieldErrors.street))
    await assert.rejects(quoteOrder({ items, paymentMethod: 'card' }), { code: 'VALIDATION_ERROR' })
    const soldOut = await quoteOrder({ items: [{ variantId: 'iphone-pro-512', quantity: 1 }, { variantId: 'unknown', quantity: 1 }], paymentMethod: 'cod' })
    assert.equal(soldOut.issues.length, 2)
    let input = await payload()
    const quote = await quoteOrder({ items: [...items, ...items], paymentMethod: 'cod' })
    assert.equal(quote.items.length, 1)
    assert.equal(quote.items[0].quantity, 4)
    assert.equal(quote.total, originalPrice * 4 + shippingFee)
    variant.price += 100000
    await assert.rejects(createOrder(input), (error) => error.code === 'PRICE_CHANGED' && error.quote.total === variant.price * 2 + shippingFee)
    assert.equal(local.has('chanh-man:orders:v1'), false)
    input = await payload(input.requestId)
    blockedKey = 'chanh-man:orders:v1'
    await assert.rejects(createOrder(input), { code: 'STORAGE_ERROR' })
    assert.equal(findVariant(variant.id).variant.stock, 8)
    blockedKey = ''
    const [order, duplicate] = await Promise.all([createOrder({ ...input, total: 1, userId: 'demo-admin', status: 'delivered' }), createOrder(input)])
    assert.equal(order.id, duplicate.id)
    assert.equal(order.total, variant.price * 2 + shippingFee)
    assert.equal(order.userId, 'demo-customer')
    assert.equal(order.status, 'pending')
    assert.equal(order.paymentStatus, 'unpaid')
    assert.equal(JSON.parse(local.get('chanh-man:orders:v1')).length, 1)
    const own = await listMyOrders({ userId: 'demo-admin' })
    assert.deepEqual(own.map((item) => item.id), [order.id])
    own[0].items[0].quantity = 99
    assert.equal((await listMyOrders())[0].items[0].quantity, 2, 'list returns independent snapshots')
    assert.equal(findVariant(variant.id).variant.stock, 6)
    assert.equal((await getProduct(products[0].id)).variants[0].stock, 6)
    assert.equal((await listProducts({ q: 'MacBook Air 13 inch' })).items.find((item) => item.id === products[0].id).variants[0].stock, 6)
    await assert.rejects(createOrder({ ...input, shippingAddress: { ...address, note: 'Different' } }), { code: 'REQUEST_CONFLICT' })
    variant.price += 100000
    assert.equal((await createOrder(input)).total, order.total)
    assert.equal((await getMyOrder(order.id)).items[0].unitPrice, order.items[0].unitPrice)
    order.shippingAddress.fullName = 'Changed client copy'
    assert.equal((await getMyOrder(order.id)).shippingAddress.fullName, address.fullName)
    await signOut()
    await signIn({ email: 'admin@chanhman.test', password: demoPassword })
    assert.deepEqual(await listMyOrders(), [], 'admin account does not get another user history')
    await assert.rejects(getMyOrder(order.id), { code: 'NOT_FOUND' })
    await assert.rejects(createOrder(input), { code: 'REQUEST_CONFLICT' })
    const competing = [{ variantId: variant.id, quantity: 4 }]
    const results = await Promise.allSettled([createOrder(await payload(crypto.randomUUID(), competing)), createOrder(await payload(crypto.randomUUID(), competing))])
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
    assert.equal(results.find((result) => result.status === 'rejected').reason.code, 'OUT_OF_STOCK')
    assert.equal(findVariant(variant.id).variant.stock, 2)
    assert.equal((await listMyOrders()).length, 1)
    assert.equal((await listMyOrders())[0].userId, 'demo-admin')
    local.set('chanh-man:cart:v1', JSON.stringify(items))
    blockedKey = 'chanh-man:cart:v1'
    await assert.rejects(clearPurchasedCart(items), /Không thể lưu/)
    assert.equal((await getCart()).count, 2)
    blockedKey = ''
    local.set('chanh-man:cart:v1', JSON.stringify([...items, { variantId: 'air-13-512', quantity: 1 }]))
    assert.equal(await clearPurchasedCart(items), false)
    assert.equal(JSON.parse(local.get('chanh-man:cart:v1')).length, 2)
    local.set('chanh-man:cart:v1', JSON.stringify(items))
    assert.equal(await clearPurchasedCart(items), true)
    assert.equal((await getCart()).count, 0)
    const saved = local.get('chanh-man:orders:v1')
    await signOut()
    await signIn({ email: 'customer@chanhman.test', password: demoPassword })
    const existing = JSON.parse(saved)
    const first = { ...existing.find((item) => item.userId === 'demo-customer'), createdAt: '2025-01-01T00:00:00Z' }
    const newer = ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'ffffffff-ffff-4fff-8fff-ffffffffffff'].map((id, index) => ({
      ...first, id, requestId: id, createdAt: '2026-01-01T00:00:00Z', status: index ? 'cancelled' : 'delivered',
    }))
    local.set('chanh-man:orders:v1', JSON.stringify([existing.find((item) => item.userId === 'demo-admin'), first, ...newer]))
    assert.deepEqual((await listMyOrders()).map((item) => item.id), [newer[1].id, newer[0].id, first.id], 'newest first, deterministic ties and cancelled orders retained')
    local.set('chanh-man:orders:v1', saved)
    for (const invalid of ['{broken', 'null', '[{}]']) {
      local.set('chanh-man:orders:v1', invalid)
      await assert.rejects(getMyOrder(order.id), { code: 'STORAGE_ERROR' })
      await assert.rejects(listMyOrders(), { code: 'STORAGE_ERROR' })
      await assert.rejects(quoteOrder({ items, paymentMethod: 'cod' }), { code: 'STORAGE_ERROR' })
      assert.equal(local.get('chanh-man:orders:v1'), invalid)
    }
    local.set('chanh-man:orders:v1', saved)
    await signOut()
    await assert.rejects(getMyOrder(order.id), { code: 'UNAUTHENTICATED' })
    await assert.rejects(listMyOrders(), { code: 'UNAUTHENTICATED' })
  } finally {
    variant.price = originalPrice
    delete globalThis.localStorage
    delete globalThis.sessionStorage
  }
})
