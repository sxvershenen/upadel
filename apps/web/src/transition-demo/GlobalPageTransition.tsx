import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react'

import { beginTransitionProgress, completeTransitionProgress } from './transitionProgress'
import { createRetryableRuntimeLoader, loadRuntimeForNavigation } from './runtimeLoader'

type RuntimeNavigate = (href: string) => Promise<unknown>
type TransitionRuntime = ComponentType<{ initialNavigation?: string | null; onReady?: (navigate: RuntimeNavigate) => void }>

function internalNavigableLink(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null
  const link = target.closest<HTMLAnchorElement>('a[href]')
  if (!link || link.hasAttribute('data-no-swup') || link.target === '_blank' || link.hasAttribute('download')) return null

  try {
    const url = new URL(link.href, window.location.href)
    if (url.origin !== window.location.origin || url.pathname.startsWith('/transitions/') || url.pathname.startsWith('/preview/')) return null
    if (url.pathname === window.location.pathname && url.search === window.location.search) return null
    return link
  } catch {
    return null
  }
}

export function GlobalPageTransition() {
  const [Runtime, setRuntime] = useState<TransitionRuntime | null>(null)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const runtimeReadyRef = useRef(false)
  const pendingHrefRef = useRef<string | null>(null)
  const navigateRef = useRef<RuntimeNavigate | null>(null)
  const handleRuntimeReady = useCallback((navigate: RuntimeNavigate) => {
    runtimeReadyRef.current = true
    navigateRef.current = navigate
  }, [])

  useEffect(() => {
    let disposed = false
    let idleHandle: number | null = null
    let idleTimer: ReturnType<typeof globalThis.setTimeout> | null = null
    let hardTimer: ReturnType<typeof globalThis.setTimeout> | null = null

    const loadRuntime = createRetryableRuntimeLoader(
      () => import('./GlobalPageTransitionRuntime').then(({ GlobalPageTransitionRuntime }) => GlobalPageTransitionRuntime),
      (runtime) => { if (!disposed) setRuntime(() => runtime) },
    )

    const runScheduledLoad = () => {
      if (idleHandle !== null && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleHandle)
      if (idleTimer !== null) globalThis.clearTimeout(idleTimer)
      if (hardTimer !== null) globalThis.clearTimeout(hardTimer)
      idleHandle = null
      idleTimer = null
      hardTimer = null
      void loadRuntime()
    }

    const scheduleRuntime = () => {
      if (idleHandle !== null || idleTimer !== null || hardTimer !== null) return
      hardTimer = globalThis.setTimeout(() => {
        hardTimer = null
        runScheduledLoad()
      }, 900)
      if (typeof window.requestIdleCallback === 'function') {
        idleHandle = window.requestIdleCallback(() => {
          idleHandle = null
          runScheduledLoad()
        }, { timeout: 650 })
      } else {
        idleTimer = globalThis.setTimeout(() => {
          idleTimer = null
          runScheduledLoad()
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
      void loadRuntimeForNavigation({
        load: loadRuntime,
        href,
        isReady: () => runtimeReadyRef.current || pendingHrefRef.current !== href,
        assign: (fallbackHref) => {
          completeTransitionProgress()
          window.location.assign(fallbackHref)
        },
      })
    }

    const navigateProgrammatically = (event: Event) => {
      const navigation = event as CustomEvent<{ href?: string }>
      const rawHref = navigation.detail?.href
      if (!rawHref) return
      let url: URL
      try { url = new URL(rawHref, window.location.href) } catch { return }
      if (url.origin !== window.location.origin || url.pathname.startsWith('/transitions/') || url.pathname.startsWith('/preview/')) return
      if (`${url.pathname}${url.search}${url.hash}` === `${window.location.pathname}${window.location.search}${window.location.hash}`) return
      beginTransitionProgress()
      if (!navigation.cancelable || !navigateRef.current) return
      navigation.preventDefault()
      const href = `${url.pathname}${url.search}${url.hash}`
      void navigateRef.current(href).catch(() => {
        completeTransitionProgress()
        window.location.assign(href)
      })
    }

    document.addEventListener('click', startNavigation, true)
    document.addEventListener('pointerover', primeOnIntent, { passive: true })
    document.addEventListener('focusin', primeOnIntent)
    document.addEventListener('touchstart', primeOnIntent, { passive: true })
    document.addEventListener('unlim:main-ready', scheduleRuntime, { once: true })
    document.addEventListener('unlim:navigate', navigateProgrammatically)
    if (document.querySelector<HTMLElement>('#swup')?.dataset.mainReady === 'true') scheduleRuntime()
    else window.addEventListener('DOMContentLoaded', scheduleRuntime, { once: true })

    return () => {
      disposed = true
      if (idleHandle !== null && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleHandle)
      if (idleTimer !== null) globalThis.clearTimeout(idleTimer)
      if (hardTimer !== null) globalThis.clearTimeout(hardTimer)
      document.removeEventListener('pointerover', primeOnIntent)
      document.removeEventListener('focusin', primeOnIntent)
      document.removeEventListener('touchstart', primeOnIntent)
      document.removeEventListener('click', startNavigation, true)
      document.removeEventListener('unlim:main-ready', scheduleRuntime)
      document.removeEventListener('unlim:navigate', navigateProgrammatically)
      window.removeEventListener('DOMContentLoaded', scheduleRuntime)
      navigateRef.current = null
      runtimeReadyRef.current = false
    }
  }, [])

  return <>
    <div className="route-transition-progress" aria-hidden="true"><span /></div>
    {Runtime
      ? <Runtime initialNavigation={pendingHref} onReady={handleRuntimeReady} />
      : <div className="transition-demo-reference-ball" aria-hidden="true" />}
  </>
}
