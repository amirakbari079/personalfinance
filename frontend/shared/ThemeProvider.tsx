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
import {
  DARK_PALETTE_STORAGE_KEY,
  parseDarkPalette,
  paletteColors,
  isDefaultColors,
  type DarkPalette,
} from './theme/palettes'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  colors: ThemeColors
  setColor: (key: keyof ThemeColors, value: string) => void
  applyColors: (colors: ThemeColors) => void
  resetColors: () => void
  darkPalette: DarkPalette
  selectDarkPalette: (palette: DarkPalette) => void
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
  const [darkPalette, setDarkPalette] = useState<DarkPalette>('evergreen')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
      const initial: Theme = stored === 'light' ? 'light' : 'dark'
      setTheme(initial)
      applyTheme(initial)
      const palette = parseDarkPalette(
        localStorage.getItem(DARK_PALETTE_STORAGE_KEY),
      )
      setDarkPalette(palette)
      document.documentElement.dataset.darkPalette = palette
    } catch {
      applyTheme('dark')
    }

    let storedColors = DEFAULT_THEME_COLORS
    try {
      storedColors = parseStoredColors(
        localStorage.getItem(THEME_COLORS_STORAGE_KEY),
      )
    } catch {
      /* Browser storage may be unavailable. */
    }
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

  const setColor = useCallback(
    (key: keyof ThemeColors, value: string) => {
      setColors((prev) => {
        const base =
          theme === 'dark' && isDefaultColors(prev)
            ? paletteColors(darkPalette)
            : prev
        const next = { ...base, [key]: value }
        persistColors(next)
        applyThemeColors(next)
        return next
      })
    },
    [theme, darkPalette],
  )

  const applyColors = useCallback((next: ThemeColors) => {
    setColors(next)
    persistColors(next)
    applyThemeColors(next)
  }, [])

  const resetColors = useCallback(() => {
    applyColors(DEFAULT_THEME_COLORS)
  }, [applyColors])

  const selectDarkPalette = useCallback(
    (palette: DarkPalette) => {
      setDarkPalette(palette)
      document.documentElement.dataset.darkPalette = palette
      setTheme('dark')
      applyTheme('dark')
      applyColors(DEFAULT_THEME_COLORS)
      try {
        localStorage.setItem(DARK_PALETTE_STORAGE_KEY, palette)
        localStorage.setItem(STORAGE_KEY, 'dark')
      } catch {
        /* The selection still works when storage is blocked. */
      }
    },
    [applyColors],
  )

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        colors:
          theme === 'dark' && isDefaultColors(colors)
            ? paletteColors(darkPalette)
            : colors,
        setColor,
        applyColors,
        resetColors,
        darkPalette,
        selectDarkPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
