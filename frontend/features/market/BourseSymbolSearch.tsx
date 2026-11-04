'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { searchBourseInstruments, type BourseInstrument } from '@/lib/api/marketApi'

interface Props {
  onSelect: (item: BourseInstrument) => void
  placeholder?: string
  excludeInsCodes?: string[]
}

export default function BourseSymbolSearch({
  onSelect,
  placeholder = 'نام یا نماد بورسی را جستجو کنید...',
  excludeInsCodes = [],
}: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BourseInstrument[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const items = await searchBourseInstruments(q.trim())
      const filtered = items.filter((i) => !excludeInsCodes.includes(i.insCode))
      setResults(filtered)
      setOpen(filtered.length > 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در جستجو')
      setResults([])
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }, [excludeInsCodes])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(query), 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, runSearch])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(item: BourseInstrument) {
    onSelect(item)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="chand-search-wrap">
        <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
        <input
          type="search"
          aria-label="جست‌وجوی نماد بورسی"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="chand-search-input"
          autoComplete="off"
        />
        {loading && <Loader2 className="w-4 h-4 animate-spin text-brand-accent flex-shrink-0" />}
      </div>

      {error && (
        <p className="text-xs text-status-error mt-2 px-1">{error}</p>
      )}

      {open && results.length > 0 && (
        <ul className="chand-search-results" role="listbox">
          {results.map((item) => (
            <li key={item.insCode}>
              <button
                type="button"
                role="option"
                className="chand-search-item"
                onClick={() => handleSelect(item)}
              >
                <span className="chand-search-item-symbol">{item.symbol}</span>
                <span className="chand-search-item-name">{item.name}</span>
                <span className="chand-search-item-market">{item.marketLabel}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && query.trim().length >= 2 && results.length === 0 && !error && (
        <p className="text-xs text-text-muted mt-2 px-1">نتیجه‌ای یافت نشد</p>
      )}
    </div>
  )
}
