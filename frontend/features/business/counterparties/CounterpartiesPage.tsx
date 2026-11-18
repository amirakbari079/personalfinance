'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Users, Search, Phone, Edit2, Archive, CheckCircle2, XCircle } from 'lucide-react'
import CounterpartyFormModal from './CounterpartyFormModal'
import {
  getBizCounterparties,
  toggleBizCounterpartyActive,
  deleteBizCounterparty,
  type BizCounterparty,
} from '@/lib/api/businessApi'

export default function CounterpartiesPage() {
  const [counterparties, setCounterparties] = useState<BizCounterparty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMER' | 'SUPPLIER' | 'BOTH'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ACTIVE')

  const [showModal, setShowModal] = useState(false)
  const [editingCounterparty, setEditingCounterparty] = useState<BizCounterparty | null>(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const data = await getBizCounterparties(false)
      setCounterparties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری طرف‌حساب‌ها')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleToggleActive(c: BizCounterparty) {
    try {
      await toggleBizCounterpartyActive(c.id)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطا در تغییر وضعیت طرف‌حساب')
    }
  }

  async function handleArchive(c: BizCounterparty) {
    if (!confirm(`آیا از بایگانی طرف‌حساب «${c.name}» اطمینان دارید؟ سوابق مالی و تراکنش‌های ایشان حفظ خواهند شد.`))
      return
    try {
      await deleteBizCounterparty(c.id)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'خطا در بایگانی طرف‌حساب')
    }
  }

  const filtered = useMemo(() => {
    return counterparties.filter((c) => {
      // Status filter
      if (statusFilter === 'ACTIVE' && !c.isActive) return false
      if (statusFilter === 'ARCHIVED' && c.isActive) return false

      // Role filter
      if (roleFilter !== 'ALL' && c.role !== roleFilter) return false

      // Search query
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const matchesCode = c.code.toLowerCase().includes(q)
        const matchesName = c.name.toLowerCase().includes(q)
        const matchesPhone = c.phone ? c.phone.toLowerCase().includes(q) : false
        if (!matchesCode && !matchesName && !matchesPhone) return false
      }

      return true
    })
  }, [counterparties, search, roleFilter, statusFilter])

  function getRoleBadge(role: string) {
    switch (role) {
      case 'CUSTOMER':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--color-surface-elevated)] text-[var(--color-brand-accent)] border border-[var(--finance-border)]">
            مشتری
          </span>
        )
      case 'SUPPLIER':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--color-surface-elevated)] text-[var(--color-chart-2,#70c6e8)] border border-[var(--finance-border)]">
            تأمین‌کننده
          </span>
        )
      case 'BOTH':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--color-surface-elevated)] text-[var(--color-chart-3,#91b4d3)] border border-[var(--finance-border)]">
            مشتری و تأمین‌کننده
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">طرف‌حساب‌ها</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 font-[var(--font-weight-caption)]">
            مدیریت مشتریان، تأمین‌کنندگان، بدهکاران و بستانکاران تجاری فروشگاه
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingCounterparty(null)
            setShowModal(true)
          }}
          className="btn-primary text-xs flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>افزودن طرف‌حساب</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="p-3 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--finance-border)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="جستجو در نام، کد یا شماره تماس..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input w-full pr-9 py-1.5 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'CUSTOMER' | 'SUPPLIER' | 'BOTH')}
            className="form-input text-xs py-1.5"
          >
            <option value="ALL">همهٔ نقش‌ها</option>
            <option value="CUSTOMER">فقط مشتریان</option>
            <option value="SUPPLIER">فقط تأمین‌کنندگان</option>
            <option value="BOTH">هردو نقش</option>
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

      {/* List Table */}
      <div className="rounded-2xl border border-[var(--finance-border)] bg-[var(--color-surface-card)] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">در حال بارگذاری طرف‌حساب‌ها...</div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[var(--color-status-error)]">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-muted)] space-y-3">
            <Users size={36} className="mx-auto text-[var(--color-text-muted)] opacity-50" />
            <p>طرف‌حسابی یافت نشد.</p>
            <button
              type="button"
              onClick={() => {
                setEditingCounterparty(null)
                setShowModal(true)
              }}
              className="btn-primary text-xs"
            >
              ثبت نخستین طرف‌حساب
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[var(--color-surface-elevated)] border-b border-[var(--finance-border)] text-[var(--color-text-muted)]">
                <tr>
                  <th className="p-3 font-semibold">کد</th>
                  <th className="p-3 font-semibold">نام و طرف‌حساب</th>
                  <th className="p-3 font-semibold">نقش</th>
                  <th className="p-3 font-semibold">تلفن تماس</th>
                  <th className="p-3 font-semibold">یادداشت</th>
                  <th className="p-3 font-semibold text-center">وضعیت</th>
                  <th className="p-3 font-semibold text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--finance-border)]">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-[var(--color-surface-elevated)] transition-colors ${
                      !c.isActive ? 'opacity-60 bg-[var(--color-surface-elevated)]/30' : ''
                    }`}
                  >
                    <td className="p-3 font-mono font-medium text-[var(--color-text-primary)]">{c.code}</td>
                    <td className="p-3 font-semibold text-[var(--color-text-primary)]">{c.name}</td>
                    <td className="p-3">{getRoleBadge(c.role)}</td>
                    <td className="p-3 font-mono text-[var(--color-text-muted)]">
                      {c.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="opacity-70" />
                          <span>{c.phone}</span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)] max-w-xs truncate">{c.notes || '—'}</td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                          c.isActive
                            ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border border-[var(--color-status-success-border)]'
                            : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border border-[var(--finance-border)]'
                        }`}
                        title="تغییر وضعیت"
                      >
                        {c.isActive ? (
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
                            setEditingCounterparty(c)
                            setShowModal(true)
                          }}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                          title="ویرایش"
                        >
                          <Edit2 size={14} />
                        </button>
                        {c.isActive && (
                          <button
                            type="button"
                            onClick={() => handleArchive(c)}
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

      {showModal && (
        <CounterpartyFormModal
          counterparty={editingCounterparty}
          onClose={() => setShowModal(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  )
}
