'use client'

import { useEffect, useMemo, useState } from 'react'
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
import {
  getAccountCashFlow,
  getAccountTotalSeries,
  type CashFlowSummary,
  type TotalSeriesPoint,
} from '@/lib/api/historyApi'
import AccountForm from './AccountForm'
import AccountHistoryModal from './AccountHistoryModal'
import { Pencil, Trash2, History } from 'lucide-react'
import PageHeader from '@/shared/PageHeader'
import StatusTag from '@/shared/StatusTag'
import { exportAccountsCsv } from '@/lib/api/accountsApi'
import BankLogo from '@/shared/banks/BankLogo'
import { resolveBankCode } from '@/shared/banks/detectBank'
import CashFlowSummaryCard from '@/shared/history/CashFlowSummaryCard'
import TrendLineChart from '@/shared/history/TrendLineChartLazy'
import MarketSidebar from '@/shared/market/MarketSidebar'
import { ACCOUNT_HISTORY_CONFIG } from '@/shared/history/historyTypes'
import ListSortBar from '@/shared/ListSortBar'
import { BASE_SORT_OPTIONS, DEFAULT_SORT, sortItems, type SortOptionId } from '@/utils/listSort'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [sortId, setSortId] = useState<SortOptionId>(DEFAULT_SORT)
  const [total, setTotal] = useState<number>(0)
  const [totalSeries, setTotalSeries] = useState<TotalSeriesPoint[]>([])
  const [cashFlow, setCashFlow] = useState<CashFlowSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [historyAccount, setHistoryAccount] = useState<Account | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

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
      const [accs, tot] = await Promise.all([getAccounts(), getTotalBalance()])
      setAccounts(accs)
      setTotal(tot)
      await loadAnalytics()
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

  const formatValue = ACCOUNT_HISTORY_CONFIG.formatValue

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <PageHeader
        title="حساب‌های نقدی"
        subtitle={`مجموع موجودی: ${formatValue(total)}`}
        addLabel="+ حساب جدید"
        onAdd={openNew}
        onExport={exportAccountsCsv}
      />

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

      {/* Account list + live market (aligned with first account row) */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        <div className="flex-1 min-w-0">
          {accounts.length > 0 && (
            <ListSortBar value={sortId} options={BASE_SORT_OPTIONS} onChange={setSortId} />
          )}
          {accounts.length === 0 ? (
            <div className="text-center py-16 text-text-muted text-sm">
              هنوز حسابی ثبت نشده. اولین حساب را اضافه کنید.
            </div>
          ) : (
            <div className="space-y-2">
              {sortedAccounts.map(account => (
                <div
                  key={account.id}
                  className="glass-card px-5 py-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-surface-elevated flex items-center justify-center flex-shrink-0 overflow-hidden border border-surface-muted/40">
                      <BankLogo
                        bankCode={resolveBankCode(account.bankCode, account.name)}
                        accountType={account.type}
                        size={26}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-item-title text-text-primary">{account.name}</p>
                      <StatusTag variant="secondary" className="mt-1 text-[10px]">
                        {ACCOUNT_TYPE_LABELS[account.type]}
                      </StatusTag>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:gap-6">
                    <span className="text-sm text-amount text-text-primary">
                      {formatValue(account.balance)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setHistoryAccount(account)}
                        title="تاریخچه"
                        aria-label="تاریخچه"
                        className="text-text-muted hover:text-brand-accent transition-colors p-1.5 rounded"
                      >
                        <History className="w-4 h-4" />
                      </button>
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

          {accounts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-surface-muted flex justify-between items-center">
              <span className="text-sm text-text-muted">جمع کل</span>
              <span className="text-sm text-amount text-text-primary">{formatValue(total)}</span>
            </div>
          )}
        </div>

        <MarketSidebar className="lg:sticky lg:top-20 self-start" />
      </div>

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
