'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/src/context/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-text-muted tracking-wide">در حال بارگذاری...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <>{children}</>
}
