'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Store, ArrowLeft, ShieldCheck } from 'lucide-react'
import { getBizSummary, type BizSummary } from '@/lib/api/businessApi'
import { formatToman } from '@/utils/formatToman'

export default function ShopPersonalSummaryCard() {
  const [summary, setSummary] = useState<BizSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getBizSummary()
      .then((res) => {
        if (active) setSummary(res)
      })
      .catch(() => {
        /* Fail silently in personal view; summary is supplementary */
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="finance-panel animate-pulse p-5 rounded-2xl border border-[var(--finance-border)] bg-[var(--color-surface-card)]">
        <div className="h-6 w-48 bg-[var(--color-surface-elevated)] rounded mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-[var(--color-surface-elevated)] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!summary) return null

  return (
    <section className="finance-panel rounded-2xl border border-[var(--finance-border)] bg-[var(--color-surface-card)] p-5 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--finance-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-status-success-bg)] text-[var(--color-brand-accent)] flex items-center justify-center flex-shrink-0">
            <Store size={20} aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">نمای مالی فروشگاه</h2>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border border-[var(--finance-border)] flex items-center gap-1">
                <ShieldCheck size={12} className="text-[var(--color-brand-accent)]" />
                نمای فقط‌خواندنی
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              خلاصهٔ شاخص‌های تجاری — جدا از جمع دارایی و تراز شخصی
            </p>
          </div>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--finance-accent-bg,var(--color-status-success-bg))] text-[var(--color-brand-accent)] hover:opacity-90 transition-opacity"
        >
          <span>ورود به پنل فروشگاه</span>
          <ArrowLeft size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--finance-border)]">
          <span className="text-[11px] text-[var(--color-text-muted)] block mb-1">نقدینگی فروشگاه</span>
          <strong className="text-sm text-[var(--color-text-primary)] font-bold block">
            {formatToman(summary.cashLiquidity)}
          </strong>
          <small className="text-[10px] text-[var(--color-text-muted)] block mt-0.5">
            {summary.activeAccountsCount.toLocaleString('fa-IR')} حساب تجاری فعال
          </small>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--finance-border)]">
          <span className="text-[11px] text-[var(--color-text-muted)] block mb-1">فروش دوره ({summary.period})</span>
          <strong className="text-sm text-[var(--color-text-primary)] font-bold block">
            {formatToman(summary.salesTotal)}
          </strong>
          <small className="text-[10px] text-[var(--color-text-muted)] block mt-0.5">
            سود ناخالص: {formatToman(summary.grossProfit)}
          </small>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--finance-border)]">
          <span className="text-[11px] text-[var(--color-text-muted)] block mb-1">مطالبات از مشتریان</span>
          <strong className="text-sm text-[var(--color-text-primary)] font-bold block">
            {formatToman(summary.receivables)}
          </strong>
          <small className="text-[10px] text-[var(--color-text-muted)] block mt-0.5">
            بدهی به تأمین‌کننده: {formatToman(summary.payables)}
          </small>
        </div>

        <div className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--finance-border)]">
          <span className="text-[11px] text-[var(--color-text-muted)] block mb-1">کالا و طرف‌حساب‌ها</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              {summary.activeProductsCount.toLocaleString('fa-IR')} کالا
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]">|</span>
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              {summary.activeCounterpartiesCount.toLocaleString('fa-IR')} شخص
            </span>
          </div>
          <small className="text-[10px] text-[var(--color-text-muted)] block mt-0.5">
            ارزش موجودی: {formatToman(summary.inventoryValue)}
          </small>
        </div>
      </div>
    </section>
  )
}
