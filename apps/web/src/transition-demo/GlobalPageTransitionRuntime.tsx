import gsap from 'gsap'
import Swup from 'swup'
import SwupHeadPlugin from '@swup/head-plugin'
import SwupScriptsPlugin from '@swup/scripts-plugin'
import { useEffect, useRef, useState, type ForwardRefExoticComponent, type RefAttributes } from 'react'

import type { ReferenceBallSceneHandle } from './ReferenceBallScene'
import { waitForGsapAnimation } from './animationLifecycle'
import { computeReferenceTrajectory } from './referenceTrajectories'
import { transitionAudio } from './transitionAudio'
import { beginTransitionProgress, completeTransitionProgress } from './transitionProgress'
import { cancelBrowserIdle, createPostNavigationSceneLoader, scheduleBrowserIdle } from './postNavigationScene'

const duration = 980

function getSurface() {
  const surface = document.querySelector<HTMLElement>('#swup')
  if (!surface) throw new Error('Global Swup surface is missing')
  return surface
}

function resetTransitionStyles() {
  const surface = document.querySelector<HTMLElement>('#swup')
  if (!surface) return

  gsap.killTweensOf(surface)
  clearTransitionStyles(surface)
}

function clearTransitionStyles(surface: HTMLElement) {
  gsap.set(surface, { clearProps: 'transform,opacity' })
}

function resumeCurrentPage() {
  const surface = document.querySelector<HTMLElement>('#swup')
  if (!surface) return
  document.dispatchEvent(new Event('unlim:main-ready'))
}

function animateOut() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve()
  const surface = getSurface()
  return waitForGsapAnimation(gsap.to(surface, {
    opacity: 0.2,
    y: -18,
    scale: 1.02,
    duration: 0.34,
    ease: 'power2.in',
    onInterrupt: () => clearTransitionStyles(surface),
  }))
}

function animateIn() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve()
  const surface = getSurface()
  gsap.set(surface, { opacity: 0, y: 28, scale: 0.97 })
  return waitForGsapAnimation(gsap.to(surface, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.64,
    ease: 'power4.out',
    onComplete: () => clearTransitionStyles(surface),
    onInterrupt: () => clearTransitionStyles(surface),
  }))
}

type BallSceneComponent = ForwardRefExoticComponent<RefAttributes<ReferenceBallSceneHandle>>

export function GlobalPageTransitionRuntime({ initialNavigation, onReady }: { initialNavigation?: string | null; onReady?: (navigate: (href: string) => Promise<unknown>) => void }) {
  const ballRef = useRef<ReferenceBallSceneHandle | null>(null)
  const swupRef = useRef<Swup | null>(null)
  const navigateRef = useRef<((href: string) => Promise<unknown>) | null>(null)
  const [BallScene, setBallScene] = useState<BallSceneComponent | null>(null)

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sceneLoader = createPostNavigationSceneLoader({
      load: () => import('./ReferenceBallScene').then(({ ReferenceBallScene }) => ReferenceBallScene),
      accept: (scene) => setBallScene(() => scene),
      isReducedMotion: () => motionQuery.matches,
      scheduleIdle: scheduleBrowserIdle,
      cancelIdle: cancelBrowserIdle,
    })
    const markDestinationReady = () => sceneLoader.destinationBecameReady()
    const handleMotionChange = () => sceneLoader.motionPreferenceChanged()
    document.addEventListener('unlim:main-ready', markDestinationReady)
    motionQuery.addEventListener('change', handleMotionChange)

    const swup = new Swup({
      containers: ['#swup'],
      cache: false,
      requestHeaders: {
        'X-Requested-With': 'swup',
        'Accept': 'text/html, application/xhtml+xml',
        'Cache-Control': 'no-cache',
      },
      linkSelector: 'a[href]:not([data-transition-link])',
      animationSelector: false,
      plugins: [new SwupHeadPlugin({ awaitAssets: true, persistAssets: true }), new SwupScriptsPlugin({ head: false, body: true })],
      ignoreVisit: (url, { el } = {}) => {
        if (el?.closest('[data-no-swup]')) return true
        const pathname = new URL(url, window.location.href).pathname
        return pathname.startsWith('/transitions/') || pathname.startsWith('/preview/')
      },
      hooks: {
        'visit:start': (visit) => {
          beginTransitionProgress()
          sceneLoader.visitStarted()
          // Keep the current page stable until the next document is ready.
          // The visual transition can then run as one uninterrupted timeline.
          visit.animation.wait = true
        },
        'animation:out:start': () => {
          if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const portrait = window.matchMedia('(max-width: 767px) and (orientation: portrait)').matches
            const trajectory = computeReferenceTrajectory({ portrait })
            if (ballRef.current) {
              ballRef.current.startFlight(trajectory, duration)
              transitionAudio.playWhoosh(duration / 1000)
            }
          }
        },
        'content:replace.before': () => {
          document.dispatchEvent(new Event('astro:before-swap'))
        },
        'page:view': () => {
          // Astro islands removed by Swup otherwise never receive their unmount event.
          document.dispatchEvent(new Event('astro:after-swap'))
        },
        'visit:abort': () => {
          completeTransitionProgress()
          ballRef.current?.cancel()
          resetTransitionStyles()
          resumeCurrentPage()
          sceneLoader.visitSettled()
        },
        'visit:fail': () => {
          completeTransitionProgress()
          ballRef.current?.cancel()
          resetTransitionStyles()
          resumeCurrentPage()
          sceneLoader.visitSettled()
        },
        'visit:end': () => {
          completeTransitionProgress()
          sceneLoader.visitCompleted()
        },
      },
    })
    swupRef.current = swup
    const navigate = (href: string) => new Promise<void>((resolve, reject) => {
      const cleanup = () => { offEnd(); offAbort(); offFail() }
      const offEnd = swup.hooks.once('visit:end', () => { cleanup(); resolve() })
      const offAbort = swup.hooks.once('visit:abort', () => { cleanup(); resolve() })
      const offFail = swup.hooks.once('visit:fail', () => { cleanup(); reject(new Error('Swup navigation failed')) })
      try { swup.navigate(href) } catch (error) { cleanup(); reject(error) }
    })
    navigateRef.current = navigate
    onReady?.(navigate)

    swup.hooks.replace('animation:out:await', () => animateOut())
    swup.hooks.replace('animation:in:await', () => animateIn())

    return () => {
      swupRef.current = null
      navigateRef.current = null
      document.removeEventListener('unlim:main-ready', markDestinationReady)
      motionQuery.removeEventListener('change', handleMotionChange)
      sceneLoader.dispose()
      ballRef.current?.cancel()
      resetTransitionStyles()
      void swup.destroy()
    }
  }, [onReady])

  useEffect(() => {
    const navigate = navigateRef.current
    if (!navigate || !initialNavigation) return
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` === initialNavigation) return
    void navigate(initialNavigation).catch(() => window.location.assign(initialNavigation))
  }, [initialNavigation])

  return BallScene ? <BallScene ref={ballRef} /> : <div className="transition-demo-reference-ball" aria-hidden="true" />
}

GlobalPageTransitionRuntime.displayName = 'GlobalPageTransitionRuntime'
