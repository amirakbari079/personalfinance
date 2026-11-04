'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  type Loan,
  type LoanRequest,
  type InstallmentView,
  getLoans,
  createLoan,
  updateLoan,
  deleteLoan,
  payNextInstallment,
  undoLastInstallment,
} from '@/lib/api/loansApi'
import LoanForm from './LoanForm'
import { Pencil, Trash2, Check, Clock, ChevronDown, ChevronUp, Undo2, Landmark } from 'lucide-react'
import { formatJalali } from '@/utils/jalaliUtils'
import PageHeader from '@/shared/PageHeader'
import StatusTag from '@/shared/StatusTag'
import ListIcon from '@/shared/ListIcon'
import { exportLoansCsv } from '@/lib/api/loansApi'
import ListSortBar from '@/shared/ListSortBar'
import TotalFooter from '@/shared/TotalFooter'
import { formatToman, sumAmounts } from '@/utils/formatToman'
import {
  BASE_SORT_OPTIONS,
  DEFAULT_SORT,
  DOMAIN_DATE_SORT_OPTIONS,
  sortItems,
  type SortOptionId,
} from '@/utils/listSort'

const SORT_OPTIONS = [...BASE_SORT_OPTIONS, ...DOMAIN_DATE_SORT_OPTIONS]

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [sortId, setSortId] = useState<SortOptionId>(DEFAULT_SORT)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Loan | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [payingId, setPayingId] = useState<number | null>(null)
  const [undoingId, setUndoingId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  async function load() {
    try {
      const items = await getLoans()
      setLoans(items)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در بارگذاری')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const activeLoans = loans.filter((l) => !l.completed)
  const monthlyTotal = sumAmounts(activeLoans.map((l) => l.monthlyAmount))
  const remainingTotal = sumAmounts(activeLoans.map((l) => l.remainingAmount))

  const sortedLoans = useMemo(
    () => sortItems(loans, sortId, {
      getName: (l) => l.creditor,
      getAmount: (l) => l.monthlyAmount,
      getCreatedAt: (l) => l.createdAt,
      getDate: (l) => l.startDate,
    }),
    [loans, sortId],
  )

  async function handleSave(data: LoanRequest) {
    if (editing) {
      await updateLoan(editing.id, data)
    } else {
      await createLoan(data)
    }
    setShowForm(false)
    setEditing(null)
    load()
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await deleteLoan(id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در حذف')
    } finally {
      setDeletingId(null)
    }
  }

  async function handlePayNext(loan: Loan) {
    setPayingId(loan.id)
    try {
      await payNextInstallment(loan.id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ثبت پرداخت')
    } finally {
      setPayingId(null)
    }
  }

  async function handleUndoLast(loan: Loan) {
    if (!window.confirm(`آخرین قسط پرداخت‌شده «${loan.creditor}» برگردانده شود؟`)) {
      return
    }
    setUndoingId(loan.id)
    try {
      await undoLastInstallment(loan.id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در برگرداندن قسط')
    } finally {
      setUndoingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader
        title="وام‌ها"
        subtitle={`مانده کل: ${formatToman(remainingTotal)} · قسط ماهانه: ${formatToman(monthlyTotal)}`}
        addLabel="+ وام جدید"
        onAdd={() => { setEditing(null); setShowForm(true) }}
        onExport={exportLoansCsv}
      />

      {error && (
        <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5 mb-4">
          {error}
        </p>
      )}

      {loans.length > 0 && (
        <ListSortBar value={sortId} options={SORT_OPTIONS} onChange={setSortId} />
      )}

      {loans.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          هنوز وامی ثبت نشده. اولین وام را اضافه کنید.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedLoans.map(loan => (
            <LoanCard
              key={loan.id}
              loan={loan}
              expanded={expandedId === loan.id}
              onToggle={() => setExpandedId(expandedId === loan.id ? null : loan.id)}
              onPayNext={handlePayNext}
              onUndoLast={handleUndoLast}
              onEdit={() => { setEditing(loan); setShowForm(true) }}
              onDelete={() => handleDelete(loan.id)}
              isPaying={payingId === loan.id}
              isUndoing={undoingId === loan.id}
              isDeleting={deletingId === loan.id}
            />
          ))}
        </div>
      )}

      {loans.length > 0 && (
        <TotalFooter label="جمع مانده وام‌ها" value={remainingTotal} formatValue={formatToman} />
      )}

      {showForm && (
        <LoanForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

interface CardProps {
  loan: Loan
  expanded: boolean
  onToggle: () => void
  onPayNext: (loan: Loan) => void
  onUndoLast: (loan: Loan) => void
  onEdit: () => void
  onDelete: () => void
  isPaying: boolean
  isUndoing: boolean
  isDeleting: boolean
}

function LoanCard({
  loan,
  expanded,
  onToggle,
  onPayNext,
  onUndoLast,
  onEdit,
  onDelete,
  isPaying,
  isUndoing,
  isDeleting,
}: CardProps) {
  const progressPct = loan.totalInstallments > 0
    ? Math.round((loan.paidInstallments / loan.totalInstallments) * 100)
    : 0

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ListIcon icon={Landmark} variant="primary" />
          <div>
            <p className="text-sm text-item-title text-text-primary flex items-center gap-2 flex-wrap">
              {loan.creditor}
              {loan.completed && (
                <StatusTag variant="success" className="text-[10px]">تکمیل شده</StatusTag>
              )}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {toPersian(loan.paidInstallments)} / {toPersian(loan.totalInstallments)} قسط
              • {formatToman(loan.monthlyAmount)} در ماه
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            title="ویرایش"
            aria-label="ویرایش"
            className="text-text-muted hover:text-brand-accent transition-colors p-1.5 rounded"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            title="حذف"
            aria-label="حذف"
            className="text-text-muted hover:text-status-error transition-colors p-1.5 rounded disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            title={expanded ? 'جمع کردن' : 'باز کردن اقساط'}
            aria-label="جزئیات اقساط"
            className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="px-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-text-muted">پیشرفت پرداخت</span>
          <span className="text-[11px] text-text-muted tabular-nums">{toPersian(progressPct)}٪</span>
        </div>
        <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-accent rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="px-5 pb-4 grid grid-cols-2 gap-3">
        <div className="stat-cell">
          <p className="text-[11px] text-text-muted">پرداخت‌شده</p>
          <p className="text-sm text-amount text-text-primary">{formatToman(loan.paidAmount)}</p>
        </div>
        <div className="stat-cell">
          <p className="text-[11px] text-text-muted">باقی‌مانده</p>
          <p className="text-sm text-amount text-text-primary">{formatToman(loan.remainingAmount)}</p>
        </div>
        <div className="stat-cell">
          <p className="text-[11px] text-text-muted">قسط باقی‌مانده</p>
          <p className="text-sm text-amount text-text-primary">{toPersian(loan.remainingInstallments)} قسط</p>
        </div>
        <div className="stat-cell">
          <p className="text-[11px] text-text-muted">قسط آخر</p>
          <p className="text-sm text-amount text-text-primary">{formatJalali(loan.lastPaymentDate)}</p>
        </div>
      </div>

      <div className="px-5 pb-4 flex flex-col sm:flex-row gap-2">
        {!loan.completed && (
          <button
            onClick={() => onPayNext(loan)}
            disabled={isPaying || isUndoing}
            className="flex-1 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPaying ? (
              'در حال ثبت...'
            ) : (
              <>
                <Check className="w-4 h-4" />
                ثبت پرداخت قسط {toPersian(loan.paidInstallments + 1)}
              </>
            )}
          </button>
        )}
        {loan.paidInstallments > 0 && (
          <button
            onClick={() => onUndoLast(loan)}
            disabled={isPaying || isUndoing}
            className="flex-1 bg-surface-muted hover:bg-surface-muted/80 text-text-muted hover:text-text-primary text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUndoing ? (
              'در حال برگرداندن...'
            ) : (
              <>
                <Undo2 className="w-4 h-4" />
                برگرداندن آخرین قسط
              </>
            )}
          </button>
        )}
      </div>

      {expanded && (
        <div className="px-5 pb-4 border-t border-surface-muted pt-4">
          <p className="text-section-label text-text-primary mb-3">اقساط</p>
          <InstallmentGrid installments={loan.installments} />
        </div>
      )}
    </div>
  )
}

function InstallmentGrid({ installments }: { installments: InstallmentView[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {installments.map(inst => (
        <div
          key={inst.number}
          title={`قسط ${inst.number} — ${inst.monthLabel} (${inst.dueDateJalali})`}
          className={[
            'w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium transition-all',
            inst.status === 'PAID'
              ? 'bg-brand-accent text-text-on-accent'
              : inst.status === 'NEXT'
                ? 'bg-brand-accent/15 text-brand-accent border-2 border-brand-accent border-dashed'
                : 'bg-surface-muted text-text-muted',
          ].join(' ')}
        >
          {inst.status === 'PAID' ? (
            <Check className="w-4 h-4" />
          ) : inst.status === 'NEXT' ? (
            <Clock className="w-3.5 h-3.5" />
          ) : (
            toPersian(inst.number)
          )}
        </div>
      ))}
    </div>
  )
}

function toPersian(value: number): string {
  return value.toLocaleString('fa-IR')
}
