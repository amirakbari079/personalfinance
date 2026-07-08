import type { ApiResponse } from './authApi'
import { parseJson } from './authApi'
import { downloadCsv } from '@/lib/csvExport'

export interface PendingExpense {
  id: number
  label: string
  plannedAmount: number
  dueDate: string | null
  notes: string | null
  createdAt: string
}

export interface PendingExpenseRequest {
  label: string
  plannedAmount: number
  dueDate: string | null
  notes: string
}

const BASE = '/api/v1/pending-expenses'

export async function getPendingExpenses(): Promise<PendingExpense[]> {
  const res = await fetch(BASE, { credentials: 'include' })
  if (!res.ok) throw new Error('خطا در دریافت هزینه‌ها')
  const body: ApiResponse<PendingExpense[]> = await parseJson(res)
  return body.data ?? []
}

export async function getPendingExpensesTotal(): Promise<number> {
  const res = await fetch(`${BASE}/total`, { credentials: 'include' })
  if (!res.ok) throw new Error('خطا در دریافت مجموع هزینه‌ها')
  const body: ApiResponse<number> = await parseJson(res)
  return body.data ?? 0
}

export async function createPendingExpense(data: PendingExpenseRequest): Promise<PendingExpense> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = 'خطا در ایجاد هزینه'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
  const body: ApiResponse<PendingExpense> = await parseJson(res)
  return body.data!
}

export async function updatePendingExpense(id: number, data: PendingExpenseRequest): Promise<PendingExpense> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = 'خطا در ویرایش هزینه'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
  const body: ApiResponse<PendingExpense> = await parseJson(res)
  return body.data!
}

export async function deletePendingExpense(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    let message = 'خطا در حذف هزینه'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
}

export function exportPendingExpensesCsv(): Promise<void> {
  return downloadCsv(`${BASE}/export`, 'pending-expenses.csv')
}
