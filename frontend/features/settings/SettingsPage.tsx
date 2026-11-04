'use client'

import { useTheme } from '@/shared/ThemeProvider'
import {
  COLOR_DESCRIPTIONS,
  COLOR_LABELS,
  DEFAULT_THEME_COLORS,
  isValidHex,
  type ThemeColors,
} from '@/shared/theme/colors'
import { RotateCcw, Palette, Check, Moon } from 'lucide-react'
import { DARK_PALETTES } from '@/shared/theme/palettes'
import PageHeader from '@/shared/PageHeader'
import StatusTag from '@/shared/StatusTag'
import BackupPanel from './BackupPanel'

const PRESET_PALETTES: { name: string; colors: ThemeColors }[] = [
  { name: 'رنگ‌های پایهٔ تم', colors: DEFAULT_THEME_COLORS },
  {
    name: 'بنفش شبانه',
    colors: {
      primary: '#7c3aed',
      secondary: '#ec4899',
      success: '#34d399',
      error: '#fb7185',
    },
  },
  {
    name: 'سبز نئون',
    colors: {
      primary: '#a3e635',
      secondary: '#38bdf8',
      success: '#4ade80',
      error: '#f87171',
    },
  },
  {
    name: 'فیروزه‌ای',
    colors: {
      primary: '#06b6d4',
      secondary: '#818cf8',
      success: '#2dd4bf',
      error: '#f43f5e',
    },
  },
]

function ColorField({
  colorKey,
  value,
  onChange,
}: {
  colorKey: keyof ThemeColors
  value: string
  onChange: (key: keyof ThemeColors, value: string) => void
}) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <label className="relative cursor-pointer flex-shrink-0 group">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(colorKey, e.target.value)}
          className="sr-only"
          aria-label={COLOR_LABELS[colorKey]}
        />
        <div
          className="w-14 h-14 rounded-2xl border-2 border-white/10 shadow-lg transition-transform group-hover:scale-105"
          style={{ backgroundColor: value, boxShadow: `0 8px 24px ${value}44` }}
        />
      </label>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-item-title text-text-primary">
          {COLOR_LABELS[colorKey]}
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          {COLOR_DESCRIPTIONS[colorKey]}
        </p>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value
            if (isValidHex(v) || v.startsWith('#')) onChange(colorKey, v)
          }}
          onBlur={(e) => {
            if (!isValidHex(e.target.value)) onChange(colorKey, value)
          }}
          className="mt-2 field-input text-xs font-mono py-1.5 px-3 max-w-[8rem]"
          dir="ltr"
          spellCheck={false}
        />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const {
    colors,
    setColor,
    applyColors,
    resetColors,
    theme,
    darkPalette,
    selectDarkPalette,
  } = useTheme()

  function applyPreset(preset: ThemeColors) {
    applyColors(preset)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title="تنظیمات" subtitle="پشتیبان داده و ظاهر برنامه" />

      <section
        className="dark-palette-section"
        aria-labelledby="dark-palette-title"
      >
        <div className="palette-section-heading">
          <Moon size={22} aria-hidden="true" />
          <div>
            <h2 id="dark-palette-title">حال‌وهوای شب</h2>
            <p>یک تم کامل برای پس‌زمینه، کارت‌ها و نمودارها انتخاب کنید.</p>
          </div>
        </div>
        <div className="dark-palette-grid">
          {DARK_PALETTES.map((palette) => (
            <button
              key={palette.id}
              type="button"
              className="dark-palette-choice"
              aria-pressed={theme === 'dark' && darkPalette === palette.id}
              onClick={() => selectDarkPalette(palette.id)}
            >
              <span
                className="palette-miniature"
                aria-hidden="true"
                style={{
                  background: palette.background,
                  color: palette.colors.primary,
                }}
              >
                <span
                  className="palette-mini-rail"
                  style={{ background: palette.surface }}
                >
                  <i />
                  <i />
                  <i />
                </span>
                <span className="palette-mini-content">
                  <span className="palette-mini-title" />
                  <span className="palette-mini-cards">
                    <i style={{ background: palette.surface }} />
                    <i style={{ background: palette.surface }} />
                  </span>
                  <svg viewBox="0 0 180 56" fill="none">
                    <path
                      d="M2 50L29 38L58 42L87 23L116 30L145 12L178 4"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 53L29 48L58 50L87 39L116 44L145 31L178 34"
                      stroke={palette.colors.secondary}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="palette-swatches">
                  {[
                    palette.colors.primary,
                    palette.colors.secondary,
                    palette.colors.success,
                  ].map((color, index) => (
                    <i key={index} style={{ background: color }} />
                  ))}
                </span>
              </span>
              <span className="palette-choice-copy">
                <strong>{palette.name}</strong>
                <span>{palette.description}</span>
              </span>
              <span className="palette-selection">
                <Check size={16} aria-hidden="true" />
                {theme === 'dark' && darkPalette === palette.id
                  ? 'فعال'
                  : 'انتخاب تم'}
              </span>
            </button>
          ))}
        </div>
        <p className="palette-help">
          انتخاب تم، حالت تاریک و رنگ‌های هماهنگ آن را فعال می‌کند و در همین
          مرورگر ذخیره می‌شود. رنگ‌های سفارشی را می‌توانید پایین‌تر تغییر دهید.
        </p>
      </section>

      {/* Live preview */}
      <section className="mb-8">
        <h2 className="text-xs text-text-muted mb-3 px-1">پیش‌نمایش ظاهر</h2>
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button type="button" className="btn-primary text-xs">
              دکمه اصلی
            </button>
            <button type="button" className="btn-secondary text-xs">
              دکمه ثانویه
            </button>
            <StatusTag variant="primary">اصلی</StatusTag>
            <StatusTag variant="secondary">ثانویه</StatusTag>
            <StatusTag variant="success">+ ۱۳٪</StatusTag>
            <StatusTag variant="error">منفی</StatusTag>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              }}
            />
            <div>
              <p className="text-sm text-text-primary">نمونه کارت شیشه‌ای</p>
              <p className="text-xs text-text-muted mt-0.5">
                تغییرات بلافاصله اعمال می‌شوند
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Presets */}
      <section className="mb-8">
        <h2 className="text-xs text-text-muted mb-3 px-1">
          رنگ‌های تأکیدی آماده
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_PALETTES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset.colors)}
              className="glass-card p-3 text-center hover:border-brand-accent/30 transition-all group"
            >
              <div className="flex justify-center gap-1 mb-2">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ background: preset.colors.primary }}
                />
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ background: preset.colors.secondary }}
                />
              </div>
              <span className="text-xs text-text-muted group-hover:text-text-primary transition-colors">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Color pickers */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs text-text-muted flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            رنگ‌های سفارشی
          </h2>
          <button
            type="button"
            onClick={resetColors}
            className="btn-ghost text-xs flex items-center gap-1.5 py-1.5 px-3"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            بازنشانی
          </button>
        </div>
        <div className="space-y-3">
          {(Object.keys(COLOR_LABELS) as (keyof ThemeColors)[]).map((key) => (
            <ColorField
              key={key}
              colorKey={key}
              value={colors[key]}
              onChange={setColor}
            />
          ))}
        </div>
      </section>
      <BackupPanel />
    </div>
  )
}
