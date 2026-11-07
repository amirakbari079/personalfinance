'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import {
  LayoutDashboard,
  ChartNoAxesCombined,
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  ArrowDownToLine,
  Landmark,
  CalendarClock,
  HandCoins,
  Package,
  Settings,
  LogOut,
  Search,
  Menu,
  ChevronLeft,
  Sparkles,
  Scale,
  Command,
  Leaf,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import ThemeToggle from './ThemeToggle'
import FormModal from './FormModal'
import QuickEntry from './QuickEntry'
const GROUPS = [
  {
    title: 'نمای کلی',
    items: [
      { href: '/', label: 'خانهٔ مالی', icon: LayoutDashboard },
      { href: '/reports', label: 'تحلیل و مقایسه', icon: ChartNoAxesCombined },
      { href: '/balance-sheet', label: 'ترازنامه', icon: Scale },
    ],
  },
  {
    title: 'پول و دارایی',
    items: [
      { href: '/accounts', label: 'حساب‌ها', icon: Wallet },
      { href: '/transactions', label: 'گردش پول', icon: ArrowLeftRight },
      { href: '/investments', label: 'سرمایه‌گذاری‌ها', icon: TrendingUp },
      { href: '/incomes', label: 'درآمدها', icon: ArrowDownToLine },
      { href: '/loans', label: 'وام و اقساط', icon: Landmark },
      {
        href: '/pending-expenses',
        label: 'هزینه‌های پیش رو',
        icon: CalendarClock,
      },
      { href: '/receivables', label: 'طلب‌ها', icon: HandCoins },
      { href: '/standby', label: 'کالاهای معوق', icon: Package },
    ],
  },
  {
    title: 'رصد و بررسی',
    items: [
      { href: '/market', label: 'دیدبان بازار', icon: ChartNoAxesCombined },
      { href: '/intelligence', label: 'هوش مالی', icon: Sparkles },
      { href: '/settings', label: 'تنظیمات', icon: Settings },
    ],
  },
]
const ITEMS = GROUPS.flatMap((g) => g.items)
const normalize = (v: string) =>
  v.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, '').trim()
export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const [panel, setPanel] = useState<'menu' | 'search' | null>(null)
  const [query, setQuery] = useState('')
  const [revision, setRevision] = useState(0)
  const active = (href: string) =>
    href === '/'
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`)
  const current = ITEMS.find((i) => active(i.href))
  useEffect(() => {
    setPanel(null)
  }, [pathname])
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setQuery('')
        setPanel((p) => (p ? null : 'search'))
      }
    }
    const changed = () => setRevision((r) => r + 1)
    window.addEventListener('keydown', key)
    window.addEventListener('finance-data-changed', changed)
    return () => {
      window.removeEventListener('keydown', key)
      window.removeEventListener('finance-data-changed', changed)
    }
  }, [])
  const nav = (
    <nav aria-label="منوی اصلی">
      {GROUPS.map((group) => (
        <div className="rail-group" key={group.title}>
          <p>{group.title}</p>
          {group.items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setPanel(null)}
              aria-current={active(href) ? 'page' : undefined}
              className={`rail-link ${active(href) ? 'is-active' : ''}`}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{label}</span>
              {active(href) && <span className="nav-active-dot" />}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  )
  return (
    <div className="finance-app">
      <a href="#main-content" className="skip-link">
        رفتن به محتوای صفحه
      </a>
      <aside className="finance-rail">
        <Link href="/" className="finance-brand">
          <span>
            <Leaf size={24} aria-hidden="true" />
          </span>
          <div>
            <strong>حسابداری شخصی</strong>
            <small>پول شما، تصویر روشن‌تر</small>
          </div>
        </Link>
        {nav}
        <div className="rail-foot">
          <span className="local-dot" /> فضای شخصی شما
          <button
            aria-label="خروج از حساب"
            title="خروج از حساب"
            onClick={async () => {
              await logout()
              router.replace('/login')
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <div className="finance-workspace">
        <header className="finance-topbar">
          <div className="topbar-context">
            <button
              className="icon-button mobile-menu-button"
              aria-label="بازکردن منو"
              onClick={() => setPanel('menu')}
            >
              <Menu size={22} />
            </button>
            <span className="topbar-brand">فضای شخصی</span>
            <ChevronLeft size={14} aria-hidden="true" />
            <strong>{current?.label ?? 'حسابداری شخصی'}</strong>
          </div>
          <div className="topbar-actions">
            <button
              className="search-trigger"
              onClick={() => {
                setQuery('')
                setPanel('search')
              }}
              aria-label="جست‌وجوی صفحات"
            >
              <Search size={18} />
              <span>رفتن به…</span>
              <kbd>Ctrl K</kbd>
            </button>
            <ThemeToggle />
            <QuickEntry />
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="finance-main">
          <div key={`${pathname}-${revision}`} className="route-enter">
            {children}
          </div>
        </main>
        <nav className="mobile-dock" aria-label="دسترسی سریع">
          {[ITEMS[0], ITEMS[1], ITEMS[3], ITEMS[10]].map(
            ({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={active(href) ? 'page' : undefined}
              >
                <Icon size={21} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ),
          )}
          <button onClick={() => setPanel('menu')}>
            <Menu size={21} />
            <span>بیشتر</span>
          </button>
        </nav>
      </div>
      {panel && (
        <FormModal
          title={panel === 'search' ? 'کجا می‌خواهید بروید؟' : 'بخش‌های برنامه'}
          onClose={() => setPanel(null)}
          footer={
            <button className="btn-ghost" onClick={() => setPanel(null)}>
              بستن
            </button>
          }
        >
          {panel === 'menu' ? (
            <>
              {nav}
              <button
                className="btn-ghost"
                onClick={async () => {
                  await logout()
                  router.replace('/login')
                }}
              >
                خروج از حساب
              </button>
            </>
          ) : (
            <>
              <label className="search-field">
                <Search size={20} />
                <input
                  aria-label="نام صفحه"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="مثلاً حساب، بازار یا تحلیل…"
                />
              </label>
              <div className="command-results">
                {ITEMS.filter((i) =>
                  normalize(i.label).includes(normalize(query)),
                ).map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} onClick={() => setPanel(null)}>
                    <Icon size={20} />
                    <span>{label}</span>
                    <ChevronLeft size={17} />
                  </Link>
                ))}
                {!ITEMS.some((i) =>
                  normalize(i.label).includes(normalize(query)),
                ) && (
                  <p className="empty-caption">
                    صفحه‌ای با این نام پیدا نشد. نام کوتاه‌تری بنویسید.
                  </p>
                )}
              </div>
              <p className="command-hint">
                <Command size={14} /> با کلیدهای Tab و Enter انتخاب کنید؛ Esc
                برای بستن.
              </p>
            </>
          )}
        </FormModal>
      )}
    </div>
  )
}
