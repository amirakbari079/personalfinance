'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Plus,
  Wallet,
  ArrowDownToLine,
  CalendarClock,
  ChevronLeft,
} from 'lucide-react'
import FormModal from './FormModal'
import { createAccount } from '@/lib/api/accountsApi'
import { createIncome } from '@/lib/api/incomesApi'
import { createPendingExpense } from '@/lib/api/pendingExpensesApi'
const AccountForm = dynamic(() => import('@/features/accounts/AccountForm'))
const IncomeForm = dynamic(() => import('@/features/income/IncomeForm'))
const ExpenseForm = dynamic(
  () => import('@/features/pending-expenses/PendingExpenseForm'),
)
export default function QuickEntry() {
  const [mode, setMode] = useState<
    'choose' | 'account' | 'income' | 'expense' | null
  >(null)
  const [saved, setSaved] = useState(false)
  const done = () => {
    setMode(null)
    setSaved(true)
    window.dispatchEvent(new Event('finance-data-changed'))
  }
  return (
    <>
      <button
        type="button"
        className="btn-primary quick-entry"
        onClick={() => {
          setSaved(false)
          setMode('choose')
        }}
      >
        <Plus size={18} aria-hidden="true" />
        <span>ثبت جدید</span>
      </button>
      {saved && (
        <div className="finance-toast" role="status">
          اطلاعات ثبت شد.
          <button onClick={() => setSaved(false)} aria-label="بستن پیام">
            ×
          </button>
        </div>
      )}
      {mode === 'choose' && (
        <FormModal
          title="چه چیزی ثبت می‌کنید؟"
          subtitle="اطلاعات تازه، تصویر روشن‌تری از پول شما می‌سازد."
          onClose={() => setMode(null)}
          footer={
            <button className="btn-ghost" onClick={() => setMode(null)}>
              انصراف
            </button>
          }
        >
          <div className="quick-options">
            {[
              {
                id: 'account' as const,
                title: 'حساب یا موجودی',
                hint: 'حساب بانکی، کیف پول و وجه نقد',
                Icon: Wallet,
              },
              {
                id: 'income' as const,
                title: 'درآمد',
                hint: 'حقوق ماهانه یا درآمد یک‌باره',
                Icon: ArrowDownToLine,
              },
              {
                id: 'expense' as const,
                title: 'هزینهٔ پیش رو',
                hint: 'مبلغ و تاریخ پرداخت برنامه‌ریزی‌شده',
                Icon: CalendarClock,
              },
            ].map(({ id, title, hint, Icon }) => (
              <button key={id} onClick={() => setMode(id)}>
                <span className="finance-icon">
                  <Icon size={22} />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{hint}</small>
                </span>
                <ChevronLeft size={18} />
              </button>
            ))}
          </div>
        </FormModal>
      )}
      {mode === 'account' && (
        <AccountForm
          initial={null}
          onSave={async (data) => {
            await createAccount(data)
            done()
          }}
          onCancel={() => setMode(null)}
        />
      )}
      {mode === 'income' && (
        <IncomeForm
          initial={null}
          onSave={async (data) => {
            await createIncome(data)
            done()
          }}
          onCancel={() => setMode(null)}
        />
      )}
      {mode === 'expense' && (
        <ExpenseForm
          initial={null}
          onSave={async (data) => {
            await createPendingExpense(data)
            done()
          }}
          onCancel={() => setMode(null)}
        />
      )}
    </>
  )
}
