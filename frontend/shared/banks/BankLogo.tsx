'use client'

import * as BankIconsCore from '@iran-utils/iranian-banks-icons-core'
import { getBankByCode } from './bankCatalog'
import type { AccountType } from '@/lib/api/accountsApi'

interface SvgIconData {
  viewBox: string
  content: string
}

const ICON_DATA = new Map<string, SvgIconData>()

for (const [exportName, data] of Object.entries(BankIconsCore)) {
  if (
    exportName.endsWith('ColorIcon') &&
    data &&
    typeof data === 'object' &&
    'viewBox' in data &&
    'content' in data
  ) {
    ICON_DATA.set(exportName.replace(/ColorIcon$/, ''), data as SvgIconData)
  }
}

interface BankLogoProps {
  bankCode: string | null | undefined
  accountType?: AccountType
  size?: number
  className?: string
}

export default function BankLogo({ bankCode, accountType, size = 28, className = '' }: BankLogoProps) {
  const bank = getBankByCode(bankCode ?? undefined)
  const icon = bank ? ICON_DATA.get(bank.iconKey) : undefined

  if (icon) {
    return (
      <svg
        viewBox={icon.viewBox}
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        aria-hidden
        dangerouslySetInnerHTML={{ __html: icon.content }}
      />
    )
  }

  return (
    <span className={`text-base leading-none ${className}`} aria-hidden>
      {fallbackEmoji(accountType)}
    </span>
  )
}

function fallbackEmoji(type?: AccountType): string {
  const icons: Record<AccountType, string> = {
    BANK: '🏦',
    DIGITAL_WALLET: '💳',
    EXCHANGE: '💱',
    CASH: '💵',
    OTHER: '📁',
  }
  return type ? icons[type] : '🏦'
}
