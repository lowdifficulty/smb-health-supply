import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { PortalMode } from '../types'

export type AuthRole = 'client' | 'admin'

interface AuthContextValue {
  isAuthenticated: boolean
  role: AuthRole | null
  loginAsClient: () => void
  loginAsAdmin: () => void
  logout: () => void
}

const AUTH_KEY = 'smb_auth_session'

const AuthContext = createContext<AuthContextValue | null>(null)

function loadSession(): AuthRole | null {
  try {
    const stored = localStorage.getItem(AUTH_KEY)
    return stored === 'admin' || stored === 'client' ? stored : null
  } catch {
    return null
  }
}

export function AuthProvider({
  children,
  onRoleChange,
}: {
  children: ReactNode
  onRoleChange: (role: AuthRole | null) => void
}) {
  const [role, setRole] = useState<AuthRole | null>(loadSession)

  const persist = useCallback(
    (next: AuthRole | null) => {
      setRole(next)
      if (next) localStorage.setItem(AUTH_KEY, next)
      else localStorage.removeItem(AUTH_KEY)
      onRoleChange(next)
    },
    [onRoleChange],
  )

  const loginAsClient = useCallback(() => persist('client'), [persist])
  const loginAsAdmin = useCallback(() => persist('admin'), [persist])
  const logout = useCallback(() => persist(null), [persist])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: role !== null,
        role,
        loginAsClient,
        loginAsAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function getStoredAuthRole(): AuthRole | null {
  return loadSession()
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function authRoleToPortal(role: AuthRole | null): PortalMode {
  return role === 'admin' ? 'admin' : 'client'
}
