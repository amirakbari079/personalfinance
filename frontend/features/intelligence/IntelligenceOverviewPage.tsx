'use client'

import { useCallback, useEffect, useState } from 'react'
import PageHeader from '@/shared/PageHeader'
import MarketRefreshButton from '@/shared/market/MarketRefreshButton'
import { formatChange, formatPrice, formatStatus } from './format'
import {
  enqueueIntelligenceUpdate,
  getIntelligencePrices,
  getIntelligenceUpdate,
  getMarketPremiums,
  listIntelligenceUpdates,
  type IntelligencePrice,
  type IntelligenceUpdate,
  type MarketPremiums,
} from './api'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function IntelligenceOverviewPage() {
  const [prices, setPrices] = useState<IntelligencePrice[]>([])
  const [premiums, setPremiums] = useState<MarketPremiums | null>(null)
  const [updates, setUpdates] = useState<IntelligenceUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    const [nextPrices, nextPremiums, nextUpdates] = await Promise.all([
      getIntelligencePrices(),
      getMarketPremiums(),
      listIntelligenceUpdates(),
    ])
    setPrices(nextPrices)
    setPremiums(nextPremiums)
    setUpdates(nextUpdates)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    load()
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'خطا در بارگذاری')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [load])

  async function handleUpdate() {
    setRefreshing(true)
    setError(null)
    try {
      const job = await enqueueIntelligenceUpdate()
      for (let i = 0; i < 25; i++) {
        const latest = await getIntelligenceUpdate(job.id)
        if (latest.status !== 'QUEUED' && latest.status !== 'RUNNING') {
          break
        }
        await sleep(1000)
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در بروزرسانی')
    } finally {
      setRefreshing(false)
    }
  }

  const lastUpdate = updates[0]

  return (
    <div>
      <PageHeader
        title="هوش مالی"
        subtitle="کاتالوگ دارایی، قیمت تاریخی و وضعیت بروزرسانی منابع"
      />

      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-xs text-text-muted">
          {lastUpdate
            ? `آخرین جاب: ${formatStatus(lastUpdate.status)} — ذخیره ${lastUpdate.recordsStored.toLocaleString('fa-IR')}`
            : 'هنوز بروزرسانی ثبت نشده'}
        </p>
        <MarketRefreshButton onClick={handleUpdate} loading={refreshing} label="بروزرسانی اطلاعات" />
      </div>

      {error && (
        <p className="text-sm text-status-error mb-4">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="glass-card p-4">
          <p className="text-xs text-text-muted mb-1">پریمیوم تتر به دلار</p>
          <p className="text-lg text-text-primary">
            {formatChange(premiums?.usdtPremiumPercent ?? null)}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-text-muted mb-1">پریمیوم PAXG به طلای جهانی</p>
          <p className="text-lg text-text-primary">
            {formatChange(premiums?.paxgPremiumPercent ?? null)}
          </p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <p className="p-4 text-sm text-text-muted">در حال بارگذاری…</p>
        ) : prices.length === 0 ? (
          <p className="p-4 text-sm text-text-muted">هنوز قیمتی در کاتالوگ ذخیره نشده. بروزرسانی را بزنید.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs border-b border-surface-muted/40">
                  <th className="text-right font-normal p-3">دارایی</th>
                  <th className="text-right font-normal p-3">قیمت</th>
                  <th className="text-right font-normal p-3">۱روز</th>
                  <th className="text-right font-normal p-3">۷روز</th>
                  <th className="text-right font-normal p-3">۳۰روز</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((row) => (
                  <tr key={`${row.symbol}-${row.currency}`} className="border-b border-surface-muted/30 last:border-0">
                    <td className="p-3">
                      <div className="text-text-primary">{row.name}</div>
                      <div className="text-[11px] text-text-muted">{row.symbol} · {row.currency}</div>
                    </td>
                    <td className="p-3 text-text-primary whitespace-nowrap">
                      {formatPrice(row.price, row.currency)}
                    </td>
                    <td className="p-3 whitespace-nowrap">{formatChange(row.change1d)}</td>
                    <td className="p-3 whitespace-nowrap">{formatChange(row.change7d)}</td>
                    <td className="p-3 whitespace-nowrap">{formatChange(row.change30d)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
