import test from 'node:test'
import assert from 'node:assert/strict'
import { createDemoRecovery, getPasswordResetState, resetPassword, getSession, signIn, demoPassword } from '../src/services/authService.js'

test('mock recovery expires, is single-use, validates passwords and never changes credentials or profile/session data', async () => {
  const values = new Map()
  const key = 'chanh-man:auth-recovery:v1'
  const originalNow = Date.now
  let now = originalNow()
  let readBlocked = false
  let writeBlocked = false
  globalThis.sessionStorage = {
    getItem: (name) => { if (readBlocked && name === key) throw new Error('blocked'); return values.get(name) ?? null },
    setItem: (name, value) => { if (writeBlocked && name === key) throw new Error('blocked'); values.set(name, value) },
    removeItem: (name) => values.delete(name),
  }
  Date.now = () => now
  const password = 'SampleReset456!'
  const input = (token) => ({ token, password, confirmPassword: password })
  try {
    for (const token of [undefined, null, '', 'unknown', 42]) await assert.rejects(getPasswordResetState(token), { code: 'INVALID_RECOVERY_LINK' })
    const guest = await createDemoRecovery()
    assert.equal(guest.expiresAt, now + 600000)
    assert.deepEqual(await getPasswordResetState(guest.token), { expiresAt: guest.expiresAt })
    await resetPassword(input(guest.token))
    assert.equal(await getSession(), null, 'a reset ticket never authenticates a guest')
    await signIn({ email: 'customer@chanhman.test', password: demoPassword })
    const before = [...values.entries()].filter(([name]) => name !== key)
    const ticket = await createDemoRecovery()
    for (const bad of [undefined, null, '', 'short', ' '.repeat(8), 'x'.repeat(129), 42])
      await assert.rejects(resetPassword({ ...input(ticket.token), password: bad }), (error) => error.code === 'VALIDATION_ERROR' && Boolean(error.fieldErrors.password))
    await assert.rejects(resetPassword({ ...input(ticket.token), confirmPassword: 'Different456!' }), (error) => error.code === 'VALIDATION_ERROR' && Boolean(error.fieldErrors.confirmPassword))
    assert.equal(JSON.parse(values.get(key)).used, false)
    readBlocked = true
    await assert.rejects(getPasswordResetState(ticket.token), { code: 'STORAGE_ERROR' })
    await assert.rejects(resetPassword(input(ticket.token)), { code: 'STORAGE_ERROR' })
    readBlocked = false
    writeBlocked = true
    const unused = values.get(key)
    await assert.rejects(resetPassword(input(ticket.token)), { code: 'STORAGE_ERROR' })
    assert.equal(values.get(key), unused, 'failed consume preserves a usable ticket')
    await assert.rejects(createDemoRecovery(), { code: 'STORAGE_ERROR' })
    assert.equal(values.get(key), unused, 'failed issue preserves the previous ticket')
    writeBlocked = false
    assert.deepEqual(await resetPassword({ ...input(ticket.token), userId: 'demo-admin', role: 'admin' }), { mock: true })
    assert.deepEqual([...values.entries()].filter(([name]) => name !== key), before)
    assert.equal((await getSession()).role, 'customer')
    await assert.rejects(getPasswordResetState(ticket.token), { code: 'RECOVERY_LINK_USED' })
    await assert.rejects(resetPassword(input(ticket.token)), { code: 'RECOVERY_LINK_USED' })
    await assert.rejects(signIn({ email: 'customer@chanhman.test', password }), { code: 'INVALID_CREDENTIALS' })
    const competing = await createDemoRecovery()
    const attempts = await Promise.allSettled([resetPassword(input(competing.token)), resetPassword(input(competing.token))])
    assert.equal(attempts.filter((result) => result.status === 'fulfilled').length, 1)
    assert.equal(attempts.find((result) => result.status === 'rejected').reason.code, 'RECOVERY_LINK_USED')
    const expiring = await createDemoRecovery()
    await assert.rejects(getPasswordResetState(competing.token), { code: 'INVALID_RECOVERY_LINK' })
    now = expiring.expiresAt
    await assert.rejects(getPasswordResetState(expiring.token), { code: 'RECOVERY_LINK_EXPIRED' })
    await assert.rejects(resetPassword(input(expiring.token)), { code: 'RECOVERY_LINK_EXPIRED' })
    const valid = await createDemoRecovery()
    for (const corrupt of ['{broken', 'null', '{}', JSON.stringify({ token: valid.token, expiresAt: now + 600001, used: false }), JSON.stringify({ token: valid.token, expiresAt: 'tomorrow', used: false })]) {
      values.set(key, corrupt)
      await assert.rejects(getPasswordResetState(valid.token), { code: 'INVALID_RECOVERY_LINK' })
      assert.equal(values.get(key), corrupt)
    }
    assert.deepEqual([...values.entries()].filter(([name]) => name !== key), before)
    for (const value of values.values()) {
      assert(!value.includes(password))
      assert(!value.includes('passwordHash'))
      assert(!value.includes('confirmPassword'))
    }
  } finally { Date.now = originalNow; delete globalThis.sessionStorage }
})
