'use client'

import AppShell from '@/shared/AppShell'
import ProtectedRoute from '@/shared/ProtectedRoute'
import type { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}
