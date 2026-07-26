'use client'

import type { SortOption, SortOptionId } from '@/utils/listSort'

interface Props {
  value: SortOptionId
  options: SortOption[]
  onChange: (id: SortOptionId) => void
}

export default function ListSortBar({ value, options, onChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <label className="text-xs text-text-muted flex items-center gap-2">
        <span className="whitespace-nowrap">مرتب‌سازی</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortOptionId)}
          className="field-input py-1.5 px-3 text-xs min-w-[10rem] w-auto"
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
