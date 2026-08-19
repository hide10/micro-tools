import { readFile } from 'node:fs/promises'
import { scoreIdea } from './lib/score.mjs'

const ideas = JSON.parse(
  await readFile(new URL('../ideas/backlog.json', import.meta.url), 'utf8'),
)

const ranked = ideas
  .map((idea) => ({
    score: scoreIdea(idea.scores),
    slug: idea.slug,
    status: idea.status,
    approval: idea.approvalStatus,
    title: idea.title,
  }))
  .sort((a, b) => b.score - a.score)

console.table(ranked)
