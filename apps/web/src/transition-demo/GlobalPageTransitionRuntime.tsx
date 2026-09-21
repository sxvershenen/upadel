import gsap from 'gsap'
import Swup from 'swup'
import SwupHeadPlugin from '@swup/head-plugin'
import SwupScriptsPlugin from '@swup/scripts-plugin'
import { useEffect, useRef } from 'react'

import { ReferenceBallScene, type ReferenceBallSceneHandle } from './ReferenceBallScene'
import { waitForGsapAnimation } from './animationLifecycle'
import { computeReferenceTrajectory } from './referenceTrajectories'
import { playTransitionWhoosh } from './transitionAudioLoader'

const duration = 1000

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
    y: -25,
    scale: 1.03,
    duration: 0.45,
    ease: 'power2.in',
    onInterrupt: () => clearTransitionStyles(surface),
  }))
}

function animateIn() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve()
  const surface = getSurface()
  gsap.set(surface, { opacity: 0, y: 35, scale: 0.95 })
  return waitForGsapAnimation(gsap.to(surface, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.6,
    ease: 'power4.out',
    onComplete: () => clearTransitionStyles(surface),
    onInterrupt: () => clearTransitionStyles(surface),
  }))
}

export function GlobalPageTransitionRuntime() {
  const ballRef = useRef<ReferenceBallSceneHandle | null>(null)

  useEffect(() => {
    const swup = new Swup({
      containers: ['#swup'],
      linkSelector: 'a[href]:not([data-transition-link])',
      animationSelector: false,
      plugins: [new SwupHeadPlugin({ awaitAssets: true, persistAssets: true }), new SwupScriptsPlugin({ head: false, body: true })],
      ignoreVisit: (url, { el } = {}) => {
        if (el?.closest('[data-no-swup]')) return true
        return new URL(url, window.location.href).pathname.startsWith('/transitions/')
      },
      hooks: {
        'visit:start': () => {
          document.dispatchEvent(new Event('astro:before-swap'))
          if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const trajectory = computeReferenceTrajectory()
            ballRef.current?.startFlight(trajectory, duration)
            playTransitionWhoosh(duration / 1000)
          }
        },
        'page:view': () => {
          // Astro islands removed by Swup otherwise never receive their unmount event.
          document.dispatchEvent(new Event('astro:after-swap'))
        },
        'visit:abort': () => {
          ballRef.current?.cancel()
          resetTransitionStyles()
          resumeCurrentPage()
        },
        'visit:fail': () => {
          ballRef.current?.cancel()
          resetTransitionStyles()
          resumeCurrentPage()
        },
      },
    })

    swup.hooks.replace('animation:out:await', () => animateOut())
    swup.hooks.replace('animation:in:await', () => animateIn())

    return () => {
      ballRef.current?.cancel()
      resetTransitionStyles()
      void swup.destroy()
    }
  }, [])

  return <ReferenceBallScene ref={ballRef} />
}

GlobalPageTransitionRuntime.displayName = 'GlobalPageTransitionRuntime'
