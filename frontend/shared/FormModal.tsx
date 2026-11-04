'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

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
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const titleId = useId()
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const dialog = dialogRef.current!
    const candidates = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
        ),
      ).filter((element) => element.getClientRects().length > 0)
    ;(
      dialog.querySelector<HTMLElement>(
        '[autofocus], input:not(:disabled), .luxury-modal-body button:not(:disabled)',
      ) ??
      candidates()[0] ??
      dialog
    ).focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const fields = candidates()
      const first = fields[0]
      const last = fields[fields.length - 1]
      if (!first) {
        event.preventDefault()
        dialog.focus()
        return
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog)
      ) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    dialog.addEventListener('keydown', keydown)
    return () => {
      dialog.removeEventListener('keydown', keydown)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])
  return (
    <div
      className="luxury-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`luxury-modal luxury-modal--form${wide ? ' luxury-modal--wide' : ''}`}
        role="dialog"
        ref={dialogRef}
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="luxury-modal-header">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id={titleId} className="text-modal-title text-text-primary">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-text-muted mt-1">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {headerAction ?? (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="بستن پنجره"
                  className="icon-button"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="luxury-modal-body">{children}</div>

        {footer && <div className="luxury-modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
