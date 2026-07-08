import { BANK_CATALOG, getBankByCode } from './bankCatalog'

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\u200c/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Longest keyword match wins — e.g. «بانک ملی» before «ملی». */
export function detectBankFromName(name: string): string | null {
  const normalized = normalize(name)
  if (!normalized) return null

  let best: { code: string; length: number } | null = null

  for (const bank of BANK_CATALOG) {
    for (const keyword of bank.keywords) {
      const kw = normalize(keyword)
      if (!kw) continue
      if (normalized.includes(kw) && (!best || kw.length > best.length)) {
        best = { code: bank.code, length: kw.length }
      }
    }
  }

  return best?.code ?? null
}

export function resolveBankCode(
  storedCode: string | null | undefined,
  accountName: string,
): string | null {
  return storedCode ?? detectBankFromName(accountName)
}

export function bankLabel(code: string | null | undefined): string | null {
  return getBankByCode(code)?.label ?? null
}
