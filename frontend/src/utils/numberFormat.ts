/** Formats a digit string with thousands separators for display, e.g. "1234567" -> "1,234,567". */
export function formatWithCommas(value: string): string {
  const [intPart, decimalPart] = value.replace(/,/g, '').split('.')
  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decimalPart !== undefined ? `${groupedInt}.${decimalPart}` : groupedInt
}

/** Strips thousands separators, returning the raw digit string for storage/parsing. */
export function stripCommas(value: string): string {
  return value.replace(/,/g, '')
}
