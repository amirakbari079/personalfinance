'use client'
import Link from 'next/link'
import { CalendarClock, ArrowUpLeft, CircleCheck } from 'lucide-react'
import type { Loan } from '@/lib/api/loansApi'
import type { Income } from '@/lib/api/incomesApi'
import type { PendingExpense } from '@/lib/api/pendingExpensesApi'
import { dateKey, todayKey, compactMoney } from './analytics'
import { formatToman } from '@/utils/formatToman'
export function MonthlyPlan({
  incomes,
  loans,
  expenses,
}: {
  incomes: Income[]
  loans: Loan[]
  expenses: PendingExpense[]
}) {
  const income = incomes
    .filter((i) => i.incomeType === 'RECURRING')
    .reduce((s, i) => s + i.amount, 0)
  const installments = loans
    .filter((l) => !l.completed)
    .reduce((s, l) => s + l.monthlyAmount, 0)
  const month = todayKey().slice(0, 7)
  const planned = expenses
    .filter((e) => e.dueDate && dateKey(e.dueDate).startsWith(month))
    .reduce((s, e) => s + e.plannedAmount, 0)
  const free = income - installments - planned
  const max = Math.max(income, installments + planned, 1)
  const rows = [
    {
      label: 'درآمد ماهانهٔ تعریف‌شده',
      value: income,
      color: 'var(--finance-chart-1)',
      href: '/incomes',
    },
    {
      label: 'اقساط ماهانهٔ فعال',
      value: installments,
      color: 'var(--finance-chart-2)',
      href: '/loans',
    },
    {
      label: 'هزینه‌های سررسید این ماه',
      value: planned,
      color: 'var(--finance-chart-4)',
      href: '/pending-expenses',
    },
  ]
  return (
    <section className="finance-panel monthly-plan">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">یک نگاه به ماه جاری</p>
          <h2>درآمد و پرداخت‌های برنامه‌ریزی‌شده</h2>
        </div>
        <CalendarClock size={22} className="muted" />
      </div>
      <div className="plan-bars">
        {rows.map((row) => (
          <Link href={row.href} key={row.label}>
            <div>
              <span>{row.label}</span>
              <strong>{formatToman(row.value)}</strong>
            </div>
            <div className="plan-track">
              <span
                style={{
                  width: `${(Math.max(0, row.value) / max) * 100}%`,
                  background: row.color,
                }}
              />
            </div>
          </Link>
        ))}
      </div>
      <div className={`plan-result ${free < 0 ? 'negative' : 'positive'}`}>
        <span>{free < 0 ? 'کسری در برنامهٔ ماه' : 'ماندهٔ برنامهٔ ماه'}</span>
        <strong>
          {compactMoney(Math.abs(free))} <small>تومان</small>
        </strong>
      </div>
      <p className="chart-note">
        برآورد بر اساس درآمد تکرارشونده و مبالغ ثبت‌شده؛ هزینه‌های روزمره و
        هزینه‌های بدون تاریخ در این محاسبه نیستند. این رقم موجودی قابل‌خرج نیست.
      </p>
    </section>
  )
}
export function UpcomingPayments({
  loans,
  expenses,
}: {
  loans: Loan[]
  expenses: PendingExpense[]
}) {
  const today = todayKey()
  const events = [
    ...loans
      .filter((l) => !l.completed)
      .flatMap((l) => {
        const next = l.installments.find((i) => i.status === 'NEXT')
        return next
          ? [
              {
                id: `loan-${l.id}`,
                name: l.creditor,
                date: dateKey(next.dueDateJalali),
                amount: l.monthlyAmount,
                href: '/loans',
                kind: 'قسط',
              },
            ]
          : []
      }),
    ...expenses.map((e) => ({
      id: `expense-${e.id}`,
      name: e.label,
      date: e.dueDate ? dateKey(e.dueDate) : '',
      amount: e.plannedAmount,
      href: '/pending-expenses',
      kind: 'هزینه',
    })),
  ]
    .sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'))
    .slice(0, 5)
  return (
    <section className="finance-panel upcoming-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">چیزی از قلم نیفتد</p>
          <h2>پرداخت‌های پیش رو</h2>
        </div>
        <Link
          href="/pending-expenses"
          className="icon-button"
          aria-label="همهٔ هزینه‌های پیش رو"
        >
          <ArrowUpLeft size={20} />
        </Link>
      </div>
      <div className="upcoming-list">
        {events.map((e) => (
          <Link key={e.id} href={e.href}>
            <span
              className={`date-tile ${e.date && e.date < today ? 'is-overdue' : ''}`}
            >
              <strong>
                {e.date
                  ? e.date
                      .slice(-2)
                      .replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
                  : '—'}
              </strong>
              <small>{e.kind}</small>
            </span>
            <span className="upcoming-name">
              <strong>{e.name}</strong>
              <small>
                {!e.date
                  ? 'بدون تاریخ'
                  : e.date < today
                    ? 'سررسید گذشته؛ وضعیت را بررسی کنید'
                    : e.date === today
                      ? 'امروز'
                      : e.date.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])}
              </small>
            </span>
            <b>
              {compactMoney(e.amount)}
              <small> تومان</small>
            </b>
          </Link>
        ))}
      </div>
      {!events.length && (
        <div className="calm-empty">
          <CircleCheck size={36} />
          <h3>پرداختی در فهرست نیست</h3>
          <p>هزینه‌های آینده را ثبت کنید تا همین‌جا ببینید.</p>
        </div>
      )}
    </section>
  )
}
