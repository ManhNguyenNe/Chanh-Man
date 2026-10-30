export const orderIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const key = 'chanh-man:orders:v1'
const storageError = () => Object.assign(new Error('Không thể đọc hoặc lưu đơn dùng thử. Vui lòng kiểm tra lưu trữ trình duyệt và thử lại.'), { code: 'STORAGE_ERROR' })

export function readOrders() {
  try {
    if (typeof localStorage === 'undefined') return []
    const orders = JSON.parse(localStorage.getItem(key) || '[]')
    if (!Array.isArray(orders) || orders.some((order) => typeof order?.id !== 'string' || !orderIdPattern.test(order.id) ||
      typeof order.userId !== 'string' || typeof order.requestFingerprint !== 'string' ||
      !['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'].includes(order.status) || order.paymentMethod !== 'cod' ||
      !['unpaid', 'paid'].includes(order.paymentStatus) || !Number.isFinite(Date.parse(order.createdAt)) ||
      [order.subtotal, order.shippingFee, order.total].some((value) => !Number.isSafeInteger(value) || value < 0) ||
      !order.shippingAddress || ['fullName', 'phone', 'street', 'ward', 'city', 'note'].some((field) => typeof order.shippingAddress[field] !== 'string') ||
      !Array.isArray(order.items) || !order.items.length || order.items.length > 100 ||
      order.items.some((item) => typeof item.variantId !== 'string' || !Number.isSafeInteger(item.quantity) || item.quantity < 1 ||
        item.quantity > 999 || !Number.isSafeInteger(item.unitPrice) || item.unitPrice < 0 ||
        ['productId', 'productName', 'variantLabel', 'image'].some((field) => typeof item[field] !== 'string'))) ||
      new Set(orders.map((order) => order.id)).size !== orders.length) throw storageError()
    return orders
  } catch { throw storageError() }
}

export function writeOrders(orders) {
  try { localStorage.setItem(key, JSON.stringify(orders)) } catch { throw storageError() }
}

// ponytail: stock is derived from committed mock orders; replace with a DB inventory transaction at BE-4.
export function orderedQuantities() {
  const quantities = new Map()
  for (const order of readOrders()) {
    if (order.status === 'cancelled') continue
    for (const item of order.items) quantities.set(item.variantId, (quantities.get(item.variantId) || 0) + item.quantity)
  }
  return quantities
}
