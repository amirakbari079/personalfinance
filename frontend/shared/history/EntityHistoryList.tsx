'use client'

import type { SnapshotEntry } from '@/lib/api/historyApi'
import type { EntityHistoryConfig } from './historyTypes'
import { TrendingDown, TrendingUp, Minus, Pencil, Trash2 } from 'lucide-react'

interface Props {
  entries: SnapshotEntry[]
  config: EntityHistoryConfig
  isLoading?: boolean
  onEdit?: (entry: SnapshotEntry) => void
  onDelete?: (entry: SnapshotEntry) => void
  deletingId?: number | null
}

function formatDelta(delta: number | null, formatValue: (n: number) => string): string {
  if (delta === null) return '—'
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : ''
  return sign + formatValue(Math.abs(delta)).replace(' تومان', '') + ' تومان'
}

export default function EntityHistoryList({
  entries,
  config,
  isLoading,
  onEdit,
  onDelete,
  deletingId,
}: Props) {
  const editable = !!(onEdit || onDelete)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-10">
        هنوز تاریخچه‌ای ثبت نشده.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const delta = entry.deltaFromPrevious
        const isPositive = delta !== null && delta > 0
        const isNegative = delta !== null && delta < 0
        const isNeutral = delta === null || delta === 0

        return (
          <div
            key={entry.id}
            className={`luxury-card px-4 py-3 flex items-center justify-between gap-3 ${
              entry.isLatest ? 'border-brand-accent/35 ring-1 ring-brand-accent/15' : ''
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-text-primary tabular-nums">{entry.recordedDateJalali}</p>
                {entry.isLatest && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-brand-accent/12 text-brand-accent border border-brand-accent/25">
                    {config.latestLabel}
                  </span>
                )}
              </div>
              {entry.notes && (
                <p className="text-[10px] text-text-muted mt-0.5 truncate">{entry.notes}</p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-left">
                <p className="text-sm text-amount text-text-primary">
                  {config.formatValue(entry.value)}
                </p>
                <div className={`flex items-center justify-end gap-1 mt-0.5 text-xs ${
                  isPositive ? 'text-status-success' :
                  isNegative ? 'text-status-error' :
                  'text-text-muted'
                }`}>
                  {isPositive && <TrendingUp className="w-3 h-3" />}
                  {isNegative && <TrendingDown className="w-3 h-3" />}
                  {isNeutral && delta === 0 && <Minus className="w-3 h-3" />}
                  <span className="tabular-nums">{formatDelta(delta, config.formatValue)}</span>
                </div>
              </div>

              {editable && (
                <div className="flex items-center gap-0.5 border-r border-surface-muted pr-2 mr-1">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(entry)}
                      title="ویرایش"
                      aria-label="ویرایش"
                      className="text-text-muted hover:text-brand-accent p-1.5 rounded transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(entry)}
                      disabled={deletingId === entry.id}
                      title="حذف"
                      aria-label="حذف"
                      className="text-text-muted hover:text-status-error p-1.5 rounded transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
