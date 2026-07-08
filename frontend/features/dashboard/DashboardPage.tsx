'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getBalance, type BalanceSummary } from '@/lib/api/balanceApi'

const CAPITAL_ITEMS: {
  key: keyof Pick<BalanceSummary, 'cash' | 'investments' | 'standby' | 'receivablesOutstanding'>
  label: string
  href: string
  icon: string
}[] = [
  { key: 'cash', label: 'نقد', href: '/accounts', icon: '💳' },
  { key: 'investments', label: 'سرمایه‌گذاری‌ها', href: '/investments', icon: '📈' },
  { key: 'standby', label: 'کالاهای معوق', href: '/standby', icon: '📦' },
  { key: 'receivablesOutstanding', label: 'طلب‌ها (باقی‌مانده)', href: '/receivables', icon: '📋' },
]

const DEDUCTION_ITEMS: {
  key: keyof Pick<BalanceSummary, 'monthlyInstallments' | 'pendingExpenses'>
  label: string
  href: string
  icon: string
}[] = [
  { key: 'monthlyInstallments', label: 'اقساط ماهانه وام', href: '/loans', icon: '🏦' },
  { key: 'pendingExpenses', label: 'هزینه‌های معوق', href: '/pending-expenses', icon: '⏳' },
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5">
          {error ?? 'خطا در بارگذاری'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <p className="text-[10px] tracking-[0.25em] uppercase text-brand-accent/70 mb-2 text-section-label">Net Worth</p>
        <h1 className="text-3xl text-page-title text-text-primary tracking-tight">تراز مالی</h1>
        <p className={`mt-4 text-4xl text-amount-hero tracking-tight ${
          balance.netWorth >= 0 ? 'text-brand-accent' : 'text-status-error'
        }`}>
          {formatToman(balance.netWorth)}
        </p>
        <div className="mt-6 gold-line w-16 mx-auto" />
      </div>

      <section className="mb-6">
        <h2 className="text-section-label text-text-muted mb-3 px-1">
          سرمایه کل — <span className="text-amount text-text-primary">{formatToman(balance.totalCapital)}</span>
        </h2>
        <div className="space-y-2">
          {CAPITAL_ITEMS.map(({ key, label, href, icon }) => (
            <Link key={key} href={href} className="luxury-card px-5 py-4 flex items-center justify-between hover:border-brand-accent/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-base">{icon}</span>
                <span className="text-sm text-text-primary">{label}</span>
              </div>
              <span className="text-sm text-amount text-text-primary">
                {formatToman(balance[key])}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-section-label text-text-muted mb-3 px-1">
          کسرها
        </h2>
        <div className="space-y-2">
          {DEDUCTION_ITEMS.map(({ key, label, href, icon }) => (
            <Link key={key} href={href} className="luxury-card px-5 py-4 flex items-center justify-between hover:border-brand-accent/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-base">{icon}</span>
                <span className="text-sm text-text-primary">{label}</span>
              </div>
              <span className="text-sm text-amount text-status-error">
                − {formatToman(balance[key])}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function formatToman(amount: number): string {
  return amount.toLocaleString('fa-IR') + ' تومان'
}
