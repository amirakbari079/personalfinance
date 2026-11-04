'use client'

import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import PageHeader from '@/shared/PageHeader'
import { formatWithCommas, stripCommas } from '@/utils/numberFormat'
import { getAccounts, type Account } from '@/lib/api/accountsApi'
import { getInvestments, type Investment } from '@/lib/api/investmentsApi'
import {
  enqueueIntelligenceUpdate,
  getIntelligenceAssets,
  getIntelligenceUpdate,
  type IntelligenceAsset,
} from '@/features/intelligence/api'
import {
  getAdvisorEvaluation,
  listAdvisorRecommendations,
  previewAdvisorContext,
  submitAdvisorDraft,
  transitionAdvisorRecommendation,
  type AdvisorContext,
  type AdvisorEvaluation,
  type AdvisorRecommendation,
  type RecommendationStatus,
} from './api'
import ContextPreview from './ContextPreview'
import PortfolioEditor, { type LocalCustomHolding } from './PortfolioEditor'
import { formatAssetMove, formatHorizon, formatRecommendationStatus, formatRisk, formatWhen } from './format'
import { formatChange } from '@/features/intelligence/format'

const DEFAULT_SYMBOLS = ['GOLD_18K', 'BTC', 'USD']
const QUESTION_MAX = 4000

const HORIZONS = [
  { value: '', label: 'نامشخص' },
  { value: '1M', label: '۱ ماه' },
  { value: '3M', label: '۳ ماه' },
  { value: '6M', label: '۶ ماه' },
  { value: '1Y', label: '۱ سال' },
  { value: '3Y', label: '۳ سال' },
]

