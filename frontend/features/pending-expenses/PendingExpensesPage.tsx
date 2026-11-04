'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  type PendingExpense,
  type PendingExpenseRequest,
  getPendingExpenses,
  createPendingExpense,
  updatePendingExpense,
  deletePendingExpense,
} from '@/lib/api/pendingExpensesApi'
import PendingExpenseForm from './PendingExpenseForm'
import { Pencil, Trash2, Clock } from 'lucide-react'
import { formatJalali } from '@/utils/jalaliUtils'
import PageHeader from '@/shared/PageHeader'
import ListIcon from '@/shared/ListIcon'
import StatusTag from '@/shared/StatusTag'
import { exportPendingExpensesCsv } from '@/lib/api/pendingExpensesApi'
import ListSortBar from '@/shared/ListSortBar'
import TotalFooter from '@/shared/TotalFooter'
import { formatToman, sumAmounts } from '@/utils/formatToman'
import {
  BASE_SORT_OPTIONS,
  DEFAULT_SORT,
  DOMAIN_DATE_SORT_OPTIONS,
  sortItems,
  type SortOptionId,
} from '@/utils/listSort'

const SORT_OPTIONS = [...BASE_SORT_OPTIONS, ...DOMAIN_DATE_SORT_OPTIONS]

export default function PendingExpensesPage() {
  const [expenses, setExpenses] = useState<PendingExpense[]>([])
  const [sortId, setSortId] = useState<SortOptionId>(DEFAULT_SORT)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PendingExpense | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function load() {
    try {
      const items = await getPendingExpenses()
      setExpenses(items)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در بارگذاری')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const total = sumAmounts(expenses.map((e) => e.plannedAmount))

  const sortedExpenses = useMemo(
    () => sortItems(expenses, sortId, {
      getName: (e) => e.label,
      getAmount: (e) => e.plannedAmount,
      getCreatedAt: (e) => e.createdAt,
      getDate: (e) => e.dueDate,
    }),
    [expenses, sortId],
  )

  async function handleSave(data: PendingExpenseRequest) {
    if (editing) {
      await updatePendingExpense(editing.id, data)
    } else {
      await createPendingExpense(data)
    }
    setShowForm(false)
    setEditing(null)
    load()
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await deletePendingExpense(id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در حذف')
    } finally {
      setDeletingId(null)
    }
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
      <PageHeader
        title="هزینه‌های برنامه‌ریزی‌شده"
        subtitle={`خرج‌هایی که هنوز پرداخت نکرده‌اید ولی برنامه‌ریزی کرده‌اید • مجموع: ${formatToman(total)}`}
        addLabel="+ هزینه جدید"
        onAdd={() => { setEditing(null); setShowForm(true) }}
        onExport={exportPendingExpensesCsv}
      />

      {error && (
        <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5 mb-4">
          {error}
        </p>
      )}

      {expenses.length > 0 && (
        <ListSortBar value={sortId} options={SORT_OPTIONS} onChange={setSortId} />
      )}

      {expenses.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          هنوز هزینه‌ای ثبت نشده. اولین هزینه برنامه‌ریزی‌شده را اضافه کنید.
        </div>
      ) : (
        <div className="space-y-2">
          {sortedExpenses.map(expense => (
            <div
              key={expense.id}
              className="glass-card px-5 py-4 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <ListIcon icon={Clock} variant="error" />
                <div>
                  <p className="text-sm text-item-title text-text-primary">{expense.label}</p>
                  <StatusTag variant="warning" className="mt-1 text-[10px]">
                    {expense.dueDate ? `سررسید: ${formatJalali(expense.dueDate)}` : 'بدون سررسید'}
                  </StatusTag>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <StatusTag variant="error" className="text-sm tabular-nums">
                  − {formatToman(expense.plannedAmount)}
                </StatusTag>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditing(expense); setShowForm(true) }}
                    title="ویرایش"
                    aria-label="ویرایش"
                    className="text-text-muted hover:text-brand-accent transition-colors p-1.5 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    disabled={deletingId === expense.id}
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

      {expenses.length > 0 && (
        <TotalFooter value={total} formatValue={formatToman} />
      )}

      {showForm && (
        <PendingExpenseForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
