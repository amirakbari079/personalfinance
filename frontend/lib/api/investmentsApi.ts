import type { ApiResponse } from './authApi'
import { parseJson } from './authApi'
import { downloadCsv } from '@/lib/csvExport'

export type InvestmentType = 'STOCK' | 'GOLD' | 'CRYPTO' | 'FOREIGN_CURRENCY' | 'OTHER'

export const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  STOCK:            'سهام',
  GOLD:             'طلا',
  CRYPTO:           'ارز دیجیتال',
  FOREIGN_CURRENCY: 'ارز خارجی',
  OTHER:            'سایر',
}

export interface Investment {
  id: number
  name: string
  assetType: InvestmentType
  nativeAmount: number | null
  nativeUnit: string | null
  tomanEquivalent: number
  notes: string | null
  createdAt: string
}

export interface InvestmentRequest {
  name: string
  assetType: InvestmentType
  nativeAmount: number | null
  nativeUnit: string
  tomanEquivalent: number
  notes: string
}

const BASE = '/api/v1/investments'

export async function getInvestments(): Promise<Investment[]> {
  const res = await fetch(BASE, { credentials: 'include' })
  if (!res.ok) throw new Error('خطا در دریافت سرمایه‌گذاری‌ها')
  const body: ApiResponse<Investment[]> = await parseJson(res)
  return body.data ?? []
}

export async function getTotalTomanValue(): Promise<number> {
  const res = await fetch(`${BASE}/total`, { credentials: 'include' })
  if (!res.ok) throw new Error('خطا در دریافت جمع کل')
  const body: ApiResponse<number> = await parseJson(res)
  return body.data ?? 0
}

export async function createInvestment(data: InvestmentRequest): Promise<Investment> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = 'خطا در ایجاد سرمایه‌گذاری'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
  const body: ApiResponse<Investment> = await parseJson(res)
  return body.data!
}

export async function updateInvestment(id: number, data: InvestmentRequest): Promise<Investment> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = 'خطا در ویرایش سرمایه‌گذاری'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
  const body: ApiResponse<Investment> = await parseJson(res)
  return body.data!
}

export async function deleteInvestment(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    let message = 'خطا در حذف سرمایه‌گذاری'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
}

export function exportInvestmentsCsv(): Promise<void> {
  return downloadCsv(`${BASE}/export`, 'investments.csv')
}
