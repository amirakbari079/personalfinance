import type { ApiResponse } from './authApi'
import { parseJson } from './authApi'
import { downloadCsv } from '@/lib/csvExport'

export type InstallmentStatus = 'PAID' | 'NEXT' | 'UPCOMING'

export interface InstallmentView {
  number: number
  dueDateJalali: string
  monthLabel: string
  status: InstallmentStatus
}

export interface Loan {
  id: number
  creditor: string
  monthlyAmount: number
  totalInstallments: number
  paidInstallments: number
  startDate: string
  notes: string | null
  createdAt: string
  // Computed:
  paidAmount: number
  remainingAmount: number
  remainingInstallments: number
  lastPaymentDate: string | null
  completed: boolean
  installments: InstallmentView[]
}

export interface LoanRequest {
  creditor: string
  monthlyAmount: number
  totalInstallments: number
  startDate: string
  notes: string
}

const BASE = '/api/v1/loans'

export async function getLoans(): Promise<Loan[]> {
  const res = await fetch(BASE, { credentials: 'include' })
  if (!res.ok) throw new Error('خطا در دریافت وام‌ها')
  const body: ApiResponse<Loan[]> = await parseJson(res)
  return body.data ?? []
}

export async function getLoansMonthlyTotal(): Promise<number> {
  const res = await fetch(`${BASE}/total-monthly`, { credentials: 'include' })
  if (!res.ok) throw new Error('خطا در دریافت مجموع اقساط ماهانه')
  const body: ApiResponse<number> = await parseJson(res)
  return body.data ?? 0
}

export async function createLoan(data: LoanRequest): Promise<Loan> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = 'خطا در ایجاد وام'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
  const body: ApiResponse<Loan> = await parseJson(res)
  return body.data!
}

export async function updateLoan(id: number, data: LoanRequest): Promise<Loan> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = 'خطا در ویرایش وام'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
  const body: ApiResponse<Loan> = await parseJson(res)
  return body.data!
}

export async function deleteLoan(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    let message = 'خطا در حذف وام'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
}

/** Records payment of the next (sequential) installment. */
export async function payNextInstallment(id: number): Promise<Loan> {
  const res = await fetch(`${BASE}/${id}/pay-next`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) {
    let message = 'خطا در ثبت پرداخت قسط'
    try {
      const err: ApiResponse<null> = await parseJson(res)
      message = err.message ?? message
    } catch { /* empty body */ }
    throw new Error(message)
  }
  const body: ApiResponse<Loan> = await parseJson(res)
  return body.data!
}

export function exportLoansCsv(): Promise<void> {
  return downloadCsv(`${BASE}/export`, 'loans.csv')
}
