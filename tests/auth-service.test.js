import test from 'node:test'
import assert from 'node:assert/strict'
import { demoPassword, getSession, signIn, signUp, signOut, verifyDemoEmail, updateProfile, requestPasswordReset, subscribeAuthChanges } from '../src/services/authService.js'
import { authReturnPath } from '../src/utils/authRoutes.js'

test('mock auth validates credentials, verification, storage and expiry without storing passwords', async () => {
  const stored = new Map()
  let blocked = false
  let writeBlocked = false
  const sessionKey = 'chanh-man:auth-session:v1'
  const profilesKey = 'chanh-man:auth-profiles:v1'
  const originalNow = Date.now
  globalThis.sessionStorage = {
    getItem: (key) => { if (blocked) throw new Error('blocked'); return stored.get(key) ?? null },
    setItem: (key, value) => { if (blocked || writeBlocked) throw new Error('blocked'); stored.set(key, value) },
    removeItem: (key) => { if (blocked) throw new Error('blocked'); stored.delete(key) },
  }
  const changes = []
  const unsubscribe = subscribeAuthChanges((user) => changes.push(user))
  try {
    for (const path of ['/san-pham?q=x', '/san-pham/air-13', '/account', '/account/', '/checkout', '/checkout/', '/account/orders', '/account/orders/', '/account/orders/demo']) assert.equal(authReturnPath(path), path)
    for (const path of ['//evil.com', '/\\evil.com', 'https://evil.com', '/account/orders/extra/path', '/admin']) assert.equal(authReturnPath(path), '/cart')
    assert.equal(await getSession(), null)
    for (const input of [undefined, null, {}, { email: 42 }, { email: 'bad' }, { email: ' '.repeat(5) }, { email: `${'a'.repeat(255)}@example.test` }])
      await assert.rejects(requestPasswordReset(input), (error) => error.code === 'VALIDATION_ERROR' && Boolean(error.fieldErrors.email))
    const recovery = await requestPasswordReset({ email: ' CUSTOMER@CHANHMAN.TEST ' })
    assert.deepEqual(await requestPasswordReset({ email: 'unknown@example.test' }), recovery)
    assert.equal(recovery.mock, true)
    await assert.rejects(updateProfile({ displayName: 'Guest' }), { code: 'UNAUTHENTICATED' })
    await assert.rejects(signIn({ email: 'customer@chanhman.test', password: 'wrong' }), { code: 'INVALID_CREDENTIALS' })
    await assert.rejects(signIn(null), (error) => error.code === 'VALIDATION_ERROR' && Boolean(error.fieldErrors.email && error.fieldErrors.password))
    await assert.rejects(signUp({ displayName: ' ', email: 'bad', password: 'secret' }), (error) =>
      error.code === 'VALIDATION_ERROR' && Object.keys(error.fieldErrors).length === 3)
    assert.deepEqual(await signUp({ displayName: '  Demo User  ', email: ' NEW@example.test ', password: demoPassword, role: 'admin' }),
      { email: 'new@example.test', requiresVerification: true })
    assert.equal(await getSession(), null)
    assert.deepEqual(await requestPasswordReset({ email: 'new@example.test' }), recovery, 'unverified account gets the same recovery response')
    await assert.rejects(signUp({ displayName: 'Demo User', email: 'new@example.test', password: demoPassword }), { code: 'EMAIL_EXISTS' })
    await assert.rejects(signUp({ displayName: 'Demo User', email: 'admin@chanhman.test', password: demoPassword }), { code: 'EMAIL_EXISTS' })
    await assert.rejects(signIn({ email: 'new@example.test', password: demoPassword }), { code: 'EMAIL_NOT_VERIFIED' })
    await verifyDemoEmail('NEW@example.test')
    const legacyProfiles = JSON.parse(stored.get(profilesKey))
    delete legacyProfiles[0].phone
    stored.set(profilesKey, JSON.stringify(legacyProfiles))
    const customer = await signIn({ email: 'new@example.test', password: demoPassword })
    assert.equal(customer.role, 'customer')
    assert.equal(customer.displayName, 'Demo User')
    assert.equal(customer.phone, '')
    const beforeRecovery = [...stored.entries()]
    const notificationsBeforeRecovery = changes.length
    assert.deepEqual(await requestPasswordReset({ email: 'NEW@example.test', next: 'https://evil.test', role: 'admin' }), recovery)
    assert.deepEqual([...stored.entries()], beforeRecovery, 'recovery does not change profiles, verification or session expiry')
    assert.equal(changes.length, notificationsBeforeRecovery)
    assert.deepEqual(await getSession(), customer)
    await signUp({ displayName: 'Pending User', email: 'pending@example.test', password: demoPassword })
    await assert.rejects(updateProfile({ displayName: ' ', phone: 'abc' }), (error) =>
      error.code === 'VALIDATION_ERROR' && Boolean(error.fieldErrors.displayName && error.fieldErrors.phone))
    for (const phone of [null, 12345678, {}, '1234567', '1234567890123456', '+123-45678'])
      await assert.rejects(updateProfile({ displayName: 'Demo User', phone }), (error) => error.code === 'VALIDATION_ERROR' && Boolean(error.fieldErrors.phone))
    await assert.rejects(updateProfile({ displayName: 'x'.repeat(81) }), (error) => error.code === 'VALIDATION_ERROR' && Boolean(error.fieldErrors.displayName))
    const originalSession = stored.get(sessionKey)
    const editedCustomer = await updateProfile({ displayName: '  Khách đăng ký  ', phone: ' +84901234567 ', email: 'admin@chanhman.test', id: 'demo-admin', role: 'admin', verified: false })
    assert.deepEqual(editedCustomer, { ...customer, displayName: 'Khách đăng ký', phone: '+84901234567' })
    assert.deepEqual(await getSession(), editedCustomer)
    assert.equal(stored.get(sessionKey), originalSession)
    assert.deepEqual(changes.at(-1), editedCustomer)
    await assert.rejects(signIn({ email: 'pending@example.test', password: demoPassword }), { code: 'EMAIL_NOT_VERIFIED' })
    await signOut()
    assert.equal(await getSession(), null)
    assert.deepEqual(await signIn({ email: 'new@example.test', password: demoPassword }), editedCustomer)
    await signOut()
    const admin = await signIn({ email: ' ADMIN@chanhman.test ', password: demoPassword })
    assert.equal(admin.role, 'admin')
    assert.equal(admin.phone, '')
    const editedAdmin = await updateProfile({ displayName: 'Quản trị mới', phone: '0901234567' })
    assert.equal(editedAdmin.id, 'demo-admin')
    assert.equal(editedAdmin.role, 'admin')
    assert.deepEqual(await getSession(), editedAdmin)
    await signOut()
    assert.deepEqual(await signIn({ email: 'admin@chanhman.test', password: demoPassword }), editedAdmin)
    await signOut()
    const fixtureCustomer = await signIn({ email: 'customer@chanhman.test', password: demoPassword })
    assert.equal(fixtureCustomer.displayName, 'Khách hàng Demo')
    assert.equal(fixtureCustomer.phone, '')
    assert.equal((await updateProfile({ displayName: 'Khách demo mới', phone: ' ' })).phone, '')
    const beforeWrite = { profiles: stored.get(profilesKey), session: stored.get(sessionKey), user: await getSession(), changes: changes.length }
    writeBlocked = true
    await assert.rejects(updateProfile({ displayName: 'Không được lưu', phone: '0901111111' }), { code: 'STORAGE_ERROR' })
    writeBlocked = false
    assert.equal(stored.get(profilesKey), beforeWrite.profiles)
    assert.equal(stored.get(sessionKey), beforeWrite.session)
    assert.deepEqual(await getSession(), beforeWrite.user)
    assert.equal(changes.length, beforeWrite.changes)
    await signOut()
    assert.deepEqual(await signIn({ email: 'new@example.test', password: demoPassword }), editedCustomer)
    assert.deepEqual(await signIn({ email: 'admin@chanhman.test', password: demoPassword }), editedAdmin)
    const session = JSON.parse(stored.get(sessionKey))
    stored.set(sessionKey, JSON.stringify({ ...session, email: 'customer@chanhman.test', role: 'admin' }))
    assert.equal((await getSession()).role, 'customer')
    Date.now = () => session.expiresAt + 1
    await assert.rejects(updateProfile({ displayName: 'Hết phiên' }), { code: 'UNAUTHENTICATED' })
    assert.equal(await getSession(), null)
    assert.equal(stored.has(sessionKey), false)
    Date.now = originalNow
    stored.set(sessionKey, JSON.stringify({ email: 'unknown@example.test', expiresAt: Date.now() + 1000, role: 'admin' }))
    assert.equal(await getSession(), null)
    stored.set(sessionKey, '{broken')
    assert.equal(await getSession(), null)
    stored.delete(sessionKey)
    const registered = stored.get(profilesKey)
    for (const value of ['{broken', 'null', '{}', JSON.stringify([
      null,
      ...[null, 42, {}, ['new@example.test']].map((email) => ({ email, displayName: 'Demo User', verified: true })),
      { email: 'new@example.test', displayName: null, verified: true },
      ...[null, 42, {}, [], 'bad'].map((phone) => ({ email: 'new@example.test', displayName: 'Demo User', phone, verified: true })),
    ])]) {
      stored.set(profilesKey, value)
      await assert.rejects(signIn({ email: 'new@example.test', password: demoPassword }), { code: 'INVALID_CREDENTIALS' })
    }
    stored.set(profilesKey, registered)
    blocked = true
    await assert.rejects(signIn({ email: 'customer@chanhman.test', password: demoPassword }), { code: 'STORAGE_ERROR' })
    await assert.rejects(getSession(), { code: 'STORAGE_ERROR' })
    await assert.rejects(requestPasswordReset({ email: 'unknown@example.test' }), { code: 'STORAGE_ERROR' })
    await assert.rejects(signUp({ displayName: 'Another User', email: 'another@example.test', password: demoPassword }), { code: 'STORAGE_ERROR' })
    blocked = false
    assert.equal(await getSession(), null)
    assert.ok(changes.some((user) => user?.email === 'new@example.test'))
    assert.ok(changes.includes(null))
    for (const value of stored.values()) {
      assert.ok(!value.includes(demoPassword))
      assert.ok(!/password|hash/i.test(value))
    }
  } finally {
    Date.now = originalNow
    unsubscribe()
    delete globalThis.sessionStorage
  }
})
