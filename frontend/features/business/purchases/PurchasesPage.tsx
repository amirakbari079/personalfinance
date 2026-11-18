'use client'

import Link from 'next/link'
import { ShoppingCart, Boxes, Users } from 'lucide-react'

export default function PurchasesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">فاکتورهای خرید</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1 font-[var(--font-weight-caption)]">
          ورود کالا به انبار، ثبت بهای خرید، هزینه‌های جانبی و ثبت بدهی به تأمین‌کنندگان
        </p>
      </div>

      <div className="p-12 text-center text-xs text-[var(--color-text-muted)] rounded-2xl border border-[var(--finance-border)] bg-[var(--color-surface-card)] space-y-4 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-elevated)] text-[var(--color-brand-accent)] flex items-center justify-center mx-auto">
          <ShoppingCart size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">ماژول ثبت فاکتورهای خرید (مرحلهٔ ۳)</h2>
          <p className="leading-relaxed">
            گردش کار فاکتور خرید، انتخاب سریع کالا، هزینه‌های حمل و جانبی، و افزایش خودکار موجودی انبار بر اساس روش میانگین موزون در مرحلهٔ بعد فعال خواهد شد.
          </p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <Link href="/shop/products" className="btn-secondary text-xs flex items-center gap-1.5">
            <Boxes size={14} />
            <span>مشاهدهٔ کالاها</span>
          </Link>
          <Link href="/shop/counterparties" className="btn-primary text-xs flex items-center gap-1.5">
            <Users size={14} />
            <span>تأمین‌کنندگان</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
