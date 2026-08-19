import { calculateRequiredRevenue } from './calculator.mjs'

const form = document.querySelector('#rate-form')
const output = {
  annualRevenue: document.querySelector('#annual-revenue'),
  monthlyRate: document.querySelector('#monthly-rate'),
  dailyRate: document.querySelector('#daily-rate'),
  salaryMultiple: document.querySelector('#salary-multiple'),
  cashBuffer: document.querySelector('#cash-buffer'),
  summary: document.querySelector('#result-summary'),
}
let completionTimer

function track(event, parameters = {}) {
  window.microToolsTrack?.(event, { tool_slug: 'freelance-rate-calculator', ...parameters })
}

function valuesFromForm() {
  return Object.fromEntries(
    [...new FormData(form)].map(([name, value]) => [name, Number(value)]),
  )
}

function whole(value) {
  return Math.round(value).toLocaleString('ja-JP')
}

function render() {
  try {
    const values = valuesFromForm()
    const result = calculateRequiredRevenue(values)
    output.annualRevenue.textContent = whole(result.annualRevenue)
    output.monthlyRate.textContent = whole(result.monthlyRate)
    output.dailyRate.textContent = result.dailyRate.toFixed(1)
    output.salaryMultiple.textContent = result.salaryMultiple.toFixed(2)
    output.cashBuffer.textContent = whole(result.sixMonthCashBuffer)
    output.summary.textContent = `年収${whole(values.salary)}万円なら、${values.billableMonths}か月稼働で月単価約${whole(result.monthlyRate)}万円が目安です。`

    const url = new URL(window.location.href)
    for (const [name, value] of Object.entries(values)) url.searchParams.set(name, value)
    window.history.replaceState({}, '', url)

  } catch (error) {
    output.summary.textContent = '入力値を確認してください。'
  }
}

function restoreFromUrl() {
  const params = new URLSearchParams(window.location.search)
  for (const input of form.elements) {
    if (input.name && params.has(input.name)) input.value = params.get(input.name)
  }
}

async function loadOffers() {
  const response = await fetch('./offers.json')
  if (!response.ok) return
  const offers = (await response.json()).filter(
    (offer) => offer.approvalStatus === 'approved' && offer.url,
  )
  if (!offers.length) return

  const section = document.querySelector('#offers')
  const list = document.querySelector('#offer-list')
  for (const offer of offers) {
    const link = document.createElement('a')
    link.className = 'offer-link'
    link.href = offer.url
    link.target = '_blank'
    link.rel = 'sponsored nofollow noopener'
    link.dataset.offerId = offer.id

    const label = document.createElement('strong')
    label.textContent = offer.label
    const description = document.createElement('span')
    description.textContent = offer.description
    const arrow = document.createElement('b')
    arrow.textContent = '→'
    link.append(label, description, arrow)
    link.addEventListener('click', () => track('affiliate_outbound_click', { offer_id: offer.id }))
    list.append(link)
  }
  section.hidden = false
  track('affiliate_offer_impression', { offer_count: offers.length })
}

form.addEventListener('input', () => {
  render()
  clearTimeout(completionTimer)
  completionTimer = setTimeout(() => track('tool_complete'), 700)
})
document.querySelector('#copy-result').addEventListener('click', async () => {
  await navigator.clipboard.writeText(window.location.href)
  document.querySelector('#copy-status').textContent = 'URLをコピーしました。'
  track('tool_result_share')
})

restoreFromUrl()
render()
loadOffers().catch(() => {})
