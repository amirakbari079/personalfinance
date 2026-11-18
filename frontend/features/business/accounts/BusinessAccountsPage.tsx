'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  BadgeDollarSign,
  Landmark,
  Wallet,
  Coins,
  Receipt,
  Edit2,
  Archive,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from 'lucide-react'
import BusinessAccountFormModal from './BusinessAccountFormModal'
import {
  getBizAccounts,
  toggleBizAccountActive,
  deleteBizAccount,
  type BizAccount,
} from '@/lib/api/businessApi'
import { formatToman } from '@/utils/formatToman'
import DateObject from 'react-date-object'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import gregorian from 'react-date-object/calendars/gregorian'
import gregorian_en from 'react-date-object/locales/gregorian_en'

function formatIsoToJalali(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    const obj = new DateObject({ date: iso, calendar: gregorian, locale: gregorian_en })
    return obj.convert(persian, persian_fa).format('YYYY/MM/DD')
  } catch {
    return iso
  }
}

export default function BusinessAccountsPage() {
  const [accounts, setAccounts] = useState<BizAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BANK' | 'CASH' | 'WALLET' | 'PETTY_CASH'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ACTIVE')

  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BizAccount | null>(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const data = await getBizAccounts(false)
      setAccounts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت حساب‌های کسب‌وکار')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleToggleActive(acc: BizAccount) {
    try {
      await toggleBizAccountActive(acc.id)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطا در تغییر وضعیت حساب')
    }
  }

  async function handleArchive(acc: BizAccount) {
    if (!confirm(`آیا از بایگانی حساب «${acc.name}» اطمینان دارید؟ سوابق تراکنش‌ها و اسناد مرتبط حفظ خواهند شد.`))
      return
    try {
      await deleteBizAccount(acc.id)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطا در بایگانی حساب')
    }
  }

  const activeTotalLiquidity = useMemo(() => {
    return accounts
      .filter((a) => a.isActive)
      .reduce((sum, a) => sum + (a.openingBalance || 0), 0)
  }, [accounts])

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      if (statusFilter === 'ACTIVE' && !a.isActive) return false
      if (statusFilter === 'ARCHIVED' && a.isActive) return false
      if (typeFilter !== 'ALL' && a.type !== typeFilter) return false
      return true
    })
  }, [accounts, statusFilter, typeFilter])

  function getTypeDetails(type: string) {
    switch (type) {
      case 'BANK':
        return {
          label: 'حساب بانکی / کارتخوان',
          icon: Landmark,
          color: 'text-[var(--color-brand-accent)]',
          bg: 'bg-[var(--color-status-success-bg)]',
        }
      case 'CASH':
        return {
          label: 'صندوق نقد / دخل',
          icon: Wallet,
          color: 'text-[var(--color-chart-2,#70c6e8)]',
          bg: 'bg-[var(--color-surface-elevated)]',
        }
      case 'WALLET':
        return {
          label: 'کیف‌پول دیجیتال / صرافی',
          icon: Coins,
          color: 'text-[var(--color-chart-3,#91b4d3)]',
          bg: 'bg-[var(--color-surface-elevated)]',
        }
      case 'PETTY_CASH':
        return {
          label: 'تنخواه گردان',
          icon: Receipt,
          color: 'text-[var(--color-chart-4,#e99b88)]',
          bg: 'bg-[var(--color-surface-elevated)]',
        }
      default:
        return {
          label: 'حساب تجاری',
          icon: BadgeDollarSign,
          color: 'text-[var(--color-text-primary)]',
          bg: 'bg-[var(--color-surface-elevated)]',
        }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">حساب‌های کسب‌وکار</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 font-[var(--font-weight-caption)]">
            صندوق‌ها، حساب‌های بانکی، کارتخوان و تنخواه‌های فروشگاه — کاملاً مستقل از حساب‌های شخصی
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingAccount(null)
            setShowModal(true)
          }}
          className="btn-primary text-xs flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>افتتاح حساب جدید</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--finance-border)] shadow-sm">
          <span className="text-xs text-[var(--color-text-muted)] block mb-1">جمع نقدینگی افتتاحیه فعال</span>
          <strong className="text-xl font-bold text-[var(--color-text-primary)] block font-mono">
            {formatToman(activeTotalLiquidity)}
          </strong>
          <small className="text-[11px] text-[var(--color-text-muted)] mt-1 block">
            بر مبنای ماندهٔ اولیه حساب‌های فعال
          </small>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--finance-border)] shadow-sm">
          <span className="text-xs text-[var(--color-text-muted)] block mb-1">تعداد حساب‌های تعریف‌شده</span>
          <strong className="text-xl font-bold text-[var(--color-text-primary)] block">
            {accounts.filter((a) => a.isActive).length.toLocaleString('fa-IR')}{' '}
            <span className="text-xs font-normal text-[var(--color-text-muted)]">
              از {accounts.length.toLocaleString('fa-IR')} حساب
            </span>
          </strong>
          <small className="text-[11px] text-[var(--color-brand-accent)] mt-1 flex items-center gap-1">
            <ShieldCheck size={13} />
            <span>تفکیک‌شده از موجودی شخصی</span>
          </small>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--finance-border)] shadow-sm flex flex-col justify-center">
          <span className="text-xs text-[var(--color-text-muted)] block mb-1">قاعدهٔ چرخه مالی فروشگاه</span>
          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
            دریافت‌ها و پرداخت‌های فاکتورها مستقیماً به این حساب‌ها متصل شده و نقدینگی را به‌صورت لحظه‌ای محاسبه می‌کنند.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--finance-border)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="form-input text-xs py-1.5"
          >
            <option value="ALL">همهٔ انواع حساب‌ها</option>
            <option value="BANK">بانک و کارتخوان</option>
            <option value="CASH">صندوق و دخل</option>
            <option value="WALLET">کیف‌پول دیجیتال</option>
            <option value="PETTY_CASH">تنخواه گردان</option>
          </select>
        </div>

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
            حساب‌های فعال
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

      {/* Account Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[var(--color-text-muted)]">در حال بارگذاری حساب‌ها...</div>
      ) : error ? (
        <div className="p-12 text-center text-xs text-[var(--color-status-error)]">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-[var(--color-text-muted)] rounded-2xl border border-[var(--finance-border)] bg-[var(--color-surface-card)] space-y-3">
          <BadgeDollarSign size={40} className="mx-auto text-[var(--color-text-muted)] opacity-50" />
          <p>هیچ حسابی با این مشخصات یافت نشد.</p>
          <button
            type="button"
            onClick={() => {
              setEditingAccount(null)
              setShowModal(true)
            }}
            className="btn-primary text-xs"
          >
            افتتاح اولین حساب فروشگاه
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((acc) => {
            const meta = getTypeDetails(acc.type)
            const Icon = meta.icon

            return (
              <div
                key={acc.id}
                className={`p-4 rounded-2xl border border-[var(--finance-border)] bg-[var(--color-surface-card)] shadow-sm flex flex-col justify-between transition-all ${
                  !acc.isActive ? 'opacity-60 bg-[var(--color-surface-elevated)]/30' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl ${meta.bg} ${meta.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-[var(--color-text-primary)] block">
                          {acc.name}
                        </strong>
                        <span className="text-[11px] text-[var(--color-text-muted)]">{meta.label}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(acc)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                        acc.isActive
                          ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border border-[var(--color-status-success-border)]'
                          : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border border-[var(--finance-border)]'
                      }`}
                      title="تغییر وضعیت فعال/غیرفعال"
                    >
                      {acc.isActive ? (
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
                  </div>

                  {acc.accountNumber && (
                    <div className="mb-2 text-xs font-mono text-[var(--color-text-muted)] text-left truncate" dir="ltr">
                      {acc.accountNumber}
                    </div>
                  )}

                  <div className="my-3 p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--finance-border)]">
                    <span className="text-[11px] text-[var(--color-text-muted)] block mb-0.5">مانده افتتاحیه</span>
                    <strong className="text-base font-bold text-[var(--color-text-primary)] block font-mono">
                      {formatToman(acc.openingBalance)}
                    </strong>
                    <span className="text-[10px] text-[var(--color-text-muted)] block mt-0.5">
                      تاریخ افتتاحیه: {formatIsoToJalali(acc.openingBalanceDate)}
                    </span>
                  </div>

                  {acc.notes && (
                    <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-2 mb-2">
                      {acc.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1 pt-3 border-t border-[var(--finance-border)]">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAccount(acc)
                      setShowModal(true)
                    }}
                    className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                    title="ویرایش"
                  >
                    <Edit2 size={15} />
                  </button>
                  {acc.isActive && (
                    <button
                      type="button"
                      onClick={() => handleArchive(acc)}
                      className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-status-error)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                      title="بایگانی"
                    >
                      <Archive size={15} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <BusinessAccountFormModal
          account={editingAccount}
          onClose={() => setShowModal(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  )
}
