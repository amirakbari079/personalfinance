import {
  type WatchlistItem,
  watchlistLabel,
} from '@/lib/api/marketApi'

const STORAGE_KEY = 'pf_market_watchlist_v2'
const LEGACY_KEY = 'pf_market_watchlist_v1'

function normalizeItem(raw: Partial<WatchlistItem>): WatchlistItem | null {
  if (!raw?.insCode || typeof raw.insCode !== 'string') return null
  return {
    insCode: raw.insCode,
    symbol: raw.symbol ?? '',
    name: raw.name ?? raw.symbol ?? '',
    displayName: raw.displayName,
    showOnInvestments: Boolean(raw.showOnInvestments),
  }
}

function parseStored(raw: string | null): WatchlistItem[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Partial<WatchlistItem>[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(normalizeItem)
      .filter((item): item is WatchlistItem => item != null)
  } catch {
    return []
  }
}

export function loadWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return []
  const current = parseStored(localStorage.getItem(STORAGE_KEY))
  if (current.length > 0) return current

  const legacy = parseStored(localStorage.getItem(LEGACY_KEY))
  if (legacy.length > 0) {
    saveWatchlist(legacy)
    localStorage.removeItem(LEGACY_KEY)
  }
  return legacy
}

export function saveWatchlist(items: WatchlistItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent('pf-watchlist-changed'))
}

export function addToWatchlist(item: Omit<WatchlistItem, 'showOnInvestments'> & Partial<Pick<WatchlistItem, 'showOnInvestments'>>): WatchlistItem[] {
  const current = loadWatchlist()
  if (current.some((i) => i.insCode === item.insCode)) {
    return current
  }
  const entry: WatchlistItem = {
    insCode: item.insCode,
    symbol: item.symbol,
    name: item.name,
    displayName: item.displayName,
    showOnInvestments: item.showOnInvestments ?? false,
  }
  const next = [entry, ...current]
  saveWatchlist(next)
  return next
}

export function updateWatchlistItem(
  insCode: string,
  patch: Partial<Pick<WatchlistItem, 'displayName' | 'showOnInvestments'>>,
): WatchlistItem[] {
  const next = loadWatchlist().map((item) =>
    item.insCode === insCode ? { ...item, ...patch } : item,
  )
  saveWatchlist(next)
  return next
}

export function removeFromWatchlist(insCode: string): WatchlistItem[] {
  const next = loadWatchlist().filter((i) => i.insCode !== insCode)
  saveWatchlist(next)
  return next
}

export function getInvestmentsPinnedWatchlist(): WatchlistItem[] {
  return loadWatchlist().filter((item) => item.showOnInvestments)
}

export { watchlistLabel }
