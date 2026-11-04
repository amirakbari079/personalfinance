const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

/** Converts Persian/Arabic digits to ASCII. */
export function toAsciiDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
}

/** Formats a digit string with thousands separators for display, e.g. "1234567" -> "1,234,567". */
export function formatWithCommas(value: string): string {
  const normalized = stripCommas(value)
  const [intPart, decimalPart] = normalized.split('.')
  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decimalPart !== undefined ? `${groupedInt}.${decimalPart}` : groupedInt
}

/** Strips thousands separators and non-ASCII digits, returning the raw digit string. */
export function stripCommas(value: string): string {
  return toAsciiDigits(value).replace(/[,٬،\s]/g, '')
}
