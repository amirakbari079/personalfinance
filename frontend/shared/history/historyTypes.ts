export type SnapshotEntityType = 'ACCOUNT' | 'INVESTMENT'

export interface EntityHistoryConfig {
  entityType: SnapshotEntityType
  valueLabel: string
  latestLabel: string
  valueFieldLabel: string
  formatValue: (amount: number) => string
}

export const ACCOUNT_HISTORY_CONFIG: EntityHistoryConfig = {
  entityType: 'ACCOUNT',
  valueLabel: 'موجودی',
  latestLabel: 'موجودی فعلی',
  valueFieldLabel: 'موجودی (تومان)',
  formatValue: (amount) => amount.toLocaleString('fa-IR') + ' تومان',
}

export const INVESTMENT_HISTORY_CONFIG: EntityHistoryConfig = {
  entityType: 'INVESTMENT',
  valueLabel: 'معادل تومانی',
  latestLabel: 'ارزش فعلی',
  valueFieldLabel: 'معادل تومانی (تومان)',
  formatValue: (amount) => amount.toLocaleString('fa-IR') + ' تومان',
}
