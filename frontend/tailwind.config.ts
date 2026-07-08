import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/app/**/*.{ts,tsx}',
    './shared/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-vazirmatn)', 'Vazirmatn', 'sans-serif'],
      },
      fontWeight: {
        body: 'var(--font-weight-body)',
        caption: 'var(--font-weight-caption)',
        label: 'var(--font-weight-label)',
        title: 'var(--font-weight-title)',
        heading: 'var(--font-weight-heading)',
        amount: 'var(--font-weight-amount)',
      },
      colors: {
        'brand-dark': 'var(--color-brand-dark)',
        'brand-darker': 'var(--color-brand-darker)',
        'brand-mid': 'var(--color-brand-mid)',
        'brand-accent': 'var(--color-brand-accent)',
        'brand-accent-hover': 'var(--color-brand-accent-hover)',
        surface: 'var(--color-surface)',
        'surface-card': 'var(--color-surface-card)',
        'surface-muted': 'var(--color-surface-muted)',
        'text-primary': 'var(--color-text-primary)',
        'text-muted': 'var(--color-text-muted)',
        'text-on-dark': 'var(--color-text-on-dark)',
        'text-on-accent': 'var(--color-text-on-accent)',
        'status-error': 'var(--color-status-error)',
        'status-error-bg': 'var(--color-status-error-bg)',
        'status-error-border': 'var(--color-status-error-border)',
      },
      boxShadow: {
        luxury: 'var(--shadow-card)',
        modal: 'var(--shadow-modal)',
        gold: 'var(--shadow-gold)',
      },
    },
  },
  plugins: [],
} satisfies Config
