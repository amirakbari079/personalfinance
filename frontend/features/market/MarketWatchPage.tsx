'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '@/shared/PageHeader'
import MarketRefreshButton from '@/shared/market/MarketRefreshButton'
import MarketWatchRow from './MarketWatchRow'
import WatchlistStockCard from './WatchlistStockCard'
import BourseSymbolSearch from './BourseSymbolSearch'
import {
  type MarketQuote,
  type BourseInstrumentQuote,
  type BourseInstrument,
  getMarketQuotes,
  refreshMarketQuotes,
  getWatchlistQuotes,
  latestQuoteTime,
  minutesAgo,
} from '@/lib/api/marketApi'
import {
  loadWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  updateWatchlistItem,
} from '@/lib/marketWatchlist'
import type { WatchlistItem } from '@/lib/api/marketApi'
import { TrendingUp, Bitcoin, DollarSign, Gem, LineChart } from 'lucide-react'

const VPN_HINT =
  'دسترسی به منابع بازار را بررسی کنید و دوباره تلاش کنید. آخرین قیمت ذخیره‌شده هنگام قطع منبع حفظ می‌شود.'

const MARKET_GROUPS: {
  id: string
  title: string
  icon: typeof TrendingUp
  match: (q: MarketQuote) => boolean
}[] = [
  { id: 'etf', title: 'صندوق‌ها', icon: LineChart, match: (q) => q.symbol.startsWith('ETF_') },
  { id: 'fx', title: 'ارز', icon: DollarSign, match: (q) => q.symbol === 'USD_IRR' },
  { id: 'gold', title: 'طلا', icon: Gem, match: (q) => q.symbol.startsWith('GOLD_') },
  {
    id: 'crypto',
    title: 'رمزارز',
    icon: Bitcoin,
    match: (q) => q.symbol.startsWith('BTC_') || q.symbol === 'PAXG_USD',
  },
]

function SectionHeader({ title, icon: Icon }: { title: string; icon: typeof TrendingUp }) {
  return (
    <div className="chand-section-head">
      <Icon className="w-3.5 h-3.5 text-brand-accent" />
      <span>{title}</span>
    </div>
  )
}

