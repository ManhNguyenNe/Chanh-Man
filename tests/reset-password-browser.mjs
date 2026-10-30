import { createRequire } from 'node:module'
import assert from 'node:assert/strict'
const require = createRequire(process.env.CODEX_NODE_PACKAGES + '/package.json')
const { chromium } = require('playwright')
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const base = 'http://127.0.0.1:5173'
const key = 'chanh-man:auth-recovery:v1'
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('pageerror', (issue) => errors.push(issue.message))
  const password = () => page.getByLabel('Mật khẩu mới', { exact: true })
  const confirmation = () => page.getByLabel('Nhập lại mật khẩu mới', { exact: true })
  const submit = () => page.getByRole('button', { name: 'Đặt mật khẩu mới', exact: true })
  const snapshot = () => page.evaluate(() => ({ session: Object.entries({ ...sessionStorage }).filter(([name]) => name !== 'chanh-man:auth-recovery:v1'), cart: localStorage.getItem('chanh-man:cart:v1') }))
  const fresh = async () => {
    await page.goto(`${base}/forgot-password?next=%2Faccount%2Forders`)
    await page.getByLabel('Email đăng ký', { exact: true }).fill('unknown@example.test')
    await page.getByRole('button', { name: 'Gửi yêu cầu khôi phục', exact: true }).click()
    await page.getByRole('button', { name: 'Mô phỏng mở liên kết khôi phục', exact: true }).click()
    await page.waitForURL((url) => url.pathname === '/reset-password')
    await password().waitFor()
  }
  await page.goto(`${base}/reset-password?next=https%3A%2F%2Fevil.example`)
  await page.getByRole('heading', { name: 'Liên kết không hợp lệ', exact: true }).waitFor()
  assert.equal(await password().count(), 0)
  assert.equal(await page.getByRole('link', { name: 'Yêu cầu liên kết mới', exact: true }).getAttribute('href'), '/forgot-password?next=%2Fcart')
  await page.evaluate(() => localStorage.setItem('chanh-man:cart:v1', JSON.stringify([{ variantId: 'air-13-256', quantity: 1 }])))
  await page.goto(`${base}/forgot-password?next=%2Faccount%2Forders`)
  await page.getByLabel('Email đăng ký', { exact: true }).fill('unknown@example.test')
  await page.getByRole('button', { name: 'Gửi yêu cầu khôi phục', exact: true }).click()
  await page.getByRole('heading', { name: 'Yêu cầu dùng thử đã hoàn tất', exact: true }).waitFor()
  await page.evaluate(() => {
    const set = Storage.prototype.setItem
    window.restoreResetWrite = () => { Storage.prototype.setItem = set }
    Storage.prototype.setItem = function (name, value) { if (name === 'chanh-man:auth-recovery:v1') throw new Error('blocked'); return set.call(this, name, value) }
  })
  await page.getByRole('button', { name: 'Mô phỏng mở liên kết khôi phục', exact: true }).click()
  await page.getByRole('alert').waitFor()
  assert.equal(new URL(page.url()).pathname, '/forgot-password')
  await page.evaluate(() => window.restoreResetWrite())
  await page.getByRole('button', { name: 'Mô phỏng mở liên kết khôi phục', exact: true }).click()
  await password().waitFor()
  assert(new URLSearchParams(new URL(page.url()).hash.slice(1)).get('token'))
  assert(!new URL(page.url()).searchParams.has('token'), 'ticket is in fragment, not query')
  await page.reload()
  await password().waitFor()
  const before = await snapshot()
  await submit().click()
  await page.locator('.ant-form-item-explain-error').first().waitFor()
  assert(await password().evaluate((element) => document.activeElement === element))
  await password().fill('short')
  await confirmation().fill('different')
  await submit().click()
  await page.locator('.ant-form-item-explain-error').filter({ hasText: '8 đến 128' }).waitFor()
  await password().fill('SampleReset456!')
  await submit().click()
  await page.locator('.ant-form-item-explain-error').filter({ hasText: 'chưa khớp' }).waitFor()
  await confirmation().fill('SampleReset456!')
  const visibility = page.locator('.auth-panel .ant-input-password-icon').first()
  await visibility.focus(); await page.keyboard.press('Enter')
  assert.equal(await password().getAttribute('type'), 'text')
  await page.keyboard.press('Enter')
  assert.equal(await password().getAttribute('type'), 'password')
  for (const width of [360, 640, 641, 768, 833, 834, 1068, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }) })
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `reset overflow ${width}`)
    const box = await submit().boundingBox(); assert(box.width >= 44 && box.height >= 44)
    if ([360, 768, 1440].includes(width)) await page.screenshot({ path: `docs/previews/reset-password-${width}.png`, fullPage: true })
  }
  await page.evaluate(() => {
    const set = Storage.prototype.setItem
    window.restoreResetWrite = () => { Storage.prototype.setItem = set }
    Storage.prototype.setItem = function (name, value) { if (name === 'chanh-man:auth-recovery:v1') throw new Error('blocked'); return set.call(this, name, value) }
  })
  await submit().click()
  await page.getByRole('alert').waitFor()
  assert.equal(await password().inputValue(), 'SampleReset456!')
  assert.equal(await page.evaluate((name) => JSON.parse(sessionStorage.getItem(name)).used, key), false)
  await page.evaluate(() => {
    window.restoreResetWrite()
    const set = Storage.prototype.setItem
    window.resetWrites = 0
    Storage.prototype.setItem = function (name, value) { if (name === 'chanh-man:auth-recovery:v1') window.resetWrites++; return set.call(this, name, value) }
    const form = document.querySelector('.auth-panel form'); form.requestSubmit(); form.requestSubmit()
  })
  await page.getByRole('heading', { name: 'Đã mô phỏng đặt mật khẩu mới', exact: true }).waitFor()
  assert.equal(await page.evaluate(() => window.resetWrites), 1)
  assert.equal(await password().count(), 0)
  assert.deepEqual(await snapshot(), before)
  assert(!await page.evaluate(() => JSON.stringify({ ...sessionStorage }).includes('SampleReset456!')))
  await page.screenshot({ path: 'docs/previews/reset-password-result-1440.png', fullPage: true })
  assert.equal(await page.getByRole('link', { name: 'Về trang đăng nhập', exact: true }).getAttribute('href'), '/login?next=%2Faccount%2Forders')
  await page.reload()
  await page.getByRole('heading', { name: 'Liên kết đã được sử dụng', exact: true }).waitFor()
  await fresh()
  const validUrl = page.url()
  const isolated = await browser.newPage()
  await isolated.goto(validUrl)
  await isolated.getByRole('heading', { name: 'Liên kết không hợp lệ', exact: true }).waitFor()
  await isolated.close()
  await page.evaluate((name) => { const recovery = JSON.parse(sessionStorage.getItem(name)); recovery.expiresAt = Date.now() + 1500; sessionStorage.setItem(name, JSON.stringify(recovery)) }, key)
  await page.reload()
  await page.getByRole('heading', { name: 'Liên kết đã hết hạn', exact: true }).waitFor()
  assert.equal(await password().count(), 0)
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }) })
  await page.screenshot({ path: 'docs/previews/reset-password-expired-1440.png', fullPage: true })
  await fresh()
  const readFailure = await browser.newPage()
  await readFailure.goto(`${base}/forgot-password`)
  const readUrl = await readFailure.evaluate(async () => { const { createDemoRecovery } = await import('/src/services/authService.js'); const { token } = await createDemoRecovery(); return `/reset-password/#token=${token}` })
  await readFailure.addInitScript(() => {
    const get = Storage.prototype.getItem
    window.restoreResetRead = () => { Storage.prototype.getItem = get }
    Storage.prototype.getItem = function (name) { if (name === 'chanh-man:auth-recovery:v1') throw new Error('blocked'); return get.call(this, name) }
  })
  await readFailure.goto(base + readUrl)
  await readFailure.getByRole('heading', { name: 'Chưa kiểm tra được liên kết', exact: true }).waitFor()
  await readFailure.evaluate(() => window.restoreResetRead())
  await readFailure.getByRole('button', { name: 'Thử lại', exact: true }).click()
  await readFailure.getByLabel('Mật khẩu mới', { exact: true }).waitFor()
  await readFailure.close()
  assert.deepEqual(errors, [])
  console.log('Reset browser passed: missing/used/expired/same-tab ticket, forgot entry, issue/read/consume failure and retry, validation, duplicate submit, no saved password/auth changes, safe next, reload/trailing slash, keyboard and responsive.')
} finally { await browser.close() }
