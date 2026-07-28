'use client'

import { type FormEvent, useState } from 'react'
import type { PendingExpense, PendingExpenseRequest } from '@/lib/api/pendingExpensesApi'
import { formatWithCommas, stripCommas } from '@/utils/numberFormat'
import JalaliDatePicker from '@/shared/JalaliDatePicker'
import FormModalShell from '@/shared/FormModalShell'

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
    <FormModalShell
      title={initial ? 'ویرایش هزینه برنامه‌ریزی‌شده' : 'هزینه برنامه‌ریزی‌شده جدید'}
      onClose={onCancel}
      onSubmit={handleSubmit}
      error={error}
      saving={saving}
      submitLabel={initial ? 'ذخیره تغییرات' : 'افزودن هزینه'}
      submitDisabled={!label.trim()}
    >
      <div>
        <label className="field-label">عنوان هزینه</label>
        <input
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          required
          autoFocus
          placeholder="مثلاً: بیمه خودرو، تعمیرات"
          className="field-input"
        />
      </div>

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

      <div>
        <label className="field-label">
          تاریخ سررسید <span className="text-text-muted font-normal">(اختیاری)</span>
        </label>
        <JalaliDatePicker value={dueDate} onChange={setDueDate} />
      </div>

      <div>
        <label className="field-label">
          یادداشت <span className="text-text-muted font-normal">(اختیاری)</span>
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="مثال: بیمه شخص ثالث سالانه"
          className="field-input resize-none"
        />
      </div>
    </FormModalShell>
  )
}
