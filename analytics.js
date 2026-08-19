(() => {
  const measurementId = 'G-T1FR5FQGV2'
  const storageKey = 'micro-tools-analytics'
  const canonical = document.querySelector('link[rel="canonical"]')?.href ?? `${location.origin}${location.pathname}`

  window.disableMicroToolsAnalytics = () => {
    localStorage.setItem(storageKey, 'off')
    document.cookie.split(';').forEach((part) => {
      const name = part.split('=')[0].trim()
      if (name.startsWith('_ga')) document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
    })
  }
  window.enableMicroToolsAnalytics = () => localStorage.removeItem(storageKey)

  if (navigator.doNotTrack === '1' || localStorage.getItem(storageKey) === 'off') return

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    send_page_view: false,
    page_location: canonical,
    page_path: new URL(canonical).pathname,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  })
  window.gtag('event', 'page_view', {
    page_location: canonical,
    page_path: new URL(canonical).pathname,
    page_title: document.title,
  })

  window.microToolsTrack = (eventName, parameters = {}) => {
    const allowed = Object.fromEntries(
      Object.entries(parameters).filter(([key]) => ['tool_slug', 'offer_id', 'offer_count', 'settlement_state'].includes(key)),
    )
    window.gtag('event', eventName, {
      ...allowed,
      page_location: canonical,
      page_path: new URL(canonical).pathname,
    })
  }

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.append(script)
})()
