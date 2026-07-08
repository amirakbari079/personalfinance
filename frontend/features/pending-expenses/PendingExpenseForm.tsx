'use client'

import { type FormEvent, useState } from 'react'
import type { PendingExpense, PendingExpenseRequest } from '@/lib/api/pendingExpensesApi'
import { formatWithCommas, stripCommas } from '@/utils/numberFormat'
import JalaliDatePicker from '@/shared/JalaliDatePicker'

interface Props {
  initial: PendingExpense | null
  onSave: (data: PendingExpenseRequest) => Promise<void>
  onCancel: () => void
}

export default function PendingExpenseForm({ initial, onSave, onCancel }: Props) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [plannedAmount, setPlannedAmount] = useState(formatWithCommas(initial?.plannedAmount?.toString() ?? '0'))
  const [dueDate, setDueDate] = useState<string | null>(initial?.dueDate ?? null)
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const amountNum = parseInt(stripCommas(plannedAmount), 10)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('مبلغ باید عدد صحیح بزرگتر از صفر باشد')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await onSave({
        label,
        plannedAmount: amountNum,
        dueDate: dueDate && dueDate !== '' ? dueDate : null,
        notes,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ذخیره')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-brand-dark/50 flex items-center justify-center z-50 px-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-surface-card rounded-2xl shadow-xl w-full max-w-md p-7">
        <h2 className="text-base font-semibold text-text-primary mb-6">
          {initial ? 'ویرایش هزینه معوق' : 'هزینه معوق جدید'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Label */}
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">عنوان هزینه</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              required
              autoFocus
              placeholder="مثلاً: بیمه خودرو، تعمیرات، خرید لوازم"
              className="w-full bg-surface border border-surface-muted rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/25 focus:border-brand-accent transition-all"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">مبلغ برنامه‌ریزی‌شده (تومان)</label>
            <input
              type="text"
              inputMode="numeric"
              value={plannedAmount}
              onChange={e => setPlannedAmount(formatWithCommas(e.target.value))}
              required
              placeholder="0"
              className="w-full bg-surface border border-surface-muted rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/25 focus:border-brand-accent transition-all tabular-nums"
            />
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">
              تاریخ سررسید <span className="text-text-muted font-normal">(اختیاری)</span>
            </label>
            <JalaliDatePicker value={dueDate} onChange={setDueDate} />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">
              یادداشت <span className="text-text-muted font-normal">(اختیاری)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="توضیحات تکمیلی..."
              className="w-full bg-surface border border-surface-muted rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/25 focus:border-brand-accent transition-all resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || !label.trim()}
              className="flex-1 bg-brand-accent hover:bg-brand-accent-hover text-text-on-accent text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'در حال ذخیره...' : (initial ? 'ذخیره تغییرات' : 'افزودن هزینه')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-5 text-sm text-text-muted hover:text-text-primary border border-surface-muted rounded-lg transition-colors"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
