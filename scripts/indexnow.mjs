import { execFileSync } from 'node:child_process'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { selectIndexNowUrls } from './lib/indexnow.mjs'

const root = path.resolve(new URL('..', import.meta.url).pathname)
const config = JSON.parse(await readFile(path.join(root, 'indexnow.json'), 'utf8'))
const tools = []
for (const entry of await readdir(path.join(root, 'sites'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  tools.push(JSON.parse(await readFile(path.join(root, 'sites', entry.name, 'tool.json'), 'utf8')))
}

const before = process.env.GITHUB_EVENT_BEFORE
const sha = process.env.GITHUB_SHA
const canDiff = before && sha && !/^0+$/.test(before)
const changedPaths = canDiff
  ? execFileSync('git', ['diff', '--name-only', before, sha], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean)
  : []
const urlList = selectIndexNowUrls(changedPaths, tools, config.baseUrl, { submitAll: !canDiff })

if (!urlList.length) {
  console.log('IndexNow: 公開ページの変更なし。送信を省略します。')
  process.exit(0)
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: config.host,
    key: config.key,
    keyLocation: `${config.baseUrl}${config.keyFile}`,
    urlList,
  }),
})

if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow submission failed: HTTP ${response.status} ${await response.text()}`)
}
console.log(`IndexNow: HTTP ${response.status}, ${urlList.length} URL submitted`)
