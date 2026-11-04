'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  type MarketQuote,
  type MarketSymbol,
  type MarketHistoryPoint,
  type BourseInstrumentQuote,
  type WatchlistItem,
  getMarketQuotes,
  getMarketHistory,
  refreshMarketQuotes,
  getWatchlistQuotes,
} from '@/lib/api/marketApi'
import { getInvestmentsPinnedWatchlist } from '@/lib/marketWatchlist'
import WatchlistStockCard from '@/features/market/WatchlistStockCard'
import MarketQuoteCard from './MarketQuoteCard'
import MarketQuotePairCard from './MarketQuotePairCard'
import MarketRefreshButton from './MarketRefreshButton'
import MarketHistoryMiniChart from './MarketHistoryMiniChart'
import { ChevronDown, TrendingUp } from 'lucide-react'

const CHART_SYMBOLS: MarketSymbol[] = ['BTC_IRR', 'GOLD_18K_IRR']

const PAIR_GROUPS: {
  title: string
  symbols: MarketSymbol[]
  chartSymbol: MarketSymbol
  refreshable: boolean
}[] = [
  {
    title: 'بیت‌کوین',
    symbols: ['BTC_USD', 'BTC_IRR'],
    chartSymbol: 'BTC_IRR',
    refreshable: true,
  },
  {
    title: 'طلا',
    symbols: ['GOLD_18K_IRR', 'GOLD_XAU_USD'],
    chartSymbol: 'GOLD_18K_IRR',
    refreshable: true,
  },
]

const SINGLE_GROUPS: { title: string; symbols: MarketSymbol[] }[] = [
  { title: 'ارز', symbols: ['USD_IRR'] },
]

const VPN_HINT =
  'قیمت‌های TGJU با VPN روشن ممکن است لود نشوند. VPN را خاموش کنید و «بروزرسانی» بزنید.'

interface Props {
  className?: string
}

