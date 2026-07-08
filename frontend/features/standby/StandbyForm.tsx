'use client'

import { type FormEvent, useState } from 'react'
import type { Standby, StandbyRequest } from '@/lib/api/standbyApi'
import { formatWithCommas, stripCommas } from '@/utils/numberFormat'
import JalaliDatePicker from '@/shared/JalaliDatePicker'

interface Props {
  initial: Standby | null
  onSave: (data: StandbyRequest) => Promise<void>
  onCancel: () => void
}

export default function StandbyForm({ initial, onSave, onCancel }: Props) {
  const [itemLabel, setItemLabel] = useState(initial?.itemLabel ?? '')
  const [quantity, setQuantity] = useState(initial?.quantity?.toString() ?? '1')
  const [expectedUnitPrice, setExpectedUnitPrice] = useState(
    formatWithCommas(initial?.expectedUnitPrice?.toString() ?? '0'),
  )
  const [dateAdded, setDateAdded] = useState<string | null>(initial?.dateAdded ?? null)
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const qtyNum = parseInt(quantity, 10)
    const priceNum = parseInt(stripCommas(expectedUnitPrice), 10)
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('تعداد باید عدد صحیح بزرگتر از صفر باشد')
      return
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('قیمت واحد باید عدد صحیح بزرگتر از صفر باشد')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await onSave({
        itemLabel,
        quantity: qtyNum,
        expectedUnitPrice: priceNum,
        dateAdded: dateAdded && dateAdded !== '' ? dateAdded : null,
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
          {initial ? 'ویرایش کالای معوق' : 'کالای معوق جدید'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="field-label">عنوان کالا</label>
            <input
              type="text"
              value={itemLabel}
              onChange={e => setItemLabel(e.target.value)}
              required
              autoFocus
              placeholder="مثلاً: گوشی آیفون، طلای ۱۸ عیار"
              className="field-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">تعداد</label>
              <input
                type="text"
                inputMode="numeric"
                value={quantity}
                onChange={e => setQuantity(e.target.value.replace(/[^\d]/g, ''))}
                required
                placeholder="1"
                className="field-input tabular-nums"
              />
            </div>
            <div>
              <label className="field-label">قیمت واحد (تومان)</label>
              <input
                type="text"
                inputMode="numeric"
                value={expectedUnitPrice}
                onChange={e => setExpectedUnitPrice(formatWithCommas(e.target.value))}
                required
                placeholder="0"
                className="field-input tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="field-label">
              تاریخ ثبت <span className="text-text-muted font-normal">(اختیاری)</span>
            </label>
            <JalaliDatePicker value={dateAdded} onChange={setDateAdded} />
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
              disabled={saving || !itemLabel.trim()}
              className="flex-1 btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'در حال ذخیره...' : (initial ? 'ذخیره تغییرات' : 'افزودن کالا')}
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
