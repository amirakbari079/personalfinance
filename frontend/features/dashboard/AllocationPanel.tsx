'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpLeft } from 'lucide-react'
import type { BalanceLineItem } from '@/features/balance-sheet/balanceSheetTypes'
import { allocation, compactMoney } from './analytics'
import { formatToman } from '@/utils/formatToman'
const CATEGORIES: Record<
  string,
  { label: string; color: string; href: string }
> = {
  cash: {
    label: 'حساب‌های نقدی',
    color: 'var(--finance-chart-1)',
    href: '/accounts',
  },
  investment: {
    label: 'سرمایه‌گذاری',
    color: 'var(--finance-chart-2)',
    href: '/investments',
  },
  standby: {
    label: 'کالاهای معوق',
    color: 'var(--finance-chart-3)',
    href: '/standby',
  },
  receivable: {
    label: 'طلب‌ها',
    color: 'var(--finance-chart-4)',
    href: '/receivables',
  },
}
export default function AllocationPanel({
  assets,
}: {
  assets: BalanceLineItem[]
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const groups = allocation(assets)
  const total = groups.reduce((sum, g) => sum + Math.max(0, g.value), 0)
  const current = groups.find((g) => g.category === selected)
  let offset = 0
  return (
    <section className="finance-panel allocation-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">پول شما کجاست؟</p>
          <h2>ترکیب دارایی‌ها</h2>
        </div>
        <ArrowUpLeft size={20} className="muted" aria-hidden="true" />
      </div>
      <div className="allocation-visual">
        <svg
          viewBox="0 0 220 220"
          role="img"
          aria-label="نمودار سهم دارایی‌ها؛ مقدار دقیق هر بخش در فهرست پایین آمده است."
        >
          <circle
            cx="110"
            cy="110"
            r="85"
            fill="none"
            stroke="var(--finance-border)"
            strokeWidth="20"
          />
          {groups
            .filter((g) => g.share > 0)
            .map((g) => {
              const start = offset
              offset += g.share * 100
              return (
                <circle
                  key={g.category}
                  cx="110"
                  cy="110"
                  r="85"
                  pathLength="100"
                  fill="none"
                  stroke={CATEGORIES[g.category]?.color}
                  strokeWidth={selected === g.category ? 26 : 20}
                  strokeDasharray={`${Math.max(0, g.share * 100 - (groups.length > 1 ? 1 : 0))} 100`}
                  strokeDashoffset={-start}
                  transform="rotate(-90 110 110)"
                  opacity={selected && selected !== g.category ? 0.25 : 1}
                />
              )
            })}
        </svg>
        <div className="allocation-center" aria-live="polite">
          <small>
            {current ? CATEGORIES[current.category]?.label : 'دارایی‌های مثبت'}
          </small>
          <strong>{compactMoney(current ? current.value : total)}</strong>
          <small>تومان</small>
        </div>
      </div>
      <div className="allocation-list">
        {groups.map((g) => (
          <div key={g.category}>
            <button
              aria-pressed={selected === g.category}
              onClick={() =>
                setSelected(selected === g.category ? null : g.category)
              }
            >
              <i style={{ background: CATEGORIES[g.category]?.color }} />
              <span>{CATEGORIES[g.category]?.label}</span>
              <strong>
                {(g.share * 100).toLocaleString('fa-IR', {
                  maximumFractionDigits: 1,
                })}
                ٪
              </strong>
            </button>
            <Link
              href={CATEGORIES[g.category]?.href ?? '/balance-sheet'}
              title={`مشاهدهٔ ${CATEGORIES[g.category]?.label}`}
            >
              {formatToman(g.value)}
              <ArrowUpLeft size={14} />
            </Link>
          </div>
        ))}
      </div>
      {!groups.length && (
        <p className="empty-caption">
          هنوز دارایی‌ای ثبت نشده. از «ثبت جدید» شروع کنید.
        </p>
      )}
      {groups.some((g) => g.value < 0) && (
        <p className="chart-note">
          مقادیر منفی در سهم دایره محاسبه نمی‌شوند؛ در تراز کل لحاظ شده‌اند.
        </p>
      )}
    </section>
  )
}
