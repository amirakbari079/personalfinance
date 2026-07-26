'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import type { BalanceSheetHistoryPoint } from '@/lib/api/balanceSheetHistoryApi'

interface Props {
  data: BalanceSheetHistoryPoint[]
  formatValue: (amount: number) => string
  isLoading?: boolean
}

function shortDate(jalali: string): string {
  const parts = jalali.split('/')
  if (parts.length !== 3) return jalali
  return `${parts[1]}/${parts[2]}`
}

function formatCompact(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '−' : ''
  if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toLocaleString('fa-IR', { maximumFractionDigits: 1 }) + 'B'
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toLocaleString('fa-IR', { maximumFractionDigits: 1 }) + 'M'
  if (abs >= 1_000) return sign + (abs / 1_000).toLocaleString('fa-IR', { maximumFractionDigits: 0 }) + 'K'
  return value.toLocaleString('fa-IR')
}

export default function BalanceTrendChart({ data, formatValue, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-12">
        با ثبت دارایی‌ها و بدهی‌ها، نمودار روند ترازنامه اینجا نمایش داده می‌شود.
      </p>
    )
  }

  const chartData = data.map((d) => ({
    date: shortDate(d.recordedDateJalali),
    fullDate: d.recordedDateJalali,
    assets: d.totalAssets,
    liabilities: d.totalLiabilities,
    net: d.netBalance,
  }))

  return (
    <div className="h-72 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-accent)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--color-brand-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-surface-muted)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCompact}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-surface-muted)',
              borderRadius: '0.5rem',
              fontSize: '12px',
              direction: 'rtl',
            }}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate ?? ''}
            formatter={(value, name) => {
              const labels: Record<string, string> = {
                assets: 'دارایی‌ها',
                liabilities: 'بدهی‌ها',
                net: 'بالانس',
              }
              return [formatValue(Number(value)), labels[String(name)] ?? String(name)]
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', direction: 'rtl' }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                assets: 'دارایی‌ها',
                liabilities: 'بدهی‌ها',
                net: 'بالانس',
              }
              return labels[value] ?? value
            }}
          />
          <Area
            type="monotone"
            dataKey="net"
            fill="url(#netGradient)"
            stroke="none"
          />
          <Line
            type="monotone"
            dataKey="assets"
            stroke="var(--color-status-success)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="liabilities"
            stroke="var(--color-status-error)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="net"
            stroke="var(--color-brand-accent)"
            strokeWidth={2.5}
            dot={{ fill: 'var(--color-brand-accent)', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
