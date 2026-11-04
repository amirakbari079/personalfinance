'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  type Investment,
  type InvestmentRequest,
  INVESTMENT_TYPE_LABELS,
  getInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
} from '@/lib/api/investmentsApi'
import {
  getInvestmentCashFlow,
  getInvestmentTotalSeries,
  type CashFlowSummary,
  type TotalSeriesPoint,
} from '@/lib/api/historyApi'
import dynamic from 'next/dynamic'
const InvestmentForm = dynamic(() => import('./InvestmentForm'))
const InvestmentHistoryModal = dynamic(() => import('./InvestmentHistoryModal'))
import { Pencil, Trash2, History, TrendingUp, Coins, Bitcoin, CircleDollarSign, FolderOpen } from 'lucide-react'
import PageHeader from '@/shared/PageHeader'
import ListIcon from '@/shared/ListIcon'
import StatusTag from '@/shared/StatusTag'
import { exportInvestmentsCsv } from '@/lib/api/investmentsApi'
import CashFlowSummaryCard from '@/shared/history/CashFlowSummaryCard'
import TrendLineChart from '@/shared/history/TrendLineChartLazy'
import MarketSidebar from '@/shared/market/MarketSidebar'
import { INVESTMENT_HISTORY_CONFIG } from '@/shared/history/historyTypes'
import ListSortBar from '@/shared/ListSortBar'
import TotalFooter from '@/shared/TotalFooter'
import { BASE_SORT_OPTIONS, DEFAULT_SORT, sortItems, type SortOptionId } from '@/utils/listSort'
import { sumAmounts } from '@/utils/formatToman'

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [sortId, setSortId] = useState<SortOptionId>(DEFAULT_SORT)
  const [totalSeries, setTotalSeries] = useState<TotalSeriesPoint[]>([])
  const [cashFlow, setCashFlow] = useState<CashFlowSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)
  const [historyInvestment, setHistoryInvestment] = useState<Investment | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const formatValue = INVESTMENT_HISTORY_CONFIG.formatValue
  const total = sumAmounts(investments.map((i) => i.tomanEquivalent))

  async function loadAnalytics() {
    setAnalyticsLoading(true)
    try {
      const [series, flow] = await Promise.all([
        getInvestmentTotalSeries(),
        getInvestmentCashFlow(),
      ])
      setTotalSeries(series)
      setCashFlow(flow)
    } catch {
      /* analytics optional */
    } finally {
      setAnalyticsLoading(false)
    }
  }

  async function load() {
    try {
      const items = await getInvestments()
      setInvestments(items)
      void loadAnalytics()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در بارگذاری')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleSave(data: InvestmentRequest) {
    if (editingInvestment) {
      await updateInvestment(editingInvestment.id, data)
    } else {
      await createInvestment(data)
    }
    setShowForm(false)
    setEditingInvestment(null)
    load()
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await deleteInvestment(id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در حذف')
    } finally {
      setDeletingId(null)
    }
  }

  function openEdit(investment: Investment) {
    setEditingInvestment(investment)
    setShowForm(true)
  }

  function openNew() {
    setEditingInvestment(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingInvestment(null)
  }

  const sortedInvestments = useMemo(
    () => sortItems(investments, sortId, {
      getName: (i) => i.name,
      getAmount: (i) => i.tomanEquivalent,
      getCreatedAt: (i) => i.createdAt,
    }),
    [investments, sortId],
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
        title="سرمایه‌گذاری‌ها"
        subtitle={`جمع معادل تومانی: ${formatValue(total)}`}
        addLabel="+ سرمایه‌گذاری جدید"
        onAdd={openNew}
        onExport={exportInvestmentsCsv}
      />

      {error && (
        <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5 mb-4">
          {error}
        </p>
      )}

      <section className="mb-8 space-y-3">
        <CashFlowSummaryCard
          data={cashFlow}
          formatValue={formatValue}
          isLoading={analyticsLoading}
        />
        <TrendLineChart
          data={totalSeries}
          formatValue={formatValue}
          title="روند ارزش کل سرمایه‌گذاری‌ها"
          isLoading={analyticsLoading}
        />
      </section>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        <div className="flex-1 min-w-0">
          {investments.length > 0 && (
            <ListSortBar value={sortId} options={BASE_SORT_OPTIONS} onChange={setSortId} />
          )}
          {investments.length === 0 ? (
            <div className="text-center py-16 text-text-muted text-sm">
              هنوز سرمایه‌گذاری‌ای ثبت نشده. اولین مورد را اضافه کنید.
            </div>
          ) : (
            <div className="space-y-2">
              {sortedInvestments.map(investment => (
                <div
                  key={investment.id}
                  className="glass-card px-5 py-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <InvestmentTypeIcon type={investment.assetType} />
                    <div>
                      <p className="text-sm text-item-title text-text-primary">{investment.name}</p>
                      <StatusTag variant="secondary" className="mt-1 text-[10px]">
                        {INVESTMENT_TYPE_LABELS[investment.assetType]}
                      </StatusTag>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:gap-6">
                    <span className="text-sm text-amount text-text-primary">
                      {formatValue(investment.tomanEquivalent)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setHistoryInvestment(investment)}
                        title="تاریخچه"
                        aria-label="تاریخچه"
                        className="text-text-muted hover:text-brand-accent transition-colors p-1.5 rounded"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(investment)}
                        title="ویرایش"
                        aria-label="ویرایش"
                        className="text-text-muted hover:text-brand-accent transition-colors p-1.5 rounded"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(investment.id)}
                        disabled={deletingId === investment.id}
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

          {investments.length > 0 && (
            <TotalFooter value={total} formatValue={formatValue} />
          )}
        </div>

        <MarketSidebar className="lg:sticky lg:top-20 self-start" />
      </div>

      {showForm && (
        <InvestmentForm
          key={editingInvestment?.id ?? 'new'}
          initial={editingInvestment}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}

      {historyInvestment && (
        <InvestmentHistoryModal
          investmentId={historyInvestment.id}
          investmentName={historyInvestment.name}
          onClose={() => setHistoryInvestment(null)}
          onValueChanged={load}
        />
      )}
    </div>
  )
}

function InvestmentTypeIcon({ type }: { type: Investment['assetType'] }) {
  const icons = {
    STOCK: TrendingUp,
    GOLD: Coins,
    CRYPTO: Bitcoin,
    FOREIGN_CURRENCY: CircleDollarSign,
    OTHER: FolderOpen,
  } as const
  return <ListIcon icon={icons[type]} variant="primary" />
}
