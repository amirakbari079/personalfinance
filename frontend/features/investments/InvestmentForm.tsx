'use client'

import { type FormEvent, useState } from 'react'
import type { Investment, InvestmentRequest, InvestmentType } from '@/lib/api/investmentsApi'
import { INVESTMENT_TYPE_LABELS } from '@/lib/api/investmentsApi'
import { formatWithCommas, stripCommas } from '@/utils/numberFormat'

interface Props {
  initial: Investment | null
  onSave: (data: InvestmentRequest) => Promise<void>
  onCancel: () => void
}

const INVESTMENT_TYPES: InvestmentType[] = ['STOCK', 'GOLD', 'CRYPTO', 'FOREIGN_CURRENCY', 'OTHER']

const NATIVE_UNIT_PLACEHOLDERS: Record<InvestmentType, string> = {
  GOLD:             'گرم',
  CRYPTO:           'واحد',
  FOREIGN_CURRENCY: 'دلار/یورو/...',
  STOCK:            'سهم',
  OTHER:            '',
}

export default function InvestmentForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [assetType, setAssetType] = useState<InvestmentType>(initial?.assetType ?? 'STOCK')
  const [nativeAmount, setNativeAmount] = useState(initial?.nativeAmount?.toString() ?? '')
  const [nativeUnit, setNativeUnit] = useState(initial?.nativeUnit ?? '')
  const [tomanEquivalent, setTomanEquivalent] = useState(formatWithCommas(initial?.tomanEquivalent?.toString() ?? '0'))
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function handleTomanChange(value: string) {
    setTomanEquivalent(formatWithCommas(value))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const tomanNum = parseInt(stripCommas(tomanEquivalent), 10)
    if (isNaN(tomanNum) || tomanNum < 0) {
      setError('معادل تومانی باید عدد صحیح غیرمنفی باشد')
      return
    }
    let nativeAmountNum: number | null = null
    if (nativeAmount.trim() !== '') {
      nativeAmountNum = parseFloat(nativeAmount)
      if (isNaN(nativeAmountNum) || nativeAmountNum < 0) {
        setError('مقدار دارایی باید عدد غیرمنفی باشد')
        return
      }
    }
    setError(null)
    setSaving(true)
    try {
      await onSave({
        name,
        assetType,
        nativeAmount: nativeAmountNum,
        nativeUnit,
        tomanEquivalent: tomanNum,
        notes,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ذخیره')
      setSaving(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-brand-dark/50 flex items-center justify-center z-50 px-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-surface-card rounded-2xl shadow-xl w-full max-w-md p-7">
        <h2 className="text-base font-semibold text-text-primary mb-6">
          {initial ? 'ویرایش سرمایه‌گذاری' : 'سرمایه‌گذاری جدید'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">نام</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
              placeholder="مثلاً: سهام فولاد، طلای ۱۸ عیار"
              className="w-full bg-surface border border-surface-muted rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/25 focus:border-brand-accent transition-all"
            />
          </div>

          {/* Asset type */}
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">نوع دارایی</label>
            <select
              value={assetType}
              onChange={e => setAssetType(e.target.value as InvestmentType)}
              className="w-full bg-surface border border-surface-muted rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/25 focus:border-brand-accent transition-all"
            >
              {INVESTMENT_TYPES.map(t => (
                <option key={t} value={t}>{INVESTMENT_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Native amount + unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">
                مقدار <span className="text-text-muted font-normal">(اختیاری)</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={nativeAmount}
                onChange={e => setNativeAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-surface border border-surface-muted rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/25 focus:border-brand-accent transition-all tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">
                واحد <span className="text-text-muted font-normal">(اختیاری)</span>
              </label>
              <input
                type="text"
                value={nativeUnit}
                onChange={e => setNativeUnit(e.target.value)}
                placeholder={NATIVE_UNIT_PLACEHOLDERS[assetType]}
                className="w-full bg-surface border border-surface-muted rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/25 focus:border-brand-accent transition-all"
              />
            </div>
          </div>

          {/* Toman equivalent */}
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">معادل تومانی (تومان)</label>
            <input
              type="text"
              inputMode="numeric"
              value={tomanEquivalent}
              onChange={e => handleTomanChange(e.target.value)}
              required
              placeholder="0"
              className="w-full bg-surface border border-surface-muted rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/25 focus:border-brand-accent transition-all tabular-nums"
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
              disabled={saving || !name.trim()}
              className="flex-1 bg-brand-accent hover:bg-brand-accent-hover text-text-on-accent text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'در حال ذخیره...' : (initial ? 'ذخیره تغییرات' : 'افزودن سرمایه‌گذاری')}
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
