import { useEffect, useState } from 'react'
import { getHomeContent, listProducts } from '../services/productService'
function readFilters() {
  const params = new URLSearchParams(window.location.search)
  const category = params.get('category') || 'all'
  const need = params.get('need') || ''
  return {
    category: ['all', 'laptop', 'phone', 'pc'].includes(category) ? category : 'all',
    q: params.get('q') || '',
    need: ['study', 'work', 'game', 'creative', 'upgrade'].includes(need) ? need : '',
    all: params.get('all') === '1',
  }
}
export default function useCatalog() {
  const [filters, setFilters] = useState(readFilters)
  const [content, setContent] = useState({ categories: [], needs: [] })
  const [result, setResult] = useState({ items: [], total: 0, loading: true, error: '' })
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const onPop = () => {
      setResult((current) => ({ ...current, loading: true }))
      setFilters(readFilters())
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      getHomeContent({ signal: controller.signal }),
      listProducts({
        ...filters,
        limit: filters.all || filters.q || filters.need ? 100 : 4,
        signal: controller.signal,
      }),
    ])
      .then(([home, data]) => {
        if (!controller.signal.aborted) {
          setContent(home)
          setResult({ ...data, loading: false, error: '' })
        }
      })
      .catch((error) => {
        if (error.name !== 'AbortError')
          setResult({
            items: [],
            total: 0,
            loading: false,
            error: 'Chưa tải được sản phẩm. Bạn thử lại nhé.',
          })
      })
    return () => controller.abort()
  }, [filters, retry])
  function changeFilters(next, scroll = true) {
    const updated = { ...filters, ...next }
    const params = new URLSearchParams()
    if (updated.category !== 'all') params.set('category', updated.category)
    if (updated.q) params.set('q', updated.q)
    if (updated.need) params.set('need', updated.need)
    if (updated.all) params.set('all', '1')
    window.history.pushState(
      null,
      '',
      `${window.location.pathname}${params.size ? `?${params}` : ''}${scroll ? '#san-pham' : ''}`,
    )
    setResult((current) => ({ ...current, loading: true, error: '' }))
    setFilters(updated)
    if (scroll)
      document
        .getElementById('san-pham')
        ?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'instant'
            : 'smooth',
        })
  }
  function reload() {
    setResult((current) => ({ ...current, loading: true }))
    setRetry((current) => current + 1)
  }
  return { filters, changeFilters, ...content, ...result, reload }
}