export default function MarketWatchPage() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([])
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [watchlistQuotes, setWatchlistQuotes] = useState<BourseInstrumentQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  const watchlistInsCodes = useMemo(() => watchlist.map((w) => w.insCode), [watchlist])

  const loadAll = useCallback(async () => {
    setRefreshError(null)
    try {
      const saved = loadWatchlist()
      setWatchlist(saved)
      // A slow stock exchange must not hide currencies and crypto.
      void refreshWatchlistQuotes(saved)
      const q = await getMarketQuotes()
      setQuotes(q)
      setUpdatedAt(latestQuoteTime(q))
    } catch (e) {
      setRefreshError(e instanceof Error ? e.message : 'خطا در بارگذاری')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAll()
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadAll()
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [loadAll])

  async function handleRefresh() {
    setRefreshing(true)
    setRefreshError(null)
    try {
      const saved = loadWatchlist()
      void refreshWatchlistQuotes(saved)
      const q = await refreshMarketQuotes()
      setQuotes(q)
      setUpdatedAt(latestQuoteTime(q))
    } catch (e) {
      setRefreshError(e instanceof Error ? e.message : 'خطا در به‌روزرسانی')
    } finally {
      setRefreshing(false)
    }
  }

  async function refreshWatchlistQuotes(items: WatchlistItem[]) {
    if (items.length === 0) {
      setWatchlistQuotes([])
      return
    }
    try {
      const wlQuotes = await getWatchlistQuotes(items)
      setWatchlistQuotes(wlQuotes)
    } catch {
      setRefreshError('دریافت قیمت نمادهای بورسی انجام نشد. قیمت‌های قبلی حفظ شدند.')
    }
  }

  async function handleAddWatch(item: BourseInstrument) {
    const next = addToWatchlist({
      insCode: item.insCode,
      symbol: item.symbol,
      name: item.name,
    })
    setWatchlist(next)
    await refreshWatchlistQuotes(next)
  }

  async function handleRemoveWatch(insCode: string) {
    const next = removeFromWatchlist(insCode)
    setWatchlist(next)
    setWatchlistQuotes((prev) => prev.filter((q) => q.insCode !== insCode))
  }

  function handleToggleShow(insCode: string, value: boolean) {
    const next = updateWatchlistItem(insCode, { showOnInvestments: value })
    setWatchlist(next)
  }

  function handleDisplayNameChange(insCode: string, value: string) {
    const item = watchlist.find((w) => w.insCode === insCode)
    if (!item) return
    const trimmed = value.trim()
    const displayName = !trimmed || trimmed === item.name ? undefined : trimmed
    const next = updateWatchlistItem(insCode, { displayName })
    setWatchlist(next)
  }

  const groupedQuotes = MARKET_GROUPS.map((group) => ({
    ...group,
    items: quotes.filter(group.match),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-12">
      <PageHeader
        title="قیمت‌های لحظه‌ای"
        subtitle="دلار، طلا، رمزارز و نمادهای بورسی"
      />

      <div className="chand-panel mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <TrendingUp className="w-4 h-4 text-brand-accent" />
            {updatedAt ? `آخرین به‌روزرسانی: ${minutesAgo(updatedAt)}` : loading ? 'در حال دریافت قیمت‌ها…' : 'هنوز قیمتی ثبت نشده است'}
          </div>
          <MarketRefreshButton onClick={handleRefresh} loading={refreshing} label="به‌روزرسانی" />
        </div>

        <BourseSymbolSearch
          onSelect={handleAddWatch}
          excludeInsCodes={watchlistInsCodes}
          placeholder="افزودن نماد بورسی، مثلاً عیار، فملی، نارنج…"
        />
      </div>

      {!loading && quotes.length < 8 && (
        <p role="status" className="text-sm text-text-muted mb-4">
          بعضی قیمت‌ها هنوز دریافت نشده‌اند. وضعیت منابع را در «هوش مالی ← به‌روزرسانی‌ها» ببینید.
        </p>
      )}
      {refreshError && (
        <p role="alert" className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-xl px-3 py-2 mb-4">
          {refreshError}
        </p>
      )}

      {loading ? (
        <div className="chand-panel flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="market-watch-grid">
          {watchlist.length > 0 && (
            <section className="chand-panel market-watch-grid-full">
              <SectionHeader title="سهام/صندوق‌ها" icon={LineChart} />
              <div className="watchlist-stock-grid">
                {watchlist.map((item) => (
                  <WatchlistStockCard
                    key={item.insCode}
                    item={item}
                    quote={watchlistQuotes.find((q) => q.insCode === item.insCode)}
                    showOnInvestments={Boolean(item.showOnInvestments)}
                    onToggleShow={(v) => handleToggleShow(item.insCode, v)}
                    onDisplayNameChange={(v) => handleDisplayNameChange(item.insCode, v)}
                    onRemove={() => handleRemoveWatch(item.insCode)}
                  />
                ))}
              </div>
            </section>
          )}

          {groupedQuotes.map((group) => (
            <section key={group.id} className="chand-panel">
              <SectionHeader title={group.title} icon={group.icon} />
              <div className="chand-list">
                {group.items.map((q) => (
                  <MarketWatchRow
                    key={q.symbol}
                    symbol={q.label.split(' ')[0]}
                    name={q.label}
                    value={q.value}
                    subtitle={`${q.source} · ${minutesAgo(q.recordedAt)}${Date.now() - Date.parse(q.recordedAt) > 900_000 ? ' · آخرین قیمت ثبت‌شده' : ''}`}
                    currency={q.currency}
                    changePercent={q.changePercentMonth}
                  />
                ))}
              </div>
            </section>
          ))}

          {groupedQuotes.length === 0 && watchlist.length === 0 && (
            <div className="chand-panel text-center py-10 space-y-3 market-watch-grid-full">
              <p className="text-sm text-text-muted">قیمت بازار در دسترس نیست.</p>
              <MarketRefreshButton onClick={handleRefresh} loading={refreshing} label="تلاش مجدد" />
              <p className="text-[10px] text-text-muted px-4">{VPN_HINT}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
