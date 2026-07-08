import type { ApiResponse } from './authApi'
import { parseJson } from './authApi'
import { downloadCsv } from '@/lib/csvExport'

export type IncomeType = 'RECURRING' | 'ONE_OFF'

export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  RECURRING: 'ماهانه (مکرر)',
  ONE_OFF:   'یک‌باره',
}

export interface Income {
  id: number
  source: string
  amount: number
  incomeType: IncomeType
  receivedDate: string | null
  notes: string | null
  createdAt: string
}

export interface IncomeRequest {
  source: string
  amount: number
  incomeType: IncomeType
  receivedDate: string | null
  notes: string
}

const BASE = '/api/v1/incomes'

export async function getIncomes(): Promise<Income[]> {
  const res = await fetch(BASE, { credentials: 'include' })
  if (!res.ok) throw new Error('خطا در دریافت درآمدها')
  const body: ApiResponse<Income[]> = await parseJson(res)
  return body.data ?? []
}

export async function getMonthlyTotal(): Promise<number> {
  const res = await fetch(`${BASE}/total-monthly`, { credentials: 'include' })
  if (!res.ok) throw new Error('خطا در دریافت مجموع درآمد ماهانه')
  const body: ApiResponse<number> = await parseJson(res)
  return body.data ?? 0
}

export async function createIncome(data: IncomeRequest): Promise<Income> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = 'خطا در ایجاد درآمد'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
  const body: ApiResponse<Income> = await parseJson(res)
  return body.data!
}

export async function updateIncome(id: number, data: IncomeRequest): Promise<Income> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = 'خطا در ویرایش درآمد'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
  const body: ApiResponse<Income> = await parseJson(res)
  return body.data!
}

export async function deleteIncome(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    let message = 'خطا در حذف درآمد'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
}

export function exportIncomesCsv(): Promise<void> {
  return downloadCsv(`${BASE}/export`, 'incomes.csv')
}
