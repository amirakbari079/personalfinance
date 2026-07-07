import { type FormEvent, useState } from 'react'
import type { Loan, LoanRequest } from '../../api/loansApi'
import { formatWithCommas, stripCommas } from '../../utils/numberFormat'
import JalaliDatePicker from '../../components/JalaliDatePicker'

interface Props {
  initial: Loan | null
  onSave: (data: LoanRequest) => Promise<void>
  onCancel: () => void
}

export default function LoanForm({ initial, onSave, onCancel }: Props) {
  const [creditor, setCreditor] = useState(initial?.creditor ?? '')
  const [monthlyAmount, setMonthlyAmount] = useState(formatWithCommas(initial?.monthlyAmount?.toString() ?? '0'))
  const [totalInstallments, setTotalInstallments] = useState(initial?.totalInstallments?.toString() ?? '')
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
    setError(null)
    setSaving(true)
    try {
      await onSave({
        creditor,
        monthlyAmount: amountNum,
        totalInstallments: installmentsNum,
        startDate,
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
      <div className="bg-surface-card rounded-2xl shadow-xl w-full max-w-md p-7 max-h-[90vh] overflow-y-auto">
        <h2 className="text-base font-semibold text-text-primary mb-6">
          {initial ? 'ویرایش وام' : 'وام جدید'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Creditor */}
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">نام طلبکار / بانک</label>
            <input
              type="text"
              value={creditor}
              onChange={e => setCreditor(e.target.value)}
              required
              autoFocus
              placeholder="مثلاً: بانک ملت، شخص"
              className="w-full bg-surface border border-surface-muted rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/25 focus:border-brand-accent transition-all"
            />
          </div>

          {/* Monthly amount + total installments */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">مبلغ قسط (تومان)</label>
              <input
                type="text"
                inputMode="numeric"
                value={monthlyAmount}
                onChange={e => setMonthlyAmount(formatWithCommas(e.target.value))}
                required
                placeholder="0"
                className="w-full bg-surface border border-surface-muted rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/25 focus:border-brand-accent transition-all tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">تعداد اقساط</label>
              <input
                type="text"
                inputMode="numeric"
                value={totalInstallments}
                onChange={e => setTotalInstallments(e.target.value.replace(/[^0-9]/g, ''))}
                required
                placeholder="مثلاً ۳۶"
                className="w-full bg-surface border border-surface-muted rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/25 focus:border-brand-accent transition-all tabular-nums"
              />
            </div>
          </div>

          {/* Start date */}
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">تاریخ شروع قسط اول</label>
            <JalaliDatePicker value={startDate} onChange={setStartDate} />
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
              disabled={saving || !creditor.trim()}
              className="flex-1 bg-brand-accent hover:bg-brand-accent-hover text-text-on-accent text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'در حال ذخیره...' : (initial ? 'ذخیره تغییرات' : 'افزودن وام')}
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
