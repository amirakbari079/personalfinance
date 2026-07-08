'use client'

interface Props {
  value: string | null
  onChange: (jalali: string) => void
  placeholder?: string
}

/**
 * Simple Jalali date input field (YYYY/MM/DD string contract).
 */
export default function JalaliDatePicker({
  value,
  onChange,
  placeholder = '۱۴۰۳/۰۱/۱۵',
}: Props) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      dir="ltr"
      className="w-full bg-surface border border-surface-muted rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/25 focus:border-brand-accent transition-all tabular-nums"
    />
  )
}
