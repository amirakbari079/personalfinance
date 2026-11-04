'use client'

import { useId } from 'react'

interface CustomIconProps {
  size: number
  className?: string
}

export function EasyTraderIcon({ size, className = '' }: CustomIconProps) {
  const uid = useId().replace(/:/g, '')
  const gid = `easytrader-${uid}`

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="7" y1="39" x2="41" y2="9" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E11D48" />
          <stop offset=".28" stopColor="#F97316" />
          <stop offset=".52" stopColor="#EAB308" />
          <stop offset=".76" stopColor="#65A30D" />
          <stop offset="1" stopColor="#0D9488" />
        </linearGradient>
      </defs>
      <path
        d="M8.5 36.8C11 17.5 26.5 7.2 41 12.4"
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="8.8"
        strokeLinecap="butt"
      />
    </svg>
  )
}

export function KianTraderIcon({ size, className = '' }: CustomIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      <rect width="48" height="48" fill="#0E4D98" />
      <rect x="10" y="12" width="6.4" height="24" rx="1.15" fill="#fff" />
      <path
        fill="#8BB8EE"
        d="M22.2 24C26.8 14.2 36.2 9.8 39.2 11.1v6.2c-5.2-1.1-11.4 1.4-13.2 6.7 1.8 5.3 8 7.8 13.2 6.7v6.2C36.2 38.2 26.8 33.8 22.2 24Z"
      />
    </svg>
  )
}
