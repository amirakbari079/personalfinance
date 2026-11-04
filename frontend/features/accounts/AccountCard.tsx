'use client'

import { History, MoreHorizontal, Pencil, Trash2, Wallet } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import type { Account } from '@/lib/api/accountsApi'
import { ACCOUNT_TYPE_LABELS } from '@/lib/api/accountsApi'
import BankLogo from '@/shared/banks/BankLogo'
import { resolveBankCode } from '@/shared/banks/detectBank'

const TYPE_THEMES: Record<Account['type'], string> = {
  BANK: '#3b59ff',
  DIGITAL_WALLET: '#8b5cf6',
  EXCHANGE: '#f59e0b',
  CASH: '#22c55e',
  OTHER: '#64748b',
}

interface Props {
  account: Account
  formatValue: (amount: number) => string
  onHistory: () => void
  onEdit: () => void
  onDelete: () => void
  isDeleting?: boolean
}

export default function AccountCard({
  account,
  formatValue,
  onHistory,
  onEdit,
  onDelete,
  isDeleting,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const accent = TYPE_THEMES[account.type]

  return (
    <article
      className="account-card group"
      style={{ '--account-accent': accent } as CSSProperties}
    >
      <div className="account-card-shine" aria-hidden />
      <div className="account-card-ring" aria-hidden />

      <div className="account-card-inner">
        <div className="account-card-top">
          <div className="account-card-logo">
            <BankLogo
              bankCode={resolveBankCode(account.bankCode, account.name)}
              accountType={account.type}
              size={24}
            />
          </div>

          <div className="account-card-menu">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="عملیات"
              aria-expanded={menuOpen}
              className="account-card-menu-trigger"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  className="account-card-menu-backdrop"
                  aria-label="بستن منو"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="account-card-menu-panel">
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onHistory() }}
                    className="account-card-menu-item"
                  >
                    <History className="w-3.5 h-3.5" />
                    تاریخچه
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onEdit() }}
                    className="account-card-menu-item"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    ویرایش
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onDelete() }}
                    disabled={isDeleting}
                    className="account-card-menu-item account-card-menu-item--danger disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="account-card-meta">
          <h3 className="account-card-name">{account.name}</h3>
          <span className="account-card-type">{ACCOUNT_TYPE_LABELS[account.type]}</span>
        </div>

        <div className="account-card-balance">
          <span className="account-card-balance-label">
            <Wallet className="w-3 h-3" />
            موجودی
          </span>
          <p className="account-card-balance-value">{formatValue(account.balance)}</p>
        </div>
      </div>
    </article>
  )
}
