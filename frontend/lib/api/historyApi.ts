import { apiDelete, apiGet, apiGetList, apiPost, apiPut } from './apiClient'

export type SnapshotEntityType = 'ACCOUNT' | 'INVESTMENT'

export interface SnapshotEntry {
  id: number
  value: number
  recordedDateJalali: string
  deltaFromPrevious: number | null
  notes: string | null
  createdAt: string
  isLatest: boolean
}

export interface SnapshotRequest {
  value: number
  recordedDateJalali: string
  notes?: string | null
}

export interface TotalSeriesPoint {
  recordedDateJalali: string
  total: number
  delta: number | null
}

export interface CashFlowSummary {
  monthLabel: string
  startOfMonthTotal: number
  currentTotal: number
  delta: number
  percentChange: number | null
  positive: boolean
}

const BASE = '/api/v1/history'
const ACCOUNTS_BASE = '/api/v1/accounts'
const INVESTMENTS_BASE = '/api/v1/investments'

export function getEntityHistory(
  entityType: SnapshotEntityType,
  entityId: number,
): Promise<SnapshotEntry[]> {
  return apiGetList<SnapshotEntry>(`${BASE}/${entityType}/${entityId}`, 'خطا در دریافت تاریخچه')
}

export function getAccountTotalSeries(): Promise<TotalSeriesPoint[]> {
  return apiGetList<TotalSeriesPoint>(`${BASE}/ACCOUNT/total-series`, 'خطا در دریافت روند موجودی')
}

export function getAccountCashFlow(): Promise<CashFlowSummary> {
  return apiGet<CashFlowSummary>(`${BASE}/ACCOUNT/cash-flow`, 'خطا در دریافت جریان نقدینگی')
}

export function getAccountSnapshots(accountId: number): Promise<SnapshotEntry[]> {
  return apiGetList<SnapshotEntry>(`${ACCOUNTS_BASE}/${accountId}/snapshots`, 'خطا در دریافت تاریخچه')
}

export function createAccountSnapshot(
  accountId: number,
  data: SnapshotRequest,
): Promise<SnapshotEntry> {
  return apiPost<SnapshotEntry>(
    `${ACCOUNTS_BASE}/${accountId}/snapshots`,
    data,
    'خطا در ثبت رکورد',
  )
}

export function updateAccountSnapshot(
  accountId: number,
  snapshotId: number,
  data: SnapshotRequest,
): Promise<SnapshotEntry> {
  return apiPut<SnapshotEntry>(
    `${ACCOUNTS_BASE}/${accountId}/snapshots/${snapshotId}`,
    data,
    'خطا در ویرایش رکورد',
  )
}

export function deleteAccountSnapshot(
  accountId: number,
  snapshotId: number,
): Promise<void> {
  return apiDelete(
    `${ACCOUNTS_BASE}/${accountId}/snapshots/${snapshotId}`,
    'خطا در حذف رکورد',
  )
}

export function getInvestmentTotalSeries(): Promise<TotalSeriesPoint[]> {
  return apiGetList<TotalSeriesPoint>(
    `${BASE}/INVESTMENT/total-series`,
    'خطا در دریافت روند سرمایه‌گذاری',
  )
}

export function getInvestmentCashFlow(): Promise<CashFlowSummary> {
  return apiGet<CashFlowSummary>(
    `${BASE}/INVESTMENT/cash-flow`,
    'خطا در دریافت جریان سرمایه‌گذاری',
  )
}

export function getInvestmentSnapshots(investmentId: number): Promise<SnapshotEntry[]> {
  return apiGetList<SnapshotEntry>(
    `${INVESTMENTS_BASE}/${investmentId}/snapshots`,
    'خطا در دریافت تاریخچه',
  )
}

export function createInvestmentSnapshot(
  investmentId: number,
  data: SnapshotRequest,
): Promise<SnapshotEntry> {
  return apiPost<SnapshotEntry>(
    `${INVESTMENTS_BASE}/${investmentId}/snapshots`,
    data,
    'خطا در ثبت رکورد',
  )
}

export function updateInvestmentSnapshot(
  investmentId: number,
  snapshotId: number,
  data: SnapshotRequest,
): Promise<SnapshotEntry> {
  return apiPut<SnapshotEntry>(
    `${INVESTMENTS_BASE}/${investmentId}/snapshots/${snapshotId}`,
    data,
    'خطا در ویرایش رکورد',
  )
}

export function deleteInvestmentSnapshot(
  investmentId: number,
  snapshotId: number,
): Promise<void> {
  return apiDelete(
    `${INVESTMENTS_BASE}/${investmentId}/snapshots/${snapshotId}`,
    'خطا در حذف رکورد',
  )
}
