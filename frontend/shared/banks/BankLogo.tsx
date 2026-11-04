'use client'

import { Wallet, Landmark, Banknote } from 'lucide-react'
import { getBankByCode } from './bankCatalog'
import { EasyTraderIcon, KianTraderIcon } from './customIcons'
import type { AccountType } from '@/lib/api/accountsApi'

interface BankLogoProps {
  bankCode: string | null | undefined
  accountType?: AccountType
  size?: number
  className?: string
}

export default function BankLogo({
  bankCode,
  accountType,
  size = 28,
  className = '',
}: BankLogoProps) {
  const bank = getBankByCode(bankCode ?? undefined)

  if (bank?.iconKey === 'EasyTrader') {
    return <EasyTraderIcon size={size} className={className} />
  }
  if (bank?.iconKey === 'KianTrader') {
    return <KianTraderIcon size={size} className={className} />
  }

  if (bank) {
    return (
      <img
        src={`/banks/${bank.iconKey}.svg`}
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
        className={`shrink-0 ${className}`}
        loading="lazy"
      />
    )
  }

  return (
    <span className={`text-base leading-none ${className}`} aria-hidden>
      {accountType === 'BANK' ? (
        <Landmark size={size} />
      ) : accountType === 'CASH' ? (
        <Banknote size={size} />
      ) : (
        <Wallet size={size} />
      )}
    </span>
  )
}
