'use client'
import { useId } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'
import { compactMoney, type HistoryPoint } from './analytics'
import { formatToman } from '@/utils/formatToman'
export default function WealthChart({
  data,
  comparison = false,
  showAssets = false,
}: {
  data: HistoryPoint[]
  comparison?: boolean
  showAssets?: boolean
}) {
  const id = useId().replace(/:/g, '')
  const contentStyle = {
    background: 'var(--color-surface-card)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--finance-border)',
    borderRadius: 12,
    direction: 'rtl' as const,
    fontSize: 12,
    boxShadow: 'var(--shadow-card)',
  }
  const labels: Record<string, string> = {
    netBalance: 'تراز خالص',
    totalAssets: 'دارایی‌ها',
    totalLiabilities: 'تعهدات',
  }
  const axis = {
    tick: { fill: 'var(--color-text-muted)', fontSize: 11 },
    axisLine: false,
    tickLine: false,
  }
  const formatDate = (v: string) =>
    v.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
  return (
    <div
      className="wealth-chart"
      dir="ltr"
      role="img"
      aria-label={
        comparison
          ? 'مقایسهٔ دارایی و تعهدات در تاریخ‌های ثبت‌شده؛ جدول داده‌ها در پایین کارت در دسترس است.'
          : 'نمودار تراز خالص در تاریخ‌های ثبت‌شده؛ جدول داده‌ها در پایین کارت در دسترس است.'
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        {comparison ? (
          <BarChart
            data={data}
            margin={{ top: 15, right: 8, bottom: 0, left: 10 }}
            accessibilityLayer
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--finance-border)"
              strokeDasharray="3 5"
            />
            <XAxis
              {...axis}
              dataKey="recordedDateJalali"
              tickFormatter={formatDate}
              minTickGap={30}
            />
            <YAxis {...axis} tickFormatter={compactMoney} width={78} />
            <Tooltip
              contentStyle={contentStyle}
              labelFormatter={(label) => formatDate(String(label))}
              formatter={(v, n) => [
                formatToman(Number(v)),
                labels[String(n)] ?? n,
              ]}
              cursor={{ fill: 'var(--color-surface-elevated)' }}
            />
            <Bar
              dataKey="totalAssets"
              fill="var(--finance-chart-1)"
              radius={[5, 5, 0, 0]}
              maxBarSize={28}
              isAnimationActive={false}
            />
            <Bar
              dataKey="totalLiabilities"
              fill="var(--finance-chart-4)"
              radius={[5, 5, 0, 0]}
              maxBarSize={28}
              isAnimationActive={false}
            />
          </BarChart>
        ) : (
          <ComposedChart
            data={data}
            margin={{ top: 15, right: 8, bottom: 0, left: 10 }}
            accessibilityLayer
          >
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--finance-chart-1)"
                  stopOpacity={0.24}
                />
                <stop
                  offset="100%"
                  stopColor="var(--finance-chart-1)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--finance-border)"
              strokeDasharray="3 5"
            />
            <XAxis
              {...axis}
              dataKey="recordedDateJalali"
              tickFormatter={formatDate}
              minTickGap={30}
            />
            <YAxis
              {...axis}
              tickFormatter={compactMoney}
              width={78}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={contentStyle}
              labelFormatter={(label) => formatDate(String(label))}
              formatter={(v, n) => [
                formatToman(Number(v)),
                labels[String(n)] ?? n,
              ]}
            />
            <Area
              type="linear"
              dataKey="netBalance"
              fill={`url(#${id})`}
              stroke="var(--finance-chart-1)"
              strokeWidth={3}
              dot={{
                r: data.length < 20 ? 3 : 0,
                strokeWidth: 2,
                fill: 'var(--color-surface-card)',
              }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
            {showAssets && (
              <Line
                type="linear"
                dataKey="totalAssets"
                stroke="var(--finance-chart-2)"
                dot={false}
                strokeWidth={2}
                strokeDasharray="6 4"
                isAnimationActive={false}
              />
            )}
            {showAssets && (
              <Line
                type="linear"
                dataKey="totalLiabilities"
                stroke="var(--finance-chart-4)"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
