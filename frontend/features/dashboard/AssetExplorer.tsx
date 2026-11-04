'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Eye,
  EyeOff,
  ArrowUpLeft,
  Wallet,
  TrendingUp,
  Package,
  HandCoins,
  Landmark,
  CalendarClock,
} from 'lucide-react'
import type {
  BalanceSheetData,
  BalanceLineItem,
} from '@/features/balance-sheet/balanceSheetTypes'
import { formatToman } from '@/utils/formatToman'

const TABS = [
  { id: 'all', label: 'همهٔ دارایی‌ها' },
  { id: 'cash', label: 'حساب‌ها' },
  { id: 'investment', label: 'سرمایه‌گذاری' },
  { id: 'receivable', label: 'طلب‌ها' },
  { id: 'standby', label: 'کالا' },
  { id: 'liability', label: 'تعهدات' },
]
const ICONS = {
  cash: Wallet,
  investment: TrendingUp,
  standby: Package,
  receivable: HandCoins,
  loan: Landmark,
  expense: CalendarClock,
}
const normalize = (v: string) =>
  v.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, '').trim().toLowerCase()

export default function AssetExplorer({ data }: { data: BalanceSheetData }) {
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [hideZero, setHideZero] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [sort, setSort] = useState<'amount' | 'name'>('amount')
  const items = category === 'liability' ? data.liabilities : data.assets
  const categoryItems = items.filter(
    (i) =>
      category === 'all' || category === 'liability' || i.category === category,
  )
  const baseTotal = categoryItems.reduce((s, i) => s + Math.max(0, i.amount), 0)
  const filtered = useMemo(
    () =>
      categoryItems
        .filter(
          (i) =>
            (!hideZero || i.amount !== 0) &&
            normalize(i.name + ' ' + i.categoryLabel).includes(
              normalize(query),
            ),
        )
        .sort((a, b) =>
          sort === 'amount'
            ? b.amount - a.amount
            : a.name.localeCompare(b.name, 'fa'),
        ),
    [categoryItems, hideZero, query, sort],
  )
  const sum = filtered.reduce((s, i) => s + i.amount, 0)
  return (
    <section className="finance-panel asset-explorer">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">جزئیات، هر وقت که بخواهید</p>
          <h2>دارایی‌های من</h2>
        </div>
        <button
          className="icon-button"
          aria-pressed={hidden}
          aria-label={
            hidden
              ? 'نمایش مبلغ‌های این فهرست'
              : 'پنهان‌کردن مبلغ‌های این فهرست'
          }
          title="نمایش یا پنهان‌کردن مبلغ‌های همین فهرست"
          onClick={() => setHidden((v) => !v)}
        >
          {hidden ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      <div className="asset-tabs" aria-label="دستهٔ دارایی‌ها">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            aria-pressed={category === tab.id}
            onClick={() => setCategory(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="asset-toolbar">
        <label className="asset-search">
          <Search size={18} aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جست‌وجوی نام دارایی…"
            aria-label="جست‌وجوی دارایی"
          />
        </label>
        <label className="asset-zero">
          <input
            type="checkbox"
            checked={hideZero}
            onChange={(e) => setHideZero(e.target.checked)}
          />
          پنهان‌کردن صفرها
        </label>
        <label className="asset-sort">
          <span className="sr-only">ترتیب دارایی‌ها</span>
          <select
            aria-label="ترتیب دارایی‌ها"
            value={sort}
            onChange={(e) => setSort(e.target.value as 'amount' | 'name')}
          >
            <option value="amount">بیشترین مبلغ</option>
            <option value="name">نام دارایی</option>
          </select>
        </label>
      </div>
      <div className="asset-list-heading" aria-hidden="true">
        <span>نام و نوع</span>
        <span>ارزش ثبت‌شده</span>
        <span>سهم از دسته</span>
        <span />
      </div>
      <div className="asset-rows">
        {filtered.map((item) => (
          <AssetRow
            key={item.id}
            item={item}
            total={baseTotal}
            hidden={hidden}
          />
        ))}
      </div>
      {!filtered.length && (
        <div className="calm-empty">
          <Wallet size={32} />
          <h3>
            {query
              ? 'دارایی‌ای با این نام پیدا نشد'
              : 'این فهرست هنوز خالی است'}
          </h3>
          <p>
            {query || hideZero
              ? 'عبارت جست‌وجو یا فیلتر صفرها را تغییر دهید.'
              : 'از «ثبت جدید» یا صفحهٔ مربوط به هر بخش شروع کنید.'}
          </p>
          {(query || hideZero) && (
            <button
              className="btn-ghost"
              onClick={() => {
                setQuery('')
                setHideZero(false)
              }}
            >
              پاک‌کردن فیلترها
            </button>
          )}
        </div>
      )}
      <div className="asset-total" aria-live="polite">
        <span>{filtered.length.toLocaleString('fa-IR')} مورد در این فهرست</span>
        <strong>{hidden ? '••••••' : formatToman(sum)}</strong>
      </div>
      <p className="chart-note">
        سهم هر ردیف از مجموع مقادیر مثبت همان دسته است؛ جست‌وجو این مبنا را
        تغییر نمی‌دهد. مبلغ‌ها آخرین ارزش ثبت‌شده‌اند.
      </p>
    </section>
  )
}
function AssetRow({
  item,
  total,
  hidden,
}: {
  item: BalanceLineItem
  total: number
  hidden: boolean
}) {
  const Icon = ICONS[item.category]
  const share = total > 0 ? (Math.max(0, item.amount) / total) * 100 : 0
  return (
    <Link href={item.href} className="asset-row">
      <span className="asset-name">
        <span className="finance-icon">
          <Icon size={20} aria-hidden="true" />
        </span>
        <span>
          <strong>{item.name}</strong>
          <small>{item.categoryLabel}</small>
        </span>
      </span>
      <span className="asset-value">
        {hidden ? '••••••' : formatToman(item.amount)}
      </span>
      <span className="asset-share">
        {hidden ? (
          '•••'
        ) : (
          <>
            <span>
              {share.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}٪
            </span>
            <span className="plan-track">
              <span
                style={{
                  width: `${share}%`,
                  background: 'var(--color-brand-accent)',
                }}
              />
            </span>
          </>
        )}
      </span>
      <ArrowUpLeft size={18} aria-hidden="true" />
    </Link>
  )
}
