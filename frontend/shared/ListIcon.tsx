import type { LucideIcon } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'success' | 'error'

interface Props {
  icon: LucideIcon
  variant?: Variant
  className?: string
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-brand-accent/10 text-brand-accent group-hover:bg-brand-accent/18',
  secondary: 'bg-secondary/10 text-secondary group-hover:bg-secondary/18',
  success: 'bg-status-success/10 text-status-success group-hover:bg-status-success/16',
  error: 'bg-status-error/10 text-status-error group-hover:bg-status-error/16',
}

export default function ListIcon({ icon: Icon, variant = 'primary', className = '' }: Props) {
  return (
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
    >
      <Icon className="w-4 h-4" />
    </div>
  )
}
