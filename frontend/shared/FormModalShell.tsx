'use client'

import type { FormEvent, ReactNode } from 'react'
import FormModal from '@/shared/FormModal'

interface Props {
  title: string
  subtitle?: string
  wide?: boolean
  onClose: () => void
  onSubmit: (e: FormEvent) => void
  error?: string | null
  saving?: boolean
  submitLabel: string
  savingLabel?: string
  submitDisabled?: boolean
  children: ReactNode
}

export default function FormModalShell({
  title,
  subtitle,
  wide,
  onClose,
  onSubmit,
  error,
  saving,
  submitLabel,
  savingLabel = 'در حال ذخیره...',
  submitDisabled,
  children,
}: Props) {
  return (
    <FormModal
      title={title}
      subtitle={subtitle}
      wide={wide}
      onClose={onClose}
      footer={
        <>
          {error && (
            <p className="text-sm text-status-error bg-status-error-bg border border-status-error-border rounded-lg px-4 py-2.5 mb-3">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              form="form-modal"
              disabled={saving || submitDisabled}
              className="flex-1 btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? savingLabel : submitLabel}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">
              انصراف
            </button>
          </div>
        </>
      }
    >
      <form id="form-modal" onSubmit={onSubmit} noValidate className="space-y-4">
        {children}
      </form>
    </FormModal>
  )
}
