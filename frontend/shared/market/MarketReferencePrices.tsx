'use client'

import type { MarketQuote, MarketSymbol } from '@/lib/api/marketApi'
import { formatMarketValue } from '@/lib/api/marketApi'
import MarketRefreshButton from './MarketRefreshButton'

interface Props {
  quotes: MarketQuote[]
  symbols: MarketSymbol[]
  title?: string
  onRefresh?: () => void
  refreshing?: boolean
  missingHint?: string
}

export default function MarketReferencePrices({
  quotes,
  symbols,
  title = 'قیمت مرجع بازار',
  onRefresh,
  refreshing = false,
  missingHint,
}: Props) {
  const items = symbols
    .map((sym) => quotes.find((q) => q.symbol === sym))
    .filter((q): q is MarketQuote => q != null)

  const hasMissing = symbols.some((sym) => !quotes.find((q) => q.symbol === sym))

  return (
    <div className="glass-card p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-text-muted">{title}</p>
        {onRefresh && (
          <MarketRefreshButton onClick={onRefresh} loading={refreshing} />
        )}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {items.map((q) => (
            <div key={q.symbol} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-text-muted">{q.label}</span>
              <span className="text-amount text-text-primary tabular-nums">
                {formatMarketValue(Number(q.value), q.currency)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-muted">قیمت در دسترس نیست</p>
      )}

      {hasMissing && missingHint && (
        <p className="text-[10px] text-status-error/90 leading-relaxed">{missingHint}</p>
      )}
    </div>
  )
}
