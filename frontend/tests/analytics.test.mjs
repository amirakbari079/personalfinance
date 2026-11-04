import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  dateKey,
  historyInPeriod,
  monthIndex,
  changeBetween,
  allocation,
  csvCell,
} from '../features/dashboard/analytics.ts'
const point = (date, value = 100) => ({
  recordedDateJalali: date,
  totalAssets: value,
  totalLiabilities: 0,
  netBalance: value,
})
test('normalizes both Persian and Arabic dates and sorts chronologically', () => {
  assert.equal(dateKey('۱۴۰۵/۲/۳'), '1405/02/03')
  assert.equal(dateKey('١٤٠٥-٠٢-٠٣'), '1405/02/03')
  assert.deepEqual(
    historyInPeriod(
      [point('۱۴۰۵/۰۲/۰۳'), point('1404/12/29'), point('1405/03/01')],
      0,
      '1405/02/20',
    ).map((p) => dateKey(p.recordedDateJalali)),
    ['1404/12/29', '1405/02/03'],
  )
})
test('three calendar months cross year boundaries without future records', () => {
  assert.equal(monthIndex('1405/01/01') - monthIndex('1404/12/01'), 1)
  const dates = [
    '1404/10/30',
    '1404/11/01',
    '1404/12/29',
    '1405/01/05',
    '1405/01/21',
  ]
  assert.deepEqual(
    historyInPeriod(
      dates.map((d) => point(d)),
      3,
      '1405/01/20',
    ).map((p) => p.recordedDateJalali),
    dates.slice(1, 4),
  )
})
test('zero baseline has no percentage; negative baselines retain correct direction', () => {
  assert.deepEqual(changeBetween(0, 300), { delta: 300, percent: null })
  assert.deepEqual(changeBetween(-100, -50), { delta: 50, percent: 50 })
  assert.deepEqual(changeBetween(100, 80), { delta: -20, percent: -20 })
})
test('allocation aggregates categories and does not draw negative slices', () => {
  const values = allocation([
    { category: 'cash', amount: 75 },
    { category: 'cash', amount: 25 },
    { category: 'investment', amount: 300 },
    { category: 'receivable', amount: -20 },
  ])
  assert.equal(values.find((v) => v.category === 'cash').share, 0.25)
  assert.equal(values.find((v) => v.category === 'receivable').share, 0)
  assert.equal(
    values.reduce((s, v) => s + v.share, 0),
    1,
  )
  assert.deepEqual(allocation([]), [])
})
test('CSV quotes data and neutralizes spreadsheet formula strings', () => {
  assert.equal(csvCell('=1+1'), '"\'=1+1"')
  assert.equal(csvCell('a"b'), '"a""b"')
  assert.equal(csvCell(-10), '"-10"')
})
