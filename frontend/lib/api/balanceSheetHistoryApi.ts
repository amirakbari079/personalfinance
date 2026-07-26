import { apiGet, apiGetList } from './apiClient'
import type { CashFlowSummary } from './historyApi'

export interface BalanceSheetHistoryPoint {
  recordedDateJalali: string
  totalAssets: number
  totalLiabilities: number
  netBalance: number
  delta: number | null
}

const BASE = '/api/v1/balance-sheet/history'

export function getBalanceSheetHistory(): Promise<BalanceSheetHistoryPoint[]> {
  return apiGetList<BalanceSheetHistoryPoint>(`${BASE}/total-series`, 'خطا در دریافت تاریخچه ترازنامه')
}

export function getBalanceSheetCashFlow(): Promise<CashFlowSummary> {
  return apiGet<CashFlowSummary>(`${BASE}/cash-flow`, 'خطا در دریافت تغییرات ماهانه')
}
