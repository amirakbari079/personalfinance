'use client'

import dynamic from 'next/dynamic'

export default dynamic(() => import('./TrendLineChart'), {
  ssr: false,
  loading: () => (
    <div className="glass-card p-6 flex items-center justify-center h-56">
      <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})
