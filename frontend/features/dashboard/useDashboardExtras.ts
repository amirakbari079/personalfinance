'use client'
import { useEffect, useState } from 'react'
import {
  getBalanceSheetHistory,
  type BalanceSheetHistoryPoint,
} from '@/lib/api/balanceSheetHistoryApi'
import { getIncomes, type Income } from '@/lib/api/incomesApi'
import { getLoans, type Loan } from '@/lib/api/loansApi'
import {
  getPendingExpenses,
  type PendingExpense,
} from '@/lib/api/pendingExpensesApi'

export function useDashboardExtras() {
  const [history, setHistory] = useState<BalanceSheetHistoryPoint[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [expenses, setExpenses] = useState<PendingExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<string[]>([])
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    let alive = true
    setLoading(true)
    setErrors([])
    const tasks = [
      {
        name: 'تاریخچه',
        run: () =>
          getBalanceSheetHistory().then((v) => {
            if (alive) setHistory(v)
          }),
      },
      {
        name: 'درآمدها',
        run: () =>
          getIncomes().then((v) => {
            if (alive) setIncomes(v)
          }),
      },
      {
        name: 'وام‌ها',
        run: () =>
          getLoans().then((v) => {
            if (alive) setLoans(v)
          }),
      },
      {
        name: 'هزینه‌ها',
        run: () =>
          getPendingExpenses().then((v) => {
            if (alive) setExpenses(v)
          }),
      },
    ]
    void Promise.allSettled(
      tasks.map(async (t) => {
        try {
          await t.run()
        } catch {
          if (alive) setErrors((e) => [...e, t.name])
        }
      }),
    ).then(() => {
      if (alive) setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [revision])
  return {
    history,
    incomes,
    loans,
    expenses,
    loading,
    errors,
    retry: () => setRevision((v) => v + 1),
  }
}
