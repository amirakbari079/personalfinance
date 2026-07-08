'use client'

import { useEffect, useState } from 'react'
import {
  type Investment,
  type InvestmentRequest,
  INVESTMENT_TYPE_LABELS,
  getInvestments,
  getTotalTomanValue,
  createInvestment,
  updateInvestment,
  deleteInvestment,
} from '@/lib/api/investmentsApi'
import InvestmentForm from './InvestmentForm'
import { Pencil, Trash2 } from 'lucide-react'
import PageHeader from '@/shared/PageHeader'
import { exportInvestmentsCsv } from '@/lib/api/investmentsApi'

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function load() {
    try {
      const [items, tot] = await Promise.all([getInvestments(), getTotalTomanValue()])
      setInvestments(items)
      setTotal(tot)
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
        title="سرمایه‌گذاری‌ها"
        subtitle={`جمع معادل تومانی: ${formatToman(total)}`}
        addLabel="+ سرمایه‌گذاری جدید"
        onAdd={openNew}
        onExport={exportInvestmentsCsv}
      />

      {error && (
        <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5 mb-4">
          {error}
        </p>
      )}

      {/* Investment list */}
      {investments.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          هنوز سرمایه‌گذاری‌ای ثبت نشده. اولین مورد را اضافه کنید.
        </div>
      ) : (
        <div className="space-y-2">
          {investments.map(investment => (
            <div
              key={investment.id}
              className="luxury-card px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-accent text-base">{typeIcon(investment.assetType)}</span>
                </div>
                <div>
                  <p className="text-sm text-item-title text-text-primary">{investment.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{INVESTMENT_TYPE_LABELS[investment.assetType]}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm text-amount text-text-primary">
                  {formatToman(investment.tomanEquivalent)}
                </span>
                <div className="flex items-center gap-1">
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

      {/* Total footer */}
      {investments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-surface-muted flex justify-between items-center">
          <span className="text-sm text-text-muted">جمع کل</span>
          <span className="text-sm text-amount text-text-primary">{formatToman(total)}</span>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <InvestmentForm
          initial={editingInvestment}
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

function typeIcon(type: Investment['assetType']): string {
  const icons: Record<Investment['assetType'], string> = {
    STOCK:            '📈',
    GOLD:             '🪙',
    CRYPTO:           '₿',
    FOREIGN_CURRENCY: '💱',
    OTHER:            '📁',
  }
  return icons[type]
}
