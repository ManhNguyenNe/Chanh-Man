import { useEffect, useState } from 'react'
import { getSession, subscribeAuthChanges } from '../services/authService.js'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    const refresh = () => getSession().then((session) => {
      if (active) { setUser(session); setError('') }
    }).catch((issue) => { if (active) { setUser(null); setError(issue.message) } })
      .finally(() => { if (active) setLoading(false) })
    const unsubscribe = subscribeAuthChanges((session, issue) => {
      if (active) { setUser(session); setError(issue?.message || '') }
    })
    refresh()
    window.addEventListener('focus', refresh)
    return () => { active = false; unsubscribe(); window.removeEventListener('focus', refresh) }
  }, [attempt])
  return { user, loading, error, reload: () => { setLoading(true); setAttempt((value) => value + 1) } }
}
