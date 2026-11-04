import type { RecommendationStatus, ThesisStatus } from './api'

export function formatRecommendationStatus(status: RecommendationStatus | ThesisStatus) {
  switch (status) {
    case 'DRAFT':
      return 'پیش‌نویس'
    case 'ACTIVE':
      return 'فعال'
    case 'SUPERSEDED':
      return 'جایگزین شد'
    case 'EXPIRED':
      return 'منقضی'
    case 'INVALIDATED':
      return 'بی‌اعتبار'
    case 'COMPLETED':
      return 'تکمیل'
    default:
      return status
  }
}

export function formatRisk(value: string | null) {
  switch (value) {
    case 'CONSERVATIVE':
      return 'محافظه‌کار'
    case 'MODERATE':
      return 'متوسط'
    case 'BALANCED':
      return 'متعادل'
    case 'AGGRESSIVE':
      return 'تهاجمی'
    case 'VERY_AGGRESSIVE':
      return 'بسیار تهاجمی'
    case 'UNSPECIFIED':
      return 'نامشخص'
    default:
      return value ?? '—'
  }
}

export function formatHorizon(value: string | null) {
  switch (value) {
    case '1M':
      return '۱ ماه'
    case '3M':
      return '۳ ماه'
    case '6M':
      return '۶ ماه'
    case '1Y':
      return '۱ سال'
    case '3Y':
      return '۳ سال'
    default:
      return value ?? '—'
  }
}

export function formatAssetMove(value: string | null) {
  switch (value) {
    case 'UP':
      return 'صعود'
    case 'DOWN':
      return 'نزول'
    case 'FLAT':
      return 'بدون تغییر'
    default:
      return '—'
  }
}

export function formatWhen(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fa-IR')
}
