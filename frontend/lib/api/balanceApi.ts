import { apiGet } from './apiClient'

export interface BalanceSummary {
  cash: number
  investments: number
  standby: number
  receivablesOutstanding: number
  totalCapital: number
  monthlyInstallments: number
  pendingExpenses: number
  netWorth: number
}

const BASE = '/api/v1/balance'

export function getBalance(): Promise<BalanceSummary> {
  return apiGet<BalanceSummary>(BASE, 'خطا در دریافت تراز مالی')
}
