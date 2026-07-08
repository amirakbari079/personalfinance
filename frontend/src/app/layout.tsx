import type { Metadata } from 'next'
import { Vazirmatn } from 'next/font/google'
import type { ReactNode } from 'react'
import { Providers } from './providers'
import './globals.css'

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-vazirmatn',
})

export const metadata: Metadata = {
  title: 'حسابداری شخصی',
  description: 'مدیریت مالی شخصی',
}

const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light') document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');
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
