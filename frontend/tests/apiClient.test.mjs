import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { apiGet, apiPost, clearApiCache } from '../lib/api/apiClient.ts'

const originalFetch = globalThis.fetch
const response = (data) => Response.json({ success: true, data })
afterEach(() => { globalThis.fetch = originalFetch; clearApiCache() })

test('concurrent page reads share one request and reuse recent data', async () => {
  let calls = 0
  globalThis.fetch = async () => { calls++; return response([1]) }
  assert.deepEqual(await Promise.all([apiGet('/accounts', 'error'), apiGet('/accounts', 'error')]), [[1], [1]])
  await apiGet('/accounts', 'error')
  assert.equal(calls, 1)
})

test('saving and signing out invalidate cached financial data', async () => {
  let calls = 0
  globalThis.fetch = async () => response(++calls)
  assert.equal(await apiGet('/accounts', 'error'), 1)
  await apiPost('/accounts', {}, 'error')
  assert.equal(await apiGet('/accounts', 'error'), 3)
  clearApiCache()
  assert.equal(await apiGet('/accounts', 'error'), 4)
})

test('failed reads are retryable and unsuccessful envelopes reject', async () => {
  globalThis.fetch = async () => Response.json({ success: false, message: 'failed', data: null })
  await assert.rejects(apiGet('/accounts', 'error'), /failed/)
  globalThis.fetch = async () => response([2])
  assert.deepEqual(await apiGet('/accounts', 'error'), [2])
})

test('an old in-flight read cannot repopulate cache after a mutation', async () => {
  let resolveOld
  globalThis.fetch = () => new Promise((resolve) => { resolveOld = resolve })
  const old = apiGet('/accounts', 'error')
  globalThis.fetch = async () => response('new')
  await apiPost('/accounts', {}, 'error')
  resolveOld(response('old'))
  await old
  assert.equal(await apiGet('/accounts', 'error'), 'new')
})
