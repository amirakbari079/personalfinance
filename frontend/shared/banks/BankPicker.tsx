'use client'

import { useMemo, useState } from 'react'
import type { AccountType } from '@/lib/api/accountsApi'
import { banksForAccountType, getBankByCode } from './bankCatalog'
import BankLogo from './BankLogo'

interface BankPickerProps {
  accountType: AccountType
  value: string | null
  onChange: (code: string | null) => void
}

export default function BankPicker({ accountType, value, onChange }: BankPickerProps) {
  const [query, setQuery] = useState('')
  const banks = useMemo(() => banksForAccountType(accountType), [accountType])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\u200c/g, '')
    if (!q) return banks
    return banks.filter(b =>
      b.label.includes(q) ||
      b.code.includes(q) ||
      b.keywords.some(k => k.toLowerCase().includes(q)),
    )
  }, [banks, query])

  const selected = getBankByCode(value)

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="field-label">لوگوی بانک / کیف پول</label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[10px] text-text-muted hover:text-status-error transition-colors"
          >
            حذف لوگو
          </button>
        )}
      </div>

      {selected && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-surface-muted/40 border border-surface-muted">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
            <BankLogo bankCode={selected.code} accountType={accountType} size={24} />
          </div>
          <span className="text-xs text-text-primary">{selected.label}</span>
        </div>
      )}

      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="جستجوی بانک..."
        className="field-input mb-2 text-sm"
      />

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-40 glass-scroll-overlay p-1">
        {filtered.map(bank => {
          const active = value === bank.code
          return (
            <button
              key={bank.code}
              type="button"
              title={bank.label}
              onClick={() => onChange(bank.code)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                active
                  ? 'border-brand-accent bg-brand-accent/10 ring-1 ring-brand-accent/30'
                  : 'border-surface-muted hover:border-brand-accent/40 hover:bg-surface-muted/30'
              }`}
            >
              <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center overflow-hidden">
                <BankLogo bankCode={bank.code} accountType={accountType} size={22} />
              </div>
              <span className="text-[9px] text-text-muted leading-tight text-center line-clamp-2 w-full">
                {bank.label.replace(/^بانک\s/, '')}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-xs text-text-muted text-center py-3">بانکی یافت نشد</p>
      )}
    </div>
  )
}
