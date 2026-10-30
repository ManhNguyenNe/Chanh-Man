/** Keep post-login navigation on an existing storefront route, including its filters. */
export function authReturnPath(next) {
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//')) return '/cart'
  try {
    const url = new URL(next, 'https://store.example')
    if (url.origin !== 'https://store.example') return '/cart'
    const allowed = /^\/(?:account(?:\/orders(?:\/[^/]+)?)?\/?|checkout\/?|cart\/?|san-pham(?:\/[^/]+)?\/?|laptop\/?|dien-thoai\/?|linh-kien-pc\/?)?$/
    return allowed.test(url.pathname) ? url.pathname + url.search + url.hash : '/cart'
  } catch { return '/cart' }
}
