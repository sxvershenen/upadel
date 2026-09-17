import Lenis from 'lenis'

declare global {
  interface Window {
    __unlimLenis?: Lenis | false
  }
}

if (typeof window !== 'undefined' && !window.__unlimLenis) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.__unlimLenis = false
  } else {
    const lenis = new Lenis({
      anchors: { offset: -96 },
      autoRaf: true,
      smoothWheel: true,
    })

    window.__unlimLenis = lenis
    document.addEventListener('astro:after-swap', () => lenis.resize())
  }
}

export {}
