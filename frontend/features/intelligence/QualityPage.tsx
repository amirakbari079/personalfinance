'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/shared/PageHeader'
import { getOpenConflicts, getQualitySummary, type DataConflict, type QualitySummary } from './api'
import { formatPrice } from './format'

export default function QualityPage() {
  const [summary, setSummary] = useState<QualitySummary | null>(null)
  const [conflicts, setConflicts] = useState<DataConflict[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getQualitySummary(), getOpenConflicts()])
      .then(([nextSummary, nextConflicts]) => {
        if (cancelled) return
        setSummary(nextSummary)
        setConflicts(nextConflicts)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'خطا در بارگذاری')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <PageHeader
        title="کیفیت داده"
        subtitle="تعارض بین منابع ثبت می‌شود؛ سیستم یکی را بی‌دلیل انتخاب نمی‌کند"
      />

      {error && <p className="text-sm text-status-error mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="glass-card p-4">
          <p className="text-xs text-text-muted mb-1">تعارض باز</p>
          <p className="text-lg text-text-primary">
            {(summary?.openConflictCount ?? 0).toLocaleString('fa-IR')}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-text-muted mb-1">اعتماد اسنپ‌شات</p>
          <p className="text-lg text-text-primary">
            {summary?.averageConfidence != null
              ? `${summary.averageConfidence.toLocaleString('fa-IR')} / ۱۰۰`
              : '—'}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-text-muted mb-1">اسنپ‌شات بازار</p>
          <p className="text-lg text-text-primary">
            {summary?.lastSnapshotId != null ? `#${summary.lastSnapshotId}` : '—'}
          </p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <p className="p-4 text-sm text-text-muted">در حال بارگذاری…</p>
        ) : conflicts.length === 0 ? (
          <p className="p-4 text-sm text-text-muted">تعارض بازی بین منابع ثبت نشده است.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs border-b border-surface-muted/40">
                  <th className="text-right font-normal p-3">دارایی</th>
                  <th className="text-right font-normal p-3">منبع A</th>
                  <th className="text-right font-normal p-3">منبع B</th>
                  <th className="text-right font-normal p-3">اختلاف</th>
                </tr>
              </thead>
              <tbody>
                {conflicts.map((row) => (
                  <tr key={row.id} className="border-b border-surface-muted/30 last:border-0">
                    <td className="p-3">
                      <div className="text-text-primary">{row.assetName}</div>
                      <div className="text-[11px] text-text-muted">{row.assetSymbol}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {row.providerA}: {formatPrice(row.valueA, row.currency)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {row.providerB}: {formatPrice(row.valueB, row.currency)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {row.differencePercent.toLocaleString('fa-IR', { maximumFractionDigits: 2 })}٪
                    </td>
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