const RISKS = [
  { value: 'UNSPECIFIED', label: 'نامشخص' },
  { value: 'CONSERVATIVE', label: 'محافظه‌کار' },
  { value: 'MODERATE', label: 'متوسط' },
  { value: 'BALANCED', label: 'متعادل' },
  { value: 'AGGRESSIVE', label: 'تهاجمی' },
  { value: 'VERY_AGGRESSIVE', label: 'بسیار تهاجمی' },
]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function AdvisorPage() {
  const [question, setQuestion] = useState('')
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_SYMBOLS)
  const [horizon, setHorizon] = useState('6M')
  const [risk, setRisk] = useState('MODERATE')
  const [capital, setCapital] = useState('')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([])
  const [selectedInvestmentIds, setSelectedInvestmentIds] = useState<number[]>([])
  const [customHoldings, setCustomHoldings] = useState<LocalCustomHolding[]>([])
  const [catalog, setCatalog] = useState<IntelligenceAsset[]>([])
  const [context, setContext] = useState<AdvisorContext | null>(null)
  const [previewLoading, setPreviewLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [rows, setRows] = useState<AdvisorRecommendation[]>([])
  const [selected, setSelected] = useState<AdvisorRecommendation | null>(null)
  const [evaluation, setEvaluation] = useState<AdvisorEvaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [listsReady, setListsReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const primed = useRef(false)

  const loadLists = useCallback(async () => {
    const [nextAccounts, nextInvestments, nextCatalog, nextRows] = await Promise.all([
      getAccounts(),
      getInvestments(),
      getIntelligenceAssets(),
      listAdvisorRecommendations(),
    ])
    setAccounts(nextAccounts)
    setInvestments(nextInvestments)
    setCatalog(nextCatalog.filter((item) => item.active !== false))
    setRows(nextRows)
    if (!primed.current) {
      primed.current = true
      setSelectedAccountIds(nextAccounts.map((item) => item.id))
      setSelectedInvestmentIds(nextInvestments.map((item) => item.id))
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loadLists()
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'خطا در بارگذاری')
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
          setListsReady(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [loadLists])

  const loadPreview = useCallback(async () => {
    setPreviewLoading(true)
    try {
      const next = await previewAdvisorContext({
        symbols: symbols.join(','),
        accountIds: selectedAccountIds,
        investmentIds: selectedInvestmentIds,
        customHoldings: customHoldings.map((row) => ({
          name: row.name,
          kind: row.kind,
          type: row.type,
          amountToman: row.amountToman,
          quantity: row.quantity,
          unit: row.unit,
          symbol: row.symbol,
        })),
      })
      setContext(next)
      setAcknowledged(false)
    } finally {
      setPreviewLoading(false)
    }
  }, [symbols, selectedAccountIds, selectedInvestmentIds, customHoldings])

  useEffect(() => {
    if (!listsReady) return
    const handle = window.setTimeout(() => {
      loadPreview().catch((e) => setError(e instanceof Error ? e.message : 'خطا در پیش‌نمایش'))
    }, 280)
    return () => window.clearTimeout(handle)
  }, [loadPreview, listsReady])

  useEffect(() => {
    if (!selected) {
      setEvaluation(null)
      return
    }
    let cancelled = false
    getAdvisorEvaluation(selected.id)
      .then((next) => {
        if (!cancelled) setEvaluation(next)
      })
      .catch(() => {
        if (!cancelled) setEvaluation(null)
      })
    return () => {
      cancelled = true
    }
  }, [selected?.id])

  function toggleSymbol(symbol: string) {
    setSymbols((current) => {
      if (current.includes(symbol)) {
        const next = current.filter((item) => item !== symbol)
        return next.length === 0 ? current : next
      }
      return [...current, symbol]
    })
  }

  async function handleRefresh() {
    setRefreshing(true)
    setError(null)
    try {
      const job = await enqueueIntelligenceUpdate()
      for (let i = 0; i < 25; i++) {
        const latest = await getIntelligenceUpdate(job.id)
        if (latest.status !== 'QUEUED' && latest.status !== 'RUNNING') break
        await sleep(1000)
      }
      await loadPreview()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در بروزرسانی بازار')
    } finally {
      setRefreshing(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!acknowledged) {
      setError('ابتدا پیش‌نمایش داده را بررسی و تأیید کنید')
      return
    }
    const capitalRaw = stripCommas(capital)
    const capitalAmount = capitalRaw ? Number.parseInt(capitalRaw, 10) : undefined
    if (capitalRaw && (Number.isNaN(capitalAmount) || (capitalAmount ?? 0) < 0)) {
      setError('مبلغ تصمیم باید عدد صحیح غیرمنفی باشد')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const rec = await submitAdvisorDraft({
        question: question.trim(),
        symbols: symbols.join(','),
        accountIds: selectedAccountIds,
        investmentIds: selectedInvestmentIds,
        customHoldings: customHoldings.map((row) => ({
          name: row.name,
          kind: row.kind,
          type: row.type,
          amountToman: row.amountToman,
          quantity: row.quantity,
          unit: row.unit,
          symbol: row.symbol,
        })),
        capitalAmount,
        timeHorizon: horizon || undefined,
        riskTolerance: risk,
      })
      setSelected(rec)
      const next = await listAdvisorRecommendations()
      setRows(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت تحلیل')
    } finally {
      setSaving(false)
    }
  }

  async function handleTransition(id: number, status: RecommendationStatus, reason: string) {
    setError(null)
    try {
      const rec = await transitionAdvisorRecommendation(id, status, reason)
      setSelected(rec)
      const next = await listAdvisorRecommendations()
      setRows(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در تغییر وضعیت')
    }
  }

  return (
    <div>
      <PageHeader
        title="مشاور مالی"
        subtitle="اول داده پیش‌زمینه را ببینید، بعد پرتفوی خود را انتخاب کنید. فعلاً پاسخ از Cursor CLI می‌آید؛ مدل قیمت نمی‌سازد و سود را تضمین نمی‌کند"
      />

      {error && <p className="text-sm text-status-error mb-4">{error}</p>}

      <ContextPreview
        context={context}
        loading={previewLoading || loading}
        refreshing={refreshing}
        symbols={symbols}
        catalog={catalog}
        onToggleSymbol={toggleSymbol}
        onRefresh={handleRefresh}
      />

      <PortfolioEditor
        accounts={accounts}
        investments={investments}
        selectedAccountIds={selectedAccountIds}
        selectedInvestmentIds={selectedInvestmentIds}
        customHoldings={customHoldings}
        onToggleAccount={(id) =>
          setSelectedAccountIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
          )
        }
        onToggleInvestment={(id) =>
          setSelectedInvestmentIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
          )
        }
        onAccountsChanged={(next, selectId) => {
          setAccounts(next)
          if (selectId != null) {
            setSelectedAccountIds((current) => (current.includes(selectId) ? current : [...current, selectId]))
          }
        }}
        onInvestmentsChanged={(next, selectId) => {
          setInvestments(next)
          if (selectId != null) {
            setSelectedInvestmentIds((current) =>
              current.includes(selectId) ? current : [...current, selectId],
            )
          }
        }}
        onCustomChange={setCustomHoldings}
      />

      <form onSubmit={handleSubmit} className="glass-card p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="field-label">سؤال یا هدف</label>
          <textarea
            className="field-input resize-y min-h-[180px] max-h-[420px]"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={QUESTION_MAX}
            required
            placeholder="مثلاً: با همین ترکیب دارایی، شش ماه طلا بهتر است یا دلار؟ جزئیات هدف، زمان، محدودیت و نگرانی را بنویسید."
          />
          <p className="text-[11px] text-text-muted mt-1 tabular-nums">
            {question.length.toLocaleString('fa-IR')} / {QUESTION_MAX.toLocaleString('fa-IR')} کاراکتر
          </p>
        </div>
        <div>
          <label className="field-label">مبلغ جدا برای تصمیم (تومان)</label>
          <input
            className="field-input tabular-nums"
            value={capital}
            onChange={(e) => setCapital(formatWithCommas(e.target.value))}
            placeholder="خالی = جمع پرتفوی انتخاب‌شده"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className="field-label">افق زمانی</label>
          <select className="field-input" value={horizon} onChange={(e) => setHorizon(e.target.value)}>
            {HORIZONS.map((item) => (
              <option key={item.value || 'none'} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">پروفایل ریسک</label>
          <select className="field-input" value={risk} onChange={(e) => setRisk(e.target.value)}>
            {RISKS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <label className="md:col-span-2 flex items-start gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            className="mt-1"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
          />
          <span>
            پیش‌نمایش قیمت، تاریخ و شاخص کلان را دیدم
            {context?.freshness?.marketStale ? ' و می‌دانم ممکن است داده کهنه باشد' : ''}
            .
          </span>
        </label>
        <div className="md:col-span-2 flex justify-end">
          <button type="submit" className="btn-primary" disabled={saving || !question.trim() || !acknowledged}>
            {saving ? 'در حال تحلیل… ممکن است تا دو دقیقه طول بکشد' : 'تحلیل و ثبت'}
          </button>
        </div>
      </form>

      {selected && (
        <section className="glass-card p-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-text-muted">
            <span>اسنپ‌شات #{selected.marketSnapshotId ?? '—'}</span>
            <span>پرامپت {selected.promptVersion ?? '—'}</span>
            <span>
              {selected.fake
                ? 'مدل آزمایشی'
                : selected.provider === 'CLI'
                  ? `CLI · ${selected.model}`
                  : selected.model}
            </span>
            {selected.cached && <span>بازاستفاده از کش</span>}
            {selected.snapshotStale && <span className="text-status-error">اسنپ‌شات قدیمی‌تر از بازار فعلی</span>}
          </div>
          <p className="text-sm text-text-primary whitespace-pre-wrap leading-7">{selected.body}</p>
          {selected.thesis && (
            <div className="mt-4 pt-3 border-t border-surface-muted/40 text-sm">
              <p className="text-text-muted text-xs mb-1">تز سرمایه‌گذاری</p>
              <p className="text-text-primary">{selected.thesis.title}</p>
              <p className="text-text-muted mt-1">{selected.thesis.assumptions}</p>
              <p className="text-text-muted mt-1">{selected.thesis.invalidationConditions}</p>
            </div>
          )}
          {evaluation && (
            <div className="mt-4 pt-3 border-t border-surface-muted/40">
              <p className="text-text-muted text-xs mb-2">
                ارزیابی بازار از OHLC روزانه — صحت توصیه را نتیجه نمی‌گیرد
                {evaluation.horizonElapsed ? '' : ' · افق زمانی هنوز تمام نشده'}
              </p>
              {evaluation.status === 'INSUFFICIENT_DATA' ? (
                <p className="text-sm text-text-muted">قیمت روزانه کافی برای ارزیابی این تز نیست.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-text-muted">{evaluation.assetSymbol}</p>
                    <p className="text-text-primary">
                      {formatChange(evaluation.assetReturnPercent)} · {formatAssetMove(evaluation.assetMove)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">طلا</p>
                    <p className="text-text-primary">{formatChange(evaluation.goldReturnPercent)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">دلار</p>
                    <p className="text-text-primary">{formatChange(evaluation.usdReturnPercent)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">بیت‌کوین</p>
                    <p className="text-text-primary">{formatChange(evaluation.btcReturnPercent)}</p>
                  </div>
                </div>
              )}
              {(evaluation.startDateJalali || evaluation.endDateJalali) && (
                <p className="text-[11px] text-text-muted mt-2" dir="ltr">
                  {evaluation.startDateJalali ?? '—'} → {evaluation.endDateJalali ?? '—'}
                </p>
              )}
            </div>
          )}
          {selected.status === 'ACTIVE' && (
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleTransition(selected.id, 'COMPLETED', 'توسط کاربر تکمیل شد')}
              >
                تکمیل
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleTransition(selected.id, 'EXPIRED', 'توسط کاربر منقضی شد')}
              >
                انقضا
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => handleTransition(selected.id, 'INVALIDATED', 'تز توسط کاربر بی‌اعتبار شد')}
              >
                بی‌اعتبار کردن
              </button>
            </div>
          )}
        </section>
      )}

      <div className="glass-card overflow-hidden">
        {loading ? (
          <p className="p-4 text-sm text-text-muted">در حال بارگذاری…</p>
        ) : rows.length === 0 ? (
          <p className="p-4 text-sm text-text-muted">هنوز توصیه‌ای ثبت نشده است.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs border-b border-surface-muted/40">
                  <th className="text-right font-normal p-3">زمان</th>
                  <th className="text-right font-normal p-3">سؤال</th>
                  <th className="text-right font-normal p-3">وضعیت</th>
                  <th className="text-right font-normal p-3">اسنپ‌شات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-surface-muted/30 last:border-0 cursor-pointer hover:bg-surface-muted/20"
                    onClick={() => setSelected(row)}
                  >
                    <td className="p-3 whitespace-nowrap">{formatWhen(row.createdAt)}</td>
                    <td className="p-3">
                      <div className="text-text-primary">{row.reasoningSummary}</div>
                      <div className="text-[11px] text-text-muted">
                        {row.selectedAssets} · {formatRisk(row.riskTolerance)} · {formatHorizon(row.timeHorizon)}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">{formatRecommendationStatus(row.status)}</td>
                    <td className="p-3 whitespace-nowrap">
                      {row.marketSnapshotId != null ? `#${row.marketSnapshotId}` : '—'}
                      {row.snapshotStale ? ' · کهنه' : ''}
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
