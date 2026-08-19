import test from 'node:test'
import assert from 'node:assert/strict'
import { selectIndexNowUrls } from './indexnow.mjs'

const baseUrl = 'https://hide10.github.io/micro-tools/'
const tools = [
  { slug: 'published-tool', status: 'published' },
  { slug: 'draft-tool', status: 'draft' },
]

test('変更された公開ツールと一覧だけを通知対象にする', () => {
  assert.deepEqual(
    selectIndexNowUrls(['sites/published-tool/index.html'], tools, baseUrl),
    [baseUrl, `${baseUrl}tools/published-tool/`],
  )
})

test('下書きと非公開ファイルの変更は通知しない', () => {
  assert.deepEqual(selectIndexNowUrls(['sites/draft-tool/index.html', 'README.md'], tools, baseUrl), [])
})

test('共有ビルド変更時はすべての公開URLを通知する', () => {
  assert.deepEqual(
    selectIndexNowUrls(['scripts/build.mjs'], tools, baseUrl),
    [baseUrl, `${baseUrl}tools/published-tool/`],
  )
})
