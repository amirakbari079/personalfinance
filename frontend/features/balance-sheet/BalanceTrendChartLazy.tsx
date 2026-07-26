'use client'

import dynamic from 'next/dynamic'

const BalanceTrendChart = dynamic(() => import('./BalanceTrendChart'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

export default BalanceTrendChart
