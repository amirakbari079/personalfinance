'use client'

import { useCallback, useEffect, useState } from 'react'
import { X, Plus } from 'lucide-react'
import type { SnapshotEntry, SnapshotRequest } from '@/lib/api/historyApi'
import EntityHistoryList from '@/shared/history/EntityHistoryList'
import SnapshotEntryForm from '@/shared/history/SnapshotEntryForm'
import type { EntityHistoryConfig } from '@/shared/history/historyTypes'
import FormModal from '@/shared/FormModal'

export interface EntitySnapshotApi {
  list: (entityId: number) => Promise<SnapshotEntry[]>
  create: (entityId: number, data: SnapshotRequest) => Promise<SnapshotEntry>
  update: (entityId: number, snapshotId: number, data: SnapshotRequest) => Promise<SnapshotEntry>
  delete: (entityId: number, snapshotId: number) => Promise<void>
}

interface Props {
  entityId: number
  entityName: string
  title: string
  config: EntityHistoryConfig
  api: EntitySnapshotApi
  footerNote: string
  onClose: () => void
  onValueChanged?: () => void
  readOnly?: boolean
}

export default function EntityHistoryModal({
  entityId,
  entityName,
  title,
  config,
  api,
  footerNote,
  onClose,
  onValueChanged,
  readOnly = false,
}: Props) {
  const [entries, setEntries] = useState<SnapshotEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<SnapshotEntry | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setEntries(await api.list(entityId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا')
    } finally {
      setIsLoading(false)
    }
  }, [api, entityId])

  useEffect(() => { load() }, [load])

  function openNew() {
    setEditingEntry(null)
    setShowForm(true)
  }

  function openEdit(entry: SnapshotEntry) {
    setEditingEntry(entry)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingEntry(null)
  }

  async function handleSave(data: SnapshotRequest) {
    if (editingEntry) {
      await api.update(entityId, editingEntry.id, data)
    } else {
      await api.create(entityId, data)
    }
    closeForm()
    await load()
    onValueChanged?.()
  }

  async function handleDelete(entry: SnapshotEntry) {
    if (!confirm(`رکورد ${entry.recordedDateJalali} حذف شود؟`)) return
    setDeletingId(entry.id)
    setError(null)
    try {
      await api.delete(entityId, entry.id)
      await load()
      onValueChanged?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در حذف')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <FormModal
      title={title}
      subtitle={entityName}
      wide
      onClose={onClose}
      headerAction={
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          className="text-text-muted hover:text-text-primary p-1 rounded transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      }
      footer={
        <p className="text-[10px] text-text-muted leading-relaxed">{footerNote}</p>
      }
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-text-muted">{readOnly ? 'سوابق محفوظ؛ تغییرات جدید از دفتر تراکنش' : 'مدیریت رکوردهای تاریخی'}</p>
        {!readOnly && !showForm && (
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-1 text-xs text-brand-accent hover:text-brand-accent-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            ثبت رکورد
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5 mb-4">
          {error}
        </p>
      )}

      {showForm && (
        <SnapshotEntryForm
          key={editingEntry?.id ?? 'new'}
          initial={editingEntry}
          valueFieldLabel={config.valueFieldLabel}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}

      <EntityHistoryList
        entries={entries}
        config={config}
        isLoading={isLoading}
        onEdit={readOnly ? undefined : openEdit}
        onDelete={readOnly ? undefined : handleDelete}
        deletingId={deletingId}
      />
    </FormModal>
  )
}
