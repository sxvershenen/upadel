type RevealTarget = HTMLElement & {
  dataset: DOMStringMap & {
    gsapRevealVisible?: string
  }
}

let observer: IntersectionObserver | null = null
let mutations: MutationObserver | null = null
let activeTweens: Array<{ kill: () => void }> = []
let generation = 0

export async function startGsapReveals() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const runGeneration = ++generation

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.setAttribute('data-gsap-reveal-ready', 'true')
    document.querySelectorAll<RevealTarget>('[data-gsap-reveal]').forEach((target) => target.dataset.gsapRevealVisible = 'true')
    return
  }

  const { gsap } = await import('gsap')
  if (runGeneration !== generation) return
  observer?.disconnect()
  mutations?.disconnect()
  activeTweens.forEach((tween) => tween.kill())
  activeTweens = []
  document.documentElement.setAttribute('data-gsap-reveal-ready', 'true')

  const show = (target: RevealTarget) => {
    target.dataset.gsapRevealVisible = 'true'
    observer?.unobserve(target)
    if (target.dataset.gsapRevealFade === 'false') {
      activeTweens.push(gsap.fromTo(target, { '--gsap-reveal-offset': `${target.dataset.gsapRevealY ?? 24}px` }, { '--gsap-reveal-offset': '0px', duration: 0.68, delay: Number.parseFloat(target.style.getPropertyValue('--gsap-reveal-delay') || '0'), ease: 'power3.out' }))
      return
    }
    activeTweens.push(gsap.fromTo(target, { autoAlpha: 0, '--gsap-reveal-offset': `${target.dataset.gsapRevealY ?? 24}px` }, { autoAlpha: 1, '--gsap-reveal-offset': '0px', duration: 0.68, delay: Number.parseFloat(target.style.getPropertyValue('--gsap-reveal-delay') || '0'), ease: 'power3.out' }))
  }

  const refresh = () => {
    const allTargets = Array.from(document.querySelectorAll<RevealTarget>('[data-gsap-reveal]'))
    const targets = allTargets.filter((target) => {
      const hasBoundaryAncestor = Boolean(target.parentElement?.closest('[data-gsap-reveal-boundary="true"]'))
      if (hasBoundaryAncestor) return false
      if (target.dataset.gsapRevealBoundary === 'true') return true
      return !target.querySelector('[data-gsap-reveal-boundary="true"], [data-gsap-reveal]')
    })
    const targetSet = new Set(targets)
    allTargets.forEach((target) => {
      if (targetSet.has(target)) target.dataset.gsapRevealOwner = 'true'
      else delete target.dataset.gsapRevealOwner
    })
    observer?.disconnect()
    targets.forEach((target) => {
      if (target.dataset.gsapRevealVisible === 'true') return
      const rect = target.getBoundingClientRect()
      const visible = rect.width > 0 && rect.height > 0 && rect.bottom > -80 && rect.top < window.innerHeight + 80 && rect.right > -80 && rect.left < window.innerWidth + 80
      if (visible) show(target)
      else observer?.observe(target)
    })
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.boundingClientRect.width > 0 && entry.boundingClientRect.height > 0) show(entry.target as RevealTarget)
    })
  }, { rootMargin: '80px' })
  mutations = new MutationObserver(() => window.requestAnimationFrame(refresh))
  mutations.observe(document.querySelector('#swup') ?? document.body, { childList: true, subtree: true })
  refresh()
}

export function stopGsapReveals() {
  generation += 1
  observer?.disconnect()
  observer = null
  mutations?.disconnect()
  mutations = null
  activeTweens.forEach((tween) => tween.kill())
  activeTweens = []
  document.querySelectorAll<RevealTarget>('[data-gsap-reveal-owner]').forEach((target) => delete target.dataset.gsapRevealOwner)
  document.documentElement.removeAttribute('data-gsap-reveal-ready')
  document.querySelector('#swup')?.setAttribute('data-main-ready', 'false')
}
