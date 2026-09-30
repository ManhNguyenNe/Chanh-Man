import { useEffect, useState } from 'react'
import * as cartService from '../services/cartService'
export default function useCart() {
  const [cart, setCart] = useState({ items: [], count: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    const refresh = () =>
      cartService.getCart().then((data) => {
        if (active) { setCart(data); setError('') }
      }).catch((issue) => {
        if (active) setError(issue.message)
      }).finally(() => { if (active) setLoading(false) })
    refresh()
    window.addEventListener('storage', refresh)
    return () => {
      active = false
      window.removeEventListener('storage', refresh)
    }
  }, [attempt])
  async function change(action, ...args) {
    const next = await cartService[action](...args)
    setCart(next)
  }
  return {
    cart,
    loading,
    error,
    reload: () => { setLoading(true); setAttempt((value) => value + 1) },
    addItem: (id) => change('addItem', id),
    updateQuantity: (id, quantity) => change('updateQuantity', id, quantity),
    removeItem: (id) => change('removeItem', id),
  }
}
