import { readFile } from 'node:fs/promises'
import { scoreIdea } from './lib/score.mjs'

const ideas = JSON.parse(
  await readFile(new URL('../ideas/backlog.json', import.meta.url), 'utf8'),
)

const next = ideas
  .filter((idea) => ['candidate', 'researched'].includes(idea.status))
  .map((idea) => ({ ...idea, totalScore: scoreIdea(idea.scores) }))
  .sort((a, b) => b.totalScore - a.totalScore)[0]

if (!next) {
  console.log('未処理候補はありません。調査して backlog.json に追加してください。')
  process.exit(0)
}

console.log(`NEXT ${next.totalScore}点: ${next.title}`)
console.log(`slug: ${next.slug}`)
console.log(`query: ${next.problemQuery}`)
console.log(`revenue: ${next.monetization}`)
console.log(`approval: ${next.approvalStatus}`)
console.log(`evidence: ${next.programEvidence}`)

