import { calculateSettlement } from './calculator.mjs'

const form = document.querySelector('#settlement-form')
const fields = Object.fromEntries([...form.elements].filter((field) => field.name).map((field) => [field.name, field]))
const output = {
  state: document.querySelector('#settlement-state'),
  method: document.querySelector('#method-label'),
  total: document.querySelector('#total-payment'),
  base: document.querySelector('#base-fee'),
  adjustment: document.querySelector('#adjustment'),
  overtime: document.querySelector('#overtime-rate'),
  deduction: document.querySelector('#deduction-rate'),
  summary: document.querySelector('#result-summary'),
}
const number = new Intl.NumberFormat('ja-JP')

function currentInput() {
  return {
    monthlyFee: Number(fields.monthlyFeeMan.value) * 10_000,
    lowerHours: Number(fields.lowerHours.value),
    upperHours: Number(fields.upperHours.value),
    actualHours: Number(fields.actualHours.value),
    method: fields.method.value,
    roundingMode: fields.roundingMode.value,
  }
}

function saveUrl() {
  const url = new URL(window.location.href)
  for (const [name, field] of Object.entries(fields)) url.searchParams.set(name, field.value)
  history.replaceState(null, '', url)
}

function render() {
  try {
    const result = calculateSettlement(currentInput())
    output.state.textContent = result.stateLabel
    output.method.textContent = result.methodLabel
    output.total.textContent = number.format(result.totalPayment)
    output.base.textContent = number.format(result.monthlyFee)
    output.adjustment.textContent = `${result.adjustment >= 0 ? '+' : '−'}${number.format(Math.abs(result.adjustment))}`
    output.overtime.textContent = number.format(result.overtimeRate)
    output.deduction.textContent = number.format(result.deductionRate)
    output.summary.textContent = result.summary
    saveUrl()
    window.dataLayer?.push({ event: 'tool_complete', tool: 'settlement-range-calculator', state: result.state })
  } catch (error) {
    output.state.textContent = '入力条件を確認'
    output.summary.textContent = error.message
  }
}

function restoreUrl() {
  const params = new URLSearchParams(window.location.search)
  for (const [name, field] of Object.entries(fields)) {
    if (params.has(name)) field.value = params.get(name)
  }
}

async function loadOffers() {
  const response = await fetch('./offers.json')
  const offers = (await response.json()).filter((offer) => offer.approvalStatus === 'approved' && offer.url)
  if (!offers.length) return
  const section = document.querySelector('#offers')
  const list = document.querySelector('#offer-list')
  for (const offer of offers) {
    const card = document.createElement('article')
    card.className = 'offer-card'
    const text = document.createElement('div')
    const title = document.createElement('h3')
    title.textContent = offer.name
    const note = document.createElement('p')
    note.textContent = offer.note
    const link = document.createElement('a')
    link.href = offer.url
    link.rel = 'sponsored noopener noreferrer'
    link.textContent = offer.cta ?? '条件を見る'
    link.addEventListener('click', () => window.dataLayer?.push({ event: 'affiliate_outbound_click', offer: offer.id }))
    text.append(title, note)
    card.append(text, link)
    list.append(card)
  }
  section.hidden = false
  window.dataLayer?.push({ event: 'affiliate_offer_impression', tool: 'settlement-range-calculator' })
}

form.addEventListener('input', render)
document.querySelector('#copy-result').addEventListener('click', async () => {
  await navigator.clipboard.writeText(window.location.href)
  document.querySelector('#copy-status').textContent = 'URLをコピーしました。'
  window.dataLayer?.push({ event: 'tool_result_share', tool: 'settlement-range-calculator' })
})

restoreUrl()
render()
loadOffers().catch(() => {})
