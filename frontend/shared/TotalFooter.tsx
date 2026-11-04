'use client'

interface Props {
  label?: string
  value: number
  formatValue: (amount: number) => string
}

export default function TotalFooter({ label = 'جمع کل', value, formatValue }: Props) {
  return (
    <div className="mt-4 pt-4 border-t border-surface-muted flex justify-between items-center">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-base text-amount text-text-primary">{formatValue(value)}</span>
    </div>
  )
}
