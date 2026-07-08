'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getMe, login as apiLogin, logout as apiLogout } from '@/lib/api/authApi'

interface AuthState {
  isAuthenticated: boolean
  username: string | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
    isLoading: true,
  })

  useEffect(() => {
    getMe()
      .then((res) => {
        setState({
          isAuthenticated: true,
          username: res.data,
          isLoading: false,
        })
      })
      .catch(() => {
        setState({
          isAuthenticated: false,
          username: null,
          isLoading: false,
        })
      })
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin({ username, password })
    setState({
      isAuthenticated: true,
      username: res.data?.username ?? username,
      isLoading: false,
    })
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setState({ isAuthenticated: false, username: null, isLoading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
