'use client'

import Link from 'next/link'
import { ShoppingBag, Boxes, Users } from 'lucide-react'

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">فاکتورهای فروش</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1 font-[var(--font-weight-caption)]">
          صدور فاکتور فروش، خروج کالا از انبار، محاسبهٔ سود ناخالص لحظه‌ای و ثبت مطالبات از مشتریان
        </p>
      </div>

      <div className="p-12 text-center text-xs text-[var(--color-text-muted)] rounded-2xl border border-[var(--finance-border)] bg-[var(--color-surface-card)] space-y-4 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-elevated)] text-[var(--color-brand-accent)] flex items-center justify-center mx-auto">
          <ShoppingBag size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">ماژول صدور فاکتورهای فروش (مرحلهٔ ۴)</h2>
          <p className="leading-relaxed">
            صدور فاکتور با انتخاب کالا، ثبت تخفیف‌ها، بهای تمام‌شده قطعی لحظه فروش و تسویه نقدی/نسیه در مرحلهٔ ۴ فعال می‌شود.
          </p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <Link href="/shop/products" className="btn-secondary text-xs flex items-center gap-1.5">
            <Boxes size={14} />
            <span>فهرست کالاها</span>
          </Link>
          <Link href="/shop/counterparties" className="btn-primary text-xs flex items-center gap-1.5">
            <Users size={14} />
            <span>مشتریان</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
