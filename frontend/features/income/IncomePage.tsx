'use client'

import { useEffect, useState } from 'react'
import {
  type Income,
  type IncomeRequest,
  INCOME_TYPE_LABELS,
  getIncomes,
  getMonthlyTotal,
  createIncome,
  updateIncome,
  deleteIncome,
} from '@/lib/api/incomesApi'
import IncomeForm from './IncomeForm'
import { Pencil, Trash2 } from 'lucide-react'
import { formatJalali } from '@/utils/jalaliUtils'
import PageHeader from '@/shared/PageHeader'
import { exportIncomesCsv } from '@/lib/api/incomesApi'

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Income | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function load() {
    try {
      const [items, total] = await Promise.all([getIncomes(), getMonthlyTotal()])
      setIncomes(items)
      setMonthlyTotal(total)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در بارگذاری')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleSave(data: IncomeRequest) {
    if (editing) {
      await updateIncome(editing.id, data)
    } else {
      await createIncome(data)
    }
    setShowForm(false)
    setEditing(null)
    load()
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await deleteIncome(id)
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
        title="درآمدها"
        subtitle={`درآمد ماهانه (مکرر): ${formatToman(monthlyTotal)}`}
        addLabel="+ درآمد جدید"
        onAdd={() => { setEditing(null); setShowForm(true) }}
        onExport={exportIncomesCsv}
      />

      {error && (
        <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5 mb-4">
          {error}
        </p>
      )}

      {/* Income list */}
      {incomes.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          هنوز درآمدی ثبت نشده. اولین درآمد را اضافه کنید.
        </div>
      ) : (
        <div className="space-y-2">
          {incomes.map(income => (
            <div
              key={income.id}
              className="luxury-card px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-accent text-base">💰</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{income.source}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {INCOME_TYPE_LABELS[income.incomeType]}
                    {income.receivedDate && ` • ${formatJalali(income.receivedDate)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm font-semibold text-text-primary tabular-nums">
                  <span className="text-brand-accent">+</span> {formatToman(income.amount)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditing(income); setShowForm(true) }}
                    title="ویرایش"
                    aria-label="ویرایش"
                    className="text-text-muted hover:text-brand-accent transition-colors p-1.5 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(income.id)}
                    disabled={deletingId === income.id}
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

      {showForm && (
        <IncomeForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

function formatToman(amount: number): string {
  return amount.toLocaleString('fa-IR') + ' تومان'
}
