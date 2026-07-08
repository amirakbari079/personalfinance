import type { Config } from 'tailwindcss'

// ─────────────────────────────────────────────
//  DESIGN TOKENS — تمام تصمیمات بصری اینجاست
//  برای تغییر کل تم، فقط این مقادیر را عوض کن
// ─────────────────────────────────────────────

const tokens = {
  // رنگ‌های اصلی
  'brand-dark':    '#0D1B2A',   // پنل تاریک، متن اصلی
  'brand-darker':  '#070E17',   // عمیق‌ترین تاریکی
  'brand-mid':     '#1E3048',   // hover روی پنل تاریک
  'brand-accent':  '#4F46E5',   // رنگ تأکید — دکمه، focus، لوگو
  'brand-accent-hover': '#4338CA', // hover روی accent

  // سطوح روشن
  'surface':       '#F4F7FA',   // پس‌زمینه کل صفحه
  'surface-card':  '#FFFFFF',   // کارت‌ها، input‌ها
  'surface-muted': '#E8EDF2',   // border‌ها، divider‌ها

  // متن
  'text-primary':  '#0D1B2A',   // متن اصلی
  'text-muted':    '#7A9BB5',   // متن فرعی، placeholder
  'text-on-dark':  '#F4F7FA',   // متن روی پنل تاریک
  'text-on-accent':'#FFFFFF',   // متن روی دکمه accent

  // وضعیت
  'status-error':  '#F87171',   // خطا
  'status-error-bg': '#FEF2F2', // پس‌زمینه خطا
  'status-error-border': '#FECACA',
}

export default {
  content: [
    './src/app/**/*.{ts,tsx}',
    './shared/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-vazirmatn)', 'Vazirmatn', 'sans-serif'],
      },
      colors: tokens,
    },
  },
  plugins: [],
} satisfies Config
