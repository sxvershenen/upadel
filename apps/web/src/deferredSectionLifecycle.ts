export type DeferredObserverCleanup = () => void

export function waitUntilSectionIsNear(
  key: string,
  cleanups: Set<DeferredObserverCleanup>,
) {
  if (typeof window === 'undefined') return Promise.resolve()
  const section = document.querySelector<HTMLElement>(`[data-home-section="${key}"]`)
  if (!section || !('IntersectionObserver' in window)) return Promise.resolve()
  const rect = section.getBoundingClientRect()
  if (rect.bottom >= -600 && rect.top <= window.innerHeight + 900) return Promise.resolve()

  return new Promise<void>((resolve) => {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      disconnect()
      resolve()
    }, { rootMargin: '900px 0px' })
    const disconnect = () => {
      observer.disconnect()
      cleanups.delete(disconnect)
    }
    cleanups.add(disconnect)
    observer.observe(section)
  })
}

export function disconnectDeferredSectionObservers(cleanups: Set<DeferredObserverCleanup>) {
  for (const disconnect of [...cleanups]) disconnect()
}
