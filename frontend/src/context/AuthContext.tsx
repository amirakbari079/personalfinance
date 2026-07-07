import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'

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

// ⚠️ DEVELOPMENT MODE — authentication bypassed on the frontend.
// The context always reports authenticated=true, so ProtectedRoute never
// redirects to /login and the app is usable without a valid JWT cookie.
// Backend security is also wide-open in dev (see SecurityConfig).
// Restore real auth (getMe / apiLogin / apiLogout) before production.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: true,
    username: 'dev',
    isLoading: false,
  })

  const login = useCallback(async (_username: string, _password: string) => {
    setState({
      isAuthenticated: true,
      username: _username || 'dev',
      isLoading: false,
    })
  }, [])

  const logout = useCallback(async () => {
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
