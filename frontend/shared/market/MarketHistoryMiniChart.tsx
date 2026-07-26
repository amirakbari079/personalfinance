'use client'

import dynamic from 'next/dynamic'
import type { MarketHistoryPoint } from '@/lib/api/marketApi'
import { formatMarketValue } from '@/lib/api/marketApi'

const MiniChartInner = dynamic(() => import('./MarketHistoryMiniChartInner'), {
  ssr: false,
  loading: () => (
    <div className="h-16 flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

interface Props {
  data: MarketHistoryPoint[]
  currency: string
  isLoading?: boolean
}

export default function MarketHistoryMiniChart({ data, currency, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="h-16 flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (data.length < 2) {
    return (
      <p className="text-[10px] text-text-muted text-center py-4">
        داده کافی برای نمودار ماه جاری نیست
      </p>
    )
  }

  return <MiniChartInner data={data} currency={currency} formatValue={formatMarketValue} />
}
