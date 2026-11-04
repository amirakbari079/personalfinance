'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  type Standby,
  type StandbyRequest,
  getStandbyItems,
  createStandbyItem,
  updateStandbyItem,
  deleteStandbyItem,
  exportStandbyCsv,
} from '@/lib/api/standbyApi'
import StandbyForm from './StandbyForm'
import { Pencil, Trash2, Package } from 'lucide-react'
import { formatJalali } from '@/utils/jalaliUtils'
import PageHeader from '@/shared/PageHeader'
import ListIcon from '@/shared/ListIcon'
import StatusTag from '@/shared/StatusTag'
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

export default function StandbyPage() {
  const [items, setItems] = useState<Standby[]>([])
  const [sortId, setSortId] = useState<SortOptionId>(DEFAULT_SORT)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Standby | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function load() {
    try {
      const list = await getStandbyItems()
      setItems(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در بارگذاری')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const total = sumAmounts(items.map((i) => i.totalValue))

  const sortedItems = useMemo(
    () => sortItems(items, sortId, {
      getName: (i) => i.itemLabel,
      getAmount: (i) => i.totalValue,
      getCreatedAt: (i) => i.createdAt,
      getDate: (i) => i.dateAdded,
    }),
    [items, sortId],
  )

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

      {items.length > 0 && (
        <ListSortBar value={sortId} options={SORT_OPTIONS} onChange={setSortId} />
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          هنوز کالایی ثبت نشده. اولین کالای معوق را اضافه کنید.
        </div>
      ) : (
        <div className="space-y-2">
          {sortedItems.map(item => (
            <div
              key={item.id}
              className="glass-card px-5 py-4 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <ListIcon icon={Package} variant="secondary" />
                <div>
                  <p className="text-sm text-item-title text-text-primary">{item.itemLabel}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {item.quantity.toLocaleString('fa-IR')} عدد × {formatToman(item.expectedUnitPrice)}
                    {item.dateAdded && ` • ${formatJalali(item.dateAdded)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <StatusTag variant="success" className="text-sm tabular-nums">
                  + {formatToman(item.totalValue)}
                </StatusTag>
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

      {items.length > 0 && (
        <TotalFooter value={total} formatValue={formatToman} />
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
