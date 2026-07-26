'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'

interface Props {
  onExport: () => Promise<void>
  label?: string
  title?: string
  className?: string
}

export default function CsvExportButton({
  onExport,
  label = 'CSV',
  title = 'دانلود پشتیبان CSV',
  className = 'btn-export',
}: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      await onExport()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'خطا در دانلود')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
      title={title}
    >
      <Download className="w-3.5 h-3.5" />
      {loading ? '...' : label}
    </button>
  )
}
