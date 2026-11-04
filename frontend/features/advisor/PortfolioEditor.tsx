'use client'

import { useState } from 'react'
import AccountForm from '@/features/accounts/AccountForm'
import InvestmentForm from '@/features/investments/InvestmentForm'
import {
  ACCOUNT_TYPE_LABELS,
  createAccount,
  type Account,
  type AccountRequest,
} from '@/lib/api/accountsApi'
import {
  INVESTMENT_TYPE_LABELS,
  createInvestment,
  type Investment,
  type InvestmentRequest,
} from '@/lib/api/investmentsApi'
import { formatToman } from '@/utils/formatToman'
import { formatWithCommas, stripCommas } from '@/utils/numberFormat'
import type { AdvisorCustomHolding } from './api'

export interface LocalCustomHolding extends AdvisorCustomHolding {
  localId: string
}

interface Props {
  accounts: Account[]
  investments: Investment[]
  selectedAccountIds: number[]
  selectedInvestmentIds: number[]
  customHoldings: LocalCustomHolding[]
  onToggleAccount: (id: number) => void
  onToggleInvestment: (id: number) => void
  onAccountsChanged: (next: Account[], selectId?: number) => void
  onInvestmentsChanged: (next: Investment[], selectId?: number) => void
  onCustomChange: (next: LocalCustomHolding[]) => void
}

