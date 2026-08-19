import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(new URL('..', import.meta.url).pathname)
const sitesRoot = path.join(root, 'sites')
const errors = []

for (const entry of await readdir(sitesRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const siteRoot = path.join(sitesRoot, entry.name)
  for (const required of ['index.html', 'tool.json', 'offers.json']) {
    try {
      await access(path.join(siteRoot, required))
    } catch {
      errors.push(`${entry.name}: ${required} がありません`)
    }
  }

  const html = await readFile(path.join(siteRoot, 'index.html'), 'utf8')
  if (!html.includes('<title>') || !html.includes('meta name="description"')) {
    errors.push(`${entry.name}: title または description がありません`)
  }
  if (!html.includes('この計算は概算です')) {
    errors.push(`${entry.name}: 概算であることの表示がありません`)
  }

  const tool = JSON.parse(await readFile(path.join(siteRoot, 'tool.json'), 'utf8'))
  for (const required of ['slug', 'number', 'title', 'summary', 'status', 'updatedAt']) {
    if (!tool[required]) errors.push(`${entry.name}: tool.json の ${required} が空です`)
  }
  if (tool.slug !== entry.name) {
    errors.push(`${entry.name}: tool.json の slug とディレクトリ名が一致しません`)
  }
  if (['ready', 'published'].includes(tool.status) && tool.number === 'TBD') {
    errors.push(`${entry.name}: 公開対象ですが number が未設定です`)
  }

  const offers = JSON.parse(await readFile(path.join(siteRoot, 'offers.json'), 'utf8'))
  for (const offer of offers) {
    if (offer.url && offer.approvalStatus !== 'approved') {
      errors.push(`${entry.name}: 未承認案件 ${offer.id} にURLが設定されています`)
    }
    if (offer.approvalStatus === 'approved' && !offer.url) {
      errors.push(`${entry.name}: 承認済み案件 ${offer.id} にURLがありません`)
    }
    if (offer.url && !offer.url.startsWith('https://')) {
      errors.push(`${entry.name}: ${offer.id} のURLがHTTPSではありません`)
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('validation: ok')
