import { getSession, profilePhonePattern } from './authService.js'
import { findVariant } from './productService.js'
import { orderIdPattern, readOrders, writeOrders } from './mock/orders.js'

export const shippingFee = 30000 // Flat mock fee; BE-4 replaces this with shop_settings.
const fail = (code, message, details = {}) => Object.assign(new Error(message), { code, ...details })
let creation = Promise.resolve()

function itemsInput(items) {
  if (!Array.isArray(items) || !items.length || items.length > 100) throw fail('VALIDATION_ERROR', 'Giỏ cần từ 1 đến 100 dòng sản phẩm.')
  const merged = new Map()
  for (const item of items) {
    if (typeof item?.variantId !== 'string' || !item.variantId || item.variantId.length > 120 ||
      !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) throw fail('VALIDATION_ERROR', 'Sản phẩm và số lượng trong giỏ chưa hợp lệ.')
    const quantity = (merged.get(item.variantId) || 0) + item.quantity
    if (quantity > 999) throw fail('VALIDATION_ERROR', 'Mỗi phiên bản tối đa 999 sản phẩm.')
    merged.set(item.variantId, quantity)
  }
  return [...merged].sort(([a], [b]) => a.localeCompare(b)).map(([variantId, quantity]) => ({ variantId, quantity }))
}

function addressInput(input) {
  const address = {}
  const fieldErrors = {}
  for (const [field, label, min, max] of [
    ['fullName', 'Tên người nhận', 2, 80], ['street', 'Địa chỉ cụ thể', 5, 240],
    ['ward', 'Phường / xã', 2, 80], ['city', 'Tỉnh / thành phố', 2, 80], ['note', 'Ghi chú', 0, 500],
  ]) {
    address[field] = typeof input?.[field] === 'string' ? input[field].trim() : ''
    if (address[field].length < min || address[field].length > max || (input?.[field] !== undefined && typeof input[field] !== 'string'))
      fieldErrors[field] = `${label} cần từ ${min} đến ${max} ký tự.`
  }
  address.phone = typeof input?.phone === 'string' ? input.phone.trim() : ''
  if (!profilePhonePattern.test(address.phone)) fieldErrors.phone = 'Số điện thoại cần 8–15 chữ số, có thể bắt đầu bằng +.'
  if (Object.keys(fieldErrors).length) throw fail('VALIDATION_ERROR', 'Vui lòng kiểm tra thông tin giao hàng.', { fieldErrors })
  return address
}

/** Quote current catalog prices/stock; no reservation or order is created.
 * shippingAddress is optional for preview, required by createOrder.
 * Returns snapshots, subtotal/shippingFee/total, issues and fingerprint.
 */
export async function quoteOrder(input = {}) {
  if (input?.paymentMethod !== 'cod') throw fail('VALIDATION_ERROR', 'Bản dùng thử chỉ hỗ trợ thanh toán khi nhận hàng (COD).')
  const selection = itemsInput(input.items)
  const shippingAddress = input.shippingAddress === undefined ? undefined : addressInput(input.shippingAddress)
  const items = []
  const issues = []
  for (const item of selection) {
    const match = findVariant(item.variantId)
    if (!match || match.variant.active === false || match.product.status === 'archived') {
      issues.push({ variantId: item.variantId, message: 'Một phiên bản không còn bán. Vui lòng sửa giỏ hàng.' })
      continue
    }
    const { product, variant } = match
    if (!Number.isSafeInteger(variant.price) || variant.price < 0 || !Number.isInteger(variant.stock) || variant.stock < 0)
      throw fail('DATA_ERROR', 'Giá hoặc tồn kho của sản phẩm chưa hợp lệ. Vui lòng thử lại sau.')
    if (item.quantity > variant.stock) issues.push({ variantId: item.variantId, message: `${product.name} (${variant.label}): còn ${variant.stock}, bạn chọn ${item.quantity}.` })
    items.push({ ...item, productId: product.id, productName: product.name, variantLabel: variant.label,
      image: product.image, unitPrice: variant.price, stock: variant.stock })
  }
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  if (!Number.isSafeInteger(subtotal + shippingFee)) throw fail('VALIDATION_ERROR', 'Tổng đơn hàng vượt giới hạn dùng thử.')
  const fingerprint = JSON.stringify([items.map(({ variantId, quantity, unitPrice }) => [variantId, quantity, unitPrice]), shippingFee])
  return { items, subtotal, shippingFee, total: subtotal + shippingFee, currency: 'VND', paymentMethod: 'cod', shippingAddress, issues, fingerprint }
}

