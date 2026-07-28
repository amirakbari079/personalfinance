'use client'

import { type FormEvent, useState } from 'react'
import type { Income, IncomeRequest, IncomeType } from '@/lib/api/incomesApi'
import { INCOME_TYPE_LABELS } from '@/lib/api/incomesApi'
import { formatWithCommas, stripCommas } from '@/utils/numberFormat'
import JalaliDatePicker from '@/shared/JalaliDatePicker'
import FormModalShell from '@/shared/FormModalShell'

interface Props {
  initial: Income | null
  onSave: (data: IncomeRequest) => Promise<void>
  onCancel: () => void
}

const INCOME_TYPES: IncomeType[] = ['RECURRING', 'ONE_OFF']

export default function IncomeForm({ initial, onSave, onCancel }: Props) {
  const [source, setSource] = useState(initial?.source ?? '')
  const [amount, setAmount] = useState(formatWithCommas(initial?.amount?.toString() ?? '0'))
  const [incomeType, setIncomeType] = useState<IncomeType>(initial?.incomeType ?? 'RECURRING')
  const [receivedDate, setReceivedDate] = useState<string | null>(initial?.receivedDate ?? null)
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const amountNum = parseInt(stripCommas(amount), 10)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('مبلغ باید عدد صحیح بزرگتر از صفر باشد')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await onSave({
        source,
        amount: amountNum,
        incomeType,
        receivedDate: receivedDate && receivedDate !== '' ? receivedDate : null,
        notes,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ذخیره')
      setSaving(false)
    }
  }

  return (
    <FormModalShell
      title={initial ? 'ویرایش درآمد' : 'درآمد جدید'}
      onClose={onCancel}
      onSubmit={handleSubmit}
      error={error}
      saving={saving}
      submitLabel={initial ? 'ذخیره تغییرات' : 'افزودن درآمد'}
      submitDisabled={!source.trim()}
    >
      <div>
        <label className="field-label">عنوان درآمد</label>
        <input
          type="text"
          value={source}
          onChange={e => setSource(e.target.value)}
          required
          autoFocus
          placeholder="مثلاً: حقوق، فروش، پورسانت"
          className="field-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">مبلغ (تومان)</label>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={e => setAmount(formatWithCommas(e.target.value))}
            required
            placeholder="0"
            className="field-input tabular-nums"
          />
        </div>
        <div>
          <label className="field-label">نوع</label>
          <select
            value={incomeType}
            onChange={e => setIncomeType(e.target.value as IncomeType)}
            className="field-input"
          >
            {INCOME_TYPES.map(t => (
              <option key={t} value={t}>{INCOME_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label">
          تاریخ دریافت <span className="text-text-muted font-normal">(اختیاری)</span>
        </label>
        <JalaliDatePicker value={receivedDate} onChange={setReceivedDate} />
      </div>

      <div>
        <label className="field-label">
          یادداشت <span className="text-text-muted font-normal">(اختیاری)</span>
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="مثال: حقوق ماهانه شرکت"
          className="field-input resize-none"
        />
      </div>
    </FormModalShell>
  )
}
