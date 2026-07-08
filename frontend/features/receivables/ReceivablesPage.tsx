'use client'

import { useEffect, useState } from 'react'
import {
  type Receivable,
  type ReceivableRequest,
  getReceivables,
  createReceivable,
  updateReceivable,
  deleteReceivable,
  exportReceivablesCsv,
} from '@/lib/api/receivablesApi'
import ReceivableForm from './ReceivableForm'
import { Pencil, Trash2 } from 'lucide-react'
import { formatJalali } from '@/utils/jalaliUtils'
import PageHeader from '@/shared/PageHeader'

export default function ReceivablesPage() {
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Receivable | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function load() {
    try {
      const items = await getReceivables()
      setReceivables(items)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در بارگذاری')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const totalOutstanding = receivables.reduce((sum, r) => sum + r.outstanding, 0)

  async function handleSave(data: ReceivableRequest) {
    if (editing) {
      await updateReceivable(editing.id, data)
    } else {
      await createReceivable(data)
    }
    setShowForm(false)
    setEditing(null)
    load()
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await deleteReceivable(id)
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
        title="طلب‌ها"
        subtitle={`مجموع باقی‌مانده: ${formatToman(totalOutstanding)}`}
        addLabel="+ طلب جدید"
        onAdd={() => { setEditing(null); setShowForm(true) }}
        onExport={exportReceivablesCsv}
      />

      {error && (
        <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5 mb-4">
          {error}
        </p>
      )}

      {receivables.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          هنوز طلبی ثبت نشده. اولین طلب را اضافه کنید.
        </div>
      ) : (
        <div className="space-y-2">
          {receivables.map(receivable => (
            <div
              key={receivable.id}
              className="luxury-card px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-accent text-base">📋</span>
                </div>
                <div>
                  <p className="text-sm text-item-title text-text-primary">{receivable.debtorName}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {receivable.createdDate
                      ? `تاریخ: ${formatJalali(receivable.createdDate)}`
                      : 'بدون تاریخ'}
                    {' • '}
                    دریافت‌شده: {formatToman(receivable.receivedAmount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-left">
                  <span className="text-sm text-amount text-text-primary block">
                    <span className="text-brand-accent">+</span> {formatToman(receivable.outstanding)}
                  </span>
                  <span className="text-[10px] text-text-muted tabular-nums">
                    از {formatToman(receivable.originalAmount)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditing(receivable); setShowForm(true) }}
                    title="ویرایش"
                    aria-label="ویرایش"
                    className="text-text-muted hover:text-brand-accent transition-colors p-1.5 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(receivable.id)}
                    disabled={deletingId === receivable.id}
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
        <ReceivableForm
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
