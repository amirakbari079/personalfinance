'use client'

import NumberFlow, { type Format } from '@number-flow/react'

/**
 * Number Flow only supports Latin digits (0–9) and LTR number layout.
 * fa-IR / Eastern digits render as broken commas — see number-flow#8 / #93.
 */
const TOMAN_FORMAT: Format = {
  useGrouping: true,
  maximumFractionDigits: 0,
  numberingSystem: 'latn',
}

interface Props {
  value: number
  /** When false, only the digits animate (caller renders «تومان»). Default true. */
  withSuffix?: boolean
  className?: string
  suffixClassName?: string
}

/**
 * Rolling toman amount via Number Flow (Nobitex-style digit spin).
 * Latin digits + LTR host; honors prefers-reduced-motion.
 */
export default function AnimatedToman({
  value,
  withSuffix = true,
  className,
  suffixClassName,
}: Props) {
  const amount = Math.trunc(Number(value) || 0)

  return (
    <span className={className} dir="ltr">
      <NumberFlow
        value={amount}
        locales="en-US"
        format={TOMAN_FORMAT}
        respectMotionPreference
      />
      {withSuffix ? (
        <span className={suffixClassName} dir="rtl">
          {' '}
          تومان
        </span>
      ) : null}
    </span>
  )
}
