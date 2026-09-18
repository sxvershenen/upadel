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

function scheduleAfterMainReady(run: () => void) {
  let stopped = false
  let scheduled = false
  let firstFrame = 0
  let secondFrame = 0
  let idle: number | undefined
  let timer: number | undefined

  const eligible = () => document.readyState === 'complete' && document.visibilityState === 'visible' && Boolean(document.querySelector('#swup'))
  const attempt = () => {
    if (stopped || scheduled || !eligible()) return
    scheduled = true
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const finish = () => {
          if (stopped) return
          if (!eligible()) { scheduled = false; return }
          stop()
          run()
        }
        if (typeof window.requestIdleCallback === 'function') idle = window.requestIdleCallback(finish, { timeout: 2000 })
        else timer = window.setTimeout(finish, 100)
      })
    })
  }
  function stop() {
    stopped = true
    window.removeEventListener('load', attempt)
    document.removeEventListener('unlim:main-ready', attempt)
    document.removeEventListener('visibilitychange', attempt)
    window.cancelAnimationFrame(firstFrame)
    window.cancelAnimationFrame(secondFrame)
    if (idle !== undefined && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle)
    if (timer !== undefined) window.clearTimeout(timer)
  }

  window.addEventListener('load', attempt)
  document.addEventListener('unlim:main-ready', attempt)
  document.addEventListener('visibilitychange', attempt)
  attempt()
  return stop
}

export function GlobalPageTransition() {
  const [Runtime, setRuntime] = useState<TransitionRuntime | null>(null)
  const importRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    let disposed = false

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

    const primeOnIntent = (event: Event) => {
      if (isInternalNavigableLink(event.target)) void loadRuntime()
    }

    const cancel = scheduleAfterMainReady(() => { void loadRuntime() })
    document.addEventListener('pointerover', primeOnIntent, { passive: true })
    document.addEventListener('focusin', primeOnIntent)
    document.addEventListener('touchstart', primeOnIntent, { passive: true })

    return () => {
      disposed = true
      cancel()
      document.removeEventListener('pointerover', primeOnIntent)
      document.removeEventListener('focusin', primeOnIntent)
      document.removeEventListener('touchstart', primeOnIntent)
    }
  }, [])

  return Runtime ? <Runtime /> : <div className="transition-demo-reference-ball" aria-hidden="true" />
}
