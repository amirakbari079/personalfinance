'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/shared/PageHeader'
import { getMacroIndicators, type MacroIndicator } from './api'

function formatPercent(value: number | null) {
  if (value == null) return '—'
  return `${value.toLocaleString('fa-IR', { maximumFractionDigits: 2 })}٪`
}

function formatFrequency(value: string) {
  switch (value) {
    case 'MONTHLY':
      return 'ماهانه'
    case 'ANNUAL':
      return 'سالانه'
    default:
      return value
  }
}

export default function MacroPage() {
  const [rows, setRows] = useState<MacroIndicator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getMacroIndicators()
      .then((next) => {
        if (!cancelled) setRows(next)
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
        title="شاخص‌های کلان"
        subtitle="آمریکا: تورم ماهانه BLS تا آخرین ماه منتشرشده. ایران: برآورد IMF برای سال جاری — تورم سالانهٔ World Bank معمولاً یک تا دو سال عقب است"
      />

      {error && <p className="text-sm text-status-error mb-4">{error}</p>}

      <div className="glass-card overflow-hidden">
        {loading ? (
          <p className="p-4 text-sm text-text-muted">در حال بارگذاری…</p>
        ) : rows.length === 0 ? (
          <p className="p-4 text-sm text-text-muted">شاخص کلانی ثبت نشده است.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs border-b border-surface-muted/40">
                  <th className="text-right font-normal p-3">شاخص</th>
                  <th className="text-right font-normal p-3">آخرین دوره</th>
                  <th className="text-right font-normal p-3">مقدار</th>
                  <th className="text-right font-normal p-3">دوره قبل</th>
                  <th className="text-right font-normal p-3">منبع</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-surface-muted/30 last:border-0">
                    <td className="p-3">
                      <div className="text-text-primary">{row.name}</div>
                      <div className="text-[11px] text-text-muted">
                        {formatFrequency(row.frequency)}
                        {row.country ? ` · ${row.country}` : ''}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap" dir="ltr">{row.period ?? '—'}</td>
                    <td className="p-3 whitespace-nowrap">{formatPercent(row.value)}</td>
                    <td className="p-3 whitespace-nowrap">{formatPercent(row.previousValue)}</td>
                    <td className="p-3 whitespace-nowrap text-text-muted">{row.sourceCode}</td>
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
