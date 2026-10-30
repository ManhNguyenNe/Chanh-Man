import { createRequire } from 'node:module'
import assert from 'node:assert/strict'

const require = createRequire(process.env.CODEX_NODE_PACKAGES + '/package.json')
const { chromium } = require('playwright')
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const base = 'http://127.0.0.1:5173'
const ordersKey = 'chanh-man:orders:v1'
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const cards = () => page.locator('.orders-card')
  const login = async (email = 'customer@chanhman.test') => {
    await page.getByRole('link', { name: 'Đăng nhập', exact: true }).click()
    await page.waitForURL((url) => url.pathname === '/login' && url.searchParams.get('next') === '/account/orders')
    await page.getByLabel('Email', { exact: true }).fill(email)
    await page.getByLabel('Mật khẩu', { exact: true }).fill('Demo123!')
    await page.getByLabel('Mật khẩu', { exact: true }).press('Enter')
    await page.waitForURL(`${base}/account/orders`)
  }
  await page.goto(`${base}/account/orders/`)
  await page.getByRole('heading', { name: 'Đăng nhập để xem đơn hàng', exact: true }).waitFor()
  assert.equal(await cards().count(), 0)
  assert.equal(await page.locator('.nav-orders').getAttribute('href'), '/login?next=%2Faccount%2Forders')
  await page.setViewportSize({ width: 360, height: 900 })
  await page.getByRole('button', { name: 'Mở danh mục', exact: true }).click()
  assert.equal(await page.locator('.mobile-links').getByRole('link', { name: 'Đơn hàng của tôi', exact: true }).getAttribute('href'), '/login?next=%2Faccount%2Forders')
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 1440, height: 900 })
  await login()
  await page.getByText('Bạn chưa có đơn hàng nào.', { exact: true }).waitFor()
  assert.equal(await page.title(), 'Đơn hàng của tôi | Chanh&Man')
  assert.equal(await page.getByRole('link', { name: 'Khám phá sản phẩm', exact: true }).getAttribute('href'), '/san-pham')
  await page.goto(base)
  await page.locator('.nav-orders').focus()
  await page.keyboard.press('Enter')
  await page.waitForURL(`${base}/account/orders`)
  await page.getByText('Bạn chưa có đơn hàng nào.', { exact: true }).waitFor()

  // Create the first history entry through the actual checkout UI.
  await page.goto(`${base}/cart`)
  await page.evaluate(() => localStorage.setItem('chanh-man:cart:v1', JSON.stringify([{ variantId: 'air-13-256', quantity: 1 }])))
  await page.reload()
  await page.getByRole('link', { name: 'Tiếp tục đặt hàng', exact: true }).click()
  for (const [label, value] of [['Tên người nhận', 'Khách lịch sử'], ['Số điện thoại', '0901234567'], ['Địa chỉ cụ thể', '123 Đường mẫu'], ['Phường / xã', 'Phường mẫu'], ['Tỉnh / thành phố', 'Thành phố mẫu']])
    await page.getByLabel(label, { exact: true }).fill(value)
  await page.getByRole('button', { name: 'Kiểm tra đơn hàng', exact: true }).click()
  await page.getByRole('button', { name: 'Xác nhận đặt hàng COD', exact: true }).click()
  await page.waitForURL((url) => url.pathname.startsWith('/account/orders/'))
  const originalId = new URL(page.url()).pathname.split('/').at(-1)
  await page.getByRole('link', { name: 'Về danh sách đơn hàng', exact: true }).click()
  await cards().first().waitFor()
  assert.equal(await cards().count(), 1)
  assert.equal(await cards().first().getByRole('link', { name: /Xem chi tiết đơn/ }).getAttribute('href'), `/account/orders/${originalId}`)

  // Additional snapshots cover states not yet editable without admin.
  const fixtures = await page.evaluate(async () => {
    const original = JSON.parse(localStorage.getItem('chanh-man:orders:v1'))[0]
    original.createdAt = '2025-01-01T00:00:00Z'
    const { quoteOrder } = await import('/src/services/orderService.js')
    const quote = await quoteOrder({ items: [{ variantId: 'air-13-256', quantity: 1 }, { variantId: 'air-13-512', quantity: 1 }], paymentMethod: 'cod' })
    const states = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled']
    const extra = states.map((status, index) => {
      const id = crypto.randomUUID()
      return { ...original, id, requestId: id, code: `CM-${id.slice(0, 8).toUpperCase()}`, status,
        paymentStatus: status === 'delivered' ? 'paid' : 'unpaid', createdAt: `2026-0${index + 1}-01T00:00:00Z` }
    })
    const newest = extra.at(-1)
    Object.assign(newest, { items: quote.items, subtotal: quote.subtotal, total: quote.total })
    newest.items[0].productName = 'MacBook Air với tên sản phẩm dài để kiểm tra xuống dòng trên màn hình điện thoại'
    const adminId = crypto.randomUUID()
    const admin = { ...original, id: adminId, requestId: adminId, userId: 'demo-admin', code: 'CM-ADMIN', createdAt: '2026-09-01T00:00:00Z' }
    localStorage.setItem('chanh-man:orders:v1', JSON.stringify([original, admin, ...extra]))
    return { newestId: newest.id, newestCode: newest.code, saved: localStorage.getItem('chanh-man:orders:v1') }
  })
  await page.getByRole('button', { name: 'Làm mới', exact: true }).click()
  await page.getByText('Và 1 phiên bản khác trong đơn.', { exact: true }).waitFor()
  assert.equal(await cards().count(), 6)
  assert.match(await cards().first().innerText(), new RegExp(fixtures.newestCode))
  assert.match(await cards().first().innerText(), /Đã hủy/)
  assert.match(await cards().first().innerText(), /2 sản phẩm/)
  assert(!await page.locator('main').innerText().then((value) => value.includes('CM-ADMIN')))
  for (const label of ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao hàng', 'Đã giao hàng', 'Đã hủy'])
    assert(await page.locator('.order-status').filter({ hasText: label }).count() > 0)
  assert.match(await cards().filter({ hasText: 'Đã giao hàng' }).innerText(), /COD · Đã thanh toán/)
  for (const width of [360, 640, 641, 768, 833, 834, 1068, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `history overflow ${width}`)
    assert.equal(await page.locator('.nav-orders').isVisible(), width >= 834)
    if (width >= 834) {
      const box = await page.locator('.nav-orders').boundingBox()
      assert(box.width >= 44 && box.height >= 44)
      if ([834, 1440].includes(width)) await page.locator('.site-header').screenshot({ path: `docs/previews/header-orders-${width}.png` })
    }
    for (const link of [page.getByRole('button', { name: 'Làm mới', exact: true }), cards().first().getByRole('link', { name: /Xem chi tiết đơn/ })]) {
      const box = await link.boundingBox()
      assert(box.width >= 44 && box.height >= 44)
    }
    if ([360, 768, 1440].includes(width)) await page.screenshot({ path: `docs/previews/orders-${width}.png`, fullPage: true })
  }
  await page.setViewportSize({ width: 360, height: 900 })
  await page.goto(base)
  await page.getByRole('button', { name: 'Mở danh mục', exact: true }).click()
  const mobileOrders = page.locator('.mobile-links').getByRole('link', { name: 'Đơn hàng của tôi', exact: true })
  assert.equal(await mobileOrders.getAttribute('href'), '/account/orders')
  const mobileBox = await mobileOrders.boundingBox()
  assert(mobileBox.width >= 44 && mobileBox.height >= 44)
  await page.screenshot({ path: 'docs/previews/header-orders-mobile-360.png' })
  await mobileOrders.focus()
  await page.keyboard.press('Enter')
  await page.waitForURL(`${base}/account/orders`)
  await cards().first().waitFor()
  await page.setViewportSize({ width: 1440, height: 900 })
  await cards().first().getByRole('link', { name: /Xem chi tiết đơn/ }).focus()
  await page.keyboard.press('Enter')
  await page.waitForURL(`${base}/account/orders/${fixtures.newestId}`)
  await page.getByText('Trạng thái: Đã hủy', { exact: true }).waitFor()
  await page.getByRole('link', { name: 'Về danh sách đơn hàng', exact: true }).click()
  await cards().first().waitFor()
  await page.getByRole('link', { name: 'Thông tin cá nhân', exact: true }).click()
  await page.locator('.auth-demo').screenshot({ path: 'docs/previews/profile-orders-button-1440.png' })
  await page.locator('.profile-links').getByRole('link', { name: 'Đơn hàng của tôi', exact: true }).focus()
  await page.keyboard.press('Enter')
  await cards().first().waitFor()
  await page.reload()
  await cards().first().waitFor()
  assert.equal(await cards().count(), 6)

  await page.evaluate(() => {
    const get = Storage.prototype.getItem
    window.restoreOrdersRead = () => { Storage.prototype.getItem = get }
    Storage.prototype.getItem = function (key) { if (key === 'chanh-man:orders:v1') throw new Error('blocked'); return get.call(this, key) }
  })
  await page.getByRole('button', { name: 'Làm mới', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: 'Không thể đọc hoặc lưu đơn dùng thử.' }).waitFor()
  assert.equal(await cards().count(), 0)
  await page.evaluate(() => window.restoreOrdersRead())
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click()
  await cards().first().waitFor()
  await page.evaluate(() => localStorage.setItem('chanh-man:orders:v1', '{broken'))
  await page.getByRole('button', { name: 'Làm mới', exact: true }).click()
  await page.getByRole('alert').waitFor()
  assert.equal(await page.evaluate((key) => localStorage.getItem(key), ordersKey), '{broken')
  await page.evaluate(({ saved }) => localStorage.setItem('chanh-man:orders:v1', saved), fixtures)
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click()
  await cards().first().waitFor()

  await page.goto(`${base}/account`)
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click()
  await page.getByRole('heading', { name: 'Vui lòng đăng nhập', exact: true }).waitFor()
  await page.goto(`${base}/account/orders/`)
  await login('admin@chanhman.test')
  await cards().first().waitFor()
  assert.equal(await cards().count(), 1)
  assert.match(await cards().first().innerText(), /CM-ADMIN/)
  await page.goto(`${base}/account/orders/${fixtures.newestId}`)
  await page.getByRole('alert').filter({ hasText: 'Không tìm thấy đơn hàng' }).waitFor()
  await page.goto(`${base}/account/orders`)
  await cards().first().waitFor()
  await page.evaluate(() => {
    const session = JSON.parse(sessionStorage.getItem('chanh-man:auth-session:v1'))
    session.expiresAt = Date.now() - 1
    sessionStorage.setItem('chanh-man:auth-session:v1', JSON.stringify(session))
  })
  await page.getByRole('button', { name: 'Làm mới', exact: true }).click()
  await page.getByRole('heading', { name: 'Đăng nhập để xem đơn hàng', exact: true }).waitFor()
  assert.equal(await cards().count(), 0)
  assert.equal(await page.evaluate((key) => localStorage.getItem(key), ordersKey), fixtures.saved)
  assert.deepEqual(errors, [])
  console.log('Orders browser passed: guest/login return, empty, checkout to history, newest first, snapshots/statuses, desktop header/mobile menu/profile entry, detail links, reload/refresh, storage failure/retry, corrupt data preservation, account isolation, expiry, keyboard and responsive.')
} finally { await browser.close() }
