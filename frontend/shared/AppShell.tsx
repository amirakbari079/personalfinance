'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/AuthContext'

const NAV_ITEMS: { href: string; label: string; exact?: boolean }[] = [
  { href: '/', label: 'داشبورد', exact: true },
  { href: '/accounts', label: 'حساب‌ها' },
  { href: '/investments', label: 'سرمایه‌گذاری‌ها' },
  { href: '/incomes', label: 'درآمدها' },
  { href: '/loans', label: 'وام‌ها' },
  { href: '/pending-expenses', label: 'هزینه‌های معوق' },
]

function navClassName(isActive: boolean) {
  return `text-xs px-3 py-1.5 rounded-lg transition-colors ${
    isActive
      ? 'bg-brand-accent/10 text-brand-accent font-medium'
      : 'text-text-muted hover:text-text-primary'
  }`
}

function isNavActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  async function handleLogout() {
    await logout()
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="bg-surface-card border-b border-surface-muted px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm bg-brand-accent flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-text-on-accent/90" />
          </div>
          <span className="text-text-primary font-semibold text-sm">حسابداری شخصی</span>
        </div>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, exact }) => {
            const active = isNavActive(pathname, href, exact)
            return (
              <Link key={href} href={href} className={navClassName(active)}>
                {label}
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          خروج
        </button>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
