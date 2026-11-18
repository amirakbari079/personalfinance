'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Boxes, Search, Tag, Edit2, Archive, CheckCircle2, XCircle } from 'lucide-react'
import ProductFormModal from './ProductFormModal'
import CategoryModal from '../categories/CategoryModal'
import {
  getBizProducts,
  getBizCategories,
  toggleBizProductActive,
  deleteBizProduct,
  type BizProduct,
  type BizCategory,
} from '@/lib/api/businessApi'
import { formatToman } from '@/utils/formatToman'

export default function ProductsPage() {
  const [products, setProducts] = useState<BizProduct[]>([])
  const [categories, setCategories] = useState<BizCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ACTIVE')

  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<BizProduct | null>(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [prods, cats] = await Promise.all([getBizProducts(false), getBizCategories()])
      setProducts(prods)
      setCategories(cats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری فهرست کالاها')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleToggleActive(p: BizProduct) {
    try {
      await toggleBizProductActive(p.id)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطا در تغییر وضعیت کالا')
    }
  }

  async function handleArchive(p: BizProduct) {
    if (!confirm(`آیا از بایگانی کردن کالای «${p.name}» اطمینان دارید؟ سوابق تاریخی خرید و فروش این کالا حفظ خواهند شد.`))
      return
    try {
      await deleteBizProduct(p.id)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطا در بایگانی کالا')
    }
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      // Status filter
      if (statusFilter === 'ACTIVE' && !p.isActive) return false
      if (statusFilter === 'ARCHIVED' && p.isActive) return false

      // Category filter
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'NONE' && p.categoryId != null) return false
        if (selectedCategory !== 'NONE' && String(p.categoryId) !== selectedCategory) return false
      }

      // Search query
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const matchesCode = p.code.toLowerCase().includes(q)
        const matchesName = p.name.toLowerCase().includes(q)
        const matchesNotes = p.notes ? p.notes.toLowerCase().includes(q) : false
        if (!matchesCode && !matchesName && !matchesNotes) return false
      }

      return true
    })
  }, [products, search, selectedCategory, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">کالا و موجودی</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 font-[var(--font-weight-caption)]">
            تعریف کالاها، دسته‌بندی‌ها، قیمت‌های پایه و کنترل کسری انبار
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Tag size={15} />
            <span>دسته‌بندی‌ها ({categories.length.toLocaleString('fa-IR')})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null)
              setShowProductModal(true)
            }}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>افزودن کالا</span>
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="p-3 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--finance-border)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="جستجو در نام یا کد کالا..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input w-full pr-9 py-1.5 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-input text-xs py-1.5"
          >
            <option value="ALL">همهٔ دسته‌ها</option>
            <option value="NONE">بدون دسته</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <div className="flex rounded-lg border border-[var(--finance-border)] bg-[var(--color-surface-elevated)] p-0.5">
            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                statusFilter === 'ACTIVE'
                  ? 'bg-[var(--finance-accent-bg,var(--color-status-success-bg))] text-[var(--color-brand-accent)] font-semibold'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              فعال
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-[var(--finance-accent-bg,var(--color-status-success-bg))] text-[var(--color-brand-accent)] font-semibold'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              همه
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ARCHIVED')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                statusFilter === 'ARCHIVED'
                  ? 'bg-[var(--finance-accent-bg,var(--color-status-success-bg))] text-[var(--color-brand-accent)] font-semibold'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              بایگانی‌شده
            </button>
          </div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="rounded-2xl border border-[var(--finance-border)] bg-[var(--color-surface-card)] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">در حال بارگذاری لیست کالاها...</div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[var(--color-status-error)]">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-muted)] space-y-3">
            <Boxes size={36} className="mx-auto text-[var(--color-text-muted)] opacity-50" />
            <p>کالایی با این مشخصات یافت نشد.</p>
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null)
                setShowProductModal(true)
              }}
              className="btn-primary text-xs"
            >
              ثبت نخستین کالا
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[var(--color-surface-elevated)] border-b border-[var(--finance-border)] text-[var(--color-text-muted)]">
                <tr>
                  <th className="p-3 font-semibold">کد کالا</th>
                  <th className="p-3 font-semibold">نام کالا</th>
                  <th className="p-3 font-semibold">دسته</th>
                  <th className="p-3 font-semibold">واحد</th>
                  <th className="p-3 font-semibold">قیمت خرید (تومان)</th>
                  <th className="p-3 font-semibold">قیمت فروش (تومان)</th>
                  <th className="p-3 font-semibold">حد هشدار</th>
                  <th className="p-3 font-semibold text-center">وضعیت</th>
                  <th className="p-3 font-semibold text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--finance-border)]">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-[var(--color-surface-elevated)] transition-colors ${
                      !p.isActive ? 'opacity-60 bg-[var(--color-surface-elevated)]/30' : ''
                    }`}
                  >
                    <td className="p-3 font-mono font-medium text-[var(--color-text-primary)]">{p.code}</td>
                    <td className="p-3">
                      <strong className="text-[var(--color-text-primary)] font-semibold">{p.name}</strong>
                      {p.notes && (
                        <p className="text-[10px] text-[var(--color-text-muted)] truncate max-w-xs">{p.notes}</p>
                      )}
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)]">{p.categoryName || '—'}</td>
                    <td className="p-3 font-medium text-[var(--color-text-primary)]">{p.unit}</td>
                    <td className="p-3 font-mono text-[var(--color-text-primary)]">
                      {p.defaultPurchasePrice != null ? formatToman(p.defaultPurchasePrice) : '—'}
                    </td>
                    <td className="p-3 font-mono text-[var(--color-text-primary)]">
                      {p.defaultSalePrice != null ? formatToman(p.defaultSalePrice) : '—'}
                    </td>
                    <td className="p-3 font-mono text-[var(--color-text-muted)]">
                      {p.minStockAlert != null ? p.minStockAlert.toLocaleString('fa-IR') : '—'}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                          p.isActive
                            ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border border-[var(--color-status-success-border)]'
                            : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border border-[var(--finance-border)]'
                        }`}
                        title="برای تغییر وضعیت کلیک کنید"
                      >
                        {p.isActive ? (
                          <>
                            <CheckCircle2 size={11} />
                            <span>فعال</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={11} />
                            <span>بایگانی</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(p)
                            setShowProductModal(true)
                          }}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                          title="ویرایش"
                        >
                          <Edit2 size={14} />
                        </button>
                        {p.isActive && (
                          <button
                            type="button"
                            onClick={() => handleArchive(p)}
                            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-status-error)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                            title="بایگانی"
                          >
                            <Archive size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showProductModal && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setShowProductModal(false)}
          onSuccess={loadData}
          onOpenCategories={() => setShowCategoryModal(true)}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          onClose={() => setShowCategoryModal(false)}
          onChanged={loadData}
        />
      )}
    </div>
  )
}
