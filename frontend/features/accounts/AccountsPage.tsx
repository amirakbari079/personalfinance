'use client'

import { useEffect, useState } from 'react'
import {
  type Account,
  type AccountRequest,
  ACCOUNT_TYPE_LABELS,
  getAccounts,
  getTotalBalance,
  createAccount,
  updateAccount,
  deleteAccount,
} from '@/lib/api/accountsApi'
import AccountForm from './AccountForm'
import { Pencil, Trash2 } from 'lucide-react'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function load() {
    try {
      const [accs, tot] = await Promise.all([getAccounts(), getTotalBalance()])
      setAccounts(accs)
      setTotal(tot)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در بارگذاری')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleSave(data: AccountRequest) {
    if (editingAccount) {
      await updateAccount(editingAccount.id, data)
    } else {
      await createAccount(data)
    }
    setShowForm(false)
    setEditingAccount(null)
    load()
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await deleteAccount(id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در حذف')
    } finally {
      setDeletingId(null)
    }
  }

  function openEdit(account: Account) {
    setEditingAccount(account)
    setShowForm(true)
  }

  function openNew() {
    setEditingAccount(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingAccount(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">حساب‌های نقدی</h1>
          <p className="text-sm text-text-muted mt-0.5">مجموع موجودی: {formatToman(total)}</p>
        </div>
        <button
          onClick={openNew}
          className="bg-brand-accent hover:bg-brand-accent-hover text-text-on-accent text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + حساب جدید
        </button>
      </div>

      {error && (
        <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5 mb-4">
          {error}
        </p>
      )}

      {/* Account list */}
      {accounts.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          هنوز حسابی ثبت نشده. اولین حساب را اضافه کنید.
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map(account => (
            <div
              key={account.id}
              className="bg-surface-card border border-surface-muted rounded-xl px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-accent text-base">{typeIcon(account.type)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{account.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{ACCOUNT_TYPE_LABELS[account.type]}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm font-semibold text-text-primary tabular-nums">
                  {formatToman(account.balance)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(account)}
                    title="ویرایش"
                    aria-label="ویرایش"
                    className="text-text-muted hover:text-brand-accent transition-colors p-1.5 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    disabled={deletingId === account.id}
                    title="حذف"
                    aria-label="حذف"
                    className="text-text-muted hover:text-status-error transition-colors p-1.5 rounded disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total footer */}
      {accounts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-surface-muted flex justify-between items-center">
          <span className="text-sm text-text-muted">جمع کل</span>
          <span className="text-sm font-bold text-text-primary tabular-nums">{formatToman(total)}</span>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <AccountForm
          initial={editingAccount}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}
    </div>
  )
}

function formatToman(amount: number): string {
  return amount.toLocaleString('fa-IR') + ' تومان'
}

function typeIcon(type: Account['type']): string {
  const icons: Record<Account['type'], string> = {
    BANK:           '🏦',
    DIGITAL_WALLET: '💳',
    EXCHANGE:       '💱',
    CASH:           '💵',
    OTHER:          '📁',
  }
  return icons[type]
}
