'use client'

import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import type { Investment, InvestmentRequest, InvestmentType } from '@/lib/api/investmentsApi'
import { INVESTMENT_TYPE_LABELS } from '@/lib/api/investmentsApi'
import { formatWithCommas, stripCommas } from '@/utils/numberFormat'
import JalaliDatePicker from '@/shared/JalaliDatePicker'
import { getTodayJalali } from '@/utils/jalaliToday'
import FormModalShell from '@/shared/FormModalShell'
import MarketReferencePrices from '@/shared/market/MarketReferencePrices'
import BourseSymbolSearch from '@/features/market/BourseSymbolSearch'
import {
  getMarketQuotes,
  refreshMarketQuotes,
  latestQuoteTime,
  minutesAgo,
  getPortfolioStockQuotes,
  refreshPortfolioStockQuotes,
  getWatchlistQuotes,
  type MarketQuote,
  type MarketSymbol,
  type PortfolioStockQuote,
  type BourseInstrument,
  type WatchlistItem,
} from '@/lib/api/marketApi'

const ETF_INS_CODES = {
  AYAR: '68603452107668866',
  NARANGE: '120079097679462',
} as const

interface Props {
  initial: Investment | null
  onSave: (data: InvestmentRequest) => Promise<void>
  onCancel: () => void
}

const INVESTMENT_TYPES: InvestmentType[] = ['STOCK', 'GOLD', 'CRYPTO', 'FOREIGN_CURRENCY', 'OTHER']

type CryptoKind = 'BTC' | 'PAXG'

const STOCK_PRESETS: WatchlistItem[] = [
  { insCode: ETF_INS_CODES.AYAR, symbol: 'عیار', name: 'صندوق طلای عیار' },
  { insCode: ETF_INS_CODES.NARANGE, symbol: 'نارنج', name: 'صندوق درآمد ثابت نارنج' },
]

const VPN_HINT =
  'قیمت‌های ایرانی (TGJU) با VPN روشن ممکن است لود نشوند. VPN را خاموش کنید و «بروزرسانی» بزنید.'

function detectInitialStock(initial: Investment | null): WatchlistItem | null {
  if (!initial || initial.assetType !== 'STOCK') return STOCK_PRESETS[0]
  const unit = initial.nativeUnit ?? ''
  if (unit.startsWith('b:')) {
    const insCode = unit.slice(2).trim()
    if (insCode) {
      const preset = STOCK_PRESETS.find((p) => p.insCode === insCode)
      return preset ?? { insCode, symbol: initial.name.slice(0, 8), name: initial.name }
    }
  }
  if (unit.includes(ETF_INS_CODES.NARANGE) || unit.includes('نارنج')) return STOCK_PRESETS[1]
  if (unit.includes(ETF_INS_CODES.AYAR) || unit.includes('عیار')) return STOCK_PRESETS[0]
  return STOCK_PRESETS[0]
}

function detectCryptoKind(initial: Investment | null): CryptoKind {
  if (!initial || initial.assetType !== 'CRYPTO') return 'BTC'
  const unit = (initial.nativeUnit ?? '').toUpperCase()
  return unit.includes('PAXG') ? 'PAXG' : 'BTC'
}

function quoteValue(quotes: MarketQuote[], symbol: MarketSymbol): number | null {
  const q = quotes.find((item) => item.symbol === symbol)
  if (!q) return null
  const v = Number(q.value)
  return Number.isFinite(v) && v > 0 ? v : null
}

function portfolioStockPrice(stocks: PortfolioStockQuote[], insCode: string): number | null {
  const match = stocks.find((s) => s.insCode === insCode && s.value != null && s.value > 0)
  return match?.value ?? null
}

/** TSETMC sometimes returns ETF prices with extra zeros (millions per unit). */
function normalizeStockUnitToman(price: number): number {
  let value = price
  let scaled = 0
  while (value >= 1_000_000 && scaled < 3) {
    value = Math.round(value / 1000)
    scaled += 1
  }
  return value
}

function paxgTomanPrice(quotes: MarketQuote[]): number | null {
  const paxgUsd = quoteValue(quotes, 'PAXG_USD')
  const usdIrr = quoteValue(quotes, 'USD_IRR')
  if (paxgUsd == null || usdIrr == null) return null
  return Math.round(paxgUsd * usdIrr)
}

