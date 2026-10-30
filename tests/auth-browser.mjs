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
  const email = () => page.getByLabel('Email', { exact: true })
  const password = () => page.getByLabel('Mật khẩu', { exact: true })
  const assertCart = async () => assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('chanh-man:cart:v1'))), cart)
  const signIn = async (address = 'customer@chanhman.test') => {
    await email().fill(address)
    await password().fill('Demo123!')
    await password().press('Enter')
  }
  const signOut = async (name) => {
    if (new URL(page.url()).pathname !== '/account') {
      await page.getByRole('button', { name: `Tài khoản của ${name}`, exact: true }).click()
      await page.waitForURL(`${baseUrl}/account`)
    }
    await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click()
    await page.getByRole('heading', { name: 'Vui lòng đăng nhập', exact: true }).waitFor()
    await page.getByRole('button', { name: 'Tài khoản', exact: true }).waitFor()
  }
  const checkWidths = async (route) => {
    for (const width of [360, 640, 641, 768, 833, 834, 1068, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} overflow ${width}`)
      for (const control of await page.locator('.auth-panel .ant-input-password-icon').all()) {
        const size = await control.boundingBox()
        assert(size.width >= 44 && size.height >= 44, `${route} password visibility target ${width}`)
      }
      if ([360, 768, 1440].includes(width)) await page.screenshot({ path: `docs/previews/${route}-${width}.png`, fullPage: true })
    }
  }

  await page.goto(`${baseUrl}/cart`)
  await page.evaluate((items) => localStorage.setItem('chanh-man:cart:v1', JSON.stringify(items)), cart)
  await page.reload()
  await page.getByRole('button', { name: 'Tài khoản', exact: true }).click()
  await page.waitForURL((url) => url.pathname === '/login')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await page.locator('.ant-form-item-explain-error').first().waitFor()
  assert.equal(await page.locator('.ant-form-item-explain-error').count(), 2)
  await email().fill('invalid-email')
  await password().fill('Demo123!')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await page.locator('.ant-form-item-explain-error').first().waitFor()
  assert.equal(new URL(page.url()).pathname, '/login')
  await email().fill('customer@chanhman.test')
  await password().fill('incorrect-password')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: /không đúng|không chính xác|chưa đúng/ }).waitFor()
  await page.getByRole('link', { name: 'Quên mật khẩu?', exact: true }).click()
  await page.waitForURL((url) => url.pathname === '/forgot-password')
  await page.getByLabel('Email đăng ký', { exact: true }).waitFor()
  await page.goto(`${baseUrl}/login`)
  await email().waitFor()
  const visibility = page.locator('.auth-panel .ant-input-password-icon').first()
  await visibility.focus()
  await page.keyboard.press('Enter')
  assert.equal(await password().getAttribute('type'), 'text', 'keyboard shows password')
  await page.keyboard.press('Enter')
  assert.equal(await password().getAttribute('type'), 'password', 'keyboard hides password')
  await checkWidths('login')

  await page.goto(`${baseUrl}/register`)
  const submit = page.getByRole('button', { name: 'Tạo tài khoản', exact: true })
  const confirmPassword = page.getByLabel('Nhập lại mật khẩu', { exact: true })
  await submit.click()
  await page.locator('.ant-form-item-explain-error').first().waitFor()
  assert.equal(await page.locator('.ant-form-item-explain-error').count(), 4)
  await page.getByLabel('Họ và tên', { exact: true }).fill('Người kiểm tra')
  await email().fill('customer@chanhman.test')
  await password().fill('Demo123!')
  await confirmPassword.fill('different-password')
  await submit.click()
  await page.locator('.ant-form-item-explain-error').filter({ hasText: /khớp|giống/i }).waitFor()
  await confirmPassword.fill('Demo123!')
  await submit.click()
  await page.getByRole('alert').filter({ hasText: /đã|tồn tại/ }).waitFor()
  await assertCart()
  await page.goto(`${baseUrl}/register`)
  await email().waitFor()
  await checkWidths('register')
  await page.getByLabel('Họ và tên', { exact: true }).fill('Người kiểm tra')
  await email().fill('auth-browser@example.test')
  await password().fill('Demo123!')
  await confirmPassword.fill('Demo123!')
  await submit.click()
  await page.getByRole('heading', { name: 'Xác minh email dùng thử' }).waitFor()
  await page.getByRole('button', { name: 'Tài khoản', exact: true }).waitFor()
  await page.getByRole('link', { name: 'Về trang đăng nhập', exact: true }).click()
  await page.reload()
  await signIn('auth-browser@example.test')
  await page.getByRole('alert').filter({ hasText: 'Vui lòng xác minh email trước khi đăng nhập.' }).waitFor()
  await page.getByRole('heading', { name: 'Xác minh email dùng thử' }).waitFor()
  await page.getByRole('button', { name: 'Tài khoản', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Mô phỏng xác minh email', exact: true }).click()
  await page.getByRole('link', { name: 'Đăng nhập ngay', exact: true }).click()
  await page.waitForURL((url) => url.pathname === '/login')
  await signIn('auth-browser@example.test')
  await page.waitForURL(`${baseUrl}/cart`)
  await assertCart()
  await page.reload()
  await page.getByRole('button', { name: 'Tài khoản của Người kiểm tra', exact: true }).waitFor()
  assert.equal(await page.evaluate(() => [...Object.values(localStorage), ...Object.values(sessionStorage)].some((value) => value.includes('Demo123!'))), false, 'demo password is not persisted')
  await signOut('Người kiểm tra')
  await assertCart()

  await page.getByRole('button', { name: 'Tài khoản', exact: true }).click()
  await page.waitForURL((url) => url.pathname === '/login')
  await signIn()
  await page.waitForURL(`${baseUrl}/account`)
  const signedAccount = page.locator('.site-header').getByRole('button', { name: /^Tài khoản của / })
  const demoName = (await signedAccount.getAttribute('aria-label')).replace('Tài khoản của ', '')
  await page.goto(`${baseUrl}/login`)
  await page.getByRole('heading', { name: 'Bạn đã đăng nhập' }).waitFor()
  await page.getByRole('link', { name: 'Xem hồ sơ', exact: true }).click()
  await page.waitForURL(`${baseUrl}/account`)
  await page.goto(`${baseUrl}/login`)
  await page.getByRole('link', { name: 'Tiếp tục mua sắm', exact: true }).click()
  await page.waitForURL(`${baseUrl}/cart`)
  await page.getByRole('button', { name: `Tài khoản của ${demoName}`, exact: true }).click()
  await page.waitForURL(`${baseUrl}/account`)
  await page.getByRole('heading', { name: /^Hồ sơ của bạn/ }).waitFor()
  await signOut(demoName)

  for (const next of ['/san-pham/air-13', '/checkout', 'https://example.com']) {
    await page.goto(`${baseUrl}/login?next=${encodeURIComponent(next)}`)
    await signIn()
    await page.waitForURL(`${baseUrl}${next.startsWith('/') ? next : '/cart'}`)
    await assertCart()
    await signOut(demoName)
  }
  await page.getByRole('button', { name: 'Tài khoản của bạn', exact: true }).click()
  await page.waitForURL((url) => url.pathname === '/login')
  await page.evaluate(() => {
    const getItem = Storage.prototype.getItem
    window.restoreAuthStorage = () => { Storage.prototype.getItem = getItem }
    Storage.prototype.getItem = function (key) {
      if (key.startsWith('chanh-man:auth-')) throw new Error('blocked')
      return getItem.call(this, key)
    }
    window.dispatchEvent(new Event('focus'))
  })
  await page.getByRole('alert').filter({ hasText: 'Không thể lưu hoặc đọc phiên đăng nhập.' }).waitFor()
  await page.evaluate(() => window.restoreAuthStorage())
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click()
  await email().waitFor()
  await page.evaluate(() => {
    const setItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('chanh-man:auth-')) throw new Error('blocked')
      return setItem.call(this, key, value)
    }
  })
  await signIn()
  await page.getByRole('alert').filter({ hasText: 'Không thể lưu hoặc đọc phiên đăng nhập.' }).waitFor()
  assert.equal(await email().inputValue(), 'customer@chanhman.test')
  assert.equal(await password().inputValue(), 'Demo123!')
  await page.reload()
  await signIn()
  await page.waitForURL(`${baseUrl}/account`)
  await signOut(demoName)
  await assertCart()
  assert.deepEqual(errors, [])
  console.log('Auth browser checks passed: validation, duplicate registration, pending verification/recovery, login, session reload, profile navigation/logout, safe return path, cart preservation, storage failure/retry, keyboard/password visibility, responsive.')
} finally { await browser.close() }
