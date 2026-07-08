'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/shared/ThemeProvider'

interface Props {
  className?: string
}

export default function ThemeToggle({ className = '' }: Props) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'تم روشن' : 'تم تیره'}
      aria-label={theme === 'dark' ? 'تم روشن' : 'تم تیره'}
      className={`theme-toggle ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  )
}
