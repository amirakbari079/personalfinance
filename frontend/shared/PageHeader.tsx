'use client'

import CsvExportButton from '@/shared/CsvExportButton'

interface Props {
  title: string
  subtitle?: string
  addLabel?: string
  onAdd?: () => void
  onExport?: () => Promise<void>
}

export default function PageHeader({
  title,
  subtitle,
  addLabel,
  onAdd,
  onExport,
}: Props) {
  return (
    <div className="page-heading flex flex-wrap items-start justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl text-page-title text-text-primary tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-text-muted mt-1.5 font-[var(--font-weight-caption)]">
            {subtitle}
          </p>
        )}
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
