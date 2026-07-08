import type { ApiResponse } from './authApi'
import { parseJson } from './authApi'
import { downloadCsv } from '@/lib/csvExport'

export type AccountType = 'BANK' | 'DIGITAL_WALLET' | 'EXCHANGE' | 'CASH' | 'OTHER'

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  BANK:           'بانکی',
  DIGITAL_WALLET: 'کیف پول دیجیتال',
  EXCHANGE:       'صرافی',
  CASH:           'نقد',
  OTHER:          'سایر',
}

export interface Account {
  id: number
  name: string
  type: AccountType
  balance: number
  notes: string | null
  bankCode: string | null
  createdAt: string
}

export interface AccountRequest {
  name: string
  type: AccountType
  balance: number
  notes: string
  bankCode: string | null
}

const BASE = '/api/v1/accounts'

export async function getAccounts(): Promise<Account[]> {
  const res = await fetch(BASE, { credentials: 'include' })
  if (!res.ok) throw new Error('خطا در دریافت حساب‌ها')
  const body: ApiResponse<Account[]> = await parseJson(res)
  return body.data ?? []
}

export async function getTotalBalance(): Promise<number> {
  const res = await fetch(`${BASE}/total`, { credentials: 'include' })
  if (!res.ok) throw new Error('خطا در دریافت موجودی کل')
  const body: ApiResponse<number> = await parseJson(res)
  return body.data ?? 0
}

export async function createAccount(data: AccountRequest): Promise<Account> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = 'خطا در ایجاد حساب'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
  const body: ApiResponse<Account> = await parseJson(res)
  return body.data!
}

export async function updateAccount(id: number, data: AccountRequest): Promise<Account> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = 'خطا در ویرایش حساب'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
  const body: ApiResponse<Account> = await parseJson(res)
  return body.data!
}

export async function deleteAccount(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    let message = 'خطا در حذف حساب'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
}

export function exportAccountsCsv(): Promise<void> {
  return downloadCsv(`${BASE}/export`, 'accounts.csv')
}
