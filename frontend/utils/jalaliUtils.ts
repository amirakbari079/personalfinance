/**
 * Formats a Jalali date string for display.
 * Returns "—" for null/undefined/empty values.
 */
export function formatJalali(jalali: string | null | undefined): string {
  if (!jalali) return '—'
  return jalali
}

/** Validates that a string matches YYYY/MM/DD Jalali format. */
export function isValidJalali(value: string): boolean {
  return /^\d{4}\/\d{2}\/\d{2}$/.test(value)
}
