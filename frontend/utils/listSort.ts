export type SortDir = 'asc' | 'desc'

export type SortOptionId =
  | 'createdDesc'
  | 'createdAsc'
  | 'amountDesc'
  | 'amountAsc'
  | 'nameAsc'
  | 'nameDesc'
  | 'dateDesc'
  | 'dateAsc'

export interface SortOption {
  id: SortOptionId
  label: string
}

export const DEFAULT_SORT: SortOptionId = 'createdDesc'

/** Common options for every list page. */
export const BASE_SORT_OPTIONS: SortOption[] = [
  { id: 'createdDesc', label: 'جدیدترین ایجاد' },
  { id: 'createdAsc', label: 'قدیمی‌ترین ایجاد' },
  { id: 'amountDesc', label: 'مبلغ: بیشترین' },
  { id: 'amountAsc', label: 'مبلغ: کمترین' },
  { id: 'nameAsc', label: 'نام: الفبا' },
  { id: 'nameDesc', label: 'نام: الفبا معکوس' },
]

/** Extra options when the module has a domain date (due/start/received…). */
export const DOMAIN_DATE_SORT_OPTIONS: SortOption[] = [
  { id: 'dateDesc', label: 'تاریخ: جدیدترین' },
  { id: 'dateAsc', label: 'تاریخ: قدیمی‌ترین' },
]

export interface SortAccessors<T> {
  getName: (item: T) => string
  getAmount: (item: T) => number
  getCreatedAt: (item: T) => string
  /** Domain date (Jalali YYYY/MM/DD or ISO). Empty/null sorts last. */
  getDate?: (item: T) => string | null | undefined
}

function cmpString(a: string, b: string, dir: SortDir): number {
  const r = a.localeCompare(b, 'fa')
  return dir === 'asc' ? r : -r
}

function cmpNumber(a: number, b: number, dir: SortDir): number {
  return dir === 'asc' ? a - b : b - a
}

/** Jalali YYYY/MM/DD and ISO timestamps both sort lexicographically for our use. */
function cmpDate(a: string | null | undefined, b: string | null | undefined, dir: SortDir): number {
  const av = a?.trim() || ''
  const bv = b?.trim() || ''
  if (!av && !bv) return 0
  if (!av) return 1
  if (!bv) return -1
  return cmpString(av, bv, dir)
}

export function sortItems<T>(
  items: T[],
  sortId: SortOptionId,
  accessors: SortAccessors<T>,
): T[] {
  const copy = [...items]
  copy.sort((a, b) => {
    switch (sortId) {
      case 'createdDesc':
        return cmpString(accessors.getCreatedAt(a), accessors.getCreatedAt(b), 'desc')
      case 'createdAsc':
        return cmpString(accessors.getCreatedAt(a), accessors.getCreatedAt(b), 'asc')
      case 'amountDesc':
        return cmpNumber(accessors.getAmount(a), accessors.getAmount(b), 'desc')
      case 'amountAsc':
        return cmpNumber(accessors.getAmount(a), accessors.getAmount(b), 'asc')
      case 'nameAsc':
        return cmpString(accessors.getName(a), accessors.getName(b), 'asc')
      case 'nameDesc':
        return cmpString(accessors.getName(a), accessors.getName(b), 'desc')
      case 'dateDesc':
        return cmpDate(accessors.getDate?.(a), accessors.getDate?.(b), 'desc')
      case 'dateAsc':
        return cmpDate(accessors.getDate?.(a), accessors.getDate?.(b), 'asc')
      default:
        return 0
    }
  })
  return copy
}
