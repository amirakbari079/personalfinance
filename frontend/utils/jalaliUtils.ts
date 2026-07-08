/**
 * Formats a Jalali date string for display.
 * Returns "—" for null/undefined/empty values.
 */
export function formatJalali(jalali: string | null | undefined): string {
  if (!jalali) return '—'
  return jalali
}

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

/** Converts Persian/Arabic digits to ASCII. */
export function toAsciiDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
}

/** Strips non-digits and limits to 8 digits (YYYYMMDD). */
export function normalizeJalaliInput(value: string): string {
  return toAsciiDigits(value).replace(/\D/g, '').slice(0, 8)
}

/** Formats digit string as YYYY/MM/DD while typing. */
export function formatJalaliInput(digits: string): string {
  if (digits.length <= 4) return digits
  if (digits.length <= 6) return `${digits.slice(0, 4)}/${digits.slice(4)}`
  return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`
}

/** Validates that a string matches YYYY/MM/DD Jalali format. */
export function isValidJalali(value: string): boolean {
  return /^\d{4}\/\d{2}\/\d{2}$/.test(value)
}
