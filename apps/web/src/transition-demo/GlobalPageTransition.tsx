import { useEffect, useRef, useState, type ComponentType } from 'react'

type TransitionRuntime = ComponentType

function isInternalNavigableLink(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  const link = target.closest<HTMLAnchorElement>('a[href]')
  if (!link || link.hasAttribute('data-no-swup') || link.target === '_blank' || link.hasAttribute('download')) return false

  try {
    const url = new URL(link.href, window.location.href)
    return url.origin === window.location.origin && !url.pathname.startsWith('/transitions/')
  } catch {
    return false
  }
}

export function GlobalPageTransition() {
  const [Runtime, setRuntime] = useState<TransitionRuntime | null>(null)
  const importRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    let disposed = false
    let idleHandle: number | null = null
    let idleTimer: ReturnType<typeof globalThis.setTimeout> | null = null

    const loadRuntime = () => {
      if (!importRef.current) {
        importRef.current = import('./GlobalPageTransitionRuntime')
          .then(({ GlobalPageTransitionRuntime: runtime }) => {
            if (!disposed) setRuntime(() => runtime)
          })
          .catch(() => {
            // Native navigation remains available when the optional transition runtime fails to load.
          })
      }
      return importRef.current
    }

    const scheduleRuntime = () => {
      if (importRef.current || idleHandle !== null || idleTimer !== null) return
      if (typeof window.requestIdleCallback === 'function') {
        idleHandle = window.requestIdleCallback(() => {
          idleHandle = null
          void loadRuntime()
        }, { timeout: 650 })
      } else {
        idleTimer = globalThis.setTimeout(() => {
          idleTimer = null
          void loadRuntime()
        }, 350)
      }
    }

    const primeOnIntent = (event: Event) => {
      if (isInternalNavigableLink(event.target)) void loadRuntime()
    }

    document.addEventListener('pointerover', primeOnIntent, { passive: true })
    document.addEventListener('focusin', primeOnIntent)
    document.addEventListener('touchstart', primeOnIntent, { passive: true })
    document.addEventListener('unlim:main-ready', scheduleRuntime, { once: true })
    if (document.querySelector<HTMLElement>('#swup')?.dataset.mainReady === 'true') scheduleRuntime()
    else window.addEventListener('DOMContentLoaded', scheduleRuntime, { once: true })

    return () => {
      disposed = true
      if (idleHandle !== null && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleHandle)
      if (idleTimer !== null) globalThis.clearTimeout(idleTimer)
      document.removeEventListener('pointerover', primeOnIntent)
      document.removeEventListener('focusin', primeOnIntent)
      document.removeEventListener('touchstart', primeOnIntent)
      document.removeEventListener('unlim:main-ready', scheduleRuntime)
      window.removeEventListener('DOMContentLoaded', scheduleRuntime)
    }
  }, [])

  return Runtime ? <Runtime /> : <div className="transition-demo-reference-ball" aria-hidden="true" />
}
