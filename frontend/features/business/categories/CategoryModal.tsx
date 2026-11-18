'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Check, AlertCircle } from 'lucide-react'
import FormModal from '@/shared/FormModal'
import {
  getBizCategories,
  createBizCategory,
  updateBizCategory,
  deleteBizCategory,
  type BizCategory,
} from '@/lib/api/businessApi'

interface Props {
  onClose: () => void
  onChanged?: () => void
}

export default function CategoryModal({ onClose, onChanged }: Props) {
  const [categories, setCategories] = useState<BizCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getBizCategories()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری دسته‌ها')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await createBizCategory({ name: newName.trim(), description: newDesc.trim() || undefined })
      setNewName('')
      setNewDesc('')
      await load()
      onChanged?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت دسته')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(id: number) {
    if (!editName.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await updateBizCategory(id, { name: editName.trim(), description: editDesc.trim() || undefined })
      setEditingId(null)
      await load()
      onChanged?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ویرایش دسته')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) return
    setError(null)
    try {
      await deleteBizCategory(id)
      await load()
      onChanged?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف دسته')
    }
  }

  return (
    <FormModal title="مدیریت دسته‌بندی کالاها" subtitle="دسته‌های کالایی جهت نظم‌دهی و گزارش‌گیری" onClose={onClose}>
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-[var(--color-status-error-bg)] text-[var(--color-status-error)] border border-[var(--color-status-error-border)] flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Create new category */}
        <form onSubmit={handleCreate} className="p-3 rounded-xl border border-[var(--finance-border)] bg-[var(--color-surface-elevated)] space-y-3">
          <span className="text-xs font-semibold text-[var(--color-text-primary)] block">افزودن دسته‌بندی جدید</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="نام دسته (مثال: پوشاک، لوازم یدکی)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="form-input text-xs"
              required
            />
            <input
              type="text"
              placeholder="توضیحات (اختیاری)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="form-input text-xs"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !newName.trim()}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <Plus size={14} />
            <span>ثبت دسته</span>
          </button>
        </form>

        {/* Existing categories list */}
        <div className="border border-[var(--finance-border)] rounded-xl overflow-hidden max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">در حال دریافت دسته‌ها...</div>
          ) : categories.length === 0 ? (
            <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">هیچ دسته‌ای تعریف نشده است.</div>
          ) : (
            <ul className="divide-y divide-[var(--finance-border)]">
              {categories.map((c) => (
                <li key={c.id} className="p-2.5 flex items-center justify-between gap-2 text-xs hover:bg-[var(--color-surface-elevated)] transition-colors">
                  {editingId === c.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="form-input text-xs py-1"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="توضیحات"
                        className="form-input text-xs py-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdate(c.id)}
                        className="text-[var(--color-status-success)] p-1 hover:opacity-80"
                        title="ذخیره"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <strong className="text-[var(--color-text-primary)] font-semibold">{c.name}</strong>
                      {c.description && <span className="text-[var(--color-text-muted)] mr-2">({c.description})</span>}
                    </div>
                  )}

                  {editingId !== c.id && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(c.id)
                          setEditName(c.name)
                          setEditDesc(c.description || '')
                        }}
                        className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                        title="ویرایش"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="p-1 text-[var(--color-status-error)] hover:opacity-80"
                        title="حذف"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </FormModal>
  )
}
