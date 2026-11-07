import { DEFAULT_THEME_COLORS, type ThemeColors } from './colors'

export const DARK_PALETTE_STORAGE_KEY = 'pf-dark-palette'
export const DARK_PALETTES = [
  {
    id: 'midnight',
    name: 'شبِ اقیانوس',
    description: 'سرمه‌ای عمیق، آبی یخی و مرجانی',
    background: '#0b1220',
    surface: '#141f32',
    colors: {
      primary: '#80c7ff',
      secondary: '#ffb29d',
      success: '#77d8b3',
      error: '#ff9cae',
    },
  },
  {
    id: 'amethyst',
    name: 'مخمل و کهربا',
    description: 'بنفش دودی، یاسی روشن و طلایی گرم',
    background: '#17131f',
    surface: '#241e30',
    colors: {
      primary: '#c7adff',
      secondary: '#f3c777',
      success: '#91d5ba',
      error: '#ffa6b2',
    },
  },
  {
    id: 'evergreen',
    name: 'سبز و آبی',
    description: 'سبز آرام و آبی خنک',
    background: '#101a17',
    surface: '#18251f',
    colors: {
      primary: '#82d6b4',
      secondary: '#70c6e8',
      success: '#82d6b4',
      error: '#f3a196',
    },
  },
] as const
export type DarkPalette = (typeof DARK_PALETTES)[number]['id']
export function parseDarkPalette(value: string | null): DarkPalette {
  return DARK_PALETTES.find((p) => p.id === value)?.id ?? 'evergreen'
}
export function paletteColors(palette: DarkPalette): ThemeColors {
  return DARK_PALETTES.find((p) => p.id === palette)!.colors
}
export function isDefaultColors(colors: ThemeColors): boolean {
  return (Object.keys(DEFAULT_THEME_COLORS) as (keyof ThemeColors)[]).every(
    (key) => colors[key] === DEFAULT_THEME_COLORS[key],
  )
}
