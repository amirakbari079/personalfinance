'use client'

import { type FormEvent, useState } from 'react'
import type { Loan, LoanRequest } from '@/lib/api/loansApi'
import { formatWithCommas, stripCommas } from '@/utils/numberFormat'
import JalaliDatePicker from '@/shared/JalaliDatePicker'

interface Props {
  initial: Loan | null
  onSave: (data: LoanRequest) => Promise<void>
  onCancel: () => void
}

export default function LoanForm({ initial, onSave, onCancel }: Props) {
  const [creditor, setCreditor] = useState(initial?.creditor ?? '')
  const [monthlyAmount, setMonthlyAmount] = useState(formatWithCommas(initial?.monthlyAmount?.toString() ?? '0'))
  const [totalInstallments, setTotalInstallments] = useState(initial?.totalInstallments?.toString() ?? '')
  const [paidInstallments, setPaidInstallments] = useState(initial?.paidInstallments?.toString() ?? '0')
  const [startDate, setStartDate] = useState<string | null>(initial?.startDate ?? null)
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const amountNum = parseInt(stripCommas(monthlyAmount), 10)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('مبلغ قسط باید عدد صحیح بزرگتر از صفر باشد')
      return
    }
    const installmentsNum = parseInt(totalInstallments, 10)
    if (isNaN(installmentsNum) || installmentsNum < 1) {
      setError('تعداد اقساط باید حداقل ۱ باشد')
      return
    }
    if (!startDate) {
      setError('تاریخ شروع الزامی است')
      return
    }

    let paidNum: number | undefined
    if (initial) {
      paidNum = parseInt(paidInstallments, 10)
      if (isNaN(paidNum) || paidNum < 0) {
        setError('اقساط پرداخت‌شده باید صفر یا بیشتر باشد')
        return
      }
      if (paidNum > installmentsNum) {
        setError('اقساط پرداخت‌شده نمی‌تواند بیشتر از تعداد کل اقساط باشد')
        return
      }
    }

    setError(null)
    setSaving(true)
    try {
      await onSave({
        creditor,
        monthlyAmount: amountNum,
        totalInstallments: installmentsNum,
        startDate,
        notes,
        ...(initial ? { paidInstallments: paidNum } : {}),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره')
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
          {initial ? 'ویرایش وام' : 'وام جدید'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="field-label">نام طلبکار / بانک</label>
            <input
              type="text"
              value={creditor}
              onChange={e => setCreditor(e.target.value)}
              required
              autoFocus
              placeholder="مثلاً: بانک ملت، شخص"
              className="field-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">مبلغ قسط (تومان)</label>
              <input
                type="text"
                inputMode="numeric"
                value={monthlyAmount}
                onChange={e => setMonthlyAmount(formatWithCommas(e.target.value))}
                required
                placeholder="0"
                className="field-input tabular-nums"
              />
            </div>
            <div>
              <label className="field-label">تعداد اقساط</label>
              <input
                type="text"
                inputMode="numeric"
                value={totalInstallments}
                onChange={e => setTotalInstallments(e.target.value.replace(/[^0-9]/g, ''))}
                required
                placeholder="مثلاً ۳۶"
                className="field-input tabular-nums"
              />
            </div>
          </div>

          {initial && (
            <div>
              <label className="field-label">اقساط پرداخت‌شده</label>
              <input
                type="text"
                inputMode="numeric"
                value={paidInstallments}
                onChange={e => setPaidInstallments(e.target.value.replace(/[^0-9]/g, ''))}
                className="field-input tabular-nums"
              />
              <p className="text-[11px] text-text-muted mt-1">
                برای اصلاح اشتباه در ثبت قسط، این عدد را کم یا زیاد کنید (۰ تا تعداد کل).
              </p>
            </div>
          )}

          <div>
            <label className="field-label">تاریخ شروع قسط اول</label>
            <JalaliDatePicker value={startDate} onChange={setStartDate} />
          </div>

          <div>
            <label className="field-label">
              یادداشت / توضیح برای تحلیل <span className="text-text-muted font-normal">(اختیاری)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="مثال: وام مسکن بانک ملت / وام خودرو با ضمانت چک"
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
              disabled={saving || !creditor.trim()}
              className="flex-1 btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'در حال ذخیره...' : (initial ? 'ذخیره تغییرات' : 'افزودن وام')}
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
