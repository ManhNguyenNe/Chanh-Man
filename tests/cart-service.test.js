import test from 'node:test'
import assert from 'node:assert/strict'
import { getCart, addItem, updateQuantity, removeItem } from '../src/services/cartService.js'

test('cart preserves variants, totals and stored data on failed writes', async () => {
  let stored = '[]'
  let blocked = false
  globalThis.localStorage = {
    getItem: () => stored,
    setItem: (_key, value) => { if (blocked) throw new Error('blocked'); stored = value },
  }
  try {
    assert.equal((await getCart()).count, 0)
    await addItem('air-13-256')
    await addItem('air-13-256')
    let cart = await addItem('air-13-512')
    assert.equal(cart.items.length, 2)
    assert.equal(cart.count, 3)
    assert.equal(cart.total, 24990000 * 2 + 29990000)
    assert.equal(cart.items[0].productId, 'air-13')
    cart = await updateQuantity('air-13-256', 3)
    assert.equal(cart.total, 24990000 * 3 + 29990000)
    for (const quantity of [0, -1, 1.5, 9]) await assert.rejects(updateQuantity('air-13-256', quantity))
    await assert.rejects(addItem('iphone-pro-512'))
    const previous = stored
    blocked = true
    await assert.rejects(removeItem('air-13-256'), /Không thể lưu/)
    assert.equal(stored, previous)
    blocked = false
    await removeItem('air-13-256')
    assert.equal((await getCart()).items[0].variantId, 'air-13-512')
    await removeItem('air-13-512')
    assert.equal((await getCart()).count, 0)
    stored = '{bad'
    assert.equal((await getCart()).count, 0)
    stored = JSON.stringify([{ variantId: 'air-13-256', quantity: 99 }, { variantId: 'iphone-pro-512', quantity: 1 }])
    cart = await getCart()
    assert.equal(cart.count, 8)
    assert.equal(cart.notices.length, 2)
  } finally { delete globalThis.localStorage }
})
