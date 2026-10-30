import { createRequire } from 'node:module'
import assert from 'node:assert/strict'

const require = createRequire(process.env.CODEX_NODE_PACKAGES + '/package.json')
const { chromium } = require('playwright')
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const baseUrl = 'http://127.0.0.1:5173'
const cart = [{ variantId: 'air-13-256', quantity: 2 }]
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const name = () => page.getByLabel('Họ và tên', { exact: true })
  const email = () => page.getByLabel('Email', { exact: true })
  const phone = () => page.getByLabel('Số điện thoại', { exact: true })
  const save = () => page.getByRole('button', { name: 'Lưu thay đổi', exact: true })
  const guestHeading = () => page.getByRole('heading', { name: 'Vui lòng đăng nhập', exact: true })
  const signedAccount = (displayName) => page.getByRole('button', { name: `Tài khoản của ${displayName}`, exact: true })
  const assertCart = async () => assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('chanh-man:cart:v1'))), cart)
  const signIn = async (address = 'customer@chanhman.test') => {
    await page.getByRole('link', { name: 'Đăng nhập', exact: true }).click()
    await page.waitForURL((url) => url.pathname === '/login' && url.searchParams.get('next') === '/account')
    await email().fill(address)
    await page.getByLabel('Mật khẩu', { exact: true }).fill('Demo123!')
    await page.getByLabel('Mật khẩu', { exact: true }).press('Enter')
    await page.waitForURL(`${baseUrl}/account`)
    await name().waitFor()
  }
  const signOut = async () => {
    await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click()
    await guestHeading().waitFor()
    await assertCart()
  }
  const saveProfile = async (displayName, number) => {
    await name().fill(displayName)
    await phone().fill(number)
    await save().focus()
    await page.keyboard.press('Enter')
    await page.getByRole('status').filter({ hasText: 'Đã lưu thông tin hồ sơ.' }).waitFor()
    await signedAccount(displayName).waitFor()
  }

  await page.goto(`${baseUrl}/account`)
  await guestHeading().waitFor()
  await page.evaluate((items) => localStorage.setItem('chanh-man:cart:v1', JSON.stringify(items)), cart)
  await signIn()
  await page.getByRole('heading', { name: /^Hồ sơ của bạn/ }).waitFor()
  assert.equal(await email().inputValue(), 'customer@chanhman.test')
  assert.equal(await email().getAttribute('readonly'), '')
  assert.equal(await name().inputValue(), 'Khách hàng Demo')
  assert.equal(await phone().inputValue(), '')
  assert.equal(await name().getAttribute('maxlength'), '80')

  for (const invalidName of ['', 'A']) {
    await name().fill(invalidName)
    await save().click()
    await page.locator('.ant-form-item-explain-error').first().waitFor()
    assert.equal(await name().inputValue(), invalidName)
  }
  await name().fill('Hồ sơ kiểm tra')
  for (const invalidPhone of ['abc123', '1234']) {
    await phone().fill(invalidPhone)
    await save().click()
    await page.locator('.ant-form-item-explain-error').first().waitFor()
    assert.equal(await phone().inputValue(), invalidPhone)
  }
  await saveProfile('Hồ sơ kiểm tra', '+84901234567')
  await page.reload()
  await signedAccount('Hồ sơ kiểm tra').waitFor()
  assert.equal(await name().inputValue(), 'Hồ sơ kiểm tra')
  assert.equal(await phone().inputValue(), '+84901234567')
  for (const width of [360, 640, 641, 768, 833, 834, 1068, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `profile overflow ${width}`)
    for (const control of [save(), page.getByRole('button', { name: 'Đăng xuất', exact: true })]) {
      const size = await control.boundingBox()
      assert(size.width >= 44 && size.height >= 44, `profile control target ${width}`)
    }
    if ([360, 768, 1440].includes(width)) await page.screenshot({ path: `docs/previews/profile-${width}.png`, fullPage: true })
  }

  await page.getByRole('link', { name: 'Tiếp tục mua sắm', exact: true }).click()
  await page.waitForURL(`${baseUrl}/san-pham`)
  await signedAccount('Hồ sơ kiểm tra').click()
  await page.waitForURL(`${baseUrl}/account`)
  const privacy = page.getByRole('button', { name: 'Quyền riêng tư', exact: true })
  await privacy.focus()
  await page.keyboard.press('Enter')
  await page.getByRole('dialog').waitFor()
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  assert(await privacy.evaluate((element) => element === document.activeElement), 'support modal restores focus')
  await page.goto(`${baseUrl}/cart`)
  await page.getByRole('button', { name: 'Tài khoản của bạn', exact: true }).click()
  await page.waitForURL(`${baseUrl}/account`)
  await page.goto(`${baseUrl}/san-pham`)
  await page.setViewportSize({ width: 360, height: 900 })
  await page.getByRole('button', { name: 'Mở danh mục', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Tài khoản', exact: true }).click()
  await page.waitForURL(`${baseUrl}/account`)
  await page.setViewportSize({ width: 1440, height: 900 })
  await assertCart()

  await signOut()
  await signIn('admin@chanhman.test')
  assert.equal(await name().inputValue(), 'Quản trị viên Demo')
  assert.equal(await phone().inputValue(), '')
  await saveProfile('Quản trị kiểm tra', '0900000002')
  await page.reload()
  await signedAccount('Quản trị kiểm tra').waitFor()
  assert.equal(await phone().inputValue(), '0900000002')
  await signOut()
  await signIn()
  assert.equal(await name().inputValue(), 'Hồ sơ kiểm tra')
  assert.equal(await phone().inputValue(), '+84901234567')

  await page.evaluate(() => {
    const getItem = Storage.prototype.getItem
    window.restoreProfileRead = () => { Storage.prototype.getItem = getItem }
    Storage.prototype.getItem = function (key) {
      if (key.startsWith('chanh-man:auth-')) throw new Error('blocked')
      return getItem.call(this, key)
    }
    window.dispatchEvent(new Event('focus'))
  })
  await page.getByRole('alert').filter({ hasText: 'Không thể lưu hoặc đọc phiên đăng nhập.' }).waitFor()
  await page.evaluate(() => window.restoreProfileRead())
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click()
  await name().waitFor()
  assert.equal(await name().inputValue(), 'Hồ sơ kiểm tra')
  await page.evaluate(() => {
    const setItem = Storage.prototype.setItem
    window.restoreProfileWrite = () => { Storage.prototype.setItem = setItem }
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('chanh-man:auth-')) throw new Error('blocked')
      return setItem.call(this, key, value)
    }
  })
  await name().fill('Bản nháp giữ nguyên')
  await phone().fill('0900000099')
  await save().click()
  await page.getByRole('alert').filter({ hasText: 'Không thể lưu hoặc đọc phiên đăng nhập.' }).waitFor()
  assert.equal(await name().inputValue(), 'Bản nháp giữ nguyên')
  assert.equal(await phone().inputValue(), '0900000099')
  await signedAccount('Hồ sơ kiểm tra').waitFor()
  await page.evaluate(() => window.restoreProfileWrite())
  await save().click()
  await signedAccount('Bản nháp giữ nguyên').waitFor()
  await page.reload()
  await name().waitFor()
  assert.equal(await name().inputValue(), 'Bản nháp giữ nguyên')

  await name().fill('Không được lưu khi hết phiên')
  await page.evaluate(() => {
    const session = JSON.parse(sessionStorage.getItem('chanh-man:auth-session:v1'))
    session.expiresAt = Date.now() - 1
    sessionStorage.setItem('chanh-man:auth-session:v1', JSON.stringify(session))
  })
  await save().click()
  await guestHeading().waitFor()
  await signIn()
  assert.equal(await name().inputValue(), 'Bản nháp giữ nguyên', 'expired session cannot save profile')
  assert.equal(await phone().inputValue(), '0900000099')
  await signOut()
  assert.deepEqual(errors, [])
  console.log('Profile browser checks passed: guest/login return, profile editing/reload, validation, readonly email, account isolation, header/footer/mobile navigation, storage failure/retry, expired save, cart preservation, keyboard, responsive.')
} finally { await browser.close() }
