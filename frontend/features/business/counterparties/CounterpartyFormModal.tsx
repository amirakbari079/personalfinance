'use client'

import { useState } from 'react'
import FormModal from '@/shared/FormModal'
import {
  createBizCounterparty,
  updateBizCounterparty,
  type BizCounterparty,
  type BizCounterpartyRequest,
} from '@/lib/api/businessApi'
import { AlertCircle } from 'lucide-react'

interface Props {
  counterparty?: BizCounterparty | null
  onClose: () => void
  onSuccess: () => void
}

export default function CounterpartyFormModal({ counterparty, onClose, onSuccess }: Props) {
  const [code, setCode] = useState(counterparty?.code || '')
  const [name, setName] = useState(counterparty?.name || '')
  const [role, setRole] = useState<'CUSTOMER' | 'SUPPLIER' | 'BOTH'>(counterparty?.role || 'CUSTOMER')
  const [phone, setPhone] = useState(counterparty?.phone || '')
  const [isActive, setIsActive] = useState(counterparty ? counterparty.isActive : true)
  const [notes, setNotes] = useState(counterparty?.notes || '')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim() || !name.trim()) {
      setError('کد و نام طرف‌حساب الزامی هستند.')
      return
    }

    setLoading(true)
    setError(null)

    const payload: BizCounterpartyRequest = {
      code: code.trim(),
      name: name.trim(),
      role,
      phone: phone.trim() || undefined,
      isActive,
      notes: notes.trim() || undefined,
    }

    try {
      if (counterparty) {
        await updateBizCounterparty(counterparty.id, payload)
      } else {
        await createBizCounterparty(payload)
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت طرف‌حساب')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormModal
      title={counterparty ? 'ویرایش طرف‌حساب' : 'تعریف طرف‌حساب جدید'}
      subtitle="ثبت مشخصات مشتریان، تأمین‌کنندگان و بدهکاران/بستانکاران تجاری"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-[var(--color-status-error-bg)] text-[var(--color-status-error)] border border-[var(--color-status-error-border)] flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">
              کد یکتا <span className="text-[var(--color-status-error)]">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="مثال: CUST-001"
              className="form-input w-full"
              required
              autoFocus={!counterparty}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">
              نام و نام‌خانوادگی / شرکت <span className="text-[var(--color-status-error)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: بازرگانی امین"
              className="form-input w-full"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">
              نقش طرف‌حساب <span className="text-[var(--color-status-error)]">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'CUSTOMER' | 'SUPPLIER' | 'BOTH')}
              className="form-input w-full"
            >
              <option value="CUSTOMER">مشتری (خریدار)</option>
              <option value="SUPPLIER">تأمین‌کننده (فروشنده کالا به ما)</option>
              <option value="BOTH">هردو (مشتری و تأمین‌کننده)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">شماره تماس (اختیاری)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
              className="form-input w-full"
            />
          </div>
        </div>

        <div className="flex items-center pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--color-brand-accent)] border-[var(--finance-border)]"
            />
            <span className="font-semibold text-[var(--color-text-primary)]">طرف‌حساب فعال</span>
          </label>
        </div>

        <div>
          <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">یادداشت و اطلاعات تکمیلی</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="نشانی، شرایط تسویه، یا یادداشت‌های دیگر..."
            className="form-input w-full"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--finance-border)]">
          <button type="button" onClick={onClose} className="btn-secondary">
            انصراف
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'در حال ثبت...' : counterparty ? 'بروزرسانی طرف‌حساب' : 'ثبت طرف‌حساب'}
          </button>
        </div>
      </form>
    </FormModal>
  )
}
