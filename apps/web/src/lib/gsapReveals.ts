type RevealTarget = HTMLElement & {
  dataset: DOMStringMap & {
    gsapRevealVisible?: string
  }
}

let observer: IntersectionObserver | null = null
let activeTweens: Array<{ kill: () => void }> = []

export async function startGsapReveals() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const targets = Array.from(document.querySelectorAll<RevealTarget>('[data-gsap-reveal]'))
  if (!targets.length) return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.setAttribute('data-gsap-reveal-ready', 'true')
    targets.forEach((target) => target.dataset.gsapRevealVisible = 'true')
    return
  }

  const { gsap } = await import('gsap')
  observer?.disconnect()
  activeTweens.forEach((tween) => tween.kill())
  activeTweens = []
  document.documentElement.setAttribute('data-gsap-reveal-ready', 'true')

  const show = (target: RevealTarget) => {
    target.dataset.gsapRevealVisible = 'true'
    observer?.unobserve(target)
    if (target.dataset.gsapRevealFade === 'false') {
      activeTweens.push(gsap.fromTo(target, { y: Number(target.dataset.gsapRevealY ?? 24) }, { y: 0, duration: 0.68, delay: Number.parseFloat(target.style.getPropertyValue('--gsap-reveal-delay') || '0'), ease: 'power3.out', clearProps: 'transform' }))
      return
    }
    activeTweens.push(gsap.fromTo(target, { autoAlpha: 0, y: Number(target.dataset.gsapRevealY ?? 24) }, { autoAlpha: 1, y: 0, duration: 0.68, delay: Number.parseFloat(target.style.getPropertyValue('--gsap-reveal-delay') || '0'), ease: 'power3.out', clearProps: 'opacity,visibility,transform' }))
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) show(entry.target as RevealTarget)
    })
  }, { rootMargin: '80px 0px -80px' })

  targets.forEach((target) => {
    if (target.dataset.gsapRevealVisible === 'true') return
    const rect = target.getBoundingClientRect()
    if (rect.bottom > -80 && rect.top < window.innerHeight + 80) show(target)
    else observer?.observe(target)
  })
}

export function stopGsapReveals() {
  observer?.disconnect()
  observer = null
  activeTweens.forEach((tween) => tween.kill())
  activeTweens = []
  document.documentElement.removeAttribute('data-gsap-reveal-ready')
}
