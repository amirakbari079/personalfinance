'use client'

import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  wide?: boolean
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  headerAction?: ReactNode
}

export default function FormModal({
  title,
  subtitle,
  wide,
  onClose,
  children,
  footer,
  headerAction,
}: Props) {
  return (
    <div
      className="luxury-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`luxury-modal luxury-modal--form${wide ? ' luxury-modal--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
      >
        <div className="luxury-modal-header">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="form-modal-title" className="text-modal-title text-text-primary tracking-tight">
                {title}
              </h2>
              {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
            </div>
            {headerAction}
          </div>
        </div>

        <div className="luxury-modal-body">{children}</div>

        {footer && <div className="luxury-modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
