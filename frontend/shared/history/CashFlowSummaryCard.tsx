'use client'

import type { CashFlowSummary } from '@/lib/api/historyApi'
import { ArrowDownLeft, ArrowUpRight, Minus } from 'lucide-react'

interface Props {
  data: CashFlowSummary | null
  formatValue: (amount: number) => string
  isLoading?: boolean
}

export default function CashFlowSummaryCard({ data, formatValue, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="luxury-card p-6 flex items-center justify-center h-36">
        <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const { positive, delta, percentChange, monthLabel, startOfMonthTotal, currentTotal } = data
  const isNeutral = delta === 0

  const borderClass = positive && !isNeutral
    ? 'border-status-success-border'
    : !positive && !isNeutral
      ? 'border-status-error-border'
      : 'border-surface-muted'

  const bgClass = positive && !isNeutral
    ? 'bg-status-success-bg/40'
    : !positive && !isNeutral
      ? 'bg-status-error-bg/40'
      : ''

  const accentClass = positive && !isNeutral
    ? 'text-status-success'
    : !positive && !isNeutral
      ? 'text-status-error'
      : 'text-text-muted'

  const Icon = isNeutral ? Minus : positive ? ArrowUpRight : ArrowDownLeft

  const deltaSign = delta > 0 ? '+' : delta < 0 ? '−' : ''
  const deltaText = deltaSign + formatValue(Math.abs(delta))

  const percentText = percentChange !== null
    ? `${percentChange >= 0 ? '+' : '−'}${Math.abs(percentChange).toLocaleString('fa-IR', { maximumFractionDigits: 1 })}٪`
    : null

  return (
    <div className={`luxury-card p-5 border ${borderClass} ${bgClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-section-label text-text-muted">جریان نقدینگی</p>
          <p className="text-xs text-text-muted mt-1">نسبت به اول {monthLabel}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${accentClass} ${
          positive && !isNeutral ? 'bg-status-success-bg' :
          !positive && !isNeutral ? 'bg-status-error-bg' :
          'bg-surface-muted/30'
        }`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{isNeutral ? 'بدون تغییر' : positive ? 'مثبت' : 'منفی'}</span>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className={`text-2xl text-amount tracking-tight ${accentClass}`}>
            {deltaText}
          </p>
          {percentText && (
            <p className={`text-xs mt-1 tabular-nums ${accentClass}`}>{percentText}</p>
          )}
        </div>
        <div className="text-left text-xs text-text-muted space-y-1">
          <p>
            <span className="text-text-muted">اول ماه: </span>
            <span className="text-text-primary tabular-nums">{formatValue(startOfMonthTotal)}</span>
          </p>
          <p>
            <span className="text-text-muted">اکنون: </span>
            <span className="text-text-primary tabular-nums">{formatValue(currentTotal)}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
