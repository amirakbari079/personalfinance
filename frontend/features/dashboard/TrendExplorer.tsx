'use client'
import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  ArrowUpLeft,
  ArrowDownLeft,
  Download,
  ChartNoAxesCombined,
  Table2,
} from 'lucide-react'
import {
  historyInPeriod,
  todayKey,
  changeBetween,
  compactMoney,
  csvCell,
  type HistoryPoint,
} from './analytics'
import { formatToman } from '@/utils/formatToman'
import FinanceIllustration from '@/shared/FinanceIllustration'
const WealthChart = dynamic(() => import('./WealthChart'), {
  ssr: false,
  loading: () => <div className="chart-skeleton" />,
})
const PERIODS = [
  { value: 3, label: '۳ ماه' },
  { value: 6, label: '۶ ماه' },
  { value: 12, label: 'یک سال' },
  { value: 0, label: 'همه' },
]
export default function TrendExplorer({
  history,
  loading,
  error,
  expanded = false,
  retry,
}: {
  history: HistoryPoint[]
  loading: boolean
  error?: boolean
  expanded?: boolean
  retry: () => void
}) {
  const [months, setMonths] = useState(3)
  const [mode, setMode] = useState<'trend' | 'compare'>('trend')
  const [showAssets, setShowAssets] = useState(false)
  const data = useMemo(
    () => historyInPeriod(history, months, todayKey()),
    [history, months],
  )
  const change =
    data.length > 1
      ? changeBetween(data[0].netBalance, data[data.length - 1].netBalance)
      : null
  function exportData() {
    const rows: (string | number)[][] = [
      ['تاریخ شمسی', 'دارایی (تومان)', 'تعهدات (تومان)', 'تراز خالص (تومان)'],
      ...data.map((p) => [
        p.recordedDateJalali,
        p.totalAssets,
        p.totalLiabilities,
        p.netBalance,
      ]),
    ]
    const url = URL.createObjectURL(
      new Blob(
        ['\uFEFF' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n')],
        { type: 'text/csv;charset=utf-8' },
      ),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = 'financial-history.csv'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <section className="finance-panel trend-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">مسیر مالی شما</p>
          <h2>روند دارایی و تعهدات</h2>
        </div>
        {expanded ? (
          <button
            className="icon-button"
            onClick={exportData}
            disabled={!data.length || loading || error}
            title="دریافت CSV"
            aria-label="دریافت داده‌های نمودار به‌صورت CSV"
          >
            <Download size={19} />
          </button>
        ) : (
          <Link className="text-link" href="/reports">
            تحلیل بیشتر <ArrowUpLeft size={16} />
          </Link>
        )}
      </div>
      <div className="chart-toolbar">
        <div className="segmented" aria-label="بازهٔ نمودار">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              aria-pressed={months === p.value}
              onClick={() => setMonths(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {expanded && (
          <div className="segmented" aria-label="نوع نمودار">
            <button
              aria-pressed={mode === 'trend'}
              onClick={() => setMode('trend')}
            >
              روند
            </button>
            <button
              aria-pressed={mode === 'compare'}
              onClick={() => setMode('compare')}
            >
              مقایسه
            </button>
          </div>
        )}
      </div>
      {loading ? (
        <div
          className="chart-skeleton"
          role="status"
          aria-label="در حال دریافت تاریخچه"
        />
      ) : error ? (
        <div className="chart-empty">
          <ChartNoAxesCombined size={32} />
          <p>تاریخچه دریافت نشد.</p>
          <button className="btn-secondary" onClick={retry}>
            دوباره تلاش کنید
          </button>
        </div>
      ) : !data.length ? (
        <div className="chart-empty">
          <FinanceIllustration />
          <h3>هر ثبت، یک نقطه در مسیر شما</h3>
          <p>
            در این بازه سابقه‌ای ندارید. بازه را تغییر دهید یا موجودی حساب‌ها را
            ثبت کنید.
          </p>
          <Link className="text-link" href="/accounts">
            رفتن به حساب‌ها <ArrowUpLeft size={16} />
          </Link>
        </div>
      ) : (
        <>
          <div className="trend-summary">
            <strong>{formatToman(data[data.length - 1].netBalance)}</strong>
            {change ? (
              <span className={change.delta >= 0 ? 'positive' : 'negative'}>
                {change.delta >= 0 ? (
                  <ArrowUpLeft size={17} />
                ) : (
                  <ArrowDownLeft size={17} />
                )}
                {change.percent === null
                  ? compactMoney(change.delta) + ' تومان'
                  : Math.abs(change.percent).toLocaleString('fa-IR', {
                      maximumFractionDigits: 1,
                    }) + '٪'}{' '}
                {change.delta >= 0 ? 'افزایش' : 'کاهش'}
              </span>
            ) : (
              <span className="muted">یک نقطهٔ ثبت‌شده</span>
            )}
          </div>
          <p className="chart-caption">
            آخرین تراز ثبت‌شده در بازه
            {change
              ? '؛ تغییر نسبت به اولین ثبت همین بازه'
              : '؛ برای نمایش روند به دست‌کم دو تاریخ نیاز است'}
            .
          </p>
          <WealthChart
            data={data}
            comparison={mode === 'compare'}
            showAssets={showAssets}
          />
          <div className="chart-legend">
            <span>
              <i style={{ background: 'var(--finance-chart-1)' }} />
              {mode === 'compare' ? 'دارایی' : 'تراز خالص'}
            </span>
            {mode === 'compare' ? (
              <span>
                <i style={{ background: 'var(--finance-chart-4)' }} />
                تعهدات
              </span>
            ) : (
              <label>
                <input
                  type="checkbox"
                  checked={showAssets}
                  onChange={(e) => setShowAssets(e.target.checked)}
                />
                نمایش دارایی و تعهدات
              </label>
            )}
            {showAssets && mode === 'trend' && (
              <>
                <span>
                  <i style={{ background: 'var(--finance-chart-2)' }} />
                  دارایی
                </span>
                <span>
                  <i style={{ background: 'var(--finance-chart-4)' }} />
                  تعهدات
                </span>
              </>
            )}
          </div>
          <details className="chart-data">
            <summary>
              <Table2 size={16} /> داده‌های نمودار{' '}
              <span>{data.length.toLocaleString('fa-IR')} ثبت</span>
            </summary>
            <div className="data-scroll">
              <table>
                <caption className="sr-only">مقادیر ثبت‌شده به تومان</caption>
                <thead>
                  <tr>
                    <th scope="col">تاریخ</th>
                    <th scope="col">دارایی</th>
                    <th scope="col">تعهدات</th>
                    <th scope="col">تراز خالص</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((p, i) => (
                    <tr key={`${p.recordedDateJalali}-${i}`}>
                      <td>
                        <bdi>
                          {p.recordedDateJalali.replace(
                            /\d/g,
                            (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)],
                          )}
                        </bdi>
                      </td>
                      <td>{formatToman(p.totalAssets)}</td>
                      <td>{formatToman(p.totalLiabilities)}</td>
                      <td>{formatToman(p.netBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <p className="chart-note">
            بر پایهٔ تاریخچهٔ موجودی؛ تغییر تراز الزاماً سود یا هزینه نیست.
            فاصلهٔ نقاط نشان‌دهندهٔ ترتیب ثبت‌هاست.
          </p>
        </>
      )}
    </section>
  )
}
