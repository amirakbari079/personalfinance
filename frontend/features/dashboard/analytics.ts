/** Pure presentation calculations. Snapshot changes are not spending or investment returns. */
export interface HistoryPoint {
  recordedDateJalali: string
  totalAssets: number
  totalLiabilities: number
  netBalance: number
}

export function dateKey(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/-/g, '/')
    .split('/')
    .map((p) => p.padStart(2, '0'))
    .join('/')
}

export function todayKey(): string {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  return ['year', 'month', 'day']
    .map((key) => parts.find((p) => p.type === key)?.value ?? '')
    .join('/')
}

export function monthIndex(date: string): number {
  const [year, month] = dateKey(date).split('/').map(Number)
  return year * 12 + month - 1
}

export function historyInPeriod<T extends HistoryPoint>(
  points: T[],
  months: number,
  today: string,
): T[] {
  const end = dateKey(today)
  const firstMonth = monthIndex(end) - months + 1
  return points
    .filter(
      (p) =>
        /^\d{4}\/\d{2}\/\d{2}$/.test(dateKey(p.recordedDateJalali)) &&
        dateKey(p.recordedDateJalali) <= end &&
        (!months || monthIndex(p.recordedDateJalali) >= firstMonth),
    )
    .sort((a, b) =>
      dateKey(a.recordedDateJalali).localeCompare(
        dateKey(b.recordedDateJalali),
      ),
    )
}

export function changeBetween(first: number, last: number) {
  const delta = last - first
  return {
    delta,
    percent: first === 0 ? null : (delta / Math.abs(first)) * 100,
  }
}

export function compactMoney(value: number): string {
  const abs = Math.abs(value)
  const [divisor, unit] =
    abs >= 1e9
      ? [1e9, 'میلیارد']
      : abs >= 1e6
        ? [1e6, 'میلیون']
        : abs >= 1e3
          ? [1e3, 'هزار']
          : [1, '']
  return `${(value / Number(divisor)).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} ${unit}`.trim()
}

export function allocation<T extends { category: string; amount: number }>(
  items: T[],
) {
  const totals = new Map<string, number>()
  for (const item of items)
    totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount)
  const positiveTotal = [...totals.values()].reduce(
    (sum, value) => sum + Math.max(0, value),
    0,
  )
  return [...totals.entries()]
    .map(([category, value]) => ({
      category,
      value,
      share: positiveTotal > 0 ? Math.max(0, value) / positiveTotal : 0,
    }))
    .sort((a, b) => b.value - a.value)
}

export function csvCell(value: string | number): string {
  const text = String(value)
  const safe =
    typeof value === 'string' && /^[=+@-]/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}
