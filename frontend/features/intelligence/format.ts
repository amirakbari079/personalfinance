export function formatPrice(value: number, currency: string) {
  if (currency === 'USD') {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }
  return `${Math.round(value).toLocaleString('fa-IR')} تومان`
}

export function formatChange(value: number | null) {
  if (value == null) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toLocaleString('fa-IR', { maximumFractionDigits: 2 })}٪`
}

export function formatStatus(status: string) {
  switch (status) {
    case 'QUEUED':
      return 'در صف'
    case 'RUNNING':
      return 'در حال اجرا'
    case 'SUCCESS':
      return 'موفق'
    case 'PARTIAL_SUCCESS':
      return 'نسبتاً موفق'
    case 'FAILED':
      return 'ناموفق'
    default:
      return status
  }
}

export function formatReason(reason: string | null) {
  switch (reason) {
    case 'PRIMARY_ROUTE':
      return 'منبع اصلی'
    case 'FALLBACK_ROUTE':
      return 'منبع جایگزین'
    case 'ONLY_SOURCE':
      return 'تنها منبع'
    case 'CONFLICT_PRIMARY_KEPT':
      return 'اختلاف؛ منبع اصلی نگه داشته شد'
    default:
      return reason ?? '—'
  }
}
