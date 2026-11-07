'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const TABS: { href: string; label: string; exact?: boolean }[] = [
  { href: '/intelligence', label: 'بازار', exact: true },
  { href: '/intelligence/macro', label: 'کلان' },
  { href: '/intelligence/advisor', label: 'مشاور' },
  { href: '/intelligence/updates', label: 'مرکز بروزرسانی' },
  { href: '/intelligence/quality', label: 'کیفیت داده' },
]

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function IntelligenceLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="w-full px-4 py-6 pb-12">
      <nav
        className="flex items-center gap-1 mb-6 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
        aria-label="بخش هوش مالی"
      >
        {TABS.map(({ href, label, exact }) => {
          const active = isActive(pathname, href, exact)
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
      {children}
    </div>
  )
}
