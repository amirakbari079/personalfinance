'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Wallet,
  TrendingUp,
  Package,
  FileText,
  Landmark,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { getBalance, type BalanceSummary } from '@/lib/api/balanceApi'
import { formatToman } from '@/utils/formatToman'
import StatusTag from '@/shared/StatusTag'

const CAPITAL_ITEMS: {
  key: keyof Pick<BalanceSummary, 'cash' | 'investments' | 'standby' | 'receivablesOutstanding'>
  label: string
  href: string
  icon: typeof Wallet
  tag: string
}[] = [
  { key: 'cash', label: 'نقد', href: '/accounts', icon: Wallet, tag: 'نقدینگی' },
  { key: 'investments', label: 'سرمایه‌گذاری‌ها', href: '/investments', icon: TrendingUp, tag: 'سرمایه' },
  { key: 'standby', label: 'کالاهای معوق', href: '/standby', icon: Package, tag: 'معوق' },
  { key: 'receivablesOutstanding', label: 'طلب‌ها', href: '/receivables', icon: FileText, tag: 'طلب' },
]

const DEDUCTION_ITEMS: {
  key: keyof Pick<BalanceSummary, 'monthlyInstallments' | 'pendingExpenses'>
  label: string
  href: string
  icon: typeof Landmark
  tag: string
}[] = [
  { key: 'monthlyInstallments', label: 'اقساط ماهانه وام', href: '/loans', icon: Landmark, tag: 'وام' },
  { key: 'pendingExpenses', label: 'هزینه‌های برنامه‌ریزی‌شده', href: '/pending-expenses', icon: Clock, tag: 'برنامه‌ریزی' },
]

export default function DashboardPage() {
  const [balance, setBalance] = useState<BalanceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getBalance()
      .then(setBalance)
      .catch(e => setError(e instanceof Error ? e.message : 'خطا در بارگذاری'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !balance) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5">
          {error ?? 'خطا در بارگذاری'}
        </p>
      </div>
    )
  }

  const isPositive = balance.netWorth >= 0

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
      {/* Hero — net worth */}
      <div className="glass-card px-6 py-7 md:px-8 md:py-8 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            background:
              'radial-gradient(ellipse 55% 70% at 100% 0%, var(--color-brand-accent), transparent 65%)',
          }}
        />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <StatusTag variant="primary" className="mb-3">ارزش خالص</StatusTag>
            <p
              className={`text-3xl md:text-4xl lg:text-[2.75rem] text-amount-hero tracking-tight ${
                isPositive ? 'text-brand-accent' : 'text-status-error'
              }`}
            >
              {formatToman(balance.netWorth)}
            </p>
            <div className="mt-3">
              {isPositive ? (
                <StatusTag variant="success">
                  <ArrowUpRight className="w-3 h-3" />
                  مثبت
                </StatusTag>
              ) : (
                <StatusTag variant="error">
                  <ArrowDownRight className="w-3 h-3" />
                  منفی
                </StatusTag>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <div className="stat-cell min-w-[9.5rem]">
              <p className="text-[11px] text-text-muted mb-1">سرمایه کل</p>
              <p className="text-sm text-amount text-text-primary">{formatToman(balance.totalCapital)}</p>
            </div>
            <div className="stat-cell min-w-[9.5rem]">
              <p className="text-[11px] text-text-muted mb-1">کسرهای ماهانه</p>
              <p className="text-sm text-amount text-status-error">
                − {formatToman(balance.monthlyInstallments + balance.pendingExpenses)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capital */}
        <section>
          <div className="flex items-center justify-between mb-3 px-0.5">
            <h2 className="text-section-label text-text-muted">سرمایه کل</h2>
            <span className="text-sm text-amount text-text-primary">{formatToman(balance.totalCapital)}</span>
          </div>
          <div className="space-y-2">
            {CAPITAL_ITEMS.map(({ key, label, href, icon: Icon, tag }) => (
              <Link
                key={key}
                href={href}
                className="glass-card px-4 py-3.5 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-accent/10 text-brand-accent group-hover:bg-brand-accent/18 transition-colors flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-item-title text-text-primary truncate">{label}</p>
                    <StatusTag variant="secondary" className="mt-1 text-[10px]">{tag}</StatusTag>
                  </div>
                </div>
                <span className="text-sm text-amount text-text-primary flex-shrink-0 tabular-nums">
                  {formatToman(balance[key])}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Deductions */}
        <section>
          <h2 className="text-section-label text-text-muted mb-3 px-0.5">کسرها</h2>
          <div className="space-y-2">
            {DEDUCTION_ITEMS.map(({ key, label, href, icon: Icon, tag }) => (
              <Link
                key={key}
                href={href}
                className="glass-card px-4 py-3.5 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-status-error/10 text-status-error group-hover:bg-status-error/16 transition-colors flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-item-title text-text-primary truncate">{label}</p>
                    <StatusTag variant="error" className="mt-1 text-[10px]">{tag}</StatusTag>
                  </div>
                </div>
                <span className="text-sm text-amount text-status-error flex-shrink-0 tabular-nums">
                  − {formatToman(balance[key])}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
