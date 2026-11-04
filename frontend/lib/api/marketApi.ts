import { apiGet, apiGetList, apiRequest } from './apiClient'

export type MarketSymbol =
  | 'BTC_USD'
  | 'BTC_IRR'
  | 'GOLD_18K_IRR'
  | 'GOLD_XAU_USD'
  | 'PAXG_USD'
  | 'USD_IRR'
  | 'ETF_AYAR'
  | 'ETF_NARANGE'

export interface MarketQuote {
  symbol: MarketSymbol
  label: string
  value: number
  currency: string
  source: string
  recordedAt: string
  changePercentMonth: number | null
}

export interface MarketHistoryPoint {
  recordedAt: string
  value: number
}

export interface MarketCalcResult {
  assetType: string
  amount: number
  unit: string
  unitPrice: number
  priceCurrency: string
  tomanEquivalent: number
  priceOverridden: boolean
}

export interface PortfolioStockQuote {
  investmentId: number
  name: string
  insCode: string | null
  value: number | null
  currency: string
  source: string | null
  recordedAt: string | null
  errorMessage: string | null
}

export interface BourseInstrument {
  insCode: string
  symbol: string
  name: string
  marketLabel: string
}

export interface BourseInstrumentQuote {
  insCode: string
  symbol: string
  name: string
  value: number | null
  currency: string
  changePercent: number | null
  source: string | null
  recordedAt: string | null
  errorMessage: string | null
}

export interface WatchlistItem {
  insCode: string
  symbol: string
  /** نام اصلی از TSETMC — برای جستجو دست نخورده می‌ماند */
  name: string
  /** نام نمایشی شخصی (اختیاری) */
  displayName?: string
  /** نمایش در صفحه سرمایه‌گذاری‌ها */
  showOnInvestments?: boolean
}

export function watchlistLabel(item: WatchlistItem): string {
  const custom = item.displayName?.trim()
  if (custom) return custom
  return item.name || item.symbol
}

const BASE = '/api/v1/market'

export async function getMarketQuotes(): Promise<MarketQuote[]> {
  const data = await apiGetList<MarketQuote>(`${BASE}/quotes`, 'خطا در دریافت قیمت‌های بازار')
  return data.map(normalizeQuote)
}

/** Fetches fresh prices from external providers (manual retry). */
export async function refreshMarketQuotes(): Promise<MarketQuote[]> {
  const data = await apiRequest<MarketQuote[] | null>(`${BASE}/refresh`, {
    method: 'POST',
    errorMessage: 'خطا در بروزرسانی قیمت‌های بازار',
  })
  return (data ?? []).map(normalizeQuote)
}

export async function getPortfolioStockQuotes(): Promise<PortfolioStockQuote[]> {
  const data = await apiGetList<PortfolioStockQuote>(
    `${BASE}/portfolio-stocks`,
    'خطا در دریافت قیمت سهام/صندوق‌های شما',
  )
  return data.map(normalizePortfolioQuote)
}

export async function refreshPortfolioStockQuotes(): Promise<PortfolioStockQuote[]> {
  const data = await apiRequest<PortfolioStockQuote[] | null>(`${BASE}/portfolio-stocks/refresh`, {
    method: 'POST',
    errorMessage: 'خطا در بروزرسانی قیمت بورس',
  })
  return (data ?? []).map(normalizePortfolioQuote)
}

export async function searchBourseInstruments(query: string): Promise<BourseInstrument[]> {
  const qs = new URLSearchParams({ q: query })
  return apiGetList<BourseInstrument>(
    `${BASE}/instruments/search?${qs}`,
    'خطا در جستجوی نماد بورس',
  )
}

export async function getWatchlistQuotes(items: WatchlistItem[]): Promise<BourseInstrumentQuote[]> {
  const data = await apiRequest<BourseInstrumentQuote[] | null>(`${BASE}/instruments/quotes`, {
    method: 'POST',
    body: JSON.stringify({ items }),
    errorMessage: 'خطا در دریافت قیمت نمادها',
  })
  return (data ?? []).map(normalizeBourseQuote)
}

function normalizeBourseQuote(raw: BourseInstrumentQuote): BourseInstrumentQuote {
  return {
    ...raw,
    value: raw.value != null ? Number(raw.value) : null,
    changePercent: raw.changePercent != null ? Number(raw.changePercent) : null,
  }
}

function normalizePortfolioQuote(raw: PortfolioStockQuote): PortfolioStockQuote {
  return {
    ...raw,
    value: raw.value != null ? Number(raw.value) : null,
  }
}

export function latestQuoteTime(quotes: MarketQuote[]): string | null {
  return quotes.reduce<string | null>((acc, item) => {
    if (!acc || item.recordedAt > acc) return item.recordedAt
    return acc
  }, null)
}

function normalizeQuote(raw: MarketQuote): MarketQuote {
  return {
    ...raw,
    value: Number(raw.value),
    changePercentMonth: raw.changePercentMonth != null ? Number(raw.changePercentMonth) : null,
  }
}

export function getMarketHistory(symbol: MarketSymbol): Promise<MarketHistoryPoint[]> {
  return apiGetList<MarketHistoryPoint>(`${BASE}/history/${symbol}`, 'خطا در دریافت تاریخچه قیمت')
}

export function calcMarketValue(params: {
  type: string
  amount: number
  unit?: string
  etf?: string
  priceOverride?: number
}): Promise<MarketCalcResult> {
  const qs = new URLSearchParams({
    type: params.type,
    amount: String(params.amount),
  })
  if (params.unit) qs.set('unit', params.unit)
  if (params.etf) qs.set('etf', params.etf)
  if (params.priceOverride != null) qs.set('priceOverride', String(params.priceOverride))

  return apiGet<MarketCalcResult>(`${BASE}/calc?${qs}`, 'خطا در محاسبه ارزش')
}

export function formatMarketValue(value: number, currency: string): string {
  if (currency === 'USD') {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }
  return `${value.toLocaleString('fa-IR')} تومان`
}

export function minutesAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.max(0, Math.floor(diff / 60_000))
  if (mins < 1) return 'همین الان'
  if (mins < 60) return `${mins.toLocaleString('fa-IR')} دقیقه پیش`
  const hours = Math.floor(mins / 60)
  return `${hours.toLocaleString('fa-IR')} ساعت پیش`
}
