'use client'

import { RefreshCw } from 'lucide-react'

interface Props {
  onClick: () => void
  loading?: boolean
  label?: string
  className?: string
}

export default function MarketRefreshButton({
  onClick,
  loading = false,
  label = 'بروزرسانی',
  className = '',
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title="دریافت مجدد قیمت از بازار"
      className={`inline-flex items-center gap-1 text-[11px] text-brand-accent hover:text-brand-accent-hover disabled:opacity-50 transition-colors ${className}`}
    >
      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      {label}
    </button>
  )
}
