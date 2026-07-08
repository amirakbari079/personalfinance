'use client'

import { useEffect, useState } from 'react'
import {
  type Standby,
  type StandbyRequest,
  getStandbyItems,
  getStandbyTotal,
  createStandbyItem,
  updateStandbyItem,
  deleteStandbyItem,
  exportStandbyCsv,
} from '@/lib/api/standbyApi'
import StandbyForm from './StandbyForm'
import { Pencil, Trash2 } from 'lucide-react'
import { formatJalali } from '@/utils/jalaliUtils'
import PageHeader from '@/shared/PageHeader'

export default function StandbyPage() {
  const [items, setItems] = useState<Standby[]>([])
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Standby | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function load() {
    try {
      const [list, tot] = await Promise.all([getStandbyItems(), getStandbyTotal()])
      setItems(list)
      setTotal(tot)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در بارگذاری')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleSave(data: StandbyRequest) {
    if (editing) {
      await updateStandbyItem(editing.id, data)
    } else {
      await createStandbyItem(data)
    }
    setShowForm(false)
    setEditing(null)
    load()
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await deleteStandbyItem(id)
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
        title="کالاهای معوق"
        subtitle={`مجموع ارزش: ${formatToman(total)}`}
        addLabel="+ کالای جدید"
        onAdd={() => { setEditing(null); setShowForm(true) }}
        onExport={exportStandbyCsv}
      />

      {error && (
        <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5 mb-4">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          هنوز کالایی ثبت نشده. اولین کالای معوق را اضافه کنید.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div
              key={item.id}
              className="luxury-card px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-accent text-base">📦</span>
                </div>
                <div>
                  <p className="text-sm text-item-title text-text-primary">{item.itemLabel}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {item.quantity.toLocaleString('fa-IR')} عدد × {formatToman(item.expectedUnitPrice)}
                    {item.dateAdded && ` • ${formatJalali(item.dateAdded)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm text-amount text-text-primary">
                  <span className="text-brand-accent">+</span> {formatToman(item.totalValue)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditing(item); setShowForm(true) }}
                    title="ویرایش"
                    aria-label="ویرایش"
                    className="text-text-muted hover:text-brand-accent transition-colors p-1.5 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
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
        <StandbyForm
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
