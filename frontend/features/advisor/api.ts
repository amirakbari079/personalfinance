import { apiGet, apiGetList, apiPost } from '@/lib/api/apiClient'

export type RecommendationStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'SUPERSEDED'
  | 'EXPIRED'
  | 'INVALIDATED'
  | 'COMPLETED'

export type ThesisStatus = 'ACTIVE' | 'SUPERSEDED' | 'EXPIRED' | 'INVALIDATED'

export interface AdvisorThesis {
  id: number
  title: string
  assetSymbol: string | null
  assumptions: string | null
  invalidationConditions: string | null
  status: ThesisStatus
}

export interface AdvisorRecommendation {
  id: number
  sessionId: number
  marketSnapshotId: number | null
  snapshotStale: boolean
  promptVersion: string | null
  model: string
  provider: string
  fake: boolean
  cached: boolean
  status: RecommendationStatus
  statusReason: string | null
  question: string
  selectedAssets: string
  capitalAmount: number | null
  currency: string | null
  timeHorizon: string | null
  riskTolerance: string
  liquidityRequirement: string
  body: string
  reasoningSummary: string
  portfolioJson: string | null
  confidence: number | null
  reuseCount: number
  createdAt: string
  thesis: AdvisorThesis | null
}

export interface AdvisorDraftRequest {
  question: string
  symbols?: string
  accountIds?: number[]
  investmentIds?: number[]
  customHoldings?: AdvisorCustomHolding[]
  objective?: string
  capitalAmount?: number
  timeHorizon?: string
  riskTolerance?: string
  liquidityRequirement?: string
  constraints?: string
}

export interface AdvisorCustomHolding {
  name: string
  kind: 'ACCOUNT' | 'INVESTMENT'
  type?: string
  amountToman: number
  quantity?: number
  unit?: string
  symbol?: string
}

export interface AdvisorContextRequest {
  symbols?: string
  accountIds?: number[]
  investmentIds?: number[]
  customHoldings?: AdvisorCustomHolding[]
}

export interface AdvisorFreshness {
  lastUpdateAt: string | null
  lastUpdateStatus: string | null
  marketStale: boolean
  hasOpenConflicts: boolean
  staleReason: string | null
}

export interface AdvisorHolding {
  source: 'ACCOUNT' | 'INVESTMENT' | 'CUSTOM'
  id: number | null
  name: string
  type: string | null
  amountToman: number
  quantity: number | null
  unit: string | null
  symbol: string | null
  recordedDate: string | null
}

export interface AdvisorPortfolio {
  cashTotal: number
  investmentTotal: number
  customTotal: number
  totalToman: number
  holdings: AdvisorHolding[]
}

export interface AdvisorMonthlyClose {
  period: string
  close: number
}

export interface AdvisorAssetSummary {
  symbol: string
  name: string
  currency: string
  unit: string
  latestPrice: number
  observedAt: string | null
  providerCode: string | null
  stale: boolean
  return30d: number | null
  return1y: number | null
  monthlyCloses: AdvisorMonthlyClose[]
}

export interface AdvisorMacroSummary {
  code: string
  name: string
  country: string | null
  period: string
  value: number
  unit: string
  source: string | null
  stale: boolean
}

export interface AdvisorContext {
  generatedAt: string
  marketSnapshotId: number | null
  snapshotCapturedAt: string | null
  openConflictCount: number
  freshness: AdvisorFreshness | null
  premiums: {
    usdtPremiumPercent: number | null
    paxgPremiumPercent: number | null
  } | null
  portfolio: AdvisorPortfolio | null
  assets: AdvisorAssetSummary[]
  macro: AdvisorMacroSummary[]
}