function withCreationLock(work) {
  if (globalThis.navigator?.locks) return navigator.locks.request('chanh-man:order-create', work)
  // ponytail: fallback serializes this JS context only; cross-tab transactions require Web Locks or BE-4.
  const result = creation.then(work)
  creation = result.catch(() => {})
  return result
}

/** createOrder({items,shippingAddress,paymentMethod:'cod',requestId,quoteFingerprint}).
 * Same requestId/payload returns the original order; a changed payload conflicts.
 * Throws UNAUTHENTICATED, VALIDATION_ERROR, OUT_OF_STOCK, PRICE_CHANGED (quote),
 * REQUEST_CONFLICT or STORAGE_ERROR. Identity/prices/totals come from services.
 */
export async function createOrder(input = {}) {
  return withCreationLock(async () => {
    const user = await getSession()
    if (!user) throw fail('UNAUTHENTICATED', 'Phiên đã hết hạn. Vui lòng đăng nhập lại trước khi đặt hàng.')
    if (typeof input?.requestId !== 'string' || !orderIdPattern.test(input.requestId) || input?.paymentMethod !== 'cod' || typeof input?.quoteFingerprint !== 'string')
      throw fail('VALIDATION_ERROR', 'Thông tin xác nhận đơn hàng chưa hợp lệ. Vui lòng kiểm tra lại đơn.')
    const selection = itemsInput(input.items)
    const shippingAddress = addressInput(input.shippingAddress)
    const requestFingerprint = JSON.stringify([selection, shippingAddress, 'cod', input.quoteFingerprint])
    const orders = readOrders()
    const previous = orders.find((order) => order.id === input.requestId)
    if (previous) {
      if (previous.userId !== user.id || previous.requestFingerprint !== requestFingerprint)
        throw fail('REQUEST_CONFLICT', 'Yêu cầu này đã được dùng cho đơn khác. Vui lòng kiểm tra kết quả đơn hàng trước khi đặt lại.')
      return structuredClone(previous)
    }
    const quote = await quoteOrder({ items: selection, shippingAddress, paymentMethod: 'cod' })
    if (quote.issues.length) throw fail('OUT_OF_STOCK', 'Tồn kho đã thay đổi. Vui lòng xem lại giỏ trước khi đặt.', { quote })
    if (quote.fingerprint !== input.quoteFingerprint) throw fail('PRICE_CHANGED', 'Giá hoặc phí giao hàng đã thay đổi. Vui lòng xem tổng mới và xác nhận lại.', { quote })
    const order = { id: input.requestId, requestId: input.requestId, userId: user.id, requestFingerprint,
      code: `CM-${input.requestId.slice(0, 8).toUpperCase()}`, items: quote.items,
      shippingAddress, subtotal: quote.subtotal, shippingFee: quote.shippingFee, total: quote.total, currency: 'VND',
      paymentMethod: 'cod', paymentStatus: 'unpaid', status: 'pending', createdAt: new Date().toISOString() }
    // One write commits the order and the inventory derived from it together.
    writeOrders([...orders, order])
    return structuredClone(order)
  })
}

/** Only the current user can read a mock order; another user's ID is NOT_FOUND. */
export async function getMyOrder(id) {
  const user = await getSession()
  if (!user) throw fail('UNAUTHENTICATED', 'Vui lòng đăng nhập để xem đơn hàng.')
  const order = readOrders().find((item) => item.id === id && item.userId === user.id)
  if (!order) throw fail('NOT_FOUND', 'Không tìm thấy đơn hàng trong tài khoản của bạn.')
  return structuredClone(order)
}

/** Current user's snapshots, newest first with an ID tie-breaker. No caller-supplied userId. */
export async function listMyOrders() {
  const user = await getSession()
  if (!user) throw fail('UNAUTHENTICATED', 'Vui lòng đăng nhập để xem đơn hàng.')
  // ponytail: return the small mock history at once; paginate in the service when real order volume requires it.
  return structuredClone(readOrders().filter((order) => order.userId === user.id)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id.localeCompare(a.id)))
}
