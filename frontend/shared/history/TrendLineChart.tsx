'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { TotalSeriesPoint } from '@/lib/api/historyApi'

interface Props {
  data: TotalSeriesPoint[]
  formatValue: (amount: number) => string
  title?: string
  isLoading?: boolean
}

function shortDate(jalali: string): string {
  const parts = jalali.split('/')
  if (parts.length !== 3) return jalali
  return `${parts[1]}/${parts[2]}`
}

function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toLocaleString('fa-IR', { maximumFractionDigits: 1 }) + 'B'
  if (value >= 1_000_000) return (value / 1_000_000).toLocaleString('fa-IR', { maximumFractionDigits: 1 }) + 'M'
  if (value >= 1_000) return (value / 1_000).toLocaleString('fa-IR', { maximumFractionDigits: 0 }) + 'K'
  return value.toLocaleString('fa-IR')
}

export default function TrendLineChart({ data, formatValue, title = 'روند موجودی کل', isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-56">
        <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-section-label text-text-muted mb-4">{title}</h3>
        <p className="text-sm text-text-muted text-center py-8">
          با ثبت موجودی حساب‌ها، نمودار روند اینجا نمایش داده می‌شود.
        </p>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    date: shortDate(d.recordedDateJalali),
    fullDate: d.recordedDateJalali,
    total: d.total,
  }))

  return (
    <div className="glass-card p-5">
      <h3 className="text-section-label text-text-muted mb-4">{title}</h3>
      <div className="h-56 w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
              width={48}
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
              formatter={(value) => [formatValue(Number(value)), 'موجودی کل']}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="var(--color-brand-accent)"
              strokeWidth={2.5}
              dot={{ fill: 'var(--color-brand-accent)', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: 'var(--color-brand-accent-hover)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
