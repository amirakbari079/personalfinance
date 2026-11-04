export type ThemeColors = {
  primary: string
  secondary: string
  success: string
  error: string
}

export const DEFAULT_THEME_COLORS: ThemeColors = {
  primary: '#08735d',
  secondary: '#956014',
  success: '#08735d',
  error: '#b3423a',
}

export const THEME_COLORS_STORAGE_KEY = 'pf-theme-colors'

export const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  primary: 'رنگ اصلی',
  secondary: 'رنگ ثانویه',
  success: 'موفقیت',
  error: 'خطا',
}

export const COLOR_DESCRIPTIONS: Record<keyof ThemeColors, string> = {
  primary: 'دکمه‌ها، لینک‌های فعال و هایلایت‌ها',
  secondary: 'تگ‌ها، آیکون‌ها و جزئیات تزئینی',
  success: 'مقادیر مثبت و وضعیت‌های خوب',
  error: 'مقادیر منفی و هشدارها',
}

function clamp(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)))
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')}`
}

export function lighten(hex: string, amount = 0.15): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return rgbToHex(
    rgb.r + (255 - rgb.r) * amount,
    rgb.g + (255 - rgb.g) * amount,
    rgb.b + (255 - rgb.b) * amount,
  )
}

export function darken(hex: string, amount = 0.15): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return rgbToHex(
    rgb.r * (1 - amount),
    rgb.g * (1 - amount),
    rgb.b * (1 - amount),
  )
}

export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

export function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex)
}

export function parseStoredColors(raw: string | null): ThemeColors {
  if (!raw) return DEFAULT_THEME_COLORS
  try {
    const parsed = JSON.parse(raw) as Partial<ThemeColors>
    const result = { ...DEFAULT_THEME_COLORS }
    for (const key of Object.keys(
      DEFAULT_THEME_COLORS,
    ) as (keyof ThemeColors)[]) {
      if (typeof parsed[key] === 'string' && isValidHex(parsed[key]!)) {
        result[key] = parsed[key]!
      }
    }
    return result
  } catch {
    return DEFAULT_THEME_COLORS
  }
}

export function applyThemeColors(colors: ThemeColors): void {
  const root = document.documentElement
  if (
    Object.keys(DEFAULT_THEME_COLORS).every(
      (k) =>
        colors[k as keyof ThemeColors] ===
        DEFAULT_THEME_COLORS[k as keyof ThemeColors],
    )
  ) {
    for (const key of [
      '--color-brand-accent',
      '--color-brand-accent-hover',
      '--color-secondary',
      '--color-secondary-hover',
      '--color-status-success',
      '--color-status-error',
      '--color-status-success-bg',
      '--color-status-success-border',
      '--color-status-error-bg',
      '--color-status-error-border',
      '--shadow-accent',
      '--bg-gradient',
    ])
      root.style.removeProperty(key)
    return
  }
  root.style.setProperty('--color-brand-accent', colors.primary)
  root.style.setProperty(
    '--color-brand-accent-hover',
    lighten(colors.primary, 0.12),
  )
  root.style.setProperty('--color-secondary', colors.secondary)
  root.style.setProperty(
    '--color-secondary-hover',
    lighten(colors.secondary, 0.12),
  )
  root.style.setProperty('--color-status-success', colors.success)
  root.style.setProperty('--color-status-error', colors.error)
  root.style.setProperty(
    '--color-status-success-bg',
    withAlpha(colors.success, 0.12),
  )
  root.style.setProperty(
    '--color-status-success-border',
    withAlpha(colors.success, 0.32),
  )
  root.style.setProperty(
    '--color-status-error-bg',
    withAlpha(colors.error, 0.12),
  )
  root.style.setProperty(
    '--color-status-error-border',
    withAlpha(colors.error, 0.32),
  )
  root.style.setProperty(
    '--shadow-accent',
    `0 8px 24px ${withAlpha(colors.primary, 0.35)}`,
  )
  root.style.setProperty(
    '--bg-gradient',
    `radial-gradient(ellipse 80% 50% at 50% -20%, ${withAlpha(colors.primary, 0.18)}, transparent 60%)`,
  )
}
