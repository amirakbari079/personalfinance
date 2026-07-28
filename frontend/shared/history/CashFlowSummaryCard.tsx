'use client'

import type { CashFlowSummary } from '@/lib/api/historyApi'
import { ArrowDownLeft, ArrowUpRight, Minus } from 'lucide-react'
import StatusTag from '@/shared/StatusTag'

interface Props {
  data: CashFlowSummary | null
  formatValue: (amount: number) => string
  isLoading?: boolean
}

export default function CashFlowSummaryCard({ data, formatValue, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-36">
        <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const { positive, delta, percentChange, monthLabel, startOfMonthTotal, currentTotal } = data
  const isNeutral = delta === 0

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
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-section-label text-text-muted">جریان نقدینگی</p>
          <p className="text-xs text-text-muted mt-1">نسبت به اول {monthLabel}</p>
        </div>
        {isNeutral ? (
          <StatusTag variant="neutral">
            <Icon className="w-3 h-3" />
            بدون تغییر
          </StatusTag>
        ) : positive ? (
          <StatusTag variant="success">
            <Icon className="w-3 h-3" />
            مثبت
          </StatusTag>
        ) : (
          <StatusTag variant="error">
            <Icon className="w-3 h-3" />
            منفی
          </StatusTag>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className={`text-2xl text-amount tracking-tight ${accentClass}`}>
            {deltaText}
          </p>
          {percentText && (
            <StatusTag variant={positive ? 'success' : 'error'} className="mt-2">
              {percentText}
            </StatusTag>
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

