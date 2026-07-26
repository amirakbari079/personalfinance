import { apiDelete, apiGet, apiGetList, apiPost, apiPut } from './apiClient'
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

export function getPendingExpenses(): Promise<PendingExpense[]> {
  return apiGetList<PendingExpense>(BASE, 'خطا در دریافت هزینه‌ها')
}

export function getPendingExpensesTotal(): Promise<number> {
  return apiGet<number>(`${BASE}/total`, 'خطا در دریافت مجموع هزینه‌ها').then((v) => v ?? 0)
}

export function createPendingExpense(data: PendingExpenseRequest): Promise<PendingExpense> {
  return apiPost<PendingExpense>(BASE, data, 'خطا در ایجاد هزینه')
}

export function updatePendingExpense(id: number, data: PendingExpenseRequest): Promise<PendingExpense> {
  return apiPut<PendingExpense>(`${BASE}/${id}`, data, 'خطا در ویرایش هزینه')
}

export function deletePendingExpense(id: number): Promise<void> {
  return apiDelete(`${BASE}/${id}`, 'خطا در حذف هزینه')
}

export function exportPendingExpensesCsv(): Promise<void> {
  return downloadCsv(`${BASE}/export`, 'pending-expenses.csv')
}
