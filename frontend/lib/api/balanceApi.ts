import type { ApiResponse } from './authApi'
import { parseJson } from './authApi'

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

export async function getBalance(): Promise<BalanceSummary> {
  const res = await fetch(BASE, { credentials: 'include' })
  if (!res.ok) throw new Error('خطا در دریافت تراز مالی')
  const body: ApiResponse<BalanceSummary> = await parseJson(res)
  return body.data!
}