export default function MarketSidebar({ className = '' }: Props) {
  const [quotes, setQuotes] = useState<MarketQuote[]>([])
  const [pinnedItems, setPinnedItems] = useState<WatchlistItem[]>([])
  const [pinnedQuotes, setPinnedQuotes] = useState<BourseInstrumentQuote[]>([])
  const [history, setHistory] = useState<Record<string, MarketHistoryPoint[]>>({})
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  const loadPinned = useCallback(async () => {
    const pinned = getInvestmentsPinnedWatchlist()
    setPinnedItems(pinned)
    if (pinned.length === 0) {
      setPinnedQuotes([])
      return
    }
    try {
      const wlQuotes = await getWatchlistQuotes(pinned)
      setPinnedQuotes(wlQuotes)
    } catch {
      setPinnedQuotes([])
    }
  }, [])

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const entries = await Promise.all(
        CHART_SYMBOLS.map(async (sym) => {
          const points = await getMarketHistory(sym)
          return [sym, points] as const
        }),
      )
      setHistory(Object.fromEntries(entries))
    } catch {
      /* optional */
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const q = await getMarketQuotes()
        if (!cancelled) {
          setQuotes(q)
          void loadHistory()
          void loadPinned()
        }
      } catch {
        /* optional */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [loadHistory, loadPinned])

  useEffect(() => {
    const onChange = () => loadPinned()
    window.addEventListener('storage', onChange)
    window.addEventListener('pf-watchlist-changed', onChange)
    return () => {
      window.removeEventListener('storage', onChange)
      window.removeEventListener('pf-watchlist-changed', onChange)
    }
  }, [loadPinned])

  async function handleRefresh() {
    setRefreshing(true)
    setRefreshError(null)
    try {
      const q = await refreshMarketQuotes()
      setQuotes(q)
      await Promise.all([loadHistory(), loadPinned()])
    } catch (e) {
      setRefreshError(e instanceof Error ? e.message : 'خطا در بروزرسانی')
    } finally {
      setRefreshing(false)
    }
  }

  function quoteBySymbol(symbol: MarketSymbol): MarketQuote | undefined {
    return quotes.find((q) => q.symbol === symbol)
  }

  function groupMissingIranian(symbols: MarketSymbol[]): boolean {
    const iranian: MarketSymbol[] = ['GOLD_18K_IRR', 'BTC_IRR', 'USD_IRR']
    return symbols.some((s) => iranian.includes(s) && !quoteBySymbol(s))
  }

  function latestRecordedAt(groupQuotes: MarketQuote[]): string | undefined {
    return groupQuotes.reduce<string | undefined>((acc, q) => {
      if (!acc || q.recordedAt > acc) return q.recordedAt
      return acc
    }, undefined)
  }

  const hasMarketData = quotes.length > 0 || pinnedItems.length > 0

  const content = (
    <div className="market-panel space-y-4">
      <div className="flex items-center justify-between px-1 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-accent/10 text-brand-accent">
            <TrendingUp className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-section-label text-text-muted">بازار لحظه‌ای</h2>
        </div>
        <MarketRefreshButton onClick={handleRefresh} loading={refreshing} label="بروزرسانی" />
      </div>

      {refreshError && (
        <p className="text-xs text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-3 py-2 animate-fade-in-up">
          {refreshError}
        </p>
      )}

      {loading ? (
        <div className="glass-card p-8 flex justify-center">
          <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {pinnedItems.length > 0 && (
            <div className="space-y-2 animate-fade-in-up">
              <div className="flex items-center justify-between px-1 gap-2">
                <p className="text-[11px] text-text-muted">سهام/صندوق‌ها</p>
                <Link href="/market" className="text-[10px] text-brand-accent hover:underline">
                  مدیریت
                </Link>
              </div>
              <div className="watchlist-stock-grid">
                {pinnedItems.map((item) => (
                  <WatchlistStockCard
                    key={item.insCode}
                    item={item}
                    quote={pinnedQuotes.find((q) => q.insCode === item.insCode)}
                  />
                ))}
              </div>
            </div>
          )}

          {!hasMarketData ? (
            <div className="glass-card p-6 text-center text-sm text-text-muted space-y-3">
              <p>قیمت بازار در دسترس نیست.</p>
              <MarketRefreshButton onClick={handleRefresh} loading={refreshing} label="تلاش مجدد" />
              <p className="text-[10px]">{VPN_HINT}</p>
            </div>
          ) : (
            <>
              {PAIR_GROUPS.map((group, groupIndex) => {
                const groupQuotes = group.symbols
                  .map(quoteBySymbol)
                  .filter((q): q is MarketQuote => q != null)

                return (
                  <div
                    key={group.title}
                    className="space-y-2 animate-fade-in-up"
                    style={{ animationDelay: `${groupIndex * 60}ms` }}
                  >
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[11px] text-text-muted">{group.title}</p>
                      {group.refreshable && (
                        <MarketRefreshButton onClick={handleRefresh} loading={refreshing} />
                      )}
                    </div>

                    {groupQuotes.length === 0 ? (
                      <div className="glass-card p-4 text-xs text-text-muted space-y-2">
                        <p>قیمت در دسترس نیست</p>
                        {groupMissingIranian(group.symbols) && (
                          <p className="text-[10px] text-status-error/90">{VPN_HINT}</p>
                        )}
                      </div>
                    ) : groupQuotes.length >= 2 ? (
                      <MarketQuotePairCard
                        title=""
                        quotes={groupQuotes}
                        chartSymbol={group.chartSymbol}
                        chartData={history[group.chartSymbol] ?? []}
                        chartLoading={historyLoading}
                        footerSource={groupQuotes.map((q) => q.source).filter(Boolean).join(' / ')}
                        footerTime={latestRecordedAt(groupQuotes)}
                      />
                    ) : (
                      <MarketQuoteCard quote={groupQuotes[0]}>
                        {CHART_SYMBOLS.includes(groupQuotes[0].symbol) && (
                          <MarketHistoryMiniChart
                            data={history[groupQuotes[0].symbol] ?? []}
                            currency={groupQuotes[0].currency}
                            isLoading={historyLoading}
                          />
                        )}
                      </MarketQuoteCard>
                    )}
                  </div>
                )
              })}

              {SINGLE_GROUPS.map((group) => {
                const groupQuotes = group.symbols
                  .map(quoteBySymbol)
                  .filter((q): q is MarketQuote => q != null)
                if (groupQuotes.length === 0) return null
                return (
                  <div key={group.title} className="space-y-2 animate-fade-in-up">
                    <p className="text-[11px] text-text-muted px-1">{group.title}</p>
                    {groupQuotes.map((quote) => (
                      <MarketQuoteCard key={quote.symbol} quote={quote} />
                    ))}
                  </div>
                )
              })}
            </>
          )}
        </>
      )}
    </div>
  )

  return (
    <>
      <aside className={`hidden lg:block w-80 flex-shrink-0 ${className}`}>
        {content}
      </aside>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="glass-card w-full px-4 py-3 flex items-center justify-between text-sm text-text-primary"
        >
          <span>قیمت‌های بازار</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        {expanded && <div className="mt-3">{content}</div>}
      </div>
    </>
  )
}
