'use client'

import type { MarketQuote } from '@/lib/api/marketApi'
import { formatMarketValue, minutesAgo } from '@/lib/api/marketApi'
import MarketHistoryMiniChart from './MarketHistoryMiniChart'
import type { MarketHistoryPoint } from '@/lib/api/marketApi'
import type { MarketSymbol } from '@/lib/api/marketApi'
import { Fragment } from 'react'

interface Props {
  title: string
  quotes: MarketQuote[]
  chartSymbol?: MarketSymbol
  chartData?: MarketHistoryPoint[]
  chartLoading?: boolean
  footerSource?: string
  footerTime?: string
}

function QuoteCell({ quote }: { quote: MarketQuote }) {
  const change = quote.changePercentMonth
  const changePositive = change != null && change >= 0

  return (
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-text-muted truncate">{quote.label}</p>
      <p className="text-sm text-amount text-text-primary mt-0.5 tabular-nums truncate">
        {formatMarketValue(Number(quote.value), quote.currency)}
      </p>
      {change != null && (
        <span
          className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            changePositive
              ? 'text-status-success bg-status-success/10'
              : 'text-status-error bg-status-error-bg'
          }`}
        >
          {changePositive ? '+' : ''}
          {change.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}٪
        </span>
      )}
    </div>
  )
}

export default function MarketQuotePairCard({
  title,
  quotes,
  chartSymbol,
  chartData = [],
  chartLoading = false,
  footerSource,
  footerTime,
}: Props) {
  if (quotes.length === 0) return null

  const chartQuote = chartSymbol ? quotes.find((q) => q.symbol === chartSymbol) ?? quotes[0] : quotes[0]

  return (
    <div className="luxury-card p-4 space-y-3">
      {title ? <p className="text-[11px] text-text-muted">{title}</p> : null}

      <div className="flex items-start">
        {quotes.map((quote, i) => (
          <Fragment key={quote.symbol}>
            {i > 0 && <div className="w-px self-stretch bg-surface-muted mx-3 flex-shrink-0" />}
            <QuoteCell quote={quote} />
          </Fragment>
        ))}
      </div>

      {chartSymbol && (
        <MarketHistoryMiniChart
          data={chartData}
          currency={chartQuote.currency}
          isLoading={chartLoading}
        />
      )}

      {(footerSource || footerTime) && (
        <p className="text-[10px] text-text-muted">
          {footerSource}
          {footerSource && footerTime && ' · '}
          {footerTime && minutesAgo(footerTime)}
        </p>
      )}
    </div>
  )
}
