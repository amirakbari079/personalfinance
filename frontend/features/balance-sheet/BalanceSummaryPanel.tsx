'use client'

import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Minus, TrendingUp } from 'lucide-react'
import { formatToman } from '@/utils/formatToman'
import {
  getBalanceSheetHistory,
  getBalanceSheetCashFlow,
  type BalanceSheetHistoryPoint,
} from '@/lib/api/balanceSheetHistoryApi'
import type { CashFlowSummary } from '@/lib/api/historyApi'
import BalanceTrendChart from './BalanceTrendChartLazy'
import StatusTag from '@/shared/StatusTag'

interface Props {
  totalAssets: number
  totalLiabilities: number
  netBalance: number
}

export default function BalanceSummaryPanel({ totalAssets, totalLiabilities, netBalance }: Props) {
  const [history, setHistory] = useState<BalanceSheetHistoryPoint[]>([])
  const [cashFlow, setCashFlow] = useState<CashFlowSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getBalanceSheetHistory(), getBalanceSheetCashFlow()])
      .then(([series, flow]) => {
        setHistory(series)
        setCashFlow(flow)
      })
      .catch(() => { /* history is optional */ })
      .finally(() => setIsLoading(false))
  }, [totalAssets, totalLiabilities, netBalance])

  const isPositive = netBalance >= 0
  const total = totalAssets + totalLiabilities
  const assetPct = total > 0 ? Math.round((totalAssets / total) * 100) : 50
  const liabilityPct = total > 0 ? 100 - assetPct : 50

  return (
    <section className="glass-card overflow-hidden">
      <div className="relative px-6 pt-8 pb-6 text-center border-b border-surface-muted/30">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: isPositive
              ? 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34, 197, 94, 0.15), transparent 70%)'
              : 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(244, 63, 94, 0.15), transparent 70%)',
          }}
        />
        <StatusTag variant={isPositive ? 'success' : 'error'} className="mb-3 relative">بالانس نهایی</StatusTag>
        <p
          className={`text-4xl md:text-5xl text-amount-hero tracking-tight relative ${
            isPositive ? 'text-status-success' : 'text-status-error'
          }`}
        >
          {formatToman(netBalance)}
        </p>
        <p className="text-xs text-text-muted mt-2 relative">
          {isPositive ? 'وضعیت مثبت — دارایی‌ها بیشتر از بدهی‌هاست' : 'وضعیت منفی — بدهی‌ها بیشتر از دارایی‌هاست'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-surface-muted/40">
        <StatCard
          label="دارایی‌ها"
          value={totalAssets}
          colorClass="text-status-success"
          bgClass="bg-status-success-bg/20"
        />
        <StatCard
          label="بدهی‌ها"
          value={totalLiabilities}
          colorClass="text-status-error"
          bgClass="bg-status-error-bg/20"
          prefix="−"
        />
        <CashFlowStatCard data={cashFlow} isLoading={isLoading} />
      </div>

      {/* Proportion bar */}
      <div className="px-6 py-4 border-b border-surface-muted/40">
        <div className="flex items-center justify-between text-[11px] text-text-muted mb-2">
          <span className="text-status-success">دارایی {assetPct.toLocaleString('fa-IR')}٪</span>
          <span className="text-status-error">بدهی {liabilityPct.toLocaleString('fa-IR')}٪</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden flex bg-surface-muted/30">
          <div
            className="h-full bg-status-success transition-all duration-500"
            style={{ width: `${assetPct}%` }}
          />
          <div
            className="h-full bg-status-error transition-all duration-500"
            style={{ width: `${liabilityPct}%` }}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-brand-accent" />
          <h3 className="text-section-label text-text-muted">روند ترازنامه</h3>
        </div>
        <BalanceTrendChart
          data={history}
          formatValue={formatToman}
          isLoading={isLoading}
        />
      </div>
    </section>
  )
}

function StatCard({
  label,
  value,
  colorClass,
  bgClass,
  prefix = '',
}: {
  label: string
  value: number
  colorClass: string
  bgClass: string
  prefix?: string
}) {
  return (
    <div className={`stat-cell ${bgClass}`}>
      <p className="text-[11px] text-text-muted mb-1">{label}</p>
      <p className={`text-lg text-amount tracking-tight ${colorClass}`}>
        {prefix}{formatToman(value)}
      </p>
    </div>
  )
}

function CashFlowStatCard({
  data,
  isLoading,
}: {
  data: CashFlowSummary | null
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="stat-cell flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="stat-cell">
        <p className="text-[11px] text-text-muted mb-1">تغییر ماهانه</p>
        <p className="text-lg text-amount text-text-muted">—</p>
      </div>
    )
  }

  const { positive, delta, percentChange, monthLabel } = data
  const isNeutral = delta === 0
  const accentClass = positive && !isNeutral
    ? 'text-status-success'
    : !positive && !isNeutral
      ? 'text-status-error'
      : 'text-text-muted'
  const Icon = isNeutral ? Minus : positive ? ArrowUpRight : ArrowDownLeft
  const deltaSign = delta > 0 ? '+' : delta < 0 ? '−' : ''
  const percentText = percentChange !== null
    ? `${percentChange >= 0 ? '+' : '−'}${Math.abs(percentChange).toLocaleString('fa-IR', { maximumFractionDigits: 1 })}٪`
    : null

  return (
    <div className={`stat-cell ${
      positive && !isNeutral ? 'bg-status-success-bg/20' :
      !positive && !isNeutral ? 'bg-status-error-bg/20' : ''
    }`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] text-text-muted">تغییر {monthLabel}</p>
        <Icon className={`w-3.5 h-3.5 ${accentClass}`} />
      </div>
      <p className={`text-lg text-amount tracking-tight ${accentClass}`}>
        {deltaSign}{formatToman(Math.abs(delta))}
      </p>
      {percentText && (
        <StatusTag variant={positive ? 'success' : 'error'} className="mt-1 text-[10px]">
          {percentText}
        </StatusTag>
      )}
    </div>
  )
}
