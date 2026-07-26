'use client'

import EntityHistoryModal from '@/shared/history/EntityHistoryModal'
import { ACCOUNT_HISTORY_CONFIG } from '@/shared/history/historyTypes'
import {
  createAccountSnapshot,
  deleteAccountSnapshot,
  getAccountSnapshots,
  updateAccountSnapshot,
} from '@/lib/api/historyApi'

interface Props {
  accountId: number
  accountName: string
  onClose: () => void
  onBalanceChanged?: () => void
}

const ACCOUNT_SNAPSHOT_API = {
  list: getAccountSnapshots,
  create: createAccountSnapshot,
  update: updateAccountSnapshot,
  delete: deleteAccountSnapshot,
}

export default function AccountHistoryModal(props: Props) {
  const { accountId, accountName, onClose, onBalanceChanged } = props
  return (
    <EntityHistoryModal
      entityId={accountId}
      entityName={accountName}
      title="تاریخچه موجودی"
      config={ACCOUNT_HISTORY_CONFIG}
      api={ACCOUNT_SNAPSHOT_API}
      footerNote={`ویرایش رکوردهای گذشته فقط نمودار را اصلاح می‌کند. ${ACCOUNT_HISTORY_CONFIG.latestLabel} حساب فقط از رکورد با همان برچسب به‌روز می‌شود.`}
      onClose={onClose}
      onValueChanged={onBalanceChanged}
    />
  )
}
