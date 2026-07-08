import type { ApiResponse } from './authApi'
import { parseJson } from './authApi'
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

export async function getReceivables(): Promise<Receivable[]> {
  const res = await fetch(BASE, { credentials: 'include' })
  if (!res.ok) throw new Error('خطا در دریافت طلب‌ها')
  const body: ApiResponse<Receivable[]> = await parseJson(res)
  return body.data ?? []
}

export async function createReceivable(data: ReceivableRequest): Promise<Receivable> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = 'خطا در ایجاد طلب'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
  const body: ApiResponse<Receivable> = await parseJson(res)
  return body.data!
}

export async function updateReceivable(id: number, data: ReceivableRequest): Promise<Receivable> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = 'خطا در ویرایش طلب'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
  const body: ApiResponse<Receivable> = await parseJson(res)
  return body.data!
}

export async function deleteReceivable(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    let message = 'خطا در حذف طلب'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
}

export function exportReceivablesCsv(): Promise<void> {
  return downloadCsv(`${BASE}/export`, 'receivables.csv')
}
