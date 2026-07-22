import { createContext, useContext, useEffect, useState } from 'react'
import { getTokens, getCurrentUser, clearTokens } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(getTokens().access))

  useEffect(() => {
    const { access } = getTokens()
    if (!access) return

    let cancelled = false

    getCurrentUser()
      .then((data) => {
        if (!cancelled) setUser(data)
      })
      .catch(() => {
        clearTokens()
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const logout = () => {
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
