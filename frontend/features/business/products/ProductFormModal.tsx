'use client'

import { useEffect, useState } from 'react'
import FormModal from '@/shared/FormModal'
import {
  createBizProduct,
  updateBizProduct,
  getBizCategories,
  type BizProduct,
  type BizProductRequest,
  type BizCategory,
} from '@/lib/api/businessApi'
import { AlertCircle } from 'lucide-react'

interface Props {
  product?: BizProduct | null
  onClose: () => void
  onSuccess: () => void
  onOpenCategories?: () => void
}

const COMMON_UNITS = ['عدد', 'بسته', 'کیلوگرم', 'گرم', 'متر', 'کارتن', 'جفت', 'دستگاه', 'لیتر']

export default function ProductFormModal({ product, onClose, onSuccess, onOpenCategories }: Props) {
  const [categories, setCategories] = useState<BizCategory[]>([])
  const [code, setCode] = useState(product?.code || '')
  const [name, setName] = useState(product?.name || '')
  const [unit, setUnit] = useState(product?.unit || 'عدد')
  const [categoryId, setCategoryId] = useState<string>(product?.categoryId ? String(product.categoryId) : '')
  const [defaultPurchasePrice, setDefaultPurchasePrice] = useState(
    product?.defaultPurchasePrice != null ? String(product.defaultPurchasePrice) : ''
  )
  const [defaultSalePrice, setDefaultSalePrice] = useState(
    product?.defaultSalePrice != null ? String(product.defaultSalePrice) : ''
  )
  const [minStockAlert, setMinStockAlert] = useState(
    product?.minStockAlert != null ? String(product.minStockAlert) : ''
  )
  const [isActive, setIsActive] = useState(product ? product.isActive : true)
  const [notes, setNotes] = useState(product?.notes || '')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getBizCategories()
      .then(setCategories)
      .catch(() => {
        /* fail gracefully */
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim() || !name.trim() || !unit.trim()) {
      setError('کد، نام و واحد کالا الزامی هستند.')
      return
    }

    setLoading(true)
    setError(null)

    const payload: BizProductRequest = {
      code: code.trim(),
      name: name.trim(),
      unit: unit.trim(),
      categoryId: categoryId ? Number(categoryId) : null,
      defaultPurchasePrice: defaultPurchasePrice ? Number(defaultPurchasePrice) : null,
      defaultSalePrice: defaultSalePrice ? Number(defaultSalePrice) : null,
      minStockAlert: minStockAlert ? Number(minStockAlert) : null,
      isActive,
      notes: notes.trim() || undefined,
    }

    try {
      if (product) {
        await updateBizProduct(product.id, payload)
      } else {
        await createBizProduct(payload)
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت اطلاعات کالا')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormModal
      title={product ? 'ویرایش کالا' : 'تعریف کالای جدید'}
      subtitle="اطلاعات پایه، واحد، قیمت‌های پیشنهادی و حد هشدار موجودی"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-[var(--color-status-error-bg)] text-[var(--color-status-error)] border border-[var(--color-status-error-border)] flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">
              کد یکتای کالا <span className="text-[var(--color-status-error)]">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="مثال: PRD-101"
              className="form-input w-full"
              required
              autoFocus={!product}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">
              نام کالا <span className="text-[var(--color-status-error)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: روغن موتور ۴ لیتری"
              className="form-input w-full"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-[var(--color-text-primary)]">دسته‌بندی</label>
              {onOpenCategories && (
                <button
                  type="button"
                  onClick={onOpenCategories}
                  className="text-[11px] text-[var(--color-brand-accent)] hover:underline"
                >
                  + مدیریت دسته‌ها
                </button>
              )}
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="form-input w-full"
            >
              <option value="">بدون دسته / عمومی</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">
              واحد شمارش <span className="text-[var(--color-status-error)]">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="واحد"
                className="form-input flex-1"
                required
              />
              <select
                onChange={(e) => {
                  if (e.target.value) setUnit(e.target.value)
                }}
                className="form-input text-xs w-24"
                defaultValue=""
              >
                <option value="" disabled>
                  انتخاب سریع
                </option>
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">
              قیمت پیش‌فرض خرید (تومان)
            </label>
            <input
              type="number"
              min="0"
              value={defaultPurchasePrice}
              onChange={(e) => setDefaultPurchasePrice(e.target.value)}
              placeholder="پیشنهاد در فاکتور خرید"
              className="form-input w-full"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">
              قیمت پیش‌فرض فروش (تومان)
            </label>
            <input
              type="number"
              min="0"
              value={defaultSalePrice}
              onChange={(e) => setDefaultSalePrice(e.target.value)}
              placeholder="پیشنهاد در فاکتور فروش"
              className="form-input w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">
              حد هشدار کسری موجودی
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={minStockAlert}
              onChange={(e) => setMinStockAlert(e.target.value)}
              placeholder="مثال: ۵"
              className="form-input w-full"
            />
            <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5 block">
              اگر موجودی کمتر از این مقدار شود، در داشبورد هشدار داده می‌شود.
            </span>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--color-brand-accent)] border-[var(--finance-border)]"
              />
              <span className="font-semibold text-[var(--color-text-primary)]">کالای فعال (قابل خرید و فروش)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block mb-1 font-semibold text-[var(--color-text-primary)]">یادداشت و مشخصات</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="توضیحات تکمیلی کالا..."
            className="form-input w-full"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--finance-border)]">
          <button type="button" onClick={onClose} className="btn-secondary">
            انصراف
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'در حال ثبت...' : product ? 'بروزرسانی کالا' : 'افزودن کالا'}
          </button>
        </div>
      </form>
    </FormModal>
  )
}
