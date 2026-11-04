'use client'

import { useEffect, useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import StatusTag from '@/shared/StatusTag'
import {
  formatMarketValue,
  watchlistLabel,
  type BourseInstrumentQuote,
  type WatchlistItem,
} from '@/lib/api/marketApi'

interface Props {
  item: WatchlistItem
  quote?: BourseInstrumentQuote
  showOnInvestments?: boolean
  onToggleShow?: (value: boolean) => void
  onDisplayNameChange?: (value: string) => void
  onRemove?: () => void
}

export default function WatchlistStockCard({
  item,
  quote,
  showOnInvestments = false,
  onToggleShow,
  onDisplayNameChange,
  onRemove,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(watchlistLabel(item))

  useEffect(() => {
    if (!editing) setDraftName(watchlistLabel(item))
  }, [item, editing])

  const hasPrice = quote?.value != null && quote.value > 0
  const changePositive = quote?.changePercent != null && quote.changePercent >= 0
  const label = watchlistLabel(item)

  function commitName() {
    onDisplayNameChange?.(draftName.trim())
    setEditing(false)
  }

  return (
    <div className="watchlist-stock-card group">
      <div className="watchlist-stock-card-top">
        <span className="watchlist-stock-card-symbol">{item.symbol}</span>
        {(onRemove || onDisplayNameChange) && (
          <div className="watchlist-stock-card-actions">
            {onDisplayNameChange && !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="p-0.5 text-text-muted hover:text-brand-accent opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="ویرایش نام"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="p-0.5 text-text-muted hover:text-status-error opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="حذف"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="flex items-center gap-1 mt-1">
          <input
            type="text"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            className="field-input text-xs py-1 px-2 min-w-0 flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitName()
              if (e.key === 'Escape') setEditing(false)
            }}
          />
          <button type="button" onClick={commitName} className="p-1 text-status-success">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => setEditing(false)} className="p-1 text-text-muted">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <p className="watchlist-stock-card-name">{label}</p>
      )}

      <div className="watchlist-stock-card-price-row">
        {quote?.changePercent != null && (
          <StatusTag
            variant={changePositive ? 'success' : 'error'}
            className="text-[10px] px-1 py-0 tabular-nums"
          >
            {changePositive ? '+' : ''}
            {quote.changePercent.toLocaleString('fa-IR', { maximumFractionDigits: 2 })}٪
          </StatusTag>
        )}
        <p className="watchlist-stock-card-price tabular-nums">
          {hasPrice ? formatMarketValue(quote!.value!, quote!.currency) : '—'}
        </p>
      </div>

      {quote?.errorMessage && (
        <p className="text-[10px] text-status-error/90 mt-1 leading-relaxed">{quote.errorMessage}</p>
      )}

      {onToggleShow && (
        <label className="chand-toggle mt-2" title="نمایش در سرمایه‌گذاری‌ها">
          <input
            type="checkbox"
            checked={showOnInvestments}
            onChange={(e) => onToggleShow(e.target.checked)}
            className="sr-only"
          />
          <span className="chand-toggle-track" aria-hidden />
          <span className="chand-toggle-label">سرمایه‌گذاری</span>
        </label>
      )}
    </div>
  )
}
