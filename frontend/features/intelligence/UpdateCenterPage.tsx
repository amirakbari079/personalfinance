'use client'

import { useCallback, useEffect, useState } from 'react'
import PageHeader from '@/shared/PageHeader'
import MarketRefreshButton from '@/shared/market/MarketRefreshButton'
import {
  enqueueIntelligenceUpdate,
  getIntelligenceUpdate,
  getQualitySummary,
  listIntelligenceUpdates,
  type IntelligenceUpdate,
  type QualitySummary,
} from './api'
import { formatStatus } from './format'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatWhen(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fa-IR')
}

export default function UpdateCenterPage() {
  const [updates, setUpdates] = useState<IntelligenceUpdate[]>([])
  const [summary, setSummary] = useState<QualitySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    const [nextUpdates, nextSummary] = await Promise.all([
      listIntelligenceUpdates(),
      getQualitySummary(),
    ])
    setUpdates(nextUpdates)
    setSummary(nextSummary)
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
        if (latest.status !== 'QUEUED' && latest.status !== 'RUNNING') break
        await sleep(1000)
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در بروزرسانی')
    } finally {
      setRefreshing(false)
    }
  }

  const last = summary?.lastUpdate ?? updates[0] ?? null

  return (
    <div>
      <PageHeader
        title="مرکز بروزرسانی"
        subtitle="وضعیت منابع، نرخ موفقیت و تاریخچه جاب‌های جمع‌آوری داده"
      />

      <div className="flex justify-end mb-4">
        <MarketRefreshButton onClick={handleUpdate} loading={refreshing} label="بروزرسانی اطلاعات" />
      </div>

      {error && <p className="text-sm text-status-error mb-4">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="آخرین وضعیت" value={last ? formatStatus(last.status) : '—'} />
        <Stat
          label="نرخ موفقیت منابع"
          value={summary?.providerSuccessRate != null
            ? `${summary.providerSuccessRate.toLocaleString('fa-IR')}٪`
            : '—'}
        />
        <Stat
          label="اعتماد میانگین"
          value={summary?.averageConfidence != null
            ? `${summary.averageConfidence.toLocaleString('fa-IR')} / ۱۰۰`
            : '—'}
        />
        <Stat
          label="تعارض باز"
          value={(summary?.openConflictCount ?? 0).toLocaleString('fa-IR')}
        />
      </div>

      <div className="glass-card p-4 mb-6 text-xs text-text-muted space-y-1">
        <p>آخرین جاب: {formatWhen(last?.completedAt ?? last?.startedAt ?? null)}</p>
        <p>اسنپ‌شات: {summary?.lastSnapshotId != null ? `#${summary.lastSnapshotId}` : '—'}</p>
        {last?.errorSummary && <p className="text-status-error">{last.errorSummary}</p>}
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <p className="p-4 text-sm text-text-muted">در حال بارگذاری…</p>
        ) : updates.length === 0 ? (
          <p className="p-4 text-sm text-text-muted">هنوز جابی ثبت نشده.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs border-b border-surface-muted/40">
                  <th className="text-right font-normal p-3">زمان</th>
                  <th className="text-right font-normal p-3">نوع</th>
                  <th className="text-right font-normal p-3">وضعیت</th>
                  <th className="text-right font-normal p-3">ذخیره</th>
                  <th className="text-right font-normal p-3">رد</th>
                </tr>
              </thead>
              <tbody>
                {updates.map((row) => (
                  <tr key={row.id} className="border-b border-surface-muted/30 last:border-0">
                    <td className="p-3 whitespace-nowrap">{formatWhen(row.completedAt ?? row.startedAt)}</td>
                    <td className="p-3">{row.triggerType === 'SCHEDULED' ? 'زمان‌بندی' : 'دستی'}</td>
                    <td className="p-3">{formatStatus(row.status)}</td>
                    <td className="p-3">{row.recordsStored.toLocaleString('fa-IR')}</td>
                    <td className="p-3">{row.recordsRejected.toLocaleString('fa-IR')}</td>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-4">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-text-primary">{value}</p>
    </div>
  )
}
