'use client'

import { type FormEvent, useState } from 'react'
import type { Receivable, ReceivableRequest } from '@/lib/api/receivablesApi'
import { formatWithCommas, stripCommas } from '@/utils/numberFormat'
import JalaliDatePicker from '@/shared/JalaliDatePicker'

interface Props {
  initial: Receivable | null
  onSave: (data: ReceivableRequest) => Promise<void>
  onCancel: () => void
}

export default function ReceivableForm({ initial, onSave, onCancel }: Props) {
  const [debtorName, setDebtorName] = useState(initial?.debtorName ?? '')
  const [originalAmount, setOriginalAmount] = useState(
    formatWithCommas(initial?.originalAmount?.toString() ?? '0'),
  )
  const [receivedAmount, setReceivedAmount] = useState(
    formatWithCommas(initial?.receivedAmount?.toString() ?? '0'),
  )
  const [createdDate, setCreatedDate] = useState<string | null>(initial?.createdDate ?? null)
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const originalNum = parseInt(stripCommas(originalAmount), 10)
    const receivedNum = parseInt(stripCommas(receivedAmount), 10)
    if (isNaN(originalNum) || originalNum <= 0) {
      setError('مبلغ اصلی باید عدد صحیح بزرگتر از صفر باشد')
      return
    }
    if (isNaN(receivedNum) || receivedNum < 0) {
      setError('مبلغ دریافتی نمی‌تواند منفی باشد')
      return
    }
    if (receivedNum > originalNum) {
      setError('مبلغ دریافتی نمی‌تواند بیشتر از مبلغ اصلی باشد')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await onSave({
        debtorName,
        originalAmount: originalNum,
        receivedAmount: receivedNum,
        createdDate: createdDate && createdDate !== '' ? createdDate : null,
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
          {initial ? 'ویرایش طلب' : 'طلب جدید'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="field-label">نام بدهکار</label>
            <input
              type="text"
              value={debtorName}
              onChange={e => setDebtorName(e.target.value)}
              required
              autoFocus
              placeholder="مثلاً: علی رضایی، شرکت الف"
              className="field-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">مبلغ اصلی (تومان)</label>
              <input
                type="text"
                inputMode="numeric"
                value={originalAmount}
                onChange={e => setOriginalAmount(formatWithCommas(e.target.value))}
                required
                placeholder="0"
                className="field-input tabular-nums"
              />
            </div>
            <div>
              <label className="field-label">مبلغ دریافتی (تومان)</label>
              <input
                type="text"
                inputMode="numeric"
                value={receivedAmount}
                onChange={e => setReceivedAmount(formatWithCommas(e.target.value))}
                required
                placeholder="0"
                className="field-input tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="field-label">
              تاریخ ایجاد بدهی <span className="text-text-muted font-normal">(اختیاری)</span>
            </label>
            <JalaliDatePicker value={createdDate} onChange={setCreatedDate} />
          </div>

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

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || !debtorName.trim()}
              className="flex-1 btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'در حال ذخیره...' : (initial ? 'ذخیره تغییرات' : 'افزودن طلب')}
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
