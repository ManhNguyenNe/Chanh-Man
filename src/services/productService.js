import { products, categories, needs } from './mock/catalog.js'
const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
function delay(signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'))
    const finish = () => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }
    const timer = setTimeout(finish, 180)
    function abort() {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', abort, { once: true })
  })
}
export async function getHomeContent({ signal } = {}) {
  await delay(signal)
  return structuredClone({ categories, needs })
}
/** UI contract: matching items and total, independent of the data provider. */
export async function listProducts({
  category = 'all',
  q = '',
  need = '',
  limit = 4,
  page = 1,
  brands = [],
  colors = [],
  priceRange = '',
  promotion = false,
  inStock = false,
  sort = 'featured',
  signal,
} = {}) {
  await delay(signal)
  const terms = normalize(q.trim()).split(/\s+/).filter(Boolean)
  const matches = products.filter((product) => {
    const text = normalize(
      `${product.name} ${product.brand} ${product.specs.join(' ')} ${categories.find((item) => item.id === product.category)?.name}`,
    )
    return (
      (category === 'all' || product.category === category) &&
      (!need || product.needs.includes(need)) &&
      (!brands.length || brands.includes(product.brand)) &&
      (!colors.length || product.colors.some((color) => colors.includes(color))) &&
      (!promotion || product.promotion) &&
      (!inStock || product.variants.some((variant) => variant.stock > 0)) &&
      matchesPrice(product, priceRange) &&
      terms.every((term) => text.includes(term))
    )
  })
  if (sort === 'price-asc') matches.sort((a, b) => startingPrice(a) - startingPrice(b))
  if (sort === 'price-desc') matches.sort((a, b) => startingPrice(b) - startingPrice(a))
  if (sort === 'name') matches.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
  const total = matches.length
  const currentPage = Math.min(Math.max(1, page), Math.max(1, Math.ceil(total / limit)))
  return structuredClone({
    items: matches.slice((currentPage - 1) * limit, currentPage * limit),
    total,
    page: currentPage,
  })
}
export async function getProduct(id) {
  await delay()
  const product = products.find((item) => item.id === id)
  if (!product)
    throw Object.assign(new Error('Sản phẩm này hiện không có trong danh mục.'), {
      code: 'NOT_FOUND',
    })
  return structuredClone(product)
}
export function findVariant(variantId) {
  for (const product of products) {
    const variant = product.variants.find((item) => item.id === variantId)
    if (variant) return { product, variant }
  }
  return null
}

const startingPrice = (product) => Math.min(...product.variants.map((variant) => variant.price))
export const priceRanges = [
  { value: 'under-20', label: 'Dưới 20 triệu', min: 0, max: 20000000 },
  { value: '20-30', label: 'Từ 20 đến dưới 30 triệu', min: 20000000, max: 30000000 },
  { value: '30-40', label: 'Từ 30 đến dưới 40 triệu', min: 30000000, max: 40000000 },
  { value: 'over-40', label: 'Từ 40 triệu trở lên', min: 40000000, max: Infinity },
]
function matchesPrice(product, value) {
  const range = priceRanges.find((item) => item.value === value)
  return !range || (startingPrice(product) >= range.min && startingPrice(product) < range.max)
}
export async function getCategoryFilters(category, { signal } = {}) {
  await delay(signal)
  const items = products.filter((product) => category === 'all' || product.category === category)
  return structuredClone({
    category: categories.find((item) => item.id === category) || {
      id: 'all',
      name: 'Tất cả sản phẩm',
      caption: 'Tìm thiết bị phù hợp với bạn.',
    },
    brands: [...new Set(items.map((item) => item.brand))],
    colors: [...new Set(items.flatMap((item) => item.colors))],
    priceRanges,
  })
}
