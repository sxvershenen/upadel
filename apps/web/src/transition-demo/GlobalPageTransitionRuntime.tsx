import gsap from 'gsap'
import Swup from 'swup'
import SwupScriptsPlugin from '@swup/scripts-plugin'
import { useEffect, useRef } from 'react'

import { ReferenceBallScene, type ReferenceBallSceneHandle } from './ReferenceBallScene'
import { computeReferenceTrajectory } from './referenceTrajectories'
import { transitionAudio } from './transitionAudio'

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
  surface.style.removeProperty('opacity')
  surface.style.removeProperty('transform')
}

function updateMetadata(nextDocument: Document) {
  document.title = nextDocument.title
  const description = nextDocument.querySelector('meta[name="description"]')?.getAttribute('content')
  document.querySelector('meta[name="description"]')?.setAttribute('content', description ?? '')
  const canonical = nextDocument.querySelector('link[rel="canonical"]')?.getAttribute('href')
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical ?? '')
}

function waitFor(animation: gsap.core.Animation) {
  if (animation.progress() >= 1) return Promise.resolve()
  return new Promise<void>((resolve) => animation.eventCallback('onComplete', resolve))
}

function animateOut() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve()
  const surface = getSurface()
  return waitFor(gsap.to(surface, {
    opacity: 0.2,
    y: -25,
    scale: 1.03,
    duration: 0.45,
    ease: 'power2.in',
  }))
}

function animateIn() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve()
  const surface = getSurface()
  gsap.set(surface, { opacity: 0, y: 35, scale: 0.95 })
  return waitFor(gsap.to(surface, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.6,
    ease: 'power4.out',
    onComplete: () => gsap.set(surface, { clearProps: 'transform,opacity' }),
  }))
}

export function GlobalPageTransitionRuntime() {
  const ballRef = useRef<ReferenceBallSceneHandle | null>(null)

  useEffect(() => {
    const swup = new Swup({
      containers: ['#swup'],
      linkSelector: 'a[href]:not([data-transition-link])',
      animationSelector: false,
      plugins: [new SwupScriptsPlugin({ head: false, body: true })],
      ignoreVisit: (url, { el } = {}) => {
        if (el?.closest('[data-no-swup]')) return true
        return new URL(url, window.location.href).pathname.startsWith('/transitions/')
      },
      hooks: {
        'visit:start': () => {
          document.dispatchEvent(new Event('astro:before-swap'))
          const trajectory = computeReferenceTrajectory()
          ballRef.current?.startFlight(trajectory, duration)
          transitionAudio.playWhoosh(duration / 1000)
        },
        'page:view': (visit) => {
          if (visit.to.document) updateMetadata(visit.to.document)
          // Astro islands removed by Swup otherwise never receive their unmount event.
          document.dispatchEvent(new Event('astro:after-swap'))
        },
        'visit:abort': () => {
          ballRef.current?.cancel()
          resetTransitionStyles()
        },
        'visit:fail': () => {
          ballRef.current?.cancel()
          resetTransitionStyles()
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
