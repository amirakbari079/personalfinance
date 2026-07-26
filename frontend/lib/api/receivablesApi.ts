import { apiDelete, apiGetList, apiPost, apiPut } from './apiClient'
import { downloadCsv } from '@/lib/csvExport'

export interface Receivable {
  id: number
  debtorName: string
  originalAmount: number
  createdDate: string | null
  receivedAmount: number
  outstanding: number
  notes: string | null
  createdAt: string
}

export interface ReceivableRequest {
  debtorName: string
  originalAmount: number
  createdDate: string | null
  receivedAmount: number
  notes: string
}

const BASE = '/api/v1/receivables'

export function getReceivables(): Promise<Receivable[]> {
  return apiGetList<Receivable>(BASE, 'خطا در دریافت طلب‌ها')
}

export function createReceivable(data: ReceivableRequest): Promise<Receivable> {
  return apiPost<Receivable>(BASE, data, 'خطا در ایجاد طلب')
}

export function updateReceivable(id: number, data: ReceivableRequest): Promise<Receivable> {
  return apiPut<Receivable>(`${BASE}/${id}`, data, 'خطا در ویرایش طلب')
}

export function deleteReceivable(id: number): Promise<void> {
  return apiDelete(`${BASE}/${id}`, 'خطا در حذف طلب')
}

export function exportReceivablesCsv(): Promise<void> {
  return downloadCsv(`${BASE}/export`, 'receivables.csv')
}
