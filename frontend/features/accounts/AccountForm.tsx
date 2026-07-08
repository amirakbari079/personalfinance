'use client'

import { type FormEvent, useState } from 'react'
import type { Account, AccountRequest, AccountType } from '@/lib/api/accountsApi'
import { ACCOUNT_TYPE_LABELS } from '@/lib/api/accountsApi'
import { formatWithCommas, stripCommas } from '@/utils/numberFormat'

interface Props {
  initial: Account | null
  onSave: (data: AccountRequest) => Promise<void>
  onCancel: () => void
}

const ACCOUNT_TYPES: AccountType[] = ['BANK', 'DIGITAL_WALLET', 'EXCHANGE', 'CASH', 'OTHER']

export default function AccountForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState<AccountType>(initial?.type ?? 'BANK')
  const [balance, setBalance] = useState(formatWithCommas(initial?.balance?.toString() ?? '0'))
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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
      await onSave({ name, type, balance: balanceNum, notes })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ذخیره')
      setSaving(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="luxury-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="luxury-modal">
        <h2 className="text-lg font-light text-text-primary mb-6 tracking-tight">
          {initial ? 'ویرایش حساب' : 'حساب جدید'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">نام حساب</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
              placeholder="مثلاً: بلو، رسالت، نقد کیف"
              className="field-input"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">نوع حساب</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as AccountType)}
              className="field-input"
            >
              {ACCOUNT_TYPES.map(t => (
                <option key={t} value={t}>{ACCOUNT_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Balance */}
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">موجودی (تومان)</label>
            <input
              type="text"
              inputMode="numeric"
              value={balance}
              onChange={e => handleBalanceChange(e.target.value)}
              required
              placeholder="0"
              className="field-input tabular-nums"
            />
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
              className="field-input resize-none"
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
              disabled={saving || !name.trim()}
              className="flex-1 btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'در حال ذخیره...' : (initial ? 'ذخیره تغییرات' : 'افزودن حساب')}
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
