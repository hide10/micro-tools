import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(new URL('..', import.meta.url).pathname)
const dist = path.join(root, 'dist')
const indexNow = JSON.parse(await readFile(path.join(root, 'indexnow.json'), 'utf8'))

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
await cp(path.join(root, 'styles.css'), path.join(dist, 'styles.css'))
await cp(path.join(root, 'favicon.svg'), path.join(dist, 'favicon.svg'))
await cp(path.join(root, 'analytics.js'), path.join(dist, 'analytics.js'))
await cp(path.join(root, 'robots.txt'), path.join(dist, 'robots.txt'))
await cp(path.join(root, 'privacy'), path.join(dist, 'privacy'), { recursive: true })
await cp(path.join(root, indexNow.keyFile), path.join(dist, indexNow.keyFile))
await cp(path.join(root, 'sites'), path.join(dist, 'tools'), {
  recursive: true,
  filter(source) {
    return !source.endsWith('.test.mjs')
  },
})

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const tools = []
for (const entry of await readdir(path.join(root, 'sites'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const metadata = JSON.parse(
    await readFile(path.join(root, 'sites', entry.name, 'tool.json'), 'utf8'),
  )
  if (['ready', 'published'].includes(metadata.status)) tools.push(metadata)
}
tools.sort((a, b) => a.number.localeCompare(b.number, 'ja', { numeric: true }))

const toolRows = tools
  .map(
    (tool) => `        <a class="tool-row" href="./tools/${escapeHtml(tool.slug)}/">
          <span class="number">${escapeHtml(tool.number)}</span>
          <span>
            <strong>${escapeHtml(tool.title)}</strong>
            <small>${escapeHtml(tool.summary)}</small>
          </span>
          <span class="arrow" aria-hidden="true">→</span>
        </a>`,
  )
  .join('\n')

const rootHtml = await readFile(path.join(root, 'index.html'), 'utf8')
const builtRootHtml = rootHtml.replace(
  /<!-- TOOL_ROWS_START -->[\s\S]*<!-- TOOL_ROWS_END -->/,
  `<!-- TOOL_ROWS_START -->\n${toolRows}\n        <!-- TOOL_ROWS_END -->`,
)
await writeFile(path.join(dist, 'index.html'), builtRootHtml)

const baseUrl = 'https://hide10.github.io/micro-tools/'
const sitemapUrls = [
  { url: baseUrl, updatedAt: tools.at(-1)?.updatedAt ?? '2026-08-19' },
  ...tools.map((tool) => ({
    url: `${baseUrl}tools/${tool.slug}/`,
    updatedAt: tool.updatedAt,
  })),
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    ({ url, updatedAt }) => `  <url>
    <loc>${escapeHtml(url)}</loc>
    <lastmod>${escapeHtml(updatedAt)}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>
`
await writeFile(path.join(dist, 'sitemap.xml'), sitemap)

console.log(`built: ${dist}`)
