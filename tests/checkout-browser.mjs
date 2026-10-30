import { createRequire } from 'node:module'
import assert from 'node:assert/strict'
const require = createRequire(process.env.CODEX_NODE_PACKAGES + '/package.json')
const { chromium } = require('playwright')
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const base = 'http://127.0.0.1:5173'
const selection = [{ variantId: 'air-13-256', quantity: 2 }]
const errors = []
const watch = (page) => page.on('pageerror', (error) => errors.push(error.message))
const seed = async (page) => {
  await page.goto(`${base}/cart`)
  await page.evaluate((items) => localStorage.setItem('chanh-man:cart:v1', JSON.stringify(items)), selection)
  await page.reload()
}
const login = async (page, address = 'customer@chanhman.test', waitForForm = true) => {
  await page.getByRole('link', { name: 'Đăng nhập', exact: true }).click()
  await page.getByLabel('Email', { exact: true }).fill(address)
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Demo123!')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await page.waitForURL((url) => url.pathname === '/checkout')
  if (waitForForm) await page.getByLabel('Tên người nhận', { exact: true }).waitFor()
}
const fill = async (page) => {
  for (const [label, value] of [['Tên người nhận', 'Khách kiểm tra'], ['Số điện thoại', '0901234567'], ['Địa chỉ cụ thể', '123 Đường minh họa'], ['Phường / xã', 'Phường mẫu'], ['Tỉnh / thành phố', 'Thành phố mẫu']])
    await page.getByLabel(label, { exact: true }).fill(value)
}
const review = async (page) => {
  await page.getByRole('button', { name: 'Kiểm tra đơn hàng', exact: true }).click()
  await page.getByRole('button', { name: 'Xác nhận đặt hàng COD', exact: true }).waitFor()
}
const orderCount = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('chanh-man:orders:v1') || '[]').length)
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  watch(page)
  await seed(page)
  await page.getByRole('link', { name: 'Tiếp tục đặt hàng', exact: true }).click()
  await page.getByRole('heading', { name: 'Đăng nhập để đặt hàng' }).waitFor()
  await login(page)
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('chanh-man:cart:v1'))), selection)
  await page.getByRole('button', { name: 'Kiểm tra đơn hàng', exact: true }).click()
  await page.locator('.ant-form-item-explain-error').first().waitFor()
  await fill(page)
  await page.getByLabel('Số điện thoại', { exact: true }).fill('invalid')
  await page.getByRole('button', { name: 'Kiểm tra đơn hàng', exact: true }).click()
  await page.locator('.ant-form-item-explain-error').filter({ hasText: '8–15' }).waitFor()
  await page.getByRole('alert').filter({ hasText: 'Thông tin giao hàng chưa hợp lệ.' }).waitFor()
  assert(await page.getByLabel('Số điện thoại', { exact: true }).evaluate((element) => element === document.activeElement))
  assert.equal(await page.getByRole('button', { name: 'Xác nhận đặt hàng COD', exact: true }).count(), 0)
  await fill(page)
  await review(page)
  assert(await page.getByRole('heading', { name: 'Kiểm tra trước khi đặt' }).evaluate((element) => element === document.activeElement))
  assert.match(await page.locator('.order-summary').innerText(), /50.010.000/)
  for (const width of [360, 640, 641, 768, 833, 834, 1068, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }) })
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `checkout overflow ${width}`)
    for (const label of ['Kiểm tra đơn hàng', 'Xác nhận đặt hàng COD']) {
      const box = await page.getByRole('button', { name: label, exact: true }).boundingBox()
      assert(box.width >= 44 && box.height >= 44)
    }
    if ([360, 768, 1440].includes(width)) await page.screenshot({ path: `docs/previews/checkout-${width}.png`, fullPage: true })
  }
  await page.getByLabel('Ghi chú (không bắt buộc)', { exact: true }).fill('Giao hàng minh họa')
  assert.equal(await page.getByRole('button', { name: 'Xác nhận đặt hàng COD', exact: true }).count(), 0, 'editing invalidates review')
  await review(page)
  await page.evaluate(async () => { const { products } = await import('/src/services/mock/catalog.js'); products[0].variants[0].price += 100000 })
  await page.getByRole('button', { name: 'Xác nhận đặt hàng COD', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: 'Giá hoặc phí giao hàng đã thay đổi.' }).first().waitFor()
  assert.equal(await orderCount(page), 0)
  assert.match(await page.locator('.order-summary').innerText(), /50.210.000/)
  await page.getByRole('button', { name: 'Xác nhận đặt hàng COD', exact: true }).focus()
  await page.keyboard.press('Enter')
  await page.waitForURL((url) => url.pathname.startsWith('/account/orders/'))
  await page.getByRole('heading', { name: 'Đã tạo đơn hàng dùng thử', exact: true }).waitFor()
  const orderId = new URL(page.url()).pathname.split('/').at(-1)
  assert.equal(await orderCount(page), 1)
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('chanh-man:cart:v1'))), [])
  await page.getByRole('button', { name: 'Giỏ hàng, 0 sản phẩm' }).waitFor()
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.screenshot({ path: `docs/previews/order-${width}.png`, fullPage: true })
  }
  await page.reload()
  await page.getByText('Ghi chú: Giao hàng minh họa', { exact: true }).waitFor()
  await page.goto(`${base}/san-pham/air-13`)
  await page.getByText('Còn 6 sản phẩm', { exact: true }).first().waitFor()
  await page.goto(`${base}/checkout?order=${orderId}`)
  await page.waitForURL((url) => url.pathname === `/account/orders/${orderId}`)
  assert.equal(await orderCount(page), 1, 'recovery reads the committed order')
  await page.goto(`${base}/account`)
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click()
  await page.goto(`${base}/account/orders/${orderId}`)
  await page.getByRole('link', { name: 'Đăng nhập', exact: true }).click()
  await page.getByLabel('Email', { exact: true }).fill('admin@chanhman.test')
  await page.getByLabel('Mật khẩu', { exact: true }).fill('Demo123!')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: 'Không tìm thấy đơn hàng' }).waitFor()
  await page.close()

  const failure = await browser.newPage()
  watch(failure)
  await seed(failure)
  await failure.goto(`${base}/checkout`)
  await login(failure)
  await fill(failure)
  await review(failure)
  await failure.evaluate(() => {
    const set = Storage.prototype.setItem
    window.restoreOrderWrite = () => { Storage.prototype.setItem = set }
    Storage.prototype.setItem = function (key, value) { if (key === 'chanh-man:orders:v1') throw new Error('blocked'); return set.call(this, key, value) }
  })
  await failure.getByRole('button', { name: 'Xác nhận đặt hàng COD', exact: true }).click()
  await failure.getByRole('alert').filter({ hasText: 'Không thể đọc hoặc lưu đơn dùng thử.' }).first().waitFor()
  const attemptId = new URL(failure.url()).searchParams.get('order')
  assert.equal(await orderCount(failure), 0)
  assert.equal(await failure.getByLabel('Địa chỉ cụ thể', { exact: true }).inputValue(), '123 Đường minh họa')
  assert.deepEqual(await failure.evaluate(() => JSON.parse(localStorage.getItem('chanh-man:cart:v1'))), selection)
  await failure.evaluate(() => window.restoreOrderWrite())
  await failure.getByRole('button', { name: 'Xác nhận đặt hàng COD', exact: true }).click()
  await failure.waitForURL((url) => url.pathname === `/account/orders/${attemptId}`)
  assert.equal(await orderCount(failure), 1)
  await failure.close()

  const shortage = await browser.newPage()
  watch(shortage)
  await seed(shortage)
  await shortage.goto(`${base}/checkout`)
  await login(shortage)
  await fill(shortage)
  await review(shortage)
  await shortage.evaluate(async () => { const { products } = await import('/src/services/mock/catalog.js'); products[0].variants[0].stock = 1 })
  await shortage.getByRole('button', { name: 'Xác nhận đặt hàng COD', exact: true }).click()
  await shortage.getByRole('alert').filter({ hasText: 'còn 1, bạn chọn 2' }).waitFor()
  assert.equal(await orderCount(shortage), 0)
  assert.deepEqual(await shortage.evaluate(() => JSON.parse(localStorage.getItem('chanh-man:cart:v1'))), selection)
  await shortage.close()

  const kept = await browser.newPage()
  watch(kept)
  await seed(kept)
  await kept.goto(`${base}/checkout`)
  await login(kept)
  await fill(kept)
  await review(kept)
  await kept.evaluate(() => localStorage.setItem('chanh-man:cart:v1', JSON.stringify([
    { variantId: 'air-13-256', quantity: 2 }, { variantId: 'air-13-512', quantity: 1 },
  ])))
  await kept.getByRole('button', { name: 'Xác nhận đặt hàng COD', exact: true }).click()
  await kept.waitForURL((url) => url.pathname.startsWith('/account/orders/'))
  await kept.getByRole('heading', { name: 'Giỏ hàng được giữ lại', exact: true }).waitFor()
  assert.equal(await kept.evaluate(() => JSON.parse(localStorage.getItem('chanh-man:cart:v1')).length), 2)
  await kept.close()

  const expired = await browser.newPage()
  watch(expired)
  await expired.goto(`${base}/checkout`)
  await login(expired, undefined, false)
  await expired.getByText('Giỏ hàng của bạn đang trống.', { exact: true }).waitFor()
  await seed(expired)
  await expired.goto(`${base}/checkout/`)
  await fill(expired)
  await review(expired)
  await expired.evaluate(() => {
    const value = JSON.parse(sessionStorage.getItem('chanh-man:auth-session:v1'))
    value.expiresAt = Date.now() - 1
    sessionStorage.setItem('chanh-man:auth-session:v1', JSON.stringify(value))
  })
  await expired.getByRole('button', { name: 'Xác nhận đặt hàng COD', exact: true }).click()
  await expired.getByRole('heading', { name: 'Đăng nhập để đặt hàng' }).waitFor()
  assert.equal(await orderCount(expired), 0)
  assert.deepEqual(await expired.evaluate(() => JSON.parse(localStorage.getItem('chanh-man:cart:v1'))), selection)
  await expired.close()

  const blockedCleanup = await browser.newPage()
  watch(blockedCleanup)
  await seed(blockedCleanup)
  await blockedCleanup.goto(`${base}/checkout`)
  await login(blockedCleanup)
  await fill(blockedCleanup)
  await review(blockedCleanup)
  await blockedCleanup.evaluate(() => {
    const set = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) { if (key === 'chanh-man:cart:v1') throw new Error('blocked'); return set.call(this, key, value) }
  })
  await blockedCleanup.getByRole('button', { name: 'Xác nhận đặt hàng COD', exact: true }).click()
  await blockedCleanup.waitForURL((url) => url.pathname.startsWith('/account/orders/'))
  await blockedCleanup.getByRole('heading', { name: 'Giỏ hàng được giữ lại', exact: true }).waitFor()
  assert.equal(await orderCount(blockedCleanup), 1)
  assert.deepEqual(await blockedCleanup.evaluate(() => JSON.parse(localStorage.getItem('chanh-man:cart:v1'))), selection)
  await blockedCleanup.close()

  const context = await browser.newContext()
  const tabs = await Promise.all([context.newPage(), context.newPage()])
  try {
    for (const tab of tabs) {
      watch(tab)
      await tab.goto(`${base}/login`)
      await tab.getByLabel('Email', { exact: true }).fill('customer@chanhman.test')
      await tab.getByLabel('Mật khẩu', { exact: true }).fill('Demo123!')
      await tab.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
      await tab.waitForURL(`${base}/cart`)
    }
    const concurrent = await Promise.all(tabs.map((tab) => tab.evaluate(async () => {
      const { quoteOrder, createOrder } = await import('/src/services/orderService.js')
      const items = [{ variantId: 'air-13-256', quantity: 5 }]
      const shippingAddress = { fullName: 'Khách hai tab', phone: '0901234567', street: '123 Đường mẫu', ward: 'Phường mẫu', city: 'Thành phố mẫu', note: '' }
      const quote = await quoteOrder({ items, shippingAddress, paymentMethod: 'cod' })
      try { await createOrder({ items, shippingAddress, paymentMethod: 'cod', requestId: crypto.randomUUID(), quoteFingerprint: quote.fingerprint }); return 'created' }
      catch (error) { return error.code }
    })))
    assert.deepEqual(concurrent.sort(), ['OUT_OF_STOCK', 'created'])
    assert.equal(await orderCount(tabs[0]), 1)
  } finally { await context.close() }
  assert.deepEqual(errors, [])
  console.log('Checkout browser passed: guest/login return, empty cart, address validation, review/edit, price change, COD/receipt/reload, stock, isolation, idempotent recovery, failed write/retry, retained changed cart, expired session, failed cleanup, two-tab stock, keyboard and responsive.')
} finally { await browser.close() }
