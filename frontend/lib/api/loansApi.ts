import { apiDelete, apiGet, apiGetList, apiPost, apiPut, apiRequest } from './apiClient'
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
  /** Optional; used on edit to correct payment progress. */
  paidInstallments?: number
}

const BASE = '/api/v1/loans'

export function getLoans(): Promise<Loan[]> {
  return apiGetList<Loan>(BASE, 'خطا در دریافت وام‌ها')
}

export function getLoansMonthlyTotal(): Promise<number> {
  return apiGet<number>(`${BASE}/total-monthly`, 'خطا در دریافت مجموع اقساط ماهانه').then((v) => v ?? 0)
}

export function createLoan(data: LoanRequest): Promise<Loan> {
  return apiPost<Loan>(BASE, data, 'خطا در ایجاد وام')
}

export function updateLoan(id: number, data: LoanRequest): Promise<Loan> {
  return apiPut<Loan>(`${BASE}/${id}`, data, 'خطا در ویرایش وام')
}

export function deleteLoan(id: number): Promise<void> {
  return apiDelete(`${BASE}/${id}`, 'خطا در حذف وام')
}

/** Records payment of the next (sequential) installment. */
export function payNextInstallment(id: number): Promise<Loan> {
  return apiRequest<Loan>(`${BASE}/${id}/pay-next`, {
    method: 'POST',
    errorMessage: 'خطا در ثبت پرداخت قسط',
  })
}

/** Undoes the last recorded installment payment. */
export function undoLastInstallment(id: number): Promise<Loan> {
  return apiRequest<Loan>(`${BASE}/${id}/undo-last`, {
    method: 'POST',
    errorMessage: 'خطا در برگرداندن قسط',
  })
}

export function exportLoansCsv(): Promise<void> {
  return downloadCsv(`${BASE}/export`, 'loans.csv')
}
