'use client'

import { useState } from 'react'
import FormModal from '@/shared/FormModal'
import JalaliDatePicker from '@/shared/JalaliDatePicker'
import { getTodayJalali } from '@/utils/jalaliToday'
import { formatWithCommas, stripCommas } from '@/utils/numberFormat'
import DateObject from 'react-date-object'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import gregorian from 'react-date-object/calendars/gregorian'
import gregorian_en from 'react-date-object/locales/gregorian_en'
import {
  createBizAccount,
  updateBizAccount,
  type BizAccount,
  type BizAccountRequest,
} from '@/lib/api/businessApi'
import { AlertCircle } from 'lucide-react'

interface Props {
  account?: BizAccount | null
  onClose: () => void
  onSuccess: () => void
}

function isoToJalali(iso: string | null | undefined): string {
  if (!iso) return getTodayJalali()
  try {
    const obj = new DateObject({ date: iso, calendar: gregorian, locale: gregorian_en })
    return obj.convert(persian, persian_fa).format('YYYY/MM/DD')
  } catch {
    return getTodayJalali()
  }
}

function jalaliToIso(jalali: string): string {
  try {
    const obj = new DateObject({ date: jalali, calendar: persian, locale: persian_fa })
    return obj.convert(gregorian, gregorian_en).format('YYYY-MM-DD')
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

export default function BusinessAccountFormModal({ account, onClose, onSuccess }: Props) {
  const [name, setName] = useState(account?.name || '')
  const [type, setType] = useState<'CASH' | 'BANK' | 'WALLET' | 'PETTY_CASH'>(account?.type || 'BANK')
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber || '')
  const [openingBalance, setOpeningBalance] = useState(
    account?.openingBalance != null ? formatWithCommas(String(account.openingBalance)) : '0'
  )
  const [jalaliDate, setJalaliDate] = useState<string>(isoToJalali(account?.openingBalanceDate))
  const [isActive, setIsActive] = useState(account ? account.isActive : true)
  const [notes, setNotes] = useState(account?.notes || '')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('نام حساب کسب‌وکار الزامی است.')
      return
    }

    const cleanBalance = parseInt(stripCommas(openingBalance) || '0', 10)
    if (isNaN(cleanBalance)) {
      setError('مانده افتتاحیه باید یک عدد معتبر باشد.')
      return
    }

    setLoading(true)
    setError(null)

    const payload: BizAccountRequest = {
      name: name.trim(),
      type,
      accountNumber: accountNumber.trim() || undefined,
      openingBalance: cleanBalance,
      openingBalanceDate: jalaliToIso(jalaliDate),
      isActive,
      notes: notes.trim() || undefined,
    }

    try {
      if (account) {
        await updateBizAccount(account.id, payload)
      } else {
        await createBizAccount(payload)
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت حساب کسب‌وکار')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormModal
      title={account ? 'ویرایش حساب کسب‌وکار' : 'افتتاح حساب جدید فروشگاه'}
      subtitle="صندوق‌های نقدی، حساب‌های بانکی، کارتخوان و کیف‌پول‌های تجاری (جدا از حساب‌های شخصی)"
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
              نام حساب / صندوق <span className="text-[var(--color-status-error)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: حساب جاری سامان، صندوق نقد فروشگاه"
              className="form-input w-full"
              required
              autoFocus={!account}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">
              نوع حساب <span className="text-[var(--color-status-error)]">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'CASH' | 'BANK' | 'WALLET' | 'PETTY_CASH')}
              className="form-input w-full"
            >
              <option value="BANK">حساب بانکی / کارتخوان</option>
              <option value="CASH">صندوق نقد / دخل</option>
              <option value="WALLET">کیف‌پول دیجیتال / صرافی</option>
              <option value="PETTY_CASH">تنخواه گردان</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">
              شماره حساب / شبا / کارت (اختیاری)
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="مثال: IR120560000000000000000000"
              className="form-input w-full font-mono text-left"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">
              مانده افتتاحیه (تومان) <span className="text-[var(--color-status-error)]">*</span>
            </label>
            <input
              type="text"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(formatWithCommas(stripCommas(e.target.value)))}
              placeholder="۰"
              className="form-input w-full font-mono text-left"
              dir="ltr"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">
              تاریخ مانده افتتاحیه <span className="text-[var(--color-status-error)]">*</span>
            </label>
            <JalaliDatePicker value={jalaliDate} onChange={setJalaliDate} placeholder="انتخاب تاریخ افتتاحیه" />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--color-brand-accent)] border-[var(--finance-border)]"
              />
              <span className="font-semibold text-[var(--color-text-primary)]">حساب فعال تجاری</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">یادداشت و مشخصات شعبه</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="شعبه، نام صاحب امضا یا هر یادداشت کاربردی دیگر..."
            className="form-input w-full"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--finance-border)]">
          <button type="button" onClick={onClose} className="btn-secondary">
            انصراف
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'در حال ثبت...' : account ? 'بروزرسانی حساب' : 'افتتاح حساب'}
          </button>
        </div>
      </form>
    </FormModal>
  )
}
