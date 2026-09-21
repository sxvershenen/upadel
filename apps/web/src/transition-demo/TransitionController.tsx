import gsap from 'gsap'
import Swup from 'swup'
import { useEffect, useRef, useState } from 'react'

import { ReferenceBallScene, type ReferenceBallSceneHandle } from './ReferenceBallScene'
import { computeReferenceTrajectory, type ReferenceTrajectory } from './referenceTrajectories'
import type { TransitionPageKey } from './TransitionDemoData'
import { playTransitionWhoosh } from './transitionAudioLoader'

const transitionDuration = 1000
const swupClasses = ['swup-enabled', 'is-changing', 'is-rendering', 'is-popstate', 'is-animating', 'is-leaving', 'to-']

function pageFromLocation(): TransitionPageKey {
  return window.location.pathname.endsWith('/rally') ? 'rally' : 'serve'
}

function getSurface() {
  const surface = document.querySelector<HTMLElement>('#transition-surface')
  if (!surface) throw new Error('Transition demo surface is missing')
  return surface
}

function pickFlight(lastPreset: string | undefined) {
  const portrait = window.matchMedia('(max-width: 767px) and (orientation: portrait)').matches
  let trajectory = computeReferenceTrajectory({ portrait })
  if (lastPreset && trajectory.preset === lastPreset) trajectory = computeReferenceTrajectory({ portrait })
  return trajectory
}

function waitFor(animation: gsap.core.Animation) {
  if (animation.progress() >= 1) return Promise.resolve()
  return new Promise<void>((resolve) => animation.eventCallback('onComplete', resolve))
}

function clearSwupClasses() {
  Array.from(document.documentElement.classList).forEach((className) => {
    if (swupClasses.some((prefix) => className === prefix || className.startsWith(prefix))) {
      document.documentElement.classList.remove(className)
    }
  })
}

function updateMetadata(nextDocument: Document) {
  document.title = nextDocument.title
  const description = nextDocument.querySelector('meta[name="description"]')?.getAttribute('content')
  document.querySelector('meta[name="description"]')?.setAttribute('content', description ?? '')
  const canonical = nextDocument.querySelector('link[rel="canonical"]')?.getAttribute('href')
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical ?? '')
}

function animateOut() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve()
  const tween = gsap.to(getSurface(), {
    opacity: 0.2,
    y: -25,
    scale: 1.03,
    borderRadius: 56,
    duration: 0.45,
    ease: 'power2.in',
  })
  return waitFor(tween)
}

function animateIn() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve()
  const surface = getSurface()
  gsap.set(surface, { opacity: 0, y: 35, scale: 0.95, borderRadius: 56 })
  const tween = gsap.to(surface, {
    opacity: 1,
    y: 0,
    scale: 1,
    borderRadius: 0,
    duration: 0.6,
    ease: 'power4.out',
  })
  return waitFor(tween)
}

export function TransitionController({ initialPage }: { initialPage: TransitionPageKey }) {
  const [currentPage, setCurrentPage] = useState<TransitionPageKey>(initialPage)
  const [busy, setBusy] = useState(false)
  const ballSceneRef = useRef<ReferenceBallSceneHandle | null>(null)
  const flightRef = useRef<ReferenceTrajectory | null>(null)

  useEffect(() => {
    const swup = new Swup({
      containers: ['#transition-surface'],
      linkSelector: 'a[data-transition-link]',
      animationSelector: false,
      hooks: {
        'visit:start': () => {
          const trajectory = pickFlight(flightRef.current?.preset)
          flightRef.current = trajectory
          ballSceneRef.current?.startFlight(trajectory, transitionDuration)
          playTransitionWhoosh(transitionDuration / 1000)
          setBusy(true)
        },
        'page:view': (visit) => {
          if (visit.to.document) updateMetadata(visit.to.document)
          setCurrentPage(pageFromLocation())
        },
        'visit:fail': () => {
          ballSceneRef.current?.cancel()
          flightRef.current = null
          setBusy(false)
        },
      },
    })

    swup.hooks.replace('animation:out:await', () => animateOut())
    swup.hooks.replace('animation:in:await', async () => {
      await animateIn()
      setBusy(false)
      flightRef.current = null
    })

    return () => {
      ballSceneRef.current?.cancel()
      flightRef.current = null
      void swup.destroy()
      clearSwupClasses()
    }
  }, [])

  return (
    <div className="transition-demo-chrome">
      <aside className="transition-demo-switcher" aria-label="Статус перехода страниц">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="type-micro uppercase text-white/40">Transition lab</span>
            <strong className="mt-1 block type-ui text-white">Swup + GSAP</strong>
          </div>
          <span className="transition-demo-status" aria-live="polite">
            {busy ? 'playing' : currentPage + ' / ready'}
          </span>
        </div>
        <p className="mt-4 max-w-[240px] type-micro leading-relaxed text-white/45">
          Сцена мяча и траектория перенесены из realistic-3d-tennis-ball-transitions. Swup меняет SSR-страницу на midpoint, затем она раскрывается вслед за мячом.
        </p>
      </aside>
      <ReferenceBallScene ref={ballSceneRef} />
    </div>
  )
}
