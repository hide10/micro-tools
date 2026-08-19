import { readFile } from 'node:fs/promises'

const ideas = JSON.parse(
  await readFile(new URL('../ideas/backlog.json', import.meta.url), 'utf8'),
)

const totals = ideas.reduce(
  (result, idea) => {
    result[idea.status] = (result[idea.status] ?? 0) + 1
    result.approvedConversions += idea.metrics?.approvedConversions ?? 0
    result.approvedRevenueYen += idea.metrics?.approvedRevenueYen ?? 0
    return result
  },
  { approvedConversions: 0, approvedRevenueYen: 0 },
)

console.log(`候補総数: ${ideas.length}`)
console.log(`ローカル完成: ${totals['built-local'] ?? 0}`)
console.log(`公開済み: ${totals.published ?? 0}`)
console.log(`承認成果: ${totals.approvedConversions}件`)
console.log(`承認売上: ${totals.approvedRevenueYen.toLocaleString('ja-JP')}円`)
console.log(
  `3か月目標: ${totals.approvedConversions}/10件（1件1,000円以上）または ${totals.approvedConversions}/100件（1件100円以上）`,
)

