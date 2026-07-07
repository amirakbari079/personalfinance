import { useEffect, useState } from 'react'
import {
  type PendingExpense,
  type PendingExpenseRequest,
  getPendingExpenses,
  getPendingExpensesTotal,
  createPendingExpense,
  updatePendingExpense,
  deletePendingExpense,
} from '../../api/pendingExpensesApi'
import PendingExpenseForm from './PendingExpenseForm'
import { Pencil, Trash2 } from 'lucide-react'
import { formatJalali } from '../../utils/jalaliUtils'

export default function PendingExpensesPage() {
  const [expenses, setExpenses] = useState<PendingExpense[]>([])
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PendingExpense | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function load() {
    try {
      const [items, tot] = await Promise.all([getPendingExpenses(), getPendingExpensesTotal()])
      setExpenses(items)
      setTotal(tot)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در بارگذاری')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleSave(data: PendingExpenseRequest) {
    if (editing) {
      await updatePendingExpense(editing.id, data)
    } else {
      await createPendingExpense(data)
    }
    setShowForm(false)
    setEditing(null)
    load()
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await deletePendingExpense(id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در حذف')
    } finally {
      setDeletingId(null)
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">هزینه‌های معوق</h1>
          <p className="text-sm text-text-muted mt-0.5">مجموع برنامه‌ریزی‌شده: {formatToman(total)}</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="bg-brand-accent hover:bg-brand-accent-hover text-text-on-accent text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + هزینه جدید
        </button>
      </div>

      {error && (
        <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5 mb-4">
          {error}
        </p>
      )}

      {/* Expense list */}
      {expenses.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          هنوز هزینه‌ای ثبت نشده. اولین هزینه معوق را اضافه کنید.
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map(expense => (
            <div
              key={expense.id}
              className="bg-surface-card border border-surface-muted rounded-xl px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-accent text-base">⏳</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{expense.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {expense.dueDate ? `سررسید: ${formatJalali(expense.dueDate)}` : 'بدون سررسید'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm font-semibold text-text-primary tabular-nums">
                  <span className="text-status-error">−</span> {formatToman(expense.plannedAmount)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditing(expense); setShowForm(true) }}
                    title="ویرایش"
                    aria-label="ویرایش"
                    className="text-text-muted hover:text-brand-accent transition-colors p-1.5 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    disabled={deletingId === expense.id}
                    title="حذف"
                    aria-label="حذف"
                    className="text-text-muted hover:text-status-error transition-colors p-1.5 rounded disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <PendingExpenseForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

function formatToman(amount: number): string {
  return amount.toLocaleString('fa-IR') + ' تومان'
}
