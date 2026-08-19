const rounders = {
  floor: Math.floor,
  round: Math.round,
  ceil: Math.ceil,
}

function validateNumber(value, label, { min = 0, allowZero = false } = {}) {
  if (!Number.isFinite(value) || value < min || (!allowZero && value === 0)) {
    throw new RangeError(`${label}を正しく入力してください。`)
  }
}

export function calculateSettlement(input) {
  const { monthlyFee, lowerHours, upperHours, actualHours, method, roundingMode } = input
  validateNumber(monthlyFee, '月額単価')
  validateNumber(lowerHours, '精算幅の下限')
  validateNumber(upperHours, '精算幅の上限')
  validateNumber(actualHours, '実稼働時間', { allowZero: true })
  if (lowerHours >= upperHours) throw new RangeError('精算幅は下限より上限を大きくしてください。')
  if (!['upper-lower', 'center'].includes(method)) throw new RangeError('算出方式を選んでください。')
  if (!rounders[roundingMode]) throw new RangeError('端数処理を選んでください。')

  const round = rounders[roundingMode]
  const midpoint = (lowerHours + upperHours) / 2
  const overtimeRate = round(monthlyFee / (method === 'center' ? midpoint : upperHours))
  const deductionRate = round(monthlyFee / (method === 'center' ? midpoint : lowerHours))
  let adjustment = 0
  let adjustmentHours = 0
  let state = 'within'

  if (actualHours > upperHours) {
    state = 'overtime'
    adjustmentHours = actualHours - upperHours
    adjustment = round(adjustmentHours * overtimeRate)
  } else if (actualHours < lowerHours) {
    state = 'deduction'
    adjustmentHours = lowerHours - actualHours
    adjustment = -round(adjustmentHours * deductionRate)
  }

  const totalPayment = monthlyFee + adjustment
  const hoursText = Number.isInteger(adjustmentHours) ? adjustmentHours : adjustmentHours.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  const yen = new Intl.NumberFormat('ja-JP')
  const stateLabel = state === 'overtime' ? `${hoursText}時間の超過` : state === 'deduction' ? `${hoursText}時間の控除` : '精算幅の範囲内'
  const summary = state === 'overtime'
    ? `${upperHours}hを${hoursText}h超過。${yen.format(monthlyFee)}円に${yen.format(adjustment)}円を加算します。`
    : state === 'deduction'
      ? `${lowerHours}hを${hoursText}h下回るため、${yen.format(monthlyFee)}円から${yen.format(Math.abs(adjustment))}円を控除します。`
      : `${lowerHours}–${upperHours}hの範囲内なので、月額${yen.format(monthlyFee)}円のままです。`

  return {
    monthlyFee,
    overtimeRate,
    deductionRate,
    adjustment,
    adjustmentHours,
    totalPayment,
    state,
    stateLabel,
    methodLabel: method === 'center' ? '中央割' : '上下割',
    summary,
  }
}
