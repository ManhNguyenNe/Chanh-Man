const sessionKey = 'chanh-man:auth-session:v1'
const profilesKey = 'chanh-man:auth-profiles:v1'
const recoveryKey = 'chanh-man:auth-recovery:v1'
const recoveryDuration = 10 * 60 * 1000
const sessionDuration = 60 * 60 * 1000
const listeners = new Set()
let expiryTimer

export const demoPassword = 'Demo123!'
export const profilePhonePattern = /^\+?\d{8,15}$/
export const demoAccounts = Object.freeze([
  Object.freeze({ id: 'demo-customer', displayName: 'Khách hàng Demo', email: 'customer@chanhman.test', role: 'customer' }),
  Object.freeze({ id: 'demo-admin', displayName: 'Quản trị viên Demo', email: 'admin@chanhman.test', role: 'admin' }),
])

function authError(code, message, fieldErrors = {}) {
  return Object.assign(new Error(message), { code, fieldErrors })
}

function storageError() {
  return authError('STORAGE_ERROR', 'Không thể lưu hoặc đọc phiên đăng nhập. Vui lòng cho phép lưu trữ trên trình duyệt và thử lại.')
}

function read(key, fallback) {
  let value
  try { value = sessionStorage.getItem(key) } catch { throw storageError() }
  try { return value ? JSON.parse(value) : fallback } catch { return fallback }
}

function save(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)) } catch { throw storageError() }
}

function clearSession() {
  try { sessionStorage.removeItem(sessionKey) } catch { throw storageError() }
  clearTimeout(expiryTimer)
}

const normalizeEmail = (email) => typeof email === 'string' ? email.trim().toLowerCase() : ''
const validEmail = (email) => typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

function profiles() {
  const data = read(profilesKey, [])
  return Array.isArray(data) ? data.filter((profile) =>
    profile && validEmail(profile.email || '') && typeof profile.displayName === 'string' &&
    profile.displayName.trim().length >= 2 && profile.displayName.length <= 80 &&
    (profile.phone === undefined || (typeof profile.phone === 'string' &&
      (!profile.phone.trim() || profilePhonePattern.test(profile.phone.trim())))) &&
    typeof profile.verified === 'boolean',
  ).map(({ email, displayName, phone = '', verified }) => ({ email, displayName: displayName.trim(), phone: phone.trim(), verified })) : []
}

function findUser(email) {
  const fixture = demoAccounts.find((account) => account.email === email)
  const profile = profiles().find((account) => account.email === email)
  if (fixture) return { ...fixture, displayName: profile?.displayName ?? fixture.displayName, phone: profile?.phone ?? '' }
  return profile?.verified
    ? { id: `demo:${email}`, email, displayName: profile.displayName, phone: profile.phone, role: 'customer' }
    : null
}

function notify(user, error) {
  for (const callback of listeners) callback(user, error)
}

function watchExpiry(expiresAt) {
  clearTimeout(expiryTimer)
  if (listeners.size) {
    expiryTimer = setTimeout(() => {
      getSession().then((user) => notify(user)).catch((error) => notify(null, error))
    }, Math.max(0, expiresAt - Date.now()))
  }
}

/**
 * ponytail: fixed demo credentials; replace with backend Auth/RLS for production.
 * Mock only, not real authentication. No passwords or
 * hashes are stored. Sessions/profiles last within this browser tab; sessions
 * expire after one hour. Backend Auth/RLS must replace this before production.
 * @returns {Promise<{id:string,displayName:string,email:string,phone:string,role:string}|null>}
 */
export async function getSession() {
  const session = read(sessionKey, null)
  if (!session) return null
  const valid = typeof session.expiresAt === 'number' && session.expiresAt > Date.now() &&
    session.expiresAt <= Date.now() + sessionDuration && typeof session.email === 'string'
  const user = valid ? findUser(session.email) : null
  if (!user) { clearSession(); return null }
  watchExpiry(session.expiresAt)
  return user
}

/** Example: await signIn({ email: demoAccounts[0].email, password: demoPassword }).
 * Failure throws { code, message, fieldErrors }; e.g. INVALID_CREDENTIALS.
 */
