import assert from 'node:assert/strict'
import test from 'node:test'

import { calculateRequiredRevenue } from './calculator.mjs'

const DEFAULTS = {
  salary: 740,
  companyDeductionRate: 23,
  expenseRate: 15,
  freelanceDeductionRate: 30,
  stabilityBufferRate: 10,
  billableMonths: 10.5,
  billableDays: 18,
}

test('年収740万円の既定値から年商約1053万円と月単価約100万円を返す', () => {
  const result = calculateRequiredRevenue(DEFAULTS)
  assert.ok(Math.abs(result.annualRevenue - 1053.41) < 0.01)
  assert.ok(Math.abs(result.monthlyRate - 100.32) < 0.01)
  assert.ok(Math.abs(result.dailyRate - 5.57) < 0.01)
})

test('経費率が上がると必要売上も上がる', () => {
  const base = calculateRequiredRevenue(DEFAULTS)
  const expensive = calculateRequiredRevenue({ ...DEFAULTS, expenseRate: 30 })
  assert.ok(expensive.annualRevenue > base.annualRevenue)
})

test('稼働月数は月単価だけに影響する', () => {
  const base = calculateRequiredRevenue(DEFAULTS)
  const fewerMonths = calculateRequiredRevenue({ ...DEFAULTS, billableMonths: 9 })
  assert.equal(fewerMonths.annualRevenue, base.annualRevenue)
  assert.ok(fewerMonths.monthlyRate > base.monthlyRate)
})

test('不正な率と稼働月数を拒否する', () => {
  assert.throws(
    () => calculateRequiredRevenue({ ...DEFAULTS, expenseRate: 100 }),
    RangeError,
  )
  assert.throws(
    () => calculateRequiredRevenue({ ...DEFAULTS, billableMonths: 0 }),
    RangeError,
  )
})

