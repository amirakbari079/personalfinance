'use client'

import type { MarketQuote } from '@/lib/api/marketApi'
import { formatMarketValue, minutesAgo } from '@/lib/api/marketApi'
import StatusTag from '@/shared/StatusTag'

interface Props {
  quote: MarketQuote
  children?: React.ReactNode
}

export default function MarketQuoteCard({ quote, children }: Props) {
  const change = quote.changePercentMonth
  const changePositive = change != null && change >= 0

  return (
    <div className="glass-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-text-muted">{quote.label}</p>
          <p className="text-sm text-amount text-text-primary mt-0.5">
            {formatMarketValue(quote.value, quote.currency)}
          </p>
        </div>
        {change != null && (
          <StatusTag variant={changePositive ? 'success' : 'error'} className="text-[11px]">
            {changePositive ? '+' : ''}
            {change.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}٪
          </StatusTag>
        )}
      </div>
      {children}
      <p className="text-[10px] text-text-muted">
        {quote.source} · {minutesAgo(quote.recordedAt)}
      </p>
    </div>
  )
}
