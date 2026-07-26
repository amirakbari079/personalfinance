import { apiDelete, apiGet, apiGetList, apiPost, apiPut } from './apiClient'
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
  valueRecordedDate?: string
}

const BASE = '/api/v1/investments'

export function getInvestments(): Promise<Investment[]> {
  return apiGetList<Investment>(BASE, 'خطا در دریافت سرمایه‌گذاری‌ها')
}

export function getTotalTomanValue(): Promise<number> {
  return apiGet<number>(`${BASE}/total`, 'خطا در دریافت جمع کل').then((v) => v ?? 0)
}

export function createInvestment(data: InvestmentRequest): Promise<Investment> {
  return apiPost<Investment>(BASE, data, 'خطا در ایجاد سرمایه‌گذاری')
}

export function updateInvestment(id: number, data: InvestmentRequest): Promise<Investment> {
  return apiPut<Investment>(`${BASE}/${id}`, data, 'خطا در ویرایش سرمایه‌گذاری')
}

export function deleteInvestment(id: number): Promise<void> {
  return apiDelete(`${BASE}/${id}`, 'خطا در حذف سرمایه‌گذاری')
}

export function exportInvestmentsCsv(): Promise<void> {
  return downloadCsv(`${BASE}/export`, 'investments.csv')
}
