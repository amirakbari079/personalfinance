import { apiDelete, apiGet, apiGetList, apiPost, apiPut } from './apiClient'
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

export function getIncomes(): Promise<Income[]> {
  return apiGetList<Income>(BASE, 'خطا در دریافت درآمدها')
}

export function getMonthlyTotal(): Promise<number> {
  return apiGet<number>(`${BASE}/total-monthly`, 'خطا در دریافت مجموع درآمد ماهانه').then((v) => v ?? 0)
}

export function createIncome(data: IncomeRequest): Promise<Income> {
  return apiPost<Income>(BASE, data, 'خطا در ایجاد درآمد')
}

export function updateIncome(id: number, data: IncomeRequest): Promise<Income> {
  return apiPut<Income>(`${BASE}/${id}`, data, 'خطا در ویرایش درآمد')
}

export function deleteIncome(id: number): Promise<void> {
  return apiDelete(`${BASE}/${id}`, 'خطا در حذف درآمد')
}

export function exportIncomesCsv(): Promise<void> {
  return downloadCsv(`${BASE}/export`, 'incomes.csv')
}
