export type BalanceSide = 'asset' | 'liability'

export type BalanceCategory =
  | 'cash'
  | 'investment'
  | 'standby'
  | 'receivable'
  | 'loan'
  | 'expense'

export interface BalanceLineItem {
  id: string
  side: BalanceSide
  category: BalanceCategory
  categoryLabel: string
  name: string
  amount: number
  href: string
}

export interface BalanceSheetData {
  assets: BalanceLineItem[]
  liabilities: BalanceLineItem[]
  totalAssets: number
  totalLiabilities: number
  netBalance: number
}

export const ASSET_CATEGORY_ORDER: BalanceCategory[] = [
  'cash',
  'investment',
  'standby',
  'receivable',
]

export const LIABILITY_CATEGORY_ORDER: BalanceCategory[] = [
  'loan',
  'expense',
]

export const CATEGORY_LABELS: Record<BalanceCategory, string> = {
  cash: 'نقد',
  investment: 'سرمایه‌گذاری',
  standby: 'کالای معوق',
  receivable: 'طلب',
  loan: 'وام',
  expense: 'هزینه برنامه‌ریزی‌شده',
}
