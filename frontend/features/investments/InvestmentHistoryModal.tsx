'use client'

import EntityHistoryModal from '@/shared/history/EntityHistoryModal'
import { INVESTMENT_HISTORY_CONFIG } from '@/shared/history/historyTypes'
import {
  createInvestmentSnapshot,
  deleteInvestmentSnapshot,
  getInvestmentSnapshots,
  updateInvestmentSnapshot,
} from '@/lib/api/historyApi'

interface Props {
  investmentId: number
  investmentName: string
  onClose: () => void
  onValueChanged?: () => void
}

const INVESTMENT_SNAPSHOT_API = {
  list: getInvestmentSnapshots,
  create: createInvestmentSnapshot,
  update: updateInvestmentSnapshot,
  delete: deleteInvestmentSnapshot,
}

export default function InvestmentHistoryModal(props: Props) {
  const { investmentId, investmentName, onClose, onValueChanged } = props
  return (
    <EntityHistoryModal
      entityId={investmentId}
      entityName={investmentName}
      title="تاریخچه ارزش"
      config={INVESTMENT_HISTORY_CONFIG}
      api={INVESTMENT_SNAPSHOT_API}
      footerNote={`ویرایش رکوردهای گذشته فقط نمودار را اصلاح می‌کند. ${INVESTMENT_HISTORY_CONFIG.latestLabel} سرمایه‌گذاری فقط از رکورد با همان برچسب به‌روز می‌شود.`}
      onClose={onClose}
      onValueChanged={onValueChanged}
    />
  )
}
