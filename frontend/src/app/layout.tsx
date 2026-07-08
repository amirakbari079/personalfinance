import type { Metadata } from 'next'
import { Vazirmatn } from 'next/font/google'
import type { ReactNode } from 'react'
import './globals.css'

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-vazirmatn',
})

export const metadata: Metadata = {
  title: 'حسابداری شخصی',
  description: 'مدیریت مالی شخصی',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className={`${vazirmatn.className} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
