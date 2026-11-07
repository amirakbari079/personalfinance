'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  type Account,
  type AccountRequest,
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  restoreAccount,
  exportAccountsCsv,
} from '@/lib/api/accountsApi'
import {
  getAccountCashFlow,
  getAccountTotalSeries,
  type CashFlowSummary,
  type TotalSeriesPoint,
} from '@/lib/api/historyApi'
import dynamic from 'next/dynamic'
const AccountForm = dynamic(() => import('./AccountForm'))
import AccountCard from './AccountCard'
const AccountHistoryModal = dynamic(() => import('./AccountHistoryModal'))
import PageHeader from '@/shared/PageHeader'
import CashFlowSummaryCard from '@/shared/history/CashFlowSummaryCard'
import TrendLineChart from '@/shared/history/TrendLineChartLazy'
import { ACCOUNT_HISTORY_CONFIG } from '@/shared/history/historyTypes'
import ListSortBar from '@/shared/ListSortBar'
import TotalFooter from '@/shared/TotalFooter'
import { BASE_SORT_OPTIONS, DEFAULT_SORT, sortItems, type SortOptionId } from '@/utils/listSort'
import { sumAmounts } from '@/utils/formatToman'
import Link from 'next/link'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [sortId, setSortId] = useState<SortOptionId>(DEFAULT_SORT)
  const [totalSeries, setTotalSeries] = useState<TotalSeriesPoint[]>([])
  const [cashFlow, setCashFlow] = useState<CashFlowSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [historyAccount, setHistoryAccount] = useState<Account | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [archived, setArchived] = useState(false)

  async function loadAnalytics() {
    setAnalyticsLoading(true)
    try {
      const [series, flow] = await Promise.all([
        getAccountTotalSeries(),
        getAccountCashFlow(),
      ])
      setTotalSeries(series)
      setCashFlow(flow)
    } catch {
      /* analytics are optional — list still works */
    } finally {
      setAnalyticsLoading(false)
    }
  }

  async function load() {
    try {
      setError(null)
      const accs = await getAccounts(archived)
      setAccounts(accs)
      void loadAnalytics()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در بارگذاری')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [archived])

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
      const account = accounts.find(a => a.id === id)
      if (!account) return
      if (archived) await restoreAccount(id, account.version)
      else await deleteAccount(id, account.version)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در بایگانی یا بازگردانی')
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

  const formatValue = ACCOUNT_HISTORY_CONFIG.formatValue
  const total = sumAmounts(accounts.map((a) => a.balance))

  const sortedAccounts = useMemo(
    () => sortItems(accounts, sortId, {
      getName: (a) => a.name,
      getAmount: (a) => a.balance,
      getCreatedAt: (a) => a.createdAt,
    }),
    [accounts, sortId],
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-[88rem] mx-auto px-4 py-8">
      <PageHeader
        title="حساب‌های نقدی"
        subtitle={`مجموع موجودی: ${formatValue(total)}`}
        addLabel="+ حساب جدید"
        onAdd={openNew}
        onExport={exportAccountsCsv}
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button type="button" className="btn-ghost" aria-pressed={!archived} onClick={() => setArchived(false)}>حساب‌های فعال</button>
        <button type="button" className="btn-ghost" aria-pressed={archived} onClick={() => setArchived(true)}>بایگانی</button>
        <Link className="btn-primary ms-auto" href="/transactions">ثبت گردش پول و اصلاح موجودی</Link>
      </div>

      {error && (
        <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5 mb-4">
          {error}
        </p>
      )}

      {/* Analytics */}
      <section className="mb-8 space-y-3">
        <CashFlowSummaryCard
          data={cashFlow}
          formatValue={formatValue}
          isLoading={analyticsLoading}
        />
        <TrendLineChart
          data={totalSeries}
          formatValue={formatValue}
          isLoading={analyticsLoading}
        />
      </section>

      {/* Account cards grid */}
      <section>
        {accounts.length > 0 && (
          <ListSortBar value={sortId} options={BASE_SORT_OPTIONS} onChange={setSortId} />
        )}
        {accounts.length === 0 ? (
          <div className="text-center py-16 text-text-muted text-sm">
            {archived ? 'حساب بایگانی‌شده‌ای ندارید. بایگانی، سوابق را پاک نمی‌کند.' : 'هنوز حسابی ثبت نشده. اولین حساب را اضافه کنید.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
            {sortedAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                formatValue={formatValue}
                onHistory={() => setHistoryAccount(account)}
                onEdit={() => openEdit(account)}
                onDelete={() => handleDelete(account.id)}
                isDeleting={deletingId === account.id}
              />
            ))}
          </div>
        )}

        {accounts.length > 0 && (
          <TotalFooter value={total} formatValue={formatValue} />
        )}
      </section>

      {showForm && (
        <AccountForm
          initial={editingAccount}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}

      {historyAccount && (
        <AccountHistoryModal
          accountId={historyAccount.id}
          accountName={historyAccount.name}
          onClose={() => setHistoryAccount(null)}
          onBalanceChanged={load}
        />
      )}
    </div>
  )
}
