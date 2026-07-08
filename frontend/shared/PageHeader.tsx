'use client'

import CsvExportButton from '@/shared/CsvExportButton'

interface Props {
  title: string
  subtitle?: string
  addLabel?: string
  onAdd?: () => void
  onExport?: () => Promise<void>
}

export default function PageHeader({ title, subtitle, addLabel, onAdd, onExport }: Props) {
  return (
    <div className="flex items-start justify-between mb-8 gap-4">
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-brand-accent/70 mb-1.5 font-medium">
          Personal Finance
        </p>
        <h1 className="text-2xl font-light text-text-primary tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-text-muted mt-1.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onExport && <CsvExportButton onExport={onExport} />}
        {onAdd && addLabel && (
          <button type="button" onClick={onAdd} className="btn-primary">
            {addLabel}
          </button>
        )}
      </div>
    </div>
  )
}
