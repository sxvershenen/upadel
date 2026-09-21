import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react'

import { beginTransitionProgress, completeTransitionProgress } from './transitionProgress'

type TransitionRuntime = ComponentType<{ initialNavigation?: string | null; onReady?: () => void }>

function internalNavigableLink(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null
  const link = target.closest<HTMLAnchorElement>('a[href]')
  if (!link || link.hasAttribute('data-no-swup') || link.target === '_blank' || link.hasAttribute('download')) return null

  try {
    const url = new URL(link.href, window.location.href)
    if (url.origin !== window.location.origin || url.pathname.startsWith('/transitions/')) return null
    if (url.pathname === window.location.pathname && url.search === window.location.search) return null
    return link
  } catch {
    return null
  }
}

export function GlobalPageTransition() {
  const [Runtime, setRuntime] = useState<TransitionRuntime | null>(null)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const importRef = useRef<Promise<void> | null>(null)
  const runtimeReadyRef = useRef(false)
  const pendingHrefRef = useRef<string | null>(null)
  const handleRuntimeReady = useCallback(() => { runtimeReadyRef.current = true }, [])

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
            const href = pendingHrefRef.current
            completeTransitionProgress()
            if (href) window.location.assign(href)
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
      if (internalNavigableLink(event.target)) void loadRuntime()
    }

    const startNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = internalNavigableLink(event.target)
      if (!link) return
      beginTransitionProgress()
      if (runtimeReadyRef.current) return

      event.preventDefault()
      const url = new URL(link.href, window.location.href)
      const href = `${url.pathname}${url.search}${url.hash}`
      pendingHrefRef.current = href
      setPendingHref(href)
      void loadRuntime()
    }

    document.addEventListener('click', startNavigation, true)
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
      document.removeEventListener('click', startNavigation, true)
      document.removeEventListener('unlim:main-ready', scheduleRuntime)
      window.removeEventListener('DOMContentLoaded', scheduleRuntime)
    }
  }, [])

  return <>
    <div className="route-transition-progress" aria-hidden="true"><span /></div>
    {Runtime
      ? <Runtime initialNavigation={pendingHref} onReady={handleRuntimeReady} />
      : <div className="transition-demo-reference-ball" aria-hidden="true" />}
  </>
}
