import { findVariant } from './productService.js'
const key = 'chanh-man:cart:v1'
function readItems(notices = []) {
  let raw
  try { raw = localStorage.getItem(key) } catch { throw new Error('Không thể đọc giỏ hàng. Vui lòng cho phép lưu trữ và thử lại.') }
  let data
  try { data = JSON.parse(raw || '[]') } catch { return [] }
  if (!Array.isArray(data)) return []
  const merged = new Map()
  for (const item of data) {
    const match = findVariant(item?.variantId)
    if (!match || match.variant.stock < 1) {
      notices.push('Một phiên bản không còn bán hoặc đã hết hàng được bỏ khỏi giỏ.')
    } else if (Number.isInteger(item.quantity) && item.quantity > match.variant.stock) {
      notices.push(`${match.product.name}: số lượng được giảm về ${match.variant.stock} theo tồn kho hiện tại.`)
    }
    if (match && Number.isInteger(item.quantity) && item.quantity > 0 && match.variant.stock > 0)
      merged.set(item.variantId, Math.min(match.variant.stock, (merged.get(item.variantId) || 0) + item.quantity))
  }
  return [...merged].map(([variantId, quantity]) => ({ variantId, quantity }))
}
function summarize(items) {
  const lines = items.map((item) => {
    const { product, variant } = findVariant(item.variantId)
    return {
      ...item,
      productId: product.id,
      name: product.name,
      image: product.image,
      label: variant.label,
      price: variant.price,
      stock: variant.stock,
    }
  })
  return {
    items: lines,
    count: lines.reduce((sum, item) => sum + item.quantity, 0),
    total: lines.reduce((sum, item) => sum + item.price * item.quantity, 0),
  }
}
function save(items) {
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch {
    throw new Error(
      'Không thể lưu giỏ hàng trên trình duyệt này. Vui lòng cho phép lưu trữ và thử lại.',
    )
  }
  return summarize(items)
}
export async function getCart() {
  const notices = []
  return { ...summarize(readItems(notices)), notices: [...new Set(notices)] }
}
export async function addItem(variantId) {
  const match = findVariant(variantId)
  if (!match || !match.variant.stock) throw new Error('Phiên bản này hiện đã hết hàng.')
  const items = readItems()
  const line = items.find((item) => item.variantId === variantId)
  if (line && line.quantity >= match.variant.stock)
    throw new Error('Số lượng trong giỏ đã đạt mức tồn kho của phiên bản này.')
  if (line) line.quantity += 1
  else items.push({ variantId, quantity: 1 })
  return save(items)
}
export async function updateQuantity(variantId, quantity) {
  const match = findVariant(variantId)
  if (!match || !Number.isInteger(quantity) || quantity < 1 || quantity > match.variant.stock)
    throw new Error('Vui lòng chọn số lượng hợp lệ trong mức tồn kho.')
  return save(
    readItems().map((item) => (item.variantId === variantId ? { ...item, quantity } : item)),
  )
}
export async function removeItem(variantId) {
  return save(readItems().filter((item) => item.variantId !== variantId))
}

/** Clear only the exact purchased selection; preserve a cart changed in another tab. */
export async function clearPurchasedCart(items) {
  let current
  try {
    current = JSON.parse(localStorage.getItem(key) || '[]')
    if (!Array.isArray(current) || current.some((item) => typeof item?.variantId !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1)) throw new Error('invalid cart')
  } catch { throw new Error('Đơn đã được tạo nhưng chưa đọc được giỏ để dọn. Giỏ được giữ lại để bạn kiểm tra.') }
  const selection = (lines) => {
    const merged = new Map()
    for (const item of lines) merged.set(item.variantId, (merged.get(item.variantId) || 0) + item.quantity)
    return JSON.stringify([...merged].sort(([a], [b]) => a.localeCompare(b)))
  }
  if (selection(current) !== selection(items)) return false
  save([])
  return true
}