export default function PortfolioEditor({
  accounts,
  investments,
  selectedAccountIds,
  selectedInvestmentIds,
  customHoldings,
  onToggleAccount,
  onToggleInvestment,
  onAccountsChanged,
  onInvestmentsChanged,
  onCustomChange,
}: Props) {
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [showInvestmentForm, setShowInvestmentForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customKind, setCustomKind] = useState<'ACCOUNT' | 'INVESTMENT'>('ACCOUNT')
  const [customAmount, setCustomAmount] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const cashTotal = accounts
    .filter((row) => selectedAccountIds.includes(row.id))
    .reduce((sum, row) => sum + (row.balance ?? 0), 0)
  const investmentTotal = investments
    .filter((row) => selectedInvestmentIds.includes(row.id))
    .reduce((sum, row) => sum + (row.tomanEquivalent ?? 0), 0)
  const customTotal = customHoldings.reduce((sum, row) => sum + (row.amountToman ?? 0), 0)

  async function handleSaveAccount(data: AccountRequest) {
    const created = await createAccount(data)
    onAccountsChanged([...accounts, created], created.id)
    setShowAccountForm(false)
  }

  async function handleSaveInvestment(data: InvestmentRequest) {
    const created = await createInvestment(data)
    onInvestmentsChanged([...investments, created], created.id)
    setShowInvestmentForm(false)
  }

  function addCustom() {
    const amount = Number.parseInt(stripCommas(customAmount), 10)
    if (!customName.trim()) {
      setFormError('نام دارایی موقت الزامی است')
      return
    }
    if (Number.isNaN(amount) || amount < 0) {
      setFormError('مبلغ باید عدد صحیح غیرمنفی باشد')
      return
    }
    setFormError(null)
    onCustomChange([
      ...customHoldings,
      {
        localId: `${Date.now()}-${customHoldings.length}`,
        name: customName.trim(),
        kind: customKind,
        amountToman: amount,
      },
    ])
    setCustomName('')
    setCustomAmount('')
  }

  return (
    <section className="glass-card p-4 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base text-text-primary">دارایی‌های شما</h2>
          <p className="text-xs text-text-muted mt-1">
            حساب‌ها و سرمایه‌گذاری‌های موجود را انتخاب کنید، یا همین‌جا مورد جدید بسازید.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={() => setShowAccountForm(true)}>
            افزودن حساب
          </button>
          <button type="button" className="btn-secondary" onClick={() => setShowInvestmentForm(true)}>
            افزودن سرمایه‌گذاری
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-text-muted mb-2">حساب‌ها</p>
          {accounts.length === 0 ? (
            <p className="text-sm text-text-muted">حسابی ثبت نشده. از «افزودن حساب» استفاده کنید.</p>
          ) : (
            <ul className="space-y-2">
              {accounts.map((account) => (
                <li key={account.id}>
                  <label className="flex items-start gap-2 rounded-xl bg-surface-muted/15 px-3 py-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selectedAccountIds.includes(account.id)}
                      onChange={() => onToggleAccount(account.id)}
                    />
                    <span className="flex-1">
                      <span className="block text-sm text-text-primary">{account.name}</span>
                      <span className="block text-[11px] text-text-muted">
                        {ACCOUNT_TYPE_LABELS[account.type]} · {formatToman(account.balance)}
                        {account.balanceRecordedDate ? ` · ${account.balanceRecordedDate}` : ''}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-xs text-text-muted mb-2">سرمایه‌گذاری‌ها</p>
          {investments.length === 0 ? (
            <p className="text-sm text-text-muted">سرمایه‌گذاری ثبت نشده. از «افزودن سرمایه‌گذاری» استفاده کنید.</p>
          ) : (
            <ul className="space-y-2">
              {investments.map((item) => (
                <li key={item.id}>
                  <label className="flex items-start gap-2 rounded-xl bg-surface-muted/15 px-3 py-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selectedInvestmentIds.includes(item.id)}
                      onChange={() => onToggleInvestment(item.id)}
                    />
                    <span className="flex-1">
                      <span className="block text-sm text-text-primary">{item.name}</span>
                      <span className="block text-[11px] text-text-muted">
                        {INVESTMENT_TYPE_LABELS[item.assetType]} · {formatToman(item.tomanEquivalent)}
                        {item.valueRecordedDate ? ` · ${item.valueRecordedDate}` : ''}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border-t border-surface-muted/40 pt-4 mb-4">
        <p className="text-xs text-text-muted mb-2">دارایی موقت فقط برای این تحلیل</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <input
            className="field-input"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="مثلاً پول خرد کیف"
          />
          <select
            className="field-input"
            value={customKind}
            onChange={(e) => setCustomKind(e.target.value as 'ACCOUNT' | 'INVESTMENT')}
          >
            <option value="ACCOUNT">حساب / نقد</option>
            <option value="INVESTMENT">سرمایه‌گذاری</option>
          </select>
          <input
            className="field-input tabular-nums"
            value={customAmount}
            onChange={(e) => setCustomAmount(formatWithCommas(e.target.value))}
            placeholder="مبلغ تومان"
            inputMode="numeric"
          />
          <button type="button" className="btn-secondary" onClick={addCustom}>
            افزودن موقت
          </button>
        </div>
        {formError && <p className="text-sm text-status-error mb-2">{formError}</p>}
        {customHoldings.length > 0 && (
          <ul className="space-y-2">
            {customHoldings.map((row) => (
              <li
                key={row.localId}
                className="flex items-center justify-between gap-2 rounded-xl bg-surface-muted/15 px-3 py-2 text-sm"
              >
                <span>
                  {row.name} · {row.kind === 'ACCOUNT' ? 'حساب' : 'سرمایه‌گذاری'} · {formatToman(row.amountToman)}
                </span>
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  onClick={() => onCustomChange(customHoldings.filter((item) => item.localId !== row.localId))}
                >
                  حذف
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Total label="حساب‌ها" value={cashTotal} />
        <Total label="سرمایه‌گذاری" value={investmentTotal} />
        <Total label="موقت" value={customTotal} />
        <Total label="جمع انتخاب‌شده" value={cashTotal + investmentTotal + customTotal} />
      </div>

      {showAccountForm && (
        <AccountForm initial={null} onSave={handleSaveAccount} onCancel={() => setShowAccountForm(false)} />
      )}
      {showInvestmentForm && (
        <InvestmentForm
          initial={null}
          onSave={handleSaveInvestment}
          onCancel={() => setShowInvestmentForm(false)}
        />
      )}
    </section>
  )
}

function Total({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface-muted/20 px-3 py-2">
      <p className="text-[11px] text-text-muted mb-1">{label}</p>
      <p className="text-text-primary tabular-nums">{formatToman(value)}</p>
    </div>
  )
}