export default function InvestmentForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [assetType, setAssetType] = useState<InvestmentType>(initial?.assetType ?? 'GOLD')
  const [cryptoKind, setCryptoKind] = useState<CryptoKind>(detectCryptoKind(initial))
  const [quantity, setQuantity] = useState(initial?.nativeAmount?.toString() ?? '')
  const [selectedStock, setSelectedStock] = useState<WatchlistItem | null>(detectInitialStock(initial))
  const [stockLivePrice, setStockLivePrice] = useState<number | null>(null)
  const [unitPrice, setUnitPrice] = useState('')
  const [manualUnitPrice, setManualUnitPrice] = useState(false)
  const [tomanEquivalent, setTomanEquivalent] = useState(formatWithCommas(initial?.tomanEquivalent?.toString() ?? '0'))
  const [manualToman, setManualToman] = useState(false)
  const [valueRecordedDate, setValueRecordedDate] = useState(getTodayJalali())
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [quotes, setQuotes] = useState<MarketQuote[]>([])
  const [portfolioStocks, setPortfolioStocks] = useState<PortfolioStockQuote[]>([])
  const [quotesLoading, setQuotesLoading] = useState(true)
  const [quotesRefreshing, setQuotesRefreshing] = useState(false)
  const [quotesUpdatedAt, setQuotesUpdatedAt] = useState<string | null>(null)
  const [refreshError, setRefreshError] = useState<string | null>(null)

  const supportsAutoCalc =
    assetType === 'GOLD' || assetType === 'CRYPTO' || assetType === 'STOCK' || assetType === 'FOREIGN_CURRENCY'

  const refSymbols = useMemo((): MarketSymbol[] => {
    switch (assetType) {
      case 'GOLD':
        return ['GOLD_18K_IRR']
      case 'CRYPTO':
        return cryptoKind === 'PAXG' ? ['PAXG_USD', 'USD_IRR'] : ['BTC_USD', 'BTC_IRR']
      case 'FOREIGN_CURRENCY':
        return ['USD_IRR']
      case 'STOCK':
        return []
      default:
        return []
    }
  }, [assetType, cryptoKind])

  const refTitle = useMemo(() => {
    switch (assetType) {
      case 'GOLD': return 'طلای ۱۸ عیار ایران'
      case 'CRYPTO': return cryptoKind === 'PAXG' ? 'PAXG (دلاری)' : 'بیت‌کوین'
      case 'FOREIGN_CURRENCY': return 'نرخ دلار'
      case 'STOCK': return selectedStock ? `${selectedStock.symbol} — TSETMC` : 'قیمت ETF بورس'
      default: return 'قیمت مرجع'
    }
  }, [assetType, cryptoKind])

  const resolveDefaultUnitPrice = useCallback((): number | null => {
    switch (assetType) {
      case 'GOLD':
        return quoteValue(quotes, 'GOLD_18K_IRR')
      case 'CRYPTO':
        return cryptoKind === 'PAXG'
          ? paxgTomanPrice(quotes)
          : quoteValue(quotes, 'BTC_IRR')
      case 'FOREIGN_CURRENCY':
        return quoteValue(quotes, 'USD_IRR')
      case 'STOCK': {
        const raw = stockLivePrice ?? (selectedStock ? portfolioStockPrice(portfolioStocks, selectedStock.insCode) : null)
        return raw != null ? normalizeStockUnitToman(raw) : null
      }
      default:
        return null
    }
  }, [assetType, cryptoKind, selectedStock, stockLivePrice, quotes, portfolioStocks])

  const applyQuotes = useCallback((q: MarketQuote[]) => {
    setQuotes(q)
    setQuotesUpdatedAt(latestQuoteTime(q))
  }, [])

  useEffect(() => {
    if (assetType !== 'STOCK' || !selectedStock) {
      setStockLivePrice(null)
      return
    }
    let cancelled = false
    getWatchlistQuotes([selectedStock])
      .then((items) => {
        if (cancelled) return
        const price = items[0]?.value
        setStockLivePrice(price != null && price > 0 ? normalizeStockUnitToman(price) : null)
      })
      .catch(() => {
        if (!cancelled) setStockLivePrice(null)
      })
    return () => { cancelled = true }
  }, [assetType, selectedStock])

  useEffect(() => {
    let cancelled = false
    setQuotesLoading(true)
    Promise.all([getMarketQuotes(), getPortfolioStockQuotes()])
      .then(([q, stocks]) => {
        if (!cancelled) {
          applyQuotes(q)
          setPortfolioStocks(stocks)
        }
      })
      .catch(() => { /* optional */ })
      .finally(() => { if (!cancelled) setQuotesLoading(false) })
    return () => { cancelled = true }
  }, [applyQuotes])

  useEffect(() => {
    if (!supportsAutoCalc || manualUnitPrice || quotesLoading) return
    const price = resolveDefaultUnitPrice()
    if (price != null) {
      setUnitPrice(formatWithCommas(String(price)))
    }
  }, [supportsAutoCalc, manualUnitPrice, resolveDefaultUnitPrice, quotesLoading, assetType, cryptoKind, selectedStock, stockLivePrice])

  useEffect(() => {
    if (!supportsAutoCalc || manualToman) return
    const amount = parseFloat(quantity)
    const price = parseInt(stripCommas(unitPrice), 10)
    if (isNaN(amount) || amount <= 0 || isNaN(price) || price <= 0) return
    setTomanEquivalent(formatWithCommas(String(Math.round(amount * price))))
  }, [quantity, unitPrice, manualToman, supportsAutoCalc])

  async function handleRefreshQuotes() {
    setQuotesRefreshing(true)
    setRefreshError(null)
    resetAutoCalc()
    try {
      const [q, stocks, stockQuotes] = await Promise.all([
        refreshMarketQuotes(),
        refreshPortfolioStockQuotes(),
        selectedStock ? getWatchlistQuotes([selectedStock]) : Promise.resolve([]),
      ])
      applyQuotes(q)
      setPortfolioStocks(stocks)
      const stockPrice = stockQuotes[0]?.value
      if (stockPrice != null && stockPrice > 0) setStockLivePrice(normalizeStockUnitToman(stockPrice))
      const price = (() => {
        switch (assetType) {
          case 'GOLD': return quoteValue(q, 'GOLD_18K_IRR')
          case 'CRYPTO':
            return cryptoKind === 'PAXG' ? paxgTomanPrice(q) : quoteValue(q, 'BTC_IRR')
          case 'FOREIGN_CURRENCY': return quoteValue(q, 'USD_IRR')
          case 'STOCK':
            return selectedStock
              ? (stockLivePrice ?? portfolioStockPrice(stocks, selectedStock.insCode))
              : null
          default: return null
        }
      })()
      if (price != null) {
        setUnitPrice(formatWithCommas(String(price)))
      }
    } catch (e) {
      setRefreshError(e instanceof Error ? e.message : 'خطا در بروزرسانی قیمت')
    } finally {
      setQuotesRefreshing(false)
    }
  }

  function handleUnitPriceChange(value: string) {
    setManualUnitPrice(true)
    setUnitPrice(formatWithCommas(value))
  }

  function handleTomanChange(value: string) {
    setManualToman(true)
    setTomanEquivalent(formatWithCommas(value))
  }

  function resetAutoCalc() {
    setManualToman(false)
    setManualUnitPrice(false)
  }

  function handleAssetTypeChange(type: InvestmentType) {
    setAssetType(type)
    setQuantity('')
    resetAutoCalc()
    setUnitPrice('')
    if (type !== 'CRYPTO') setCryptoKind('BTC')
    if (type === 'STOCK' && !selectedStock) setSelectedStock(STOCK_PRESETS[0])
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const tomanNum = parseInt(stripCommas(tomanEquivalent), 10)
    if (isNaN(tomanNum) || tomanNum < 0) {
      setError('معادل تومانی باید عدد صحیح غیرمنفی باشد')
      return
    }
    let quantityNum: number | null = null
    if (quantity.trim() !== '') {
      quantityNum = parseFloat(quantity)
      if (isNaN(quantityNum) || quantityNum < 0) {
        setError('مقدار دارایی باید عدد غیرمنفی باشد')
        return
      }
    }
    setError(null)
    setSaving(true)
    try {
      let resolvedUnit = ''
      if (assetType === 'STOCK') {
        if (!selectedStock) {
          setError('نماد بورسی را انتخاب کنید')
          setSaving(false)
          return
        }
        resolvedUnit = `b:${selectedStock.insCode}`
      } else if (assetType === 'GOLD') {
        resolvedUnit = 'گرم'
      } else if (assetType === 'CRYPTO') {
        resolvedUnit = cryptoKind
      } else if (assetType === 'FOREIGN_CURRENCY') {
        resolvedUnit = 'USD'
      }

      await onSave({
        name,
        assetType,
        nativeAmount: quantityNum,
        nativeUnit: resolvedUnit,
        tomanEquivalent: tomanNum,
        notes,
        valueRecordedDate,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ذخیره')
      setSaving(false)
    }
  }

  const livePrice = resolveDefaultUnitPrice()
  const needsIranianPrice = assetType === 'GOLD' || (assetType === 'CRYPTO' && cryptoKind === 'BTC') || assetType === 'FOREIGN_CURRENCY'
  const showVpnHint = needsIranianPrice && livePrice == null && !quotesLoading

  const quantityLabel =
    assetType === 'GOLD' ? 'وزن (گرم)' :
    assetType === 'CRYPTO' ? (cryptoKind === 'PAXG' ? 'مقدار (PAXG)' : 'مقدار (BTC)') :
    assetType === 'FOREIGN_CURRENCY' ? 'مقدار (دلار)' :
    assetType === 'STOCK' ? 'تعداد واحد صندوق' : 'مقدار'

  const unitPriceLabel =
    assetType === 'GOLD' ? 'قیمت هر گرم طلای ۱۸ عیار (تومان)' :
    assetType === 'CRYPTO' ? (cryptoKind === 'PAXG' ? 'قیمت هر PAXG (تومان)' : 'قیمت هر BTC (تومان)') :
    assetType === 'FOREIGN_CURRENCY' ? 'نرخ هر دلار (تومان)' :
    assetType === 'STOCK' ? 'قیمت هر واحد ETF (تومان)' : 'قیمت واحد (تومان)'

  const calcHint =
    assetType === 'GOLD' ? 'وزن (گرم) × قیمت هر گرم = ارزش تومانی' :
    assetType === 'CRYPTO' && cryptoKind === 'PAXG' ? 'مقدار PAXG × قیمت تومانی = ارزش کل (قیمت دلاری × نرخ دلار)' :
    assetType === 'CRYPTO' ? 'مقدار BTC × قیمت تومانی = ارزش کل' :
    assetType === 'FOREIGN_CURRENCY' ? 'مقدار دلار × نرخ = ارزش تومانی' :
    assetType === 'STOCK' ? 'تعداد واحد × NAV = ارزش تومانی' : ''

  return (
    <FormModalShell
      title={initial ? 'ویرایش سرمایه‌گذاری' : 'سرمایه‌گذاری جدید'}
      onClose={onCancel}
      onSubmit={handleSubmit}
      error={error}
      saving={saving}
      submitLabel={initial ? 'ذخیره تغییرات' : 'افزودن سرمایه‌گذاری'}
      submitDisabled={!name.trim()}
    >
      <div>
        <label className="field-label">نام</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          autoFocus
          placeholder="مثلاً: طلای ۱۸ عیار، بیت‌کوین، PAXG"
          className="field-input"
        />
      </div>

      <div>
        <label className="field-label">نوع دارایی</label>
        <select
          value={assetType}
          onChange={e => handleAssetTypeChange(e.target.value as InvestmentType)}
          className="field-input"
        >
          {INVESTMENT_TYPES.map(t => (
            <option key={t} value={t}>{INVESTMENT_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {assetType === 'CRYPTO' && (
        <div>
          <label className="field-label">نوع رمزارز</label>
          <select
            value={cryptoKind}
            onChange={e => {
              setCryptoKind(e.target.value as CryptoKind)
              resetAutoCalc()
              setUnitPrice('')
            }}
            className="field-input"
          >
            <option value="BTC">بیت‌کوین (BTC)</option>
            <option value="PAXG">طلای دیجیتال PAXG (دلاری)</option>
          </select>
        </div>
      )}

      {assetType === 'STOCK' && (
        <div className="space-y-3">
          <label className="field-label">نماد بورسی / صندوق</label>
          <div className="flex flex-wrap gap-2">
            {STOCK_PRESETS.map((preset) => (
              <button
                key={preset.insCode}
                type="button"
                onClick={() => {
                  setSelectedStock(preset)
                  resetAutoCalc()
                  setUnitPrice('')
                  if (!name.trim()) setName(preset.name)
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  selectedStock?.insCode === preset.insCode
                    ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                    : 'border-surface-muted/60 text-text-muted hover:text-text-primary'
                }`}
              >
                {preset.symbol}
              </button>
            ))}
          </div>
          <BourseSymbolSearch
            onSelect={(item: BourseInstrument) => {
              setSelectedStock({
                insCode: item.insCode,
                symbol: item.symbol,
                name: item.name,
              })
              resetAutoCalc()
              setUnitPrice('')
              if (!name.trim()) setName(item.name)
            }}
            excludeInsCodes={selectedStock ? [selectedStock.insCode] : []}
            placeholder="جستجو: نام یا نماد — مثلاً فملی، سیمانا..."
          />
          {selectedStock && (
            <p className="text-[10px] text-text-muted">
              انتخاب‌شده: {selectedStock.symbol} — {selectedStock.name} · insCode {selectedStock.insCode}
            </p>
          )}
        </div>
      )}

      {supportsAutoCalc && (
        <>
          {assetType === 'STOCK' ? (
            <div className="glass-card p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <p className="text-text-muted">{refTitle}</p>
                <button
                  type="button"
                  onClick={handleRefreshQuotes}
                  disabled={quotesRefreshing}
                  className="text-brand-accent hover:text-brand-accent-hover disabled:opacity-50"
                >
                  {quotesRefreshing ? 'در حال دریافت از TSETMC...' : 'بروزرسانی از بورس'}
                </button>
              </div>
              <p className="text-amount text-text-primary tabular-nums">
                {livePrice != null
                  ? `${formatWithCommas(String(livePrice))} تومان`
                  : quotesLoading || quotesRefreshing
                    ? 'در حال دریافت...'
                    : 'قیمت در دسترس نیست'}
              </p>
              <p className="text-[10px] text-text-muted">
                قیمت از TSETMC — insCode: {selectedStock?.insCode ?? '—'}
              </p>
            </div>
          ) : (
            <MarketReferencePrices
              quotes={quotes}
              symbols={refSymbols}
              title={refTitle}
              onRefresh={handleRefreshQuotes}
              refreshing={quotesRefreshing}
              missingHint={showVpnHint ? VPN_HINT : undefined}
            />
          )}
          {refreshError && (
            <p className="text-xs text-status-error -mt-1">{refreshError}</p>
          )}
        </>
      )}

      {supportsAutoCalc ? (
        <>
          <div>
            <label className="field-label">{quantityLabel}</label>
            <input
              type="text"
              inputMode="decimal"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder="0"
              className="field-input tabular-nums"
            />
            <p className="text-[10px] text-text-muted mt-1">{calcHint}</p>
          </div>

          <div>
            <label className="field-label">{unitPriceLabel}</label>
            <input
              type="text"
              inputMode="numeric"
              value={unitPrice}
              onChange={e => handleUnitPriceChange(e.target.value)}
              placeholder={livePrice != null ? formatWithCommas(String(livePrice)) : 'در حال دریافت...'}
              className="field-input tabular-nums"
            />
            <p className="text-[10px] text-text-muted mt-1">
              {manualUnitPrice ? 'قیمت دستی — ' : 'قیمت بازار — '}
              {quotesLoading || quotesRefreshing
                ? 'در حال دریافت...'
                : livePrice != null
                  ? `${formatWithCommas(String(livePrice))} تومان`
                  : 'در دسترس نیست — «بروزرسانی» بزنید یا دستی وارد کنید'}
              {quotesUpdatedAt && !quotesLoading && !quotesRefreshing && ` · ${minutesAgo(quotesUpdatedAt)}`}
            </p>
          </div>
        </>
      ) : (
        <div>
          <label className="field-label">مقدار / توضیح</label>
          <input
            type="text"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="مقدار یا توضیح دارایی"
            className="field-input"
          />
        </div>
      )}

      <div>
        <label className="field-label">معادل تومانی (تومان)</label>
        <input
          type="text"
          inputMode="numeric"
          value={tomanEquivalent}
          onChange={e => handleTomanChange(e.target.value)}
          required
          placeholder="0"
          className="field-input tabular-nums"
        />
        {supportsAutoCalc && manualToman && (
          <button
            type="button"
            onClick={resetAutoCalc}
            className="text-[10px] text-brand-accent mt-1 hover:underline"
          >
            بازگشت به محاسبه خودکار
          </button>
        )}
      </div>

      <div>
        <label className="field-label">تاریخ ثبت ارزش</label>
        <JalaliDatePicker
          value={valueRecordedDate}
          onChange={setValueRecordedDate}
          placeholder="تاریخ ثبت"
        />
        <p className="text-[10px] text-text-muted mt-1">
          هر بار که ارزش را به‌روز می‌کنید، در این تاریخ ذخیره می‌شود.
        </p>
      </div>

      <div>
        <label className="field-label">
          یادداشت / توضیح برای تحلیل <span className="text-text-muted font-normal">(اختیاری)</span>
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="مثال: این صندوق برای سرمایه‌گذاری بلندمدت است / طلا برای پس‌انداز عروسی"
          className="field-input resize-none"
        />
      </div>
    </FormModalShell>
  )
}
