'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Settings } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import ThemeToggle from '@/shared/ThemeToggle'

const NAV_ITEMS: { href: string; label: string; exact?: boolean }[] = [
  { href: '/', label: 'داشبورد', exact: true },
  { href: '/balance-sheet', label: 'ترازنامه' },
  { href: '/accounts', label: 'حساب‌ها' },
  { href: '/investments', label: 'سرمایه‌گذاری‌ها' },
  { href: '/incomes', label: 'درآمدها' },
  { href: '/loans', label: 'وام‌ها' },
  { href: '/pending-expenses', label: 'هزینه‌های برنامه‌ریزی‌شده' },
  { href: '/receivables', label: 'طلب‌ها' },
  { href: '/standby', label: 'کالاهای معوق' },
]

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

  const settingsActive = pathname === '/settings'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 px-4 md:px-6 h-14 flex items-center justify-between gap-3 app-header-glass">
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 min-w-0">
          <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-brand-accent/20">
            <Image src="/logo.svg" alt="حسابداری شخصی" width={32} height={32} priority />
          </div>
          <span
            className="text-sm tracking-tight hidden sm:block truncate"
            style={{ fontWeight: 'var(--font-weight-heading)', color: 'var(--color-header-text)' }}
          >
            حسابداری شخصی
          </span>
        </Link>

        <nav className="hidden lg:flex app-nav-pill max-w-[56vw]" aria-label="منوی اصلی">
          {NAV_ITEMS.map(({ href, label, exact }) => {
            const active = isNavActive(pathname, href, exact)
            return (
              <Link
                key={href}
                href={href}
                className={`app-nav-link ${active ? 'app-nav-link--active' : ''}`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Link
            href="/settings"
            title="تنظیمات ظاهر"
            aria-label="تنظیمات ظاهر"
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors duration-150 ${
              settingsActive
                ? 'bg-brand-accent text-text-on-accent'
                : 'text-text-muted hover:text-brand-accent hover:bg-surface-muted/60'
            }`}
          >
            <Settings className="w-4 h-4" />
          </Link>
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-text-muted hover:text-text-primary transition-colors px-3 h-9 rounded-xl hover:bg-surface-muted/60 hidden sm:inline-flex items-center"
          >
            خروج
          </button>
        </div>
      </header>

      <nav
        className="lg:hidden flex items-center gap-1 px-3 py-2 border-b border-surface-muted/40 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
        aria-label="منوی موبایل"
      >
        {NAV_ITEMS.map(({ href, label, exact }) => {
          const active = isNavActive(pathname, href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={`app-nav-link ${active ? 'app-nav-link--active' : ''}`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <main className="flex-1 pt-4 md:pt-6 pb-10">{children}</main>
    </div>
  )
}