export async function signIn(input = {}) {
  const email = normalizeEmail(input?.email)
  const password = input?.password
  const fieldErrors = {}
  if (!validEmail(email)) fieldErrors.email = 'Vui lòng nhập email hợp lệ.'
  if (typeof password !== 'string' || !password || password.length > 128)
    fieldErrors.password = 'Vui lòng nhập mật khẩu (tối đa 128 ký tự).'
  if (Object.keys(fieldErrors).length) throw authError('VALIDATION_ERROR', 'Vui lòng kiểm tra thông tin đăng nhập.', fieldErrors)
  if (password !== demoPassword) throw authError('INVALID_CREDENTIALS', 'Email hoặc mật khẩu chưa đúng.')
  const user = findUser(email)
  if (!user) {
    if (profiles().some((profile) => profile.email === email))
      throw authError('EMAIL_NOT_VERIFIED', 'Vui lòng xác minh email trước khi đăng nhập.')
    throw authError('INVALID_CREDENTIALS', 'Email hoặc mật khẩu chưa đúng.')
  }
  const expiresAt = Date.now() + sessionDuration
  save(sessionKey, { email, expiresAt })
  watchExpiry(expiresAt)
  notify(user)
  return user
}

/**
 * Demo registration requires demoPassword and does not store it. Success does
 * not sign in: call verifyDemoEmail(email), then signIn using demoPassword.
 * @returns {Promise<{email:string,requiresVerification:true}>}
 */
export async function signUp(input = {}) {
  const email = normalizeEmail(input?.email)
  const displayName = typeof input?.displayName === 'string' ? input.displayName.trim() : ''
  const fieldErrors = {}
  if (displayName.length < 2 || displayName.length > 80)
    fieldErrors.displayName = 'Họ và tên cần từ 2 đến 80 ký tự.'
  if (!validEmail(email)) fieldErrors.email = 'Vui lòng nhập email hợp lệ.'
  if (input?.password !== demoPassword)
    fieldErrors.password = `Bản thử nghiệm sử dụng mật khẩu chung ${demoPassword}.`
  if (Object.keys(fieldErrors).length) throw authError('VALIDATION_ERROR', 'Vui lòng kiểm tra thông tin đăng ký.', fieldErrors)
  const registered = profiles()
  if (demoAccounts.some((account) => account.email === email) || registered.some((profile) => profile.email === email))
    throw authError('EMAIL_EXISTS', 'Email này đã được đăng ký.', { email: 'Email này đã được đăng ký.' })
  save(profilesKey, [...registered, { email, displayName, phone: '', verified: false }])
  return { email, requiresVerification: true }
}

/** Explicit email-verification simulation; no email is sent by this mock. */
export async function verifyDemoEmail(email) {
  const normalized = normalizeEmail(email)
  const registered = profiles()
  if (!registered.some((profile) => profile.email === normalized))
    throw authError('NOT_FOUND', 'Không tìm thấy đăng ký cần xác minh.')
  save(profilesKey, registered.map((profile) => profile.email === normalized ? { ...profile, verified: true } : profile))
}

/** Simulate an email recovery request; no email, reset token or password change.
 * Same response for known/unknown/unverified emails. Throws VALIDATION_ERROR or STORAGE_ERROR.
 * Example: await requestPasswordReset({ email: 'customer@chanhman.test' }).
 */
export async function requestPasswordReset(input = {}) {
  const email = normalizeEmail(input?.email)
  if (!validEmail(email)) throw authError('VALIDATION_ERROR', 'Vui lòng kiểm tra email.', { email: 'Vui lòng nhập email hợp lệ.' })
  await new Promise((resolve) => setTimeout(resolve, 180))
  // shortcut: account lookup only; replace this mock with the Auth recovery request when BE-2 is connected.
  findUser(email)
  return { mock: true, message: 'Nếu email này có tài khoản, hệ thống khôi phục sẽ gửi hướng dẫn tới email đó.' }
}

/** Explicit UI simulation, independent of whether an email/account exists. */
export async function createDemoRecovery() {
  const recovery = { token: crypto.randomUUID(), expiresAt: Date.now() + recoveryDuration, used: false }
  save(recoveryKey, recovery)
  return { token: recovery.token, expiresAt: recovery.expiresAt }
}

