import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const [, , slug, title] = process.argv
if (!slug || !title || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('usage: npm run new -- <kebab-case-slug> "タイトル"')
  process.exit(1)
}

const root = path.resolve(new URL('..', import.meta.url).pathname)
const target = path.join(root, 'sites', slug)
await mkdir(path.dirname(target), { recursive: true })
await cp(path.join(root, 'templates', 'basic-tool'), target, {
  recursive: true,
  errorOnExist: true,
  force: false,
})

for (const filename of ['index.html', 'tool.json']) {
  const targetFile = path.join(target, filename)
  const source = await readFile(targetFile, 'utf8')
  await writeFile(
    targetFile,
    source.replaceAll('__SLUG__', slug).replaceAll('__TITLE__', title),
  )
}

console.log(`created: sites/${slug}`)

