import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateSettlement } from './calculator.mjs'

const base = {
  monthlyFee: 800_000,
  lowerHours: 140,
  upperHours: 180,
  actualHours: 190,
  method: 'upper-lower',
  roundingMode: 'round',
}

test('上下割で190時間なら超過10時間を加算する', () => {
  const result = calculateSettlement(base)
  assert.equal(result.overtimeRate, 4_444)
  assert.equal(result.deductionRate, 5_714)
  assert.equal(result.adjustment, 44_440)
  assert.equal(result.totalPayment, 844_440)
})

test('上下割で130時間なら控除10時間を減額する', () => {
  const result = calculateSettlement({ ...base, actualHours: 130 })
  assert.equal(result.state, 'deduction')
  assert.equal(result.adjustment, -57_140)
  assert.equal(result.totalPayment, 742_860)
})

test('精算幅の範囲内では月額単価が変わらない', () => {
  for (const actualHours of [140, 160, 180]) {
    const result = calculateSettlement({ ...base, actualHours })
    assert.equal(result.state, 'within')
    assert.equal(result.totalPayment, 800_000)
  }
})

test('中央割では超過と控除に同じ単価を使う', () => {
  const result = calculateSettlement({ ...base, method: 'center' })
  assert.equal(result.overtimeRate, 5_000)
  assert.equal(result.deductionRate, 5_000)
  assert.equal(result.totalPayment, 850_000)
})

test('下限以上の上限や不明な端数処理を拒否する', () => {
  assert.throws(() => calculateSettlement({ ...base, lowerHours: 180 }), /下限より上限/)
  assert.throws(() => calculateSettlement({ ...base, roundingMode: 'invalid' }), /端数処理/)
})
