import type { ReactNode } from 'react'

type TagVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'neutral'

interface StatusTagProps {
  children: ReactNode
  variant?: TagVariant
  className?: string
}

const VARIANT_CLASSES: Record<TagVariant, string> = {
  primary: 'tag-primary',
  secondary: 'tag-secondary',
  success: 'tag-success',
  error: 'tag-error',
  warning: 'tag-warning',
  neutral: 'tag-neutral',
}

export default function StatusTag({ children, variant = 'neutral', className = '' }: StatusTagProps) {
  return (
    <span className={`status-tag ${VARIANT_CLASSES[variant]} ${className}`.trim()}>
      {children}
    </span>
  )
}
