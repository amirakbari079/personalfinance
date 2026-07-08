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
      className="luxury-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="luxury-modal">
        <h2 className="text-modal-title text-text-primary mb-6 tracking-tight">
          {initial ? 'ویرایش هزینه معوق' : 'هزینه معوق جدید'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Label */}
          <div>
            <label className="field-label">عنوان هزینه</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              required
              autoFocus
              placeholder="مثلاً: بیمه خودرو، تعمیرات، خرید لوازم"
              className="field-input"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="field-label">مبلغ برنامه‌ریزی‌شده (تومان)</label>
            <input
              type="text"
              inputMode="numeric"
              value={plannedAmount}
              onChange={e => setPlannedAmount(formatWithCommas(e.target.value))}
              required
              placeholder="0"
              className="field-input tabular-nums"
            />
          </div>

          {/* Due date */}
          <div>
            <label className="field-label">
              تاریخ سررسید <span className="text-text-muted font-normal">(اختیاری)</span>
            </label>
            <JalaliDatePicker value={dueDate} onChange={setDueDate} />
          </div>

          {/* Notes */}
          <div>
            <label className="field-label">
              یادداشت <span className="text-text-muted font-normal">(اختیاری)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="توضیحات تکمیلی..."
              className="field-input resize-none"
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
              className="flex-1 btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'در حال ذخیره...' : (initial ? 'ذخیره تغییرات' : 'افزودن هزینه')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-ghost"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
