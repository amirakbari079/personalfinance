export function formatToman(amount: number): string {
  return (Number(amount) || 0).toLocaleString('fa-IR') + ' تومان'
}

/** Sums Toman amounts; coerces numeric strings so API/list totals stay consistent. */
export function sumAmounts(values: Array<number | string | null | undefined>): number {
  return values.reduce<number>((sum, value) => {
    const n = typeof value === 'number' ? value : Number(value)
    return sum + (Number.isFinite(n) ? n : 0)
  }, 0)
}
