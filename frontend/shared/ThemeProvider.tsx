'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  applyThemeColors,
  DEFAULT_THEME_COLORS,
  parseStoredColors,
  THEME_COLORS_STORAGE_KEY,
  type ThemeColors,
} from '@/shared/theme/colors'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  colors: ThemeColors
  setColor: (key: keyof ThemeColors, value: string) => void
  applyColors: (colors: ThemeColors) => void
  resetColors: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'theme'

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

function persistColors(colors: ThemeColors) {
  try {
    localStorage.setItem(THEME_COLORS_STORAGE_KEY, JSON.stringify(colors))
  } catch {
    // ignore
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_THEME_COLORS)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
      const initial: Theme = stored === 'light' ? 'light' : 'dark'
      setTheme(initial)
      applyTheme(initial)
    } catch {
      applyTheme('dark')
    }

    const storedColors = parseStoredColors(localStorage.getItem(THEME_COLORS_STORAGE_KEY))
    setColors(storedColors)
    applyThemeColors(storedColors)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // ignore
      }
      applyTheme(next)
      return next
    })
  }, [])

  const setColor = useCallback((key: keyof ThemeColors, value: string) => {
    setColors((prev) => {
      const next = { ...prev, [key]: value }
      persistColors(next)
      applyThemeColors(next)
      return next
    })
  }, [])

  const applyColors = useCallback((next: ThemeColors) => {
    setColors(next)
    persistColors(next)
    applyThemeColors(next)
  }, [])

  const resetColors = useCallback(() => {
    applyColors(DEFAULT_THEME_COLORS)
  }, [applyColors])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors, setColor, applyColors, resetColors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
