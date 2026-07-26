import { apiDelete, apiGet, apiGetList, apiPost, apiPut } from './apiClient'
import { downloadCsv } from '@/lib/csvExport'

export interface Standby {
  id: number
  itemLabel: string
  quantity: number
  expectedUnitPrice: number
  dateAdded: string | null
  totalValue: number
  notes: string | null
  createdAt: string
}

export interface StandbyRequest {
  itemLabel: string
  quantity: number
  expectedUnitPrice: number
  dateAdded: string | null
  notes: string
}

const BASE = '/api/v1/standby'

export function getStandbyItems(): Promise<Standby[]> {
  return apiGetList<Standby>(BASE, 'خطا در دریافت کالاهای معوق')
}

export function getStandbyTotal(): Promise<number> {
  return apiGet<number>(`${BASE}/total`, 'خطا در دریافت مجموع کالاهای معوق').then((v) => v ?? 0)
}

export function createStandbyItem(data: StandbyRequest): Promise<Standby> {
  return apiPost<Standby>(BASE, data, 'خطا در ایجاد کالا')
}

export function updateStandbyItem(id: number, data: StandbyRequest): Promise<Standby> {
  return apiPut<Standby>(`${BASE}/${id}`, data, 'خطا در ویرایش کالا')
}

export function deleteStandbyItem(id: number): Promise<void> {
  return apiDelete(`${BASE}/${id}`, 'خطا در حذف کالا')
}

export function exportStandbyCsv(): Promise<void> {
  return downloadCsv(`${BASE}/export`, 'standby.csv')
}
