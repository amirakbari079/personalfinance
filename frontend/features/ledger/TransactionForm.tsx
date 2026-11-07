'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import DateObject from 'react-date-object'
import persian from 'react-date-object/calendars/persian'
import gregorian from 'react-date-object/calendars/gregorian'
import gregorianEn from 'react-date-object/locales/gregorian_en'
import { ArrowLeft, ArrowDownLeft, ArrowUpLeft, ArrowLeftRight, SlidersHorizontal } from 'lucide-react'
import FormModalShell from '@/shared/FormModalShell'
import JalaliDatePicker from '@/shared/JalaliDatePicker'
import { getTodayJalali } from '@/utils/jalaliToday'
import { formatWithCommas, stripCommas, toAsciiDigits } from '@/utils/numberFormat'
import { formatToman } from '@/utils/formatToman'
import { getCatalog, ledgerLabels, postTransaction, todayIso, type CatalogItem, type LedgerAccount } from '@/lib/api/ledgerApi'

export default function TransactionForm({ accounts, onClose, onSaved }: {
  accounts: LedgerAccount[]; onClose: () => void; onSaved: () => void
}) {
  const [kind, setKind] = useState('EXPENSE')
  const [source, setSource] = useState(String(accounts[0]?.id ?? ''))
  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(getTodayJalali())
  const [category, setCategory] = useState('')
  const [counterparty, setCounterparty] = useState('')
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const retry = useRef<{ body: string; key: string } | null>(null)
  useEffect(() => { let active = true; getCatalog().then(v => { if (active) setCatalog(v) }).catch(e => { if (active) setError(e.message) }); return () => { active = false } }, [])
  const account = accounts.find(a => String(a.id) === source)
  const target = accounts.find(a => String(a.id) === destination)
  const value = Number(stripCommas(amount))
  const adjustment = kind === 'ADJUSTMENT'
  const delta = adjustment ? value - Number(account?.balance ?? 0) : kind === 'INCOME' ? value : -value
  const valid = amount.trim() !== '' && Number.isSafeInteger(value) && (adjustment || value > 0)
  const categories = catalog.filter(c => c.kind === (kind === 'INCOME' ? 'INCOME_CATEGORY' : 'EXPENSE_CATEGORY'))

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!account || !valid || !description.trim()) { setError('حساب، مبلغ صحیح و شرح را وارد کنید.'); return }
    if (kind === 'TRANSFER' && (!target || target.id === account.id)) { setError('یک حساب مقصد متفاوت انتخاب کنید.'); return }
    setSaving(true); setError(null)
    try {
      const iso = adjustment ? todayIso() : new DateObject({ date: toAsciiDigits(date), format: 'YYYY/MM/DD', calendar: persian }).convert(gregorian, gregorianEn).format('YYYY-MM-DD')
      const body = adjustment
        ? { accountId: account.id, balance: value, date: iso, reason: description.trim(), expectedVersion: account.version }
        : { kind, accountId: account.id, destinationAccountId: kind === 'TRANSFER' ? target!.id : null, amount: value, date: iso, description: description.trim(), categoryId: category ? Number(category) : null, counterpartyId: counterparty ? Number(counterparty) : null, expectedVersion: account.version }
      const serialized = JSON.stringify(body)
      if (retry.current?.body !== serialized) retry.current = { body: serialized, key: crypto.randomUUID() }
      await postTransaction({ ...body, requestKey: retry.current.key }, adjustment)
      onSaved()
    } catch (e) { setError(e instanceof Error ? e.message : 'ثبت ناموفق بود') }
    finally { setSaving(false) }
  }

  return <FormModalShell title="ثبت گردش پول" wide onClose={onClose} onSubmit={submit} error={error} saving={saving} submitLabel={adjustment ? 'ثبت اصلاح با دلیل' : 'ثبت تراکنش'} submitDisabled={!valid || !description.trim() || !account}>
    <div className="ledger-kind-picker" aria-label="نوع عملیات">
      {([[ 'EXPENSE', ArrowUpLeft ], [ 'INCOME', ArrowDownLeft ], [ 'TRANSFER', ArrowLeftRight ], [ 'ADJUSTMENT', SlidersHorizontal ]] as const).map(([k, Icon]) => <button key={k} type="button" aria-pressed={kind === k} onClick={() => { setKind(k); setCategory('') }}><Icon size={20} aria-hidden />{ledgerLabels[k]}</button>)}
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="field-label">{kind === 'TRANSFER' ? 'از حساب' : 'حساب'}<select className="field-input mt-2" value={source} onChange={e => setSource(e.target.value)} required>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
      {kind === 'TRANSFER' ? <label className="field-label">به حساب<select className="field-input mt-2" required value={destination} onChange={e => setDestination(e.target.value)}><option value="">انتخاب مقصد</option>{accounts.filter(a => String(a.id) !== source).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label> : <label className="field-label">{adjustment ? 'دلیل اصلاح' : 'دسته'}{adjustment ? <span className="block text-text-muted mt-2 font-normal">دلیل را در توضیح پایین بنویسید.</span> : <select className="field-input mt-2" value={category} onChange={e => setCategory(e.target.value)}><option value="">بدون دسته</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}</label>}
      <label className="field-label">{adjustment ? 'موجودی صحیح' : 'مبلغ'} (تومان)<input className="field-input mt-2 tabular-nums" dir="ltr" inputMode="numeric" value={amount} onChange={e => setAmount(formatWithCommas(e.target.value))} required autoFocus /></label>
      <div><label className="field-label" htmlFor={adjustment ? undefined : 'ledger-date'}>تاریخ</label>{adjustment ? <p className="mt-3 text-text-muted">امروز؛ برای حفظ سابقهٔ اصلاح</p> : <JalaliDatePicker id="ledger-date" value={date} onChange={setDate} />}</div>
    </div>
    {account && valid && <div className="ledger-preview" aria-live="polite">
      <span>{account.name}<strong>{formatToman(Number(account.balance))}</strong></span><ArrowLeft aria-hidden size={22} /><span>پس از ثبت<strong>{formatToman(Number(account.balance) + delta)}</strong></span>
      {kind === 'TRANSFER' && target && <small>موجودی {target.name} پس از انتقال: {formatToman(Number(target.balance) + value)}</small>}
    </div>}
    {!adjustment && <label className="field-label">طرف حساب (اختیاری)<select className="field-input mt-2" value={counterparty} onChange={e => setCounterparty(e.target.value)}><option value="">بدون طرف حساب</option>{catalog.filter(c => c.kind === 'COUNTERPARTY').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
    <label className="field-label">{adjustment ? 'چرا موجودی اصلاح می‌شود؟' : 'شرح تراکنش'}<textarea className="field-input mt-2" value={description} onChange={e => setDescription(e.target.value)} required maxLength={1000} rows={2} placeholder={adjustment ? 'مثلاً مغایرت شمارش وجه نقد' : 'مثلاً خرید روزانه یا دریافت حقوق'} /></label>
    <p className="text-sm text-text-muted leading-7">تراکنش ثبت‌شده از سابقه پاک نمی‌شود. در صورت اشتباه می‌توانید آن را با ذکر دلیل ابطال کنید.</p>
  </FormModalShell>
}
