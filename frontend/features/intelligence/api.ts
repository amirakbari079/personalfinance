import { apiGet, apiGetList, apiRequest } from '@/lib/api/apiClient'

export interface IntelligencePrice {
  assetId: number
  symbol: string
  name: string
  currency: string
  unit: string
  price: number
  observedAt: string
  confidence: number | null
  change1d: number | null
  change7d: number | null
  change30d: number | null
}

export interface IntelligenceUpdate {
  id: number
  startedAt: string | null
  completedAt: string | null
  status: 'QUEUED' | 'RUNNING' | 'PARTIAL_SUCCESS' | 'SUCCESS' | 'FAILED'
  triggerType: string
  providerCount: number
  successfulProviders: number
  failedProviders: number
  recordsFetched: number
  recordsStored: number
  recordsRejected: number
  errorCount: number
  errorSummary: string | null
}

export interface MarketPremiums {
  usdtPremiumPercent: number | null
  paxgPremiumPercent: number | null
}

export interface QualitySummary {
  lastUpdate: IntelligenceUpdate | null
  lastSnapshotId: number | null
  lastSnapshotAt: string | null
  openConflictCount: number
  averageConfidence: number | null
  providerSuccessRate: number | null
}

export interface DataConflict {
  id: number
  assetSymbol: string
  assetName: string
  currency: string
  providerA: string
  valueA: number
  providerB: string
  valueB: number
  differencePercent: number
  detectedAt: string
  resolutionStatus: 'OPEN' | 'RESOLVED' | 'IGNORED'
}

export interface MacroObservationPoint {
  period: string
  value: number
}

export interface MacroIndicator {
  id: number
  code: string
  name: string
  country: string | null
  unit: string
  frequency: string
  sourceCode: string
  period: string | null
  value: number | null
  previousValue: number | null
  source: string | null
  publishedAt: string | null
  history: MacroObservationPoint[]
}

const BASE = '/api/v1/financial-intelligence'

export function getIntelligencePrices(): Promise<IntelligencePrice[]> {
  return apiGetList<IntelligencePrice>(`${BASE}/prices`, 'خطا در دریافت قیمت‌های هوش مالی').then((rows) =>
    rows.map((row) => ({
      ...row,
      price: Number(row.price),
      change1d: row.change1d != null ? Number(row.change1d) : null,
      change7d: row.change7d != null ? Number(row.change7d) : null,
      change30d: row.change30d != null ? Number(row.change30d) : null,
    })),
  )
}

export function getMarketPremiums(): Promise<MarketPremiums> {
  return apiGet<MarketPremiums>(`${BASE}/metrics/premiums`, 'خطا در دریافت پریمیوم‌ها').then((row) => ({
    usdtPremiumPercent: row.usdtPremiumPercent != null ? Number(row.usdtPremiumPercent) : null,
    paxgPremiumPercent: row.paxgPremiumPercent != null ? Number(row.paxgPremiumPercent) : null,
  }))
}

export function enqueueIntelligenceUpdate(): Promise<IntelligenceUpdate> {
  return apiRequest<IntelligenceUpdate>(`${BASE}/updates`, {
    method: 'POST',
    errorMessage: 'خطا در صف بروزرسانی',
  })
}

export function getIntelligenceUpdate(id: number): Promise<IntelligenceUpdate> {
  return apiGet<IntelligenceUpdate>(`${BASE}/updates/${id}`, 'خطا در دریافت وضعیت بروزرسانی')
}

export function listIntelligenceUpdates(): Promise<IntelligenceUpdate[]> {
  return apiGetList<IntelligenceUpdate>(`${BASE}/updates`, 'خطا در دریافت تاریخچه بروزرسانی')
}

export function getQualitySummary(): Promise<QualitySummary> {
  return apiGet<QualitySummary>(`${BASE}/quality`, 'خطا در دریافت خلاصه کیفیت').then((row) => ({
    ...row,
    averageConfidence: row.averageConfidence != null ? Number(row.averageConfidence) : null,
  }))
}

export function getOpenConflicts(): Promise<DataConflict[]> {
  return apiGetList<DataConflict>(`${BASE}/conflicts`, 'خطا در دریافت تعارض‌های داده').then((rows) =>
    rows.map((row) => ({
      ...row,
      valueA: Number(row.valueA),
      valueB: Number(row.valueB),
      differencePercent: Number(row.differencePercent),
    })),
  )
}

export function getMacroIndicators(): Promise<MacroIndicator[]> {
  return apiGetList<MacroIndicator>(`${BASE}/macro`, 'خطا در دریافت شاخص‌های کلان').then((rows) =>
    rows.map((row) => ({
      ...row,
      value: row.value != null ? Number(row.value) : null,
      previousValue: row.previousValue != null ? Number(row.previousValue) : null,
      history: (row.history ?? []).map((point) => ({
        period: point.period,
        value: Number(point.value),
      })),
    })),
  )
}

export interface IntelligenceAsset {
  id: number
  symbol: string
  name: string
  currency: string
  unit: string
  active: boolean
}

export function getIntelligenceAssets(): Promise<IntelligenceAsset[]> {
  return apiGetList<IntelligenceAsset>(`${BASE}/assets`, 'خطا در دریافت فهرست دارایی‌های بازار')
}
