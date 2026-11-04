'use client'

import { useEffect, useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import StatusTag from '@/shared/StatusTag'
import { formatMarketValue } from '@/lib/api/marketApi'

interface Props {
  symbol: string
  name: string
  originalName?: string
  subtitle?: string
  value: number | null
  currency?: string
  changePercent?: number | null
  errorMessage?: string | null
  showOnInvestments?: boolean
  onToggleShow?: (value: boolean) => void
  displayNameEditable?: boolean
  onDisplayNameChange?: (value: string) => void
  onRemove?: () => void
}

export default function MarketWatchRow({
  symbol,
  name,
  originalName,
  subtitle,
  value,
  currency = 'TOMAN',
  changePercent,
  errorMessage,
  showOnInvestments = false,
  onToggleShow,
  displayNameEditable = false,
  onDisplayNameChange,
  onRemove,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(name)

  useEffect(() => {
    if (!editing) setDraftName(name)
  }, [name, editing])

  const hasPrice = value != null && value > 0
  const changePositive = changePercent != null && changePercent >= 0

  function commitName() {
    onDisplayNameChange?.(draftName.trim())
    setEditing(false)
  }

  function cancelEdit() {
    setDraftName(name)
    setEditing(false)
  }

  return (
    <div className="chand-row group">
      <div className="chand-row-main">
        <div className="chand-row-symbol">{symbol || name.slice(0, 8)}</div>
        <div className="chand-row-meta min-w-0">
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="field-input text-xs py-1 px-2 min-w-0 flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitName()
                  if (e.key === 'Escape') cancelEdit()
                }}
              />
              <button type="button" onClick={commitName} className="p-1 text-status-success" aria-label="ذخیره">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={cancelEdit} className="p-1 text-text-muted" aria-label="انصراف">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 min-w-0">
              <p className="chand-row-name">{name}</p>
              {displayNameEditable && onDisplayNameChange && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="p-0.5 text-text-muted hover:text-brand-accent opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  aria-label="ویرایش نام نمایشی"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
          {originalName && originalName !== name && (
            <p className="chand-row-sub truncate">اصلی: {originalName}</p>
          )}
          {(subtitle || errorMessage) && (
            <p className={`chand-row-sub ${errorMessage ? 'text-status-error/80' : ''}`}>
              {errorMessage ?? subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="chand-row-actions">
        {onToggleShow && (
          <label className="chand-toggle" title="نمایش در صفحه سرمایه‌گذاری‌ها">
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

        <div className="chand-row-price-block">
          {changePercent != null && (
            <StatusTag
              variant={changePositive ? 'success' : 'error'}
              className="text-[10px] px-1.5 py-0 min-w-[3rem] justify-center tabular-nums"
            >
              {changePositive ? '+' : ''}
              {changePercent.toLocaleString('fa-IR', { maximumFractionDigits: 2 })}٪
            </StatusTag>
          )}
          <p className="chand-row-price tabular-nums">
            {hasPrice ? formatMarketValue(value!, currency) : '—'}
          </p>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="chand-row-remove opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="حذف از لیست"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
