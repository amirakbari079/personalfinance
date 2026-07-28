'use client'

import Link from 'next/link'
import { formatToman } from '@/utils/formatToman'
import CsvExportButton from '@/shared/CsvExportButton'
import PageHeader from '@/shared/PageHeader'
import StatusTag from '@/shared/StatusTag'
import { exportAiPortfolioJson } from '@/lib/aiExport'
import { useBalanceSheetData } from './useBalanceSheetData'
import BalanceSummaryPanel from './BalanceSummaryPanel'
import {
  type BalanceCategory,
  type BalanceLineItem,
  ASSET_CATEGORY_ORDER,
  LIABILITY_CATEGORY_ORDER,
} from './balanceSheetTypes'

export default function BalanceSheetPage() {
  const { data, isLoading, error } = useBalanceSheetData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5">
          {error ?? 'خطا در بارگذاری'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <PageHeader
        title="ترازنامه"
        subtitle="دارایی‌ها و بدهی‌ها"
      />

      <div className="mb-8 flex justify-start">
        <CsvExportButton
          onExport={exportAiPortfolioJson}
          label="خروجی AI"
          title="دانلود فایل JSON یکپارچه برای تحلیل با هوش مصنوعی"
          className="btn-export px-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BalanceColumn
          title="دارایی‌ها"
          items={data.assets}
          total={data.totalAssets}
          categoryOrder={ASSET_CATEGORY_ORDER}
          variant="asset"
        />
        <BalanceColumn
          title="بدهی‌ها"
          items={data.liabilities}
          total={data.totalLiabilities}
          categoryOrder={LIABILITY_CATEGORY_ORDER}
          variant="liability"
        />
      </div>

      <BalanceSummaryPanel
        totalAssets={data.totalAssets}
        totalLiabilities={data.totalLiabilities}
        netBalance={data.netBalance}
      />
    </div>
  )
}

interface BalanceColumnProps {
  title: string
  items: BalanceLineItem[]
  total: number
  categoryOrder: BalanceCategory[]
  variant: 'asset' | 'liability'
}

function BalanceColumn({ title, items, total, categoryOrder, variant }: BalanceColumnProps) {
  const isAsset = variant === 'asset'
  const grouped = groupByCategory(items, categoryOrder)

  return (
    <section className={`glass-card p-4 ${isAsset ? 'border-status-success-border/40' : 'border-status-error-border/40'}`}>
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-section-label text-text-primary">{title}</h2>
          <StatusTag variant={isAsset ? 'success' : 'error'}>{isAsset ? 'دارایی' : 'بدهی'}</StatusTag>
        </div>
        <span className={`text-sm text-amount ${isAsset ? 'text-status-success' : 'text-status-error'}`}>
          {isAsset ? '' : '− '}
          {formatToman(total)}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">
          {isAsset ? 'دارایی‌ای ثبت نشده' : 'بدهی‌ای ثبت نشده'}
        </p>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ category, categoryLabel, items: groupItems }) => (
            <div key={category}>
              <p className="text-[11px] text-text-muted mb-2 px-1">{categoryLabel}</p>
              <div className="space-y-2">
                {groupItems.map((item) => (
                  <BalanceRow key={item.id} item={item} variant={variant} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function BalanceRow({
  item,
  variant,
}: {
  item: BalanceLineItem
  variant: 'asset' | 'liability'
}) {
  const isAsset = variant === 'asset'

  return (
    <Link
      href={item.href}
      className="glass-card px-4 py-3 flex items-center justify-between group"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-text-primary truncate">{item.name}</span>
        <StatusTag variant="neutral" className="text-[10px] flex-shrink-0">
          {item.categoryLabel}
        </StatusTag>
      </div>
      <span
        className={`text-sm text-amount flex-shrink-0 mr-2 ${
          isAsset ? 'text-status-success' : 'text-status-error'
        }`}
      >
        {isAsset ? '' : '− '}
        {formatToman(item.amount)}
      </span>
    </Link>
  )
}

function groupByCategory(
  items: BalanceLineItem[],
  order: BalanceCategory[],
): { category: BalanceCategory; categoryLabel: string; items: BalanceLineItem[] }[] {
  const map = new Map<BalanceCategory, BalanceLineItem[]>()

  for (const item of items) {
    const list = map.get(item.category) ?? []
    list.push(item)
    map.set(item.category, list)
  }

  return order
    .filter((cat) => map.has(cat))
    .map((cat) => ({
      category: cat,
      categoryLabel: map.get(cat)![0].categoryLabel,
      items: map.get(cat)!,
    }))
}
