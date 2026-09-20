type RevealTarget = HTMLElement & {
  dataset: DOMStringMap & {
    gsapRevealVisible?: string
  }
}

const animatedStyleProperties = ['opacity', 'visibility', '--gsap-reveal-offset'] as const

export type RevealStyleSnapshot = Array<{
  name: typeof animatedStyleProperties[number]
  priority: string
  value: string
}>

type ActiveReveal = {
  target: RevealTarget
  tween: { kill: () => void }
}

let observer: IntersectionObserver | null = null
let mutations: MutationObserver | null = null
let activeTweens = new Set<ActiveReveal>()
let ownedTargets = new Set<RevealTarget>()
let originalStyles = new WeakMap<RevealTarget, RevealStyleSnapshot>()
let refreshFrame = 0
let generation = 0
let activeRoot: HTMLElement | null = null
const initializedRoots = new WeakSet<HTMLElement>()

export function captureRevealStyles(target: Pick<HTMLElement, 'style'>): RevealStyleSnapshot {
  return animatedStyleProperties.map((name) => ({
    name,
    priority: target.style.getPropertyPriority(name),
    value: target.style.getPropertyValue(name),
  }))
}

/** Restore author styles and make an interrupted reveal settle in its visible state. */
export function settleRevealTarget(target: RevealTarget, snapshot: RevealStyleSnapshot) {
  snapshot.forEach(({ name, priority, value }) => {
    if (value) target.style.setProperty(name, value, priority)
    else target.style.removeProperty(name)
  })
  target.dataset.gsapRevealVisible = 'true'
  delete target.dataset.gsapRevealOwner
}

export function shouldOwnRevealTarget(visible: boolean, animating: boolean) {
  return !visible || animating
}

function settleActiveTweens() {
  const reveals = Array.from(activeTweens)
  activeTweens.clear()
  reveals.forEach(({ target, tween }) => {
    tween.kill()
    const snapshot = originalStyles.get(target)
    if (snapshot) settleRevealTarget(target, snapshot)
    originalStyles.delete(target)
  })
}

function disconnectRevealRuntime() {
  activeRoot = null
  if (refreshFrame) window.cancelAnimationFrame(refreshFrame)
  refreshFrame = 0
  observer?.disconnect()
  observer = null
  mutations?.disconnect()
  mutations = null
  settleActiveTweens()
  ownedTargets.forEach((target) => delete target.dataset.gsapRevealOwner)
  ownedTargets.clear()
}

export function isRevealRootReady(root: HTMLElement) {
  return root.dataset.mainReady === 'true' || !root.querySelector('astro-island')
}

function isInRevealViewport(target: HTMLElement) {
  const rect = target.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0 && rect.bottom > -80 && rect.top < window.innerHeight + 80 && rect.right > -80 && rect.left < window.innerWidth + 80
}

export async function startGsapReveals() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const root = document.querySelector<HTMLElement>('#swup')
  if (root && (!isRevealRootReady(root) || root === activeRoot)) return
  const runGeneration = ++generation
  disconnectRevealRuntime()
  if (!root) {
    document.documentElement.removeAttribute('data-gsap-reveal-ready')
    return
  }

  activeRoot = root
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.setAttribute('data-gsap-reveal-ready', 'true')
    root.querySelectorAll<RevealTarget>('[data-gsap-reveal]').forEach((target) => {
      target.dataset.gsapRevealVisible = 'true'
      delete target.dataset.gsapRevealOwner
    })
    return
  }

  const { gsap } = await import('gsap')
  if (runGeneration !== generation || !root.isConnected) return
  document.documentElement.setAttribute('data-gsap-reveal-ready', 'true')

  const show = (target: RevealTarget) => {
    if (target.dataset.gsapRevealVisible === 'true' || originalStyles.has(target)) return
    target.dataset.gsapRevealVisible = 'true'
    observer?.unobserve(target)
    const snapshot = captureRevealStyles(target)
    originalStyles.set(target, snapshot)

    let reveal: ActiveReveal
    const settle = () => {
      activeTweens.delete(reveal)
      const initialStyles = originalStyles.get(target)
      if (initialStyles) settleRevealTarget(target, initialStyles)
      originalStyles.delete(target)
      ownedTargets.delete(target)
    }
    const common = {
      '--gsap-reveal-offset': '0px',
      duration: 0.68,
      delay: Number.parseFloat(target.style.getPropertyValue('--gsap-reveal-delay') || '0'),
      ease: 'power3.out',
      onComplete: settle,
      onInterrupt: settle,
    }
    const tween = target.dataset.gsapRevealFade === 'false'
      ? gsap.fromTo(target, { '--gsap-reveal-offset': `${target.dataset.gsapRevealY ?? 24}px` }, common)
      : gsap.fromTo(target, { autoAlpha: 0, '--gsap-reveal-offset': `${target.dataset.gsapRevealY ?? 24}px` }, { ...common, autoAlpha: 1 })
    reveal = { target, tween }
    activeTweens.add(reveal)
  }

  let initialPagePass = !initializedRoots.has(root)
  const refresh = () => {
    const allTargets = Array.from(root.querySelectorAll<RevealTarget>('[data-gsap-reveal]'))
    const targets = allTargets.filter((target) => {
      const hasBoundaryAncestor = Boolean(target.parentElement?.closest('[data-gsap-reveal-boundary="true"]'))
      if (hasBoundaryAncestor) return false
      if (target.dataset.gsapRevealBoundary === 'true') return true
      return !target.querySelector('[data-gsap-reveal-boundary="true"], [data-gsap-reveal]')
    })
    // Classify before enabling hidden-state selectors. Anything already in the
    // first viewport belongs to the SSR entrance, never a post-hydration replay.
    if (initialPagePass) {
      targets.forEach((target) => {
        if (isInRevealViewport(target)) target.dataset.gsapRevealVisible = 'true'
      })
    }
    const targetSet = new Set(targets)
    allTargets.forEach((target) => {
      const ownsReveal = targetSet.has(target) && shouldOwnRevealTarget(target.dataset.gsapRevealVisible === 'true', originalStyles.has(target))
      if (ownsReveal) {
        target.dataset.gsapRevealOwner = 'true'
        ownedTargets.add(target)
      } else {
        delete target.dataset.gsapRevealOwner
        ownedTargets.delete(target)
      }
    })
    observer?.disconnect()
    targets.forEach((target) => {
      if (target.dataset.gsapRevealVisible === 'true') return
      if (isInRevealViewport(target)) show(target)
      else observer?.observe(target)
    })
    initialPagePass = false
    initializedRoots.add(root)
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.boundingClientRect.width > 0 && entry.boundingClientRect.height > 0) show(entry.target as RevealTarget)
    })
  }, { rootMargin: '80px' })
  mutations = new MutationObserver(() => {
    if (refreshFrame) return
    refreshFrame = window.requestAnimationFrame(() => {
      refreshFrame = 0
      refresh()
    })
  })
  mutations.observe(root, { childList: true, subtree: true })
  refresh()
}

export function stopGsapReveals() {
  generation += 1
  disconnectRevealRuntime()
  document.documentElement.removeAttribute('data-gsap-reveal-ready')
}
