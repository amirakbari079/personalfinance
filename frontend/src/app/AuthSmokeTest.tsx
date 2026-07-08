'use client'

import { useAuth } from '@/features/auth/AuthContext'

export function AuthSmokeTest() {
  const { isAuthenticated, username } = useAuth()

  return (
    <p className="text-xs text-text-muted mt-2 tabular-nums">
      Auth: {isAuthenticated ? `✓ ${username}` : '✗'}
    </p>
  )
}
