'use client'

import { useEffect, useState } from 'react'
import { getAccounts } from '@/lib/api/accountsApi'

export function ApiSmokeTest() {
  const [status, setStatus] = useState('در حال تست API...')

  useEffect(() => {
    getAccounts()
      .then((accounts) => setStatus(`API OK — ${accounts.length} حساب`))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'خطای ناشناخته'
        setStatus(`API خطا — ${message}`)
      })
  }, [])

  return <p className="text-xs text-text-muted mt-4 tabular-nums">{status}</p>
}
