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

    const loadRuntime = () => {
      // Warm the tiny audio module on intent, so visit:start never waits for it.
      void import('./transitionAudio').catch(() => {})
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

    const primeOnIntent = (event: Event) => {
      if (isInternalNavigableLink(event.target)) void loadRuntime()
    }

    document.addEventListener('pointerover', primeOnIntent, { passive: true })
    document.addEventListener('focusin', primeOnIntent)
    document.addEventListener('touchstart', primeOnIntent, { passive: true })

    return () => {
      disposed = true
      document.removeEventListener('pointerover', primeOnIntent)
      document.removeEventListener('focusin', primeOnIntent)
      document.removeEventListener('touchstart', primeOnIntent)
    }
  }, [])

  return Runtime ? <Runtime /> : <div className="transition-demo-reference-ball" aria-hidden="true" />
}
