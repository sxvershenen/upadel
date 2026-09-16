export function resolveAdminPrefetchHref(href: string, currentHref: string, adminRoute: string): string | null {
  const currentURL = new URL(currentHref)
  const targetURL = new URL(href, currentURL)
  const adminRoot = adminRoute === '/' ? '' : adminRoute.replace(/\/$/, '')
  const isAdminPath = targetURL.pathname === adminRoot || targetURL.pathname.startsWith(`${adminRoot}/`)

  if (targetURL.origin !== currentURL.origin || !isAdminPath) return null

  const target = `${targetURL.pathname}${targetURL.search}`
  const current = `${currentURL.pathname}${currentURL.search}`
  return target === current ? null : target
}

export function createPrefetchQueue(prefetch: (href: string) => void, schedule: (callback: () => void) => unknown) {
  const queued = new Set<string>()
  const pending: string[] = []
  let scheduled = false
  let disposed = false

  const scheduleNext = () => {
    if (disposed || scheduled || pending.length === 0) return
    scheduled = true
    schedule(() => {
      scheduled = false
      if (disposed) return
      const href = pending.shift()
      if (href) prefetch(href)
      scheduleNext()
    })
  }

  return {
    dispose: () => { disposed = true; pending.length = 0; queued.clear() },
    enqueue: (href: string) => {
      if (disposed || queued.has(href)) return
      queued.add(href)
      pending.push(href)
      scheduleNext()
    },
  }
}
