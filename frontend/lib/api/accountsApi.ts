import { apiDelete, apiGet, apiGetList, apiPost, apiPut } from './apiClient'
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
  balanceRecordedDate?: string
}

const BASE = '/api/v1/accounts'

export function getAccounts(): Promise<Account[]> {
  return apiGetList<Account>(BASE, 'خطا در دریافت حساب‌ها')
}

export function getTotalBalance(): Promise<number> {
  return apiGet<number>(`${BASE}/total`, 'خطا در دریافت موجودی کل').then((v) => v ?? 0)
}

export function createAccount(data: AccountRequest): Promise<Account> {
  return apiPost<Account>(BASE, data, 'خطا در ایجاد حساب')
}

export function updateAccount(id: number, data: AccountRequest): Promise<Account> {
  return apiPut<Account>(`${BASE}/${id}`, data, 'خطا در ویرایش حساب')
}

export function deleteAccount(id: number): Promise<void> {
  return apiDelete(`${BASE}/${id}`, 'خطا در حذف حساب')
}

export function exportAccountsCsv(): Promise<void> {
  return downloadCsv(`${BASE}/export`, 'accounts.csv')
}
