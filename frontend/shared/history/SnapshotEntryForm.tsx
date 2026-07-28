'use client'

import type { SnapshotEntry, SnapshotRequest } from '@/lib/api/historyApi'
import JalaliDatePicker from '@/shared/JalaliDatePicker'
import { getTodayJalali } from '@/utils/jalaliToday'
import { formatWithCommas, stripCommas } from '@/utils/numberFormat'
import { type FormEvent, useEffect, useState } from 'react'

interface Props {
  initial: SnapshotEntry | null
  valueFieldLabel?: string
  onSave: (data: SnapshotRequest) => Promise<void>
  onCancel: () => void
}

export default function SnapshotEntryForm({
  initial,
  valueFieldLabel = 'مقدار (تومان)',
  onSave,
  onCancel,
}: Props) {
  const [value, setValue] = useState(formatWithCommas(initial?.value?.toString() ?? '0'))
  const [recordedDate, setRecordedDate] = useState(initial?.recordedDateJalali ?? getTodayJalali())
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setValue(formatWithCommas(initial?.value?.toString() ?? '0'))
    setRecordedDate(initial?.recordedDateJalali ?? getTodayJalali())
    setNotes(initial?.notes ?? '')
    setError(null)
    setSaving(false)
  }, [initial])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const valueNum = parseInt(stripCommas(value), 10)
    if (isNaN(valueNum) || valueNum < 0) {
      setError('مقدار باید عدد صحیح غیرمنفی باشد')
      return
    }
    if (!recordedDate) {
      setError('تاریخ ثبت الزامی است')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await onSave({
        value: valueNum,
        recordedDateJalali: recordedDate,
        notes: notes || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره')
      setSaving(false)
    }
  }

  return (
    <div className="glass-card p-4 border-brand-accent/25 mb-4">
      <h3 className="text-sm text-text-primary mb-3" style={{ fontWeight: 'var(--font-weight-title)' }}>
        {initial ? 'ویرایش رکورد' : 'ثبت رکورد جدید'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="field-label">تاریخ</label>
          <JalaliDatePicker value={recordedDate} onChange={setRecordedDate} placeholder="تاریخ" />
          <p className="text-[10px] text-text-muted mt-1">
            می‌توانید تاریخ گذشته (مثلاً اول ماه) ثبت کنید.
          </p>
        </div>
        <div>
          <label className="field-label">{valueFieldLabel}</label>
          <input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={e => setValue(formatWithCommas(e.target.value))}
            required
            className="field-input tabular-nums"
          />
        </div>
        <div>
          <label className="field-label">
            یادداشت <span className="text-text-muted font-normal">(اختیاری)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="field-input"
            placeholder="توضیح..."
          />
        </div>
        {error && (
          <p className="text-xs text-status-error">{error}</p>
        )}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 btn-primary py-2 text-sm disabled:opacity-50"
          >
            {saving ? 'در حال ذخیره...' : (initial ? 'ذخیره' : 'افزودن')}
          </button>
          <button type="button" onClick={onCancel} className="btn-ghost text-sm">
            انصراف
          </button>
        </div>
      </form>
    </div>
  )
}