function recoveryFor(token) {
  const recovery = read(recoveryKey, null)
  if (typeof token !== 'string' || !token || token.length > 128 || recovery?.token !== token ||
    !Number.isSafeInteger(recovery.expiresAt) || typeof recovery.used !== 'boolean' || recovery.expiresAt > Date.now() + recoveryDuration)
    throw authError('INVALID_RECOVERY_LINK', 'Liên kết khôi phục không hợp lệ. Vui lòng gửi yêu cầu mới.')
  if (recovery.used) throw authError('RECOVERY_LINK_USED', 'Liên kết này đã được sử dụng. Bạn có thể đăng nhập hoặc yêu cầu liên kết mới.')
  if (recovery.expiresAt <= Date.now()) throw authError('RECOVERY_LINK_EXPIRED', 'Liên kết khôi phục đã hết hạn. Vui lòng gửi yêu cầu mới.')
  return recovery
}

/** Validate a same-tab mock ticket without consuming it. No authentication is granted. */
export async function getPasswordResetState(token) {
  return { expiresAt: recoveryFor(token).expiresAt }
}

/** Simulate resetPassword({token,password,confirmPassword}); consume once after validation.
 * Throws recovery-link errors, VALIDATION_ERROR/fieldErrors or STORAGE_ERROR.
 * No password/hash is saved; demo credentials, profile and session are unchanged.
 */
export async function resetPassword(input = {}) {
  await new Promise((resolve) => setTimeout(resolve, 180))
  const recovery = recoveryFor(input?.token)
  const fieldErrors = {}
  if (typeof input?.password !== 'string' || input.password.length < 8 || input.password.length > 128 || !input.password.trim())
    fieldErrors.password = 'Mật khẩu cần từ 8 đến 128 ký tự và không chỉ gồm khoảng trắng.'
  if (typeof input?.confirmPassword !== 'string' || !input.confirmPassword || input.confirmPassword !== input.password)
    fieldErrors.confirmPassword = 'Mật khẩu nhập lại chưa khớp.'
  if (Object.keys(fieldErrors).length) throw authError('VALIDATION_ERROR', 'Vui lòng kiểm tra mật khẩu mới.', fieldErrors)
  // shortcut: this ticket simulates UI states only; backend Auth recovery must perform the real credential change at BE-2.
  save(recoveryKey, { ...recovery, used: true })
  return { mock: true }
}

/** Update the current session's name/optional phone; identity and role cannot be changed.
 * Example: await updateProfile({ displayName: 'Khách hàng Demo', phone: '' }).
 * Throws UNAUTHENTICATED, VALIDATION_ERROR (fieldErrors), or STORAGE_ERROR.
 */
export async function updateProfile(input = {}) {
  const user = await getSession()
  if (!user) throw authError('UNAUTHENTICATED', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
  const displayName = typeof input?.displayName === 'string' ? input.displayName.trim() : ''
  const phone = typeof input?.phone === 'string' ? input.phone.trim() : ''
  const fieldErrors = {}
  if (displayName.length < 2 || displayName.length > 80)
    fieldErrors.displayName = 'Họ và tên cần từ 2 đến 80 ký tự.'
  if ((input?.phone !== undefined && typeof input.phone !== 'string') || (phone && !profilePhonePattern.test(phone)))
    fieldErrors.phone = 'Số điện thoại cần từ 8 đến 15 chữ số, có thể bắt đầu bằng dấu +.'
  if (Object.keys(fieldErrors).length) throw authError('VALIDATION_ERROR', 'Vui lòng kiểm tra thông tin hồ sơ.', fieldErrors)
  const registered = profiles()
  const updated = { ...user, displayName, phone }
  const profile = { email: user.email, displayName, phone, verified: true }
  save(profilesKey, [...registered.filter((account) => account.email !== user.email), profile])
  notify(updated)
  return updated
}

export async function signOut() {
  clearSession()
  notify(null)
}

/** Same-tab changes/expiry. sessionStorage is separate in each browser tab.
 * callback(user, error?) receives readable storage failures on expiry.
 */
export function subscribeAuthChanges(callback) {
  listeners.add(callback)
  getSession().catch((error) => callback(null, error))
  return () => {
    listeners.delete(callback)
    if (!listeners.size) clearTimeout(expiryTimer)
  }
}
