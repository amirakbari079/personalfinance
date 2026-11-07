'use client'

import { type FormEvent, useEffect, useRef, useState } from 'react'
import type { Account, AccountRequest, AccountType } from '@/lib/api/accountsApi'
import { ACCOUNT_TYPE_LABELS } from '@/lib/api/accountsApi'
import { formatWithCommas, stripCommas } from '@/utils/numberFormat'
import BankPicker from '@/shared/banks/BankPicker'
import { detectBankFromName } from '@/shared/banks/detectBank'
import { getTodayJalali } from '@/utils/jalaliToday'
import FormModalShell from '@/shared/FormModalShell'
import Link from 'next/link'

interface Props {
  initial: Account | null
  onSave: (data: AccountRequest) => Promise<void>
  onCancel: () => void
}

const ACCOUNT_TYPES: AccountType[] = ['BANK', 'DIGITAL_WALLET', 'EXCHANGE', 'CASH', 'OTHER']
const LOGO_TYPES: AccountType[] = ['BANK', 'DIGITAL_WALLET']

export default function AccountForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState<AccountType>(initial?.type ?? 'BANK')
  const [balance, setBalance] = useState(formatWithCommas(initial?.balance?.toString() ?? '0'))
  const [balanceRecordedDate] = useState(getTodayJalali())
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [bankCode, setBankCode] = useState<string | null>(initial?.bankCode ?? null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const bankManual = useRef(!!initial?.bankCode)

  useEffect(() => {
    if (!LOGO_TYPES.includes(type) || bankManual.current) return
    const detected = detectBankFromName(name)
    setBankCode(detected)
  }, [name, type])

  function handleNameChange(value: string) {
    setName(value)
  }

  function handleBankChange(code: string | null) {
    if (code === null) {
      bankManual.current = false
      setBankCode(detectBankFromName(name))
      return
    }
    bankManual.current = true
    setBankCode(code)
  }

  function handleTypeChange(next: AccountType) {
    setType(next)
    if (!LOGO_TYPES.includes(next)) {
      setBankCode(null)
      bankManual.current = false
    }
  }

  function handleBalanceChange(value: string) {
    setBalance(formatWithCommas(value))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const balanceNum = parseInt(stripCommas(balance), 10)
    if (isNaN(balanceNum) || balanceNum < 0) {
      setError('موجودی باید عدد صحیح غیرمنفی باشد')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await onSave({
        name,
        type,
        balance: balanceNum,
        notes,
        bankCode: LOGO_TYPES.includes(type) ? bankCode : null,
        balanceRecordedDate,
        version: initial?.version,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ذخیره')
      setSaving(false)
    }
  }

  return (
    <FormModalShell
      title={initial ? 'ویرایش حساب' : 'حساب جدید'}
      wide={LOGO_TYPES.includes(type)}
      onClose={onCancel}
      onSubmit={handleSubmit}
      error={error}
      saving={saving}
      submitLabel={initial ? 'ذخیره تغییرات' : 'افزودن حساب'}
      submitDisabled={!name.trim()}
    >
      <div>
        <label className="field-label">نام حساب</label>
        <input
          type="text"
          value={name}
          onChange={e => handleNameChange(e.target.value)}
          required
          autoFocus
          placeholder="مثلاً: بلو، رسالت، نقد کیف"
          className="field-input"
        />
        {LOGO_TYPES.includes(type) && (
          <p className="text-[10px] text-text-muted mt-1">
            با تایپ نام، لوگوی بانک به‌صورت خودکار پیشنهاد می‌شود — یا از لیست پایین انتخاب کنید.
          </p>
        )}
      </div>

      <div>
        <label className="field-label">نوع حساب</label>
        <select
          value={type}
          onChange={e => handleTypeChange(e.target.value as AccountType)}
          className="field-input"
        >
          {ACCOUNT_TYPES.map(t => (
            <option key={t} value={t}>{ACCOUNT_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {LOGO_TYPES.includes(type) && (
        <BankPicker
          accountType={type}
          value={bankCode}
          onChange={handleBankChange}
        />
      )}

      <div>
        <label className="field-label">موجودی (تومان)</label>
        <input
          type="text"
          inputMode="numeric"
          value={balance}
          disabled={!!initial}
          onChange={e => handleBalanceChange(e.target.value)}
          required
          placeholder="0"
          className="field-input tabular-nums"
        />
      </div>

      {initial ? <p className="text-sm text-text-muted leading-7">برای تغییر موجودی، <Link href="/transactions" className="text-brand-accent underline">گردش پول</Link> را باز کنید و تراکنش یا اصلاح موجودی با دلیل ثبت کنید.</p> : <div>
        <label className="field-label">تاریخ ثبت موجودی</label>
        <p className="text-sm text-text-muted mt-1">امروز، {balanceRecordedDate}؛ این مبلغ ماندهٔ افتتاحیهٔ حساب است.</p>
      </div>}

      <div>
        <label className="field-label">
          یادداشت / توضیح برای تحلیل <span className="text-text-muted font-normal">(اختیاری)</span>
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="مثال: این حساب برای دریافت وام گذاشته شده / موجودی موقت تا زمان واریز حقوق"
          className="field-input resize-none"
        />
      </div>
    </FormModalShell>
  )
}
