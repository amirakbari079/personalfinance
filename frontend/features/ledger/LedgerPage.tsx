'use client'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowDownLeft, ArrowUpLeft, ArrowLeftRight, BookOpen, Plus, RotateCcw, Search, SlidersHorizontal, ShieldCheck } from 'lucide-react'
import { displayDate, getLedgerAccounts, getLedgerSummary, getTransactions, ledgerLabels, reverseTransaction, todayIso, type LedgerAccount, type LedgerTransaction } from '@/lib/api/ledgerApi'
import { clearApiCache } from '@/lib/api/apiClient'
import { formatToman } from '@/utils/formatToman'
import FormModalShell from '@/shared/FormModalShell'
const TransactionForm = dynamic(() => import('./TransactionForm'))
const IconFor = ({ kind }: { kind: string }) => {
  const Icon = kind === 'INCOME' ? ArrowDownLeft : kind === 'EXPENSE' ? ArrowUpLeft : kind === 'TRANSFER' ? ArrowLeftRight : kind === 'ADJUSTMENT' ? SlidersHorizontal : RotateCcw
  return <Icon size={22} aria-hidden />
}

export default function LedgerPage() {
  const [accounts, setAccounts] = useState<LedgerAccount[]>([])
  const [rows, setRows] = useState<LedgerTransaction[]>([])
  const [summary, setSummary] = useState<{ income: string; expense: string } | null>(null)
  const [account, setAccount] = useState('')
  const [draftQuery, setDraftQuery] = useState('')
  const [query, setQuery] = useState('')
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [reversal, setReversal] = useState<LedgerTransaction | null>(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [reverseError, setReverseError] = useState<string | null>(null)
  const reverseKey = useRef({ key: '', reason: '' })
  const sequence = useRef(0)
  const to = todayIso()
  const from = new Date(new Date(`${to}T12:00:00Z`).getTime() - 29 * 86400000).toISOString().slice(0, 10)
  const load = useCallback(async () => {
    const seq = ++sequence.current
    setLoading(true); setError(null)
    const params = new URLSearchParams({ offset: String(offset), limit: '50', q: query })
    if (account) params.set('accountId', account)
    try {
      const [a, r, s] = await Promise.all([getLedgerAccounts(), getTransactions(params), getLedgerSummary(from, to)])
      if (seq !== sequence.current) return
      setAccounts(a); setRows(r); setSummary(s)
    } catch (e) { if (seq === sequence.current) setError(e instanceof Error ? e.message : 'بارگذاری ناموفق بود') }
    finally { if (seq === sequence.current) setLoading(false) }
  }, [account, offset, query, from, to])
  useEffect(() => { void load(); return () => { sequence.current++ } }, [load])
  const completed = () => { setShowForm(false); setNotice('تراکنش ثبت شد و موجودی حساب به‌روز شد.'); clearApiCache(); void load() }
  async function reverse(e: FormEvent) {
    e.preventDefault(); if (!reversal || !reason.trim()) return
    setSaving(true); setReverseError(null)
    if (reverseKey.current.reason !== reason.trim()) reverseKey.current = { key: crypto.randomUUID(), reason: reason.trim() }
    try {
      await reverseTransaction(reversal.id, reverseKey.current.key, reason.trim())
      setReversal(null); setNotice('اثر تراکنش برگشت داده شد؛ اصل تراکنش در سابقه باقی ماند.'); void load()
    } catch (e) { setReverseError(e instanceof Error ? e.message : 'ابطال ناموفق بود') }
    finally { setSaving(false) }
  }
  const income = Number(summary?.income ?? 0), expense = Number(summary?.expense ?? 0)
  const largest = Math.max(Math.abs(income), Math.abs(expense), 1)
  return <div className="ledger-page">
    <header className="ledger-heading"><div><h1>دفتر گردش پول</h1><p>هر جابه‌جایی پول، با رد روشن در حساب‌ها</p></div><button className="btn-primary" onClick={() => setShowForm(true)} disabled={loading || !accounts.length}><Plus size={20} aria-hidden />ثبت تراکنش</button></header>
    <section className="ledger-overview" aria-label="گردش سی روز گذشته">
      <div className="ledger-flow"><div className="ledger-flow-title"><BookOpen size={23} aria-hidden /><h2>۳۰ روز گذشته</h2></div><p>گردش واقعی همهٔ حساب‌ها؛ انتقال و اصلاح موجودی جزو درآمد و هزینه نیست.</p>
        {[{ label: 'دریافت', value: income, type: 'income' }, { label: 'پرداخت', value: expense, type: 'expense' }].map(item => <div className="ledger-flow-row" key={item.type}><span>{item.label}</span><div className="ledger-meter" aria-hidden><i className={item.type} style={{ width: `${Math.max(Math.abs(item.value) / largest * 100, 0)}%` }} /></div><strong>{summary ? formatToman(item.value) : '—'}</strong></div>)}
      </div>
      <aside className="ledger-assurance"><ShieldCheck size={32} aria-hidden /><h2>سابقه‌ای که می‌ماند</h2><p>موجودی‌های قدیمی محفوظ‌اند. تراکنش‌های جدید از ماندهٔ افتتاحیه ادامه پیدا می‌کنند و اصلاحات با دلیل ثبت می‌شوند.</p><Link href="/accounts">مشاهدهٔ حساب‌ها</Link></aside>
    </section>
    {notice && <p role="status" className="ledger-notice">{notice}</p>}
    {error && <div role="alert" className="ledger-error">{error}<button type="button" className="btn-ghost" onClick={() => { clearApiCache(); void load() }}>تلاش دوباره</button></div>}
    <section className="ledger-journal" aria-busy={loading}>
      <div className="ledger-tools"><h2>تراکنش‌ها</h2><form onSubmit={e => { e.preventDefault(); setOffset(0); setQuery(draftQuery.trim().replace(/ي/g, 'ی').replace(/ك/g, 'ک')) }}><label className="sr-only" htmlFor="ledger-search">جست‌وجو در شرح تراکنش</label><input id="ledger-search" className="field-input" placeholder="جست‌وجو در شرح…" value={draftQuery} onChange={e => setDraftQuery(e.target.value)} /><button className="icon-button" aria-label="جست‌وجو"><Search size={19} /></button></form><label className="sr-only" htmlFor="ledger-account">فیلتر حساب</label><select id="ledger-account" className="field-input" value={account} onChange={e => { setAccount(e.target.value); setOffset(0) }}><option value="">همهٔ حساب‌ها</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
      {loading && !rows.length ? <p role="status" className="ledger-empty">در حال دریافت گردش حساب‌ها…</p> : !rows.length ? <div className="ledger-empty"><BookOpen size={40} aria-hidden /><h3>{query || account ? 'تراکنشی با این فیلتر پیدا نشد' : 'اولین گردش پول را ثبت کنید'}</h3><p>{accounts.length ? 'دریافت، پرداخت یا انتقال بین حساب‌ها؛ موجودی‌ها خودکار به‌روز می‌شوند.' : 'برای شروع، یک حساب با موجودی فعلی بسازید.'}</p>{!accounts.length && <Link className="btn-primary" href="/accounts">افزودن حساب</Link>}</div> : <ol className="ledger-rows">{rows.map(row => <li key={row.id} className={`ledger-row ${row.reversed ? 'is-reversed' : ''}`}>
        <span className={`ledger-kind-icon kind-${row.kind.toLowerCase()}`}><IconFor kind={row.kind} /></span><div className="ledger-row-description"><div><strong>{row.description}</strong><span className="ledger-kind-label">{ledgerLabels[row.kind] ?? row.kind}{row.reversed ? ' · ابطال‌شده' : ''}</span></div><time dateTime={row.effective_date}>{displayDate(row.effective_date)}</time><small>شمارهٔ {row.id.toLocaleString('fa-IR')}</small></div>
        <div className="ledger-entries">{row.entries.map(entry => <div key={entry.account_id}><span>{entry.account_name}</span><strong className={Number(entry.amount) >= 0 ? 'text-status-success' : 'text-status-error'}>{Number(entry.amount) >= 0 ? '+' : '−'}{formatToman(Math.abs(Number(entry.amount)))}</strong></div>)}</div>
        {!row.reversed && row.kind !== 'REVERSAL' && !row.related_type && <button type="button" className="ledger-reverse" aria-label={`ابطال تراکنش شمارهٔ ${row.id}`} onClick={() => { setReversal(row); setReason(''); setReverseError(null); reverseKey.current = { key: '', reason: '' } }}><RotateCcw size={16} aria-hidden />ابطال</button>}
      </li>)}</ol>}
      <div className="ledger-pagination"><button className="btn-ghost" disabled={!offset || loading} onClick={() => setOffset(Math.max(0, offset - 50))}>قبلی</button><span>صفحهٔ {(offset / 50 + 1).toLocaleString('fa-IR')}</span><button className="btn-ghost" disabled={rows.length < 50 || loading} onClick={() => setOffset(offset + 50)}>بعدی</button></div>
    </section>
    {showForm && <TransactionForm accounts={accounts} onClose={() => setShowForm(false)} onSaved={completed} />}
    {reversal && <FormModalShell title="ابطال با حفظ سابقه" onClose={() => setReversal(null)} onSubmit={reverse} saving={saving} error={reverseError} submitLabel="ثبت ابطال" submitDisabled={!reason.trim()}><p className="leading-8">اثر «{reversal.description}» امروز برگردانده می‌شود. اصل تراکنش و دلیل ابطال در سابقه می‌مانند.</p><label className="field-label">دلیل ابطال<textarea className="field-input mt-2" autoFocus value={reason} onChange={e => setReason(e.target.value)} maxLength={1000} required /></label></FormModalShell>}
  </div>
}
