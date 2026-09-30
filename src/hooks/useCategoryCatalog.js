import { useEffect, useState } from 'react'
import { getCategoryFilters, listProducts } from '../services/productService'
export const CATEGORY_PAGE_SIZE = 20

export const emptyFilters = {
  q: '',
  brands: [],
  colors: [],
  priceRange: '',
  promotion: false,
  inStock: false,
  sort: 'featured',
  page: 1,
}
function readFilters() {
  const p = new URLSearchParams(window.location.search)
  return {
    q: p.get('q') || '',
    brands: p.getAll('brand'),
    colors: p.getAll('color'),
    priceRange: p.get('price') || '',
    promotion: p.get('promo') === '1',
    inStock: p.get('stock') === '1',
    sort: ['price-asc', 'price-desc', 'name'].includes(p.get('sort')) ? p.get('sort') : 'featured',
    page: Math.max(1, Math.floor(Number(p.get('page')) || 1)),
  }
}
export default function useCategoryCatalog(category) {
  const [filters, setFilters] = useState(readFilters)
  const [state, setState] = useState({
    items: [],
    total: 0,
    page: 1,
    facets: null,
    loading: true,
    loadingMore: false,
    error: '',
  })
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const pop = () => {
      setFilters(readFilters())
      setState((s) => ({ ...s, loading: true, loadingMore: false }))
    }
    window.addEventListener('popstate', pop)
    return () => window.removeEventListener('popstate', pop)
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      getCategoryFilters(category, { signal: controller.signal }),
      listProducts({ ...filters, category, page: 1, limit: CATEGORY_PAGE_SIZE * filters.page, signal: controller.signal }),
    ])
      .then(([facets, result]) => {
        if (!controller.signal.aborted) setState({ ...result, facets, loading: false, loadingMore: false, error: '' })
      })
      .catch((error) => {
        if (error.name !== 'AbortError')
          setState((s) => ({
            ...s,
            loading: false,
            error: 'Chưa tải được sản phẩm. Bạn thử lại nhé.',
          }))
      })
    return () => controller.abort()
  }, [category, filters, retry])
  function change(next) {
    const updated = { ...filters, page: 1, ...next }
    const p = new URLSearchParams()
    if (updated.q) p.set('q', updated.q)
    updated.brands.forEach((v) => p.append('brand', v))
    updated.colors.forEach((v) => p.append('color', v))
    if (updated.priceRange) p.set('price', updated.priceRange)
    if (updated.promotion) p.set('promo', '1')
    if (updated.inStock) p.set('stock', '1')
    if (updated.sort !== 'featured') p.set('sort', updated.sort)
    if (updated.page > 1) p.set('page', updated.page)
    window.history.pushState(null, '', window.location.pathname + (p.size ? '?' + p : ''))
    setFilters(updated)
    setState((s) => ({ ...s, loading: true, loadingMore: next.page > filters.page, error: '' }))
  }
  function reload() {
    setState((s) => ({ ...s, loading: true, error: '' }))
    setRetry((n) => n + 1)
  }
  function loadMore() {
    if (!state.loading && state.items.length < state.total) change({ page: filters.page + 1 })
  }
  return { ...state, filters, change, reload, loadMore, reset: () => change(emptyFilters) }
}
