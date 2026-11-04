import type { Metadata } from 'next'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'
import { Providers } from './providers'
import './globals.css'

const vazirmatn = localFont({
  src: [
    { path: './fonts/Vazirmatn-Regular.ttf', weight: '400' },
    { path: './fonts/Vazirmatn-Medium.ttf', weight: '500' },
    { path: './fonts/Vazirmatn-SemiBold.ttf', weight: '600' },
    { path: './fonts/Vazirmatn-Bold.ttf', weight: '700' },
  ],
  display: 'swap',
  variable: '--font-vazirmatn',
})

export const metadata: Metadata = {
  title: 'حسابداری شخصی',
  description: 'مدیریت مالی شخصی',
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
}

const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light') document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');
    var c = localStorage.getItem('pf-theme-colors');
    if (c) {
      var colors = JSON.parse(c);
      var root = document.documentElement;
      if (colors.primary) {
        root.style.setProperty('--color-brand-accent', colors.primary);
        root.style.setProperty('--color-brand-accent-hover', colors.primary);
      }
      if (colors.secondary) root.style.setProperty('--color-secondary', colors.secondary);
      if (colors.success) root.style.setProperty('--color-status-success', colors.success);
      if (colors.error) root.style.setProperty('--color-status-error', colors.error);
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${vazirmatn.className} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
