import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('hrms_token'))
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(Boolean(localStorage.getItem('hrms_token')))

  useEffect(() => {
    if (token) {
      localStorage.setItem('hrms_token', token)
      setLoadingUser(true)
      api.get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoadingUser(false))
    } else {
      localStorage.removeItem('hrms_token')
      setUser(null)
      setLoadingUser(false)
    }
  }, [token])

  const value = useMemo(
    () => ({
      token,
      user,
      loadingUser,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === 'admin',
      login: (newToken) => setToken(newToken),
      logout: () => setToken(null),
      refreshUser: async () => {
        if (!token) return null
        const res = await api.get('/auth/me')
        setUser(res.data)
        return res.data
      },
    }),
    [token, user, loadingUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
