export const HEADER_TOP_THRESHOLD = 32
export const HEADER_DOWN_THRESHOLD = 24
export const HEADER_UP_THRESHOLD = 16
export const HEADER_MORPH_LOCK_MS = 320

export type NavigationIconPreset = 'about' | 'article' | 'coaches' | 'courts' | 'default' | 'gift' | 'home' | 'prices' | 'training' | 'tournaments'

export function navigationIconPreset(href: string): NavigationIconPreset {
  const pathname = href.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/'
  if (pathname === '/') return 'home'
  if (pathname === '/prices') return 'prices'
  if (pathname === '/training') return 'training'
  if (pathname === '/coaches') return 'coaches'
  if (pathname === '/tournaments') return 'tournaments'
  if (pathname === '/blog') return 'article'
  if (pathname === '/gift') return 'gift'
  if (pathname === '/about') return 'about'
  if (pathname === '/courts' || pathname === '/padel-courts' || pathname === '/padel-court-zakaz') return 'courts'
  return 'default'
}

export type DesktopSubmenuKeyAction = 'close' | 'navigate' | 'open' | null

export function desktopSubmenuKeyAction(key: string, open: boolean): DesktopSubmenuKeyAction {
  if (key === 'Escape') return open ? 'close' : null
  if (key === ' ') return 'open'
  if (key === 'Enter') return open ? 'navigate' : 'open'
  return null
}

type HeaderEventTarget = {
  addEventListener: (type: string, listener: EventListener, options?: AddEventListenerOptions | boolean) => void
  removeEventListener: (type: string, listener: EventListener, options?: EventListenerOptions | boolean) => void
}

type HeaderScrollTarget = HeaderEventTarget & {
  scrollY: number
  requestAnimationFrame: (callback: FrameRequestCallback) => number
  cancelAnimationFrame: (handle: number) => void
}

/** Keeps one global scroll listener and resynchronizes state after the Swup surface swaps. */
export function bindHeaderScroll({ scrollTarget, lifecycleTarget, onScroll }: { scrollTarget: HeaderScrollTarget; lifecycleTarget: HeaderEventTarget; onScroll: (scrollY: number) => void }): () => void {
  let frame: number | null = null
  const update = () => {
    frame = null
    onScroll(scrollTarget.scrollY)
  }
  const handleScroll: EventListener = () => {
    if (frame !== null) return
    frame = scrollTarget.requestAnimationFrame(update)
  }
  const handleSwap: EventListener = () => update()

  scrollTarget.addEventListener('scroll', handleScroll, { passive: true })
  update()
  lifecycleTarget.addEventListener('astro:after-swap', handleSwap)
  lifecycleTarget.addEventListener('swup:page:view', handleSwap)
  return () => {
    scrollTarget.removeEventListener('scroll', handleScroll)
    lifecycleTarget.removeEventListener('astro:after-swap', handleSwap)
    lifecycleTarget.removeEventListener('swup:page:view', handleSwap)
    if (frame !== null) scrollTarget.cancelAnimationFrame(frame)
  }
}

export type HeaderScrollState = {
  anchorY: number
  compact: boolean
  direction: 'down' | 'up' | null
  lastY: number
}

export function initialHeaderScrollState(scrollY = 0): HeaderScrollState {
  const initialY = Math.max(0, scrollY)
  return { anchorY: initialY, compact: initialY > HEADER_TOP_THRESHOLD, direction: null, lastY: initialY }
}

export function nextHeaderScrollState(state: HeaderScrollState, scrollY: number): HeaderScrollState {
  const nextY = Math.max(0, scrollY)
  if (nextY <= HEADER_TOP_THRESHOLD) return initialHeaderScrollState(nextY)
  if (nextY === state.lastY) return state

  const direction = nextY > state.lastY ? 'down' : 'up'
  const anchorY = direction === state.direction ? state.anchorY : state.lastY
  const distance = Math.abs(nextY - anchorY)
  const threshold = direction === 'down' ? HEADER_DOWN_THRESHOLD : HEADER_UP_THRESHOLD
  return {
    anchorY,
    compact: distance >= threshold ? direction === 'down' : state.compact,
    direction,
    lastY: nextY,
  }
}
