export const HEADER_TOP_THRESHOLD = 32
export const HEADER_DIRECTION_THRESHOLD = 14

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

export type HeaderScrollState = {
  anchorY: number
  compact: boolean
  direction: 'down' | 'up' | null
  lastY: number
}

export function initialHeaderScrollState(scrollY = 0): HeaderScrollState {
  return { anchorY: Math.max(0, scrollY), compact: false, direction: null, lastY: Math.max(0, scrollY) }
}

export function nextHeaderScrollState(state: HeaderScrollState, scrollY: number): HeaderScrollState {
  const nextY = Math.max(0, scrollY)
  if (nextY <= HEADER_TOP_THRESHOLD) return initialHeaderScrollState(nextY)
  if (nextY === state.lastY) return state

  const direction = nextY > state.lastY ? 'down' : 'up'
  const anchorY = direction === state.direction ? state.anchorY : state.lastY
  const distance = Math.abs(nextY - anchorY)
  return {
    anchorY,
    compact: distance >= HEADER_DIRECTION_THRESHOLD ? direction === 'down' : state.compact,
    direction,
    lastY: nextY,
  }
}
