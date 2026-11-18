'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Store,
  Boxes,
  Users,
  BadgeDollarSign,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Wallet,
  TrendingUp,
  Scale,
} from 'lucide-react'
import { getBizSummary, type BizSummary } from '@/lib/api/businessApi'
import { formatToman } from '@/utils/formatToman'

export default function ShopDashboardPage() {
  const [summary, setSummary] = useState<BizSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const data = await getBizSummary()
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری خلاصه اطلاعات فروشگاه')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" role="status" aria-label="در حال بارگذاری داشبورد فروشگاه">
        <div className="h-10 w-64 bg-[var(--color-surface-elevated)] rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[var(--color-surface-card)] rounded-2xl border border-[var(--finance-border)]" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-[var(--color-surface-card)] rounded-2xl border border-[var(--finance-border)]" />
          <div className="h-44 bg-[var(--color-surface-card)] rounded-2xl border border-[var(--finance-border)]" />
        </div>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="p-8 text-center text-xs space-y-4 rounded-2xl border border-[var(--finance-border)] bg-[var(--color-surface-card)]">
        <RefreshCw size={32} className="mx-auto text-[var(--color-status-error)]" />
        <p className="text-[var(--color-status-error)]">{error || 'خطا در دریافت اطلاعات فروشگاه'}</p>
        <button type="button" onClick={loadData} className="btn-primary text-xs">
          تلاش دوباره
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">نمای فروشگاه</h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--color-status-success-bg)] text-[var(--color-brand-accent)] border border-[var(--color-status-success-border)] flex items-center gap-1">
              <Store size={13} />
              فضای کاری کسب‌وکار
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 font-[var(--font-weight-caption)]">
            شاخص‌های فروش، سود ناخالص، نقدینگی و وضعیت موجودی کالا — کاملاً تفکیک‌شده از دارایی‌های شخصی
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/shop/products" className="btn-secondary text-xs flex items-center gap-1.5">
            <Boxes size={15} />
            <span>مدیریت کالاها</span>
          </Link>
          <Link href="/shop/accounts" className="btn-primary text-xs flex items-center gap-1.5">
            <BadgeDollarSign size={15} />
            <span>حساب‌ها و نقدینگی</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cash Liquidity */}
        <Link
          href="/shop/accounts"
          className="p-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--finance-border)] shadow-sm hover:border-[var(--color-brand-accent)] transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--color-text-muted)]">نقدینگی در دسترس فروشگاه</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-status-success-bg)] text-[var(--color-brand-accent)] flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <strong className="text-xl font-bold text-[var(--color-text-primary)] block font-mono">
            {formatToman(summary.cashLiquidity)}
          </strong>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--finance-border)] text-[11px]">
            <span className="text-[var(--color-text-muted)]">
              {summary.activeAccountsCount.toLocaleString('fa-IR')} حساب تجاری فعال
            </span>
            <span className="text-[var(--color-brand-accent)] flex items-center gap-0.5 group-hover:translate-x-[-2px] transition-transform">
              <span>جزئیات</span>
              <ArrowLeft size={12} />
            </span>
          </div>
        </Link>

        {/* Sales in Period */}
        <div className="p-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--finance-border)] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--color-text-muted)]">فروش دوره ({summary.period})</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-elevated)] text-[var(--color-chart-2,#70c6e8)] flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <strong className="text-xl font-bold text-[var(--color-text-primary)] block font-mono">
            {formatToman(summary.salesTotal)}
          </strong>
          <div className="mt-2 pt-2 border-t border-[var(--finance-border)] text-[11px] text-[var(--color-text-muted)]">
            فاکتورهای نهایی ثبت‌شده در بازه
          </div>
        </div>

        {/* Gross Profit */}
        <div className="p-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--finance-border)] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--color-text-muted)]">سود ناخالص بازه</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-elevated)] text-[var(--color-brand-accent)] flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <strong className="text-xl font-bold text-[var(--color-text-primary)] block font-mono">
            {formatToman(summary.grossProfit)}
          </strong>
          <div className="mt-2 pt-2 border-t border-[var(--finance-border)] text-[11px] text-[var(--color-text-muted)]">
            مبلغ خالص فروش − بهای تمام‌شده کالای فروش‌رفته
          </div>
        </div>

        {/* Inventory Value */}
        <Link
          href="/shop/products"
          className="p-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--finance-border)] shadow-sm hover:border-[var(--color-brand-accent)] transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--color-text-muted)]">ارزش ریالی موجودی انبار</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-elevated)] text-[var(--color-chart-3,#91b4d3)] flex items-center justify-center">
              <Boxes size={16} />
            </div>
          </div>
          <strong className="text-xl font-bold text-[var(--color-text-primary)] block font-mono">
            {formatToman(summary.inventoryValue)}
          </strong>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--finance-border)] text-[11px]">
            <span className="text-[var(--color-text-muted)]">
              {summary.activeProductsCount.toLocaleString('fa-IR')} کالای فعال
            </span>
            <span className="text-[var(--color-brand-accent)] flex items-center gap-0.5 group-hover:translate-x-[-2px] transition-transform">
              <span>انبار</span>
              <ArrowLeft size={12} />
            </span>
          </div>
        </Link>
      </div>

      {/* Counterparties & Receivables/Payables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Receivables & Payables Card */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--finance-border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale size={18} className="text-[var(--color-brand-accent)]" />
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">وضعیت تعهدات و مطالبات تجاری</h2>
            </div>
            <Link href="/shop/counterparties" className="text-xs text-[var(--color-brand-accent)] hover:underline flex items-center gap-1">
              <span>طرف‌حساب‌ها</span>
              <ArrowLeft size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--finance-border)]">
              <span className="text-[11px] text-[var(--color-text-muted)] block mb-1">طلب از مشتریان (مطالبات)</span>
              <strong className="text-base font-bold text-[var(--color-text-primary)] font-mono block">
                {formatToman(summary.receivables)}
              </strong>
              <small className="text-[10px] text-[var(--color-text-muted)] mt-0.5 block">فروش‌های نسیه و تسویه‌نشده</small>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--finance-border)]">
              <span className="text-[11px] text-[var(--color-text-muted)] block mb-1">بدهی به تأمین‌کنندگان</span>
              <strong className="text-base font-bold text-[var(--color-text-primary)] font-mono block">
                {formatToman(summary.payables)}
              </strong>
              <small className="text-[10px] text-[var(--color-text-muted)] mt-0.5 block">خریدهای نسیه و تسویه‌نشده</small>
            </div>
          </div>
        </div>

        {/* Quick Navigation / Workflows */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--finance-border)] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Store size={18} className="text-[var(--color-brand-accent)]" />
            <h2 className="text-sm font-bold text-[var(--color-text-primary)]">مسیرهای کاری فروشگاه</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link
              href="/shop/products"
              className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--finance-border)] hover:border-[var(--color-brand-accent)] transition-all flex items-center gap-3"
            >
              <Boxes size={20} className="text-[var(--color-brand-accent)] flex-shrink-0" />
              <div>
                <strong className="text-[var(--color-text-primary)] block">کالا و موجودی</strong>
                <span className="text-[10px] text-[var(--color-text-muted)]">{summary.activeProductsCount} کالا</span>
              </div>
            </Link>

            <Link
              href="/shop/counterparties"
              className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--finance-border)] hover:border-[var(--color-brand-accent)] transition-all flex items-center gap-3"
            >
              <Users size={20} className="text-[var(--color-chart-2,#70c6e8)] flex-shrink-0" />
              <div>
                <strong className="text-[var(--color-text-primary)] block">طرف‌حساب‌ها</strong>
                <span className="text-[10px] text-[var(--color-text-muted)]">{summary.activeCounterpartiesCount} شخص</span>
              </div>
            </Link>

            <Link
              href="/shop/accounts"
              className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--finance-border)] hover:border-[var(--color-brand-accent)] transition-all flex items-center gap-3"
            >
              <BadgeDollarSign size={20} className="text-[var(--color-chart-3,#91b4d3)] flex-shrink-0" />
              <div>
                <strong className="text-[var(--color-text-primary)] block">حساب‌های تجاری</strong>
                <span className="text-[10px] text-[var(--color-text-muted)]">{summary.activeAccountsCount} حساب</span>
              </div>
            </Link>

            <Link
              href="/shop/sales"
              className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--finance-border)] hover:border-[var(--color-brand-accent)] transition-all flex items-center gap-3"
            >
              <ShoppingBag size={20} className="text-[var(--color-chart-4,#e99b88)] flex-shrink-0" />
              <div>
                <strong className="text-[var(--color-text-primary)] block">فاکتورهای فروش</strong>
                <span className="text-[10px] text-[var(--color-text-muted)]">مرحله ۴</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Accounting & Integrity Rules Note */}
      <div className="p-4 rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--finance-border)] text-xs text-[var(--color-text-muted)] space-y-2">
        <div className="flex items-center gap-2 font-semibold text-[var(--color-text-primary)]">
          <ShieldCheck size={16} className="text-[var(--color-brand-accent)]" />
          <span>قواعد انضباط مالی و حسابداری فروشگاه</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
          <li>
            <strong>تفکیک مطلق منابع حقیقت:</strong> اطلاعات، موجودی و حساب‌های فروشگاه هیچ‌گونه اثر خودکاری بر دارایی‌ها یا تراز ثروت شخصی ندارند.
          </li>
          <li>
            <strong>روش بهای تمام‌شده:</strong> ارزیابی ارزش موجودی و سود فروش‌ها طبق استاندارد «میانگین موزون متحرک (Moving Weighted Average)» محاسبه می‌شود.
          </li>
          <li>
            <strong>ثبت قطعی و اتمیک:</strong> اسناد نهایی غیرقابل حذف خاموش هستند و اصلاحات مالی صرفاً با اسناد ابطال و جایگزین یا برگشت ارجاع‌دار انجام می‌شوند.
          </li>
        </ul>
      </div>
    </div>
  )
}
