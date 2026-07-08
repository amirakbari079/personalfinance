import type { ApiResponse } from './authApi'
import { parseJson } from './authApi'
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

export async function getStandbyItems(): Promise<Standby[]> {
  const res = await fetch(BASE, { credentials: 'include' })
  if (!res.ok) throw new Error('خطا در دریافت کالاهای معوق')
  const body: ApiResponse<Standby[]> = await parseJson(res)
  return body.data ?? []
}

export async function getStandbyTotal(): Promise<number> {
  const res = await fetch(`${BASE}/total`, { credentials: 'include' })
  if (!res.ok) throw new Error('خطا در دریافت مجموع کالاهای معوق')
  const body: ApiResponse<number> = await parseJson(res)
  return body.data ?? 0
}

export async function createStandbyItem(data: StandbyRequest): Promise<Standby> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = 'خطا در ایجاد کالا'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
  const body: ApiResponse<Standby> = await parseJson(res)
  return body.data!
}

export async function updateStandbyItem(id: number, data: StandbyRequest): Promise<Standby> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = 'خطا در ویرایش کالا'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
  const body: ApiResponse<Standby> = await parseJson(res)
  return body.data!
}

export async function deleteStandbyItem(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    let message = 'خطا در حذف کالا'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
}

export function exportStandbyCsv(): Promise<void> {
  return downloadCsv(`${BASE}/export`, 'standby.csv')
}
