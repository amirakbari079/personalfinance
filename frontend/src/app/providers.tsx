'use client'

import { AuthProvider } from '@/features/auth/AuthContext'
import { ThemeProvider } from '@/shared/ThemeProvider'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}
