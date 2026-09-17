import Lenis from 'lenis'

declare global {
  interface Window {
    __unlimLenis?: Lenis | false
    __unlimScrollThumb?: HTMLSpanElement
  }
}

if (typeof window !== 'undefined' && !window.__unlimScrollThumb) {
  const thumb = document.createElement('span')
  thumb.className = 'unlim-scroll-thumb'
  thumb.setAttribute('aria-hidden', 'true')
  document.body.appendChild(thumb)
  window.__unlimScrollThumb = thumb

  let hideTimer = 0
  const updateThumb = () => {
    const scrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const ratio = scrollable > 0 ? Math.min(1, window.innerHeight / document.documentElement.scrollHeight) : 1
    const thumbHeight = Math.max(32, Math.round(window.innerHeight * ratio))
    const maxTop = Math.max(0, window.innerHeight - thumbHeight - 4)
    const top = scrollable > 0 ? Math.round((window.scrollY / scrollable) * maxTop) : 0
    thumb.style.height = `${thumbHeight}px`
    thumb.style.transform = `translateY(${top}px)`
    thumb.classList.add('is-visible')
    window.clearTimeout(hideTimer)
    hideTimer = window.setTimeout(() => thumb.classList.remove('is-visible'), 700)
  }

  window.addEventListener('scroll', updateThumb, { passive: true })
  window.addEventListener('resize', updateThumb, { passive: true })
  updateThumb()

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.__unlimLenis = false
  } else {
    const lenis = new Lenis({
      anchors: { offset: -96 },
      autoRaf: true,
      smoothWheel: true,
    })

    lenis.on('scroll', updateThumb)
    window.__unlimLenis = lenis
    document.addEventListener('astro:after-swap', () => lenis.resize())
  }
}

export {}
