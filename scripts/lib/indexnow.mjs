export function selectIndexNowUrls(changedPaths, tools, baseUrl, { submitAll = false } = {}) {
  const publicTools = tools.filter((tool) => ['ready', 'published'].includes(tool.status))
  if (submitAll) return [baseUrl, ...publicTools.map((tool) => `${baseUrl}tools/${tool.slug}/`)]

  const urls = new Set()
  for (const changedPath of changedPaths) {
    const siteMatch = changedPath.match(/^sites\/([^/]+)\//)
    if (siteMatch) {
      const tool = publicTools.find(({ slug }) => slug === siteMatch[1])
      if (tool) {
        urls.add(baseUrl)
        urls.add(`${baseUrl}tools/${tool.slug}/`)
      }
      continue
    }

    if (/^(index\.html|styles\.css|favicon\.svg|robots\.txt|scripts\/build\.mjs|templates\/)/.test(changedPath)) {
      urls.add(baseUrl)
      for (const tool of publicTools) urls.add(`${baseUrl}tools/${tool.slug}/`)
    }
  }
  return [...urls]
}
