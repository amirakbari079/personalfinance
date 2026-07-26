'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from 'recharts'
import type { MarketHistoryPoint } from '@/lib/api/marketApi'

interface Props {
  data: MarketHistoryPoint[]
  currency: string
  formatValue: (value: number, currency: string) => string
}

export default function MarketHistoryMiniChartInner({ data, currency, formatValue }: Props) {
  const chartData = data.map((d) => ({
    t: new Date(d.recordedAt).getTime(),
    value: d.value,
  }))

  return (
    <div className="h-16 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-surface-muted)',
              borderRadius: '0.375rem',
              fontSize: '10px',
              direction: 'rtl',
            }}
            labelFormatter={() => 'ماه جاری'}
            formatter={(value) => [formatValue(Number(value), currency), 'قیمت']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-brand-accent)"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
