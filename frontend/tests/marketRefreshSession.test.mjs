import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  resetMarketRefreshSessionForTests,
  runMarketRefreshOnce,
} from '../lib/marketRefreshSession.ts'

beforeEach(() => resetMarketRefreshSessionForTests())

test('market refresh runs once per app session and notifies after success', async () => {
  let refreshes = 0
  let notifications = 0
  const refresh = async () => { refreshes += 1 }
  const notify = () => { notifications += 1 }

  assert.equal(await runMarketRefreshOnce(refresh, notify), true)
  assert.equal(await runMarketRefreshOnce(refresh, notify), false)
  assert.equal(refreshes, 1)
  assert.equal(notifications, 1)
})

test('failed background refresh stays silent and does not notify stale readers', async () => {
  let notifications = 0
  const result = await runMarketRefreshOnce(
    async () => { throw new Error('provider unavailable') },
    () => { notifications += 1 },
  )

  assert.equal(result, false)
  assert.equal(notifications, 0)
})
