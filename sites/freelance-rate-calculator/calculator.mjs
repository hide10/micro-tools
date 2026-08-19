const PERCENT_FIELDS = [
  'companyDeductionRate',
  'expenseRate',
  'freelanceDeductionRate',
  'stabilityBufferRate',
]

function finiteNumber(value, name) {
  const number = Number(value)
  if (!Number.isFinite(number)) throw new TypeError(`${name} must be a finite number`)
  return number
}

export function calculateRequiredRevenue(values) {
  const salary = finiteNumber(values.salary, 'salary')
  const billableMonths = finiteNumber(values.billableMonths, 'billableMonths')
  const billableDays = finiteNumber(values.billableDays, 'billableDays')

  if (salary <= 0) throw new RangeError('salary must be greater than zero')
  if (billableMonths <= 0 || billableMonths > 12) {
    throw new RangeError('billableMonths must be between 0 and 12')
  }
  if (billableDays <= 0 || billableDays > 31) {
    throw new RangeError('billableDays must be between 0 and 31')
  }

  const rates = Object.fromEntries(
    PERCENT_FIELDS.map((name) => [name, finiteNumber(values[name], name)]),
  )
  for (const [name, rate] of Object.entries(rates)) {
    if (rate < 0 || rate >= 95) throw new RangeError(`${name} must be between 0 and 95`)
  }

  const companyTakeHome = salary * (1 - rates.companyDeductionRate / 100)
  const afterExpenseAndTaxRatio =
    (1 - rates.expenseRate / 100) * (1 - rates.freelanceDeductionRate / 100)
  const annualRevenue =
    (companyTakeHome / afterExpenseAndTaxRatio) *
    (1 + rates.stabilityBufferRate / 100)
  const monthlyRate = annualRevenue / billableMonths
  const dailyRate = monthlyRate / billableDays
  const sixMonthCashBuffer = (companyTakeHome / 12) * 6

  return {
    annualRevenue,
    monthlyRate,
    dailyRate,
    companyTakeHome,
    sixMonthCashBuffer,
    salaryMultiple: annualRevenue / salary,
  }
}

