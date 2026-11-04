'use client'

import { useEffect, useState } from 'react'
import { getAccounts } from '@/lib/api/accountsApi'
import { getInvestments } from '@/lib/api/investmentsApi'
import { getStandbyItems } from '@/lib/api/standbyApi'
import { getReceivables } from '@/lib/api/receivablesApi'
import { getLoans } from '@/lib/api/loansApi'
import { getPendingExpenses } from '@/lib/api/pendingExpensesApi'
import {
  type BalanceLineItem,
  type BalanceSheetData,
  CATEGORY_LABELS,
} from './balanceSheetTypes'

export function useBalanceSheetData() {
  const [data, setData] = useState<BalanceSheetData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      getAccounts(),
      getInvestments(),
      getStandbyItems(),
      getReceivables(),
      getLoans(),
      getPendingExpenses(),
    ])
      .then(([accounts, investments, standby, receivables, loans, expenses]) => {
        const assets: BalanceLineItem[] = [
          ...accounts.map((a) => ({
            id: `account-${a.id}`,
            side: 'asset' as const,
            category: 'cash' as const,
            categoryLabel: CATEGORY_LABELS.cash,
            name: a.name,
            amount: Number(a.balance) || 0,
            href: '/accounts',
          })),
          ...investments.map((i) => ({
            id: `investment-${i.id}`,
            side: 'asset' as const,
            category: 'investment' as const,
            categoryLabel: CATEGORY_LABELS.investment,
            name: i.name,
            amount: Number(i.tomanEquivalent) || 0,
            href: '/investments',
          })),
          ...standby.map((s) => ({
            id: `standby-${s.id}`,
            side: 'asset' as const,
            category: 'standby' as const,
            categoryLabel: CATEGORY_LABELS.standby,
            name: s.itemLabel,
            amount: Number(s.totalValue) || 0,
            href: '/standby',
          })),
          ...receivables
            .filter((r) => r.outstanding > 0)
            .map((r) => ({
              id: `receivable-${r.id}`,
              side: 'asset' as const,
              category: 'receivable' as const,
              categoryLabel: CATEGORY_LABELS.receivable,
              name: r.debtorName,
              amount: Number(r.outstanding) || 0,
              href: '/receivables',
            })),
        ]

        const liabilities: BalanceLineItem[] = [
          ...loans
            .filter((l) => !l.completed && l.remainingAmount > 0)
            .map((l) => ({
              id: `loan-${l.id}`,
              side: 'liability' as const,
              category: 'loan' as const,
              categoryLabel: CATEGORY_LABELS.loan,
              name: l.creditor,
              amount: Number(l.remainingAmount) || 0,
              href: '/loans',
            })),
          ...expenses.map((e) => ({
            id: `expense-${e.id}`,
            side: 'liability' as const,
            category: 'expense' as const,
            categoryLabel: CATEGORY_LABELS.expense,
            name: e.label,
            amount: Number(e.plannedAmount) || 0,
            href: '/pending-expenses',
          })),
        ]

        const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0)
        const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0)

        setData({
          assets,
          liabilities,
          totalAssets,
          totalLiabilities,
          netBalance: totalAssets - totalLiabilities,
        })
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'خطا در بارگذاری'))
      .finally(() => setIsLoading(false))
  }, [])

  return { data, isLoading, error }
}
