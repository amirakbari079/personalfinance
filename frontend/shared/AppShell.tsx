'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import ThemeToggle from '@/shared/ThemeToggle'

const NAV_ITEMS: { href: string; label: string; exact?: boolean }[] = [
  { href: '/', label: 'داشبورد', exact: true },
  { href: '/accounts', label: 'حساب‌ها' },
  { href: '/investments', label: 'سرمایه‌گذاری‌ها' },
  { href: '/incomes', label: 'درآمدها' },
  { href: '/loans', label: 'وام‌ها' },
  { href: '/pending-expenses', label: 'هزینه‌های معوق' },
  { href: '/receivables', label: 'طلب‌ها' },
  { href: '/standby', label: 'کالاهای معوق' },
]

function navClassName(isActive: boolean) {
  return `text-xs px-3 py-1.5 rounded-xl transition-all duration-200 ${
    isActive
      ? 'bg-brand-accent/12 text-brand-accent border border-surface-muted nav-item-active'
      : 'text-text-muted hover:text-text-primary hover:bg-surface-muted/50'
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
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b px-6 py-3 flex items-center justify-between app-header-glass">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-accent to-brand-accent-hover flex items-center justify-center shadow-gold">
            <div className="w-2.5 h-2.5 rounded-full bg-text-on-accent/90" />
          </div>
          <div>
            <span className="text-text-primary text-sm tracking-tight" style={{ fontWeight: 'var(--font-weight-heading)' }}>حسابداری شخصی</span>
            <p className="text-[9px] text-text-muted tracking-[0.2em] uppercase">Luxury Edition</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, exact }) => {
            const active = isNavActive(pathname, href, exact)
            return (
              <Link key={href} href={href} className={navClassName(active)}>
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-text-muted hover:text-text-primary transition-colors px-3 py-1.5 rounded-xl hover:bg-surface-muted/50"
          >
            خروج
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden flex items-center gap-1 px-4 py-2 border-b border-surface-muted/40 glass-scroll-overlay">
        {NAV_ITEMS.map(({ href, label, exact }) => {
          const active = isNavActive(pathname, href, exact)
          return (
            <Link key={href} href={href} className={`${navClassName(active)} whitespace-nowrap`}>
              {label}
            </Link>
          )
        })}
      </nav>

      <main className="flex-1 pt-4 md:pt-6">{children}</main>
    </div>
  )
}