function toNumber(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function mapContext(raw: AdvisorContext): AdvisorContext {
  return {
    ...raw,
    openConflictCount: toNumber(raw.openConflictCount) ?? 0,
    premiums: raw.premiums
      ? {
          usdtPremiumPercent: toNumber(raw.premiums.usdtPremiumPercent),
          paxgPremiumPercent: toNumber(raw.premiums.paxgPremiumPercent),
        }
      : null,
    portfolio: raw.portfolio
      ? {
          cashTotal: toNumber(raw.portfolio.cashTotal) ?? 0,
          investmentTotal: toNumber(raw.portfolio.investmentTotal) ?? 0,
          customTotal: toNumber(raw.portfolio.customTotal) ?? 0,
          totalToman: toNumber(raw.portfolio.totalToman) ?? 0,
          holdings: (raw.portfolio.holdings ?? []).map((row) => ({
            ...row,
            amountToman: toNumber(row.amountToman) ?? 0,
            quantity: toNumber(row.quantity),
          })),
        }
      : null,
    assets: (raw.assets ?? []).map((row) => ({
      ...row,
      latestPrice: toNumber(row.latestPrice) ?? 0,
      return30d: toNumber(row.return30d),
      return1y: toNumber(row.return1y),
      monthlyCloses: (row.monthlyCloses ?? []).map((point) => ({
        period: point.period,
        close: toNumber(point.close) ?? 0,
      })),
    })),
    macro: (raw.macro ?? []).map((row) => ({
      ...row,
      value: toNumber(row.value) ?? 0,
    })),
  }
}

const BASE = '/api/v1/advisor'

export function previewAdvisorContext(body: AdvisorContextRequest): Promise<AdvisorContext> {
  return apiPost<AdvisorContext>(`${BASE}/context`, body, 'خطا در دریافت پیش‌نمایش داده').then(mapContext)
}

export function submitAdvisorDraft(body: AdvisorDraftRequest): Promise<AdvisorRecommendation> {
  return apiPost<AdvisorRecommendation>(`${BASE}/draft`, body, 'خطا در ثبت تحلیل مشاور')
}

export function listAdvisorRecommendations(): Promise<AdvisorRecommendation[]> {
  return apiGetList<AdvisorRecommendation>(`${BASE}/recommendations`, 'خطا در دریافت تاریخچه توصیه‌ها')
}

export function getAdvisorRecommendation(id: number): Promise<AdvisorRecommendation> {
  return apiGet<AdvisorRecommendation>(`${BASE}/recommendations/${id}`, 'خطا در دریافت توصیه')
}

export function transitionAdvisorRecommendation(
  id: number,
  status: RecommendationStatus,
  reason?: string,
): Promise<AdvisorRecommendation> {
  return apiPost<AdvisorRecommendation>(
    `${BASE}/recommendations/${id}/transition`,
    { status, reason },
    'خطا در تغییر وضعیت توصیه',
  )
}

export interface AdvisorEvaluation {
  id: number
  recommendationId: number
  assetSymbol: string
  currency: string
  startDate: string | null
  startDateJalali: string | null
  endDate: string | null
  endDateJalali: string | null
  startPrice: number | null
  endPrice: number | null
  assetReturnPercent: number | null
  goldReturnPercent: number | null
  usdReturnPercent: number | null
  btcReturnPercent: number | null
  assetMove: 'UP' | 'DOWN' | 'FLAT' | null
  timeHorizon: string | null
  horizonEnd: string | null
  horizonEndJalali: string | null
  horizonElapsed: boolean
  status: 'EVALUATED' | 'INSUFFICIENT_DATA'
  evaluatedAt: string
}

export function getAdvisorEvaluation(id: number): Promise<AdvisorEvaluation> {
  return apiGet<AdvisorEvaluation>(`${BASE}/recommendations/${id}/evaluation`, 'خطا در ارزیابی توصیه').then(
    (row) => ({
      ...row,
      startPrice: row.startPrice != null ? Number(row.startPrice) : null,
      endPrice: row.endPrice != null ? Number(row.endPrice) : null,
      assetReturnPercent: row.assetReturnPercent != null ? Number(row.assetReturnPercent) : null,
      goldReturnPercent: row.goldReturnPercent != null ? Number(row.goldReturnPercent) : null,
      usdReturnPercent: row.usdReturnPercent != null ? Number(row.usdReturnPercent) : null,
      btcReturnPercent: row.btcReturnPercent != null ? Number(row.btcReturnPercent) : null,
    }),
  )
}
