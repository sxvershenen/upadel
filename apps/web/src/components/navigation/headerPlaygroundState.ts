export const HEADER_PLAYGROUND_TOP_THRESHOLD = 32
export const HEADER_PLAYGROUND_DOWN_THRESHOLD = 24
export const HEADER_PLAYGROUND_UP_THRESHOLD = 16

export type HeaderPlaygroundScrollState = {
  compact: boolean
  lastY: number
  downDistance: number
  upDistance: number
}

export function initialHeaderPlaygroundScrollState(scrollY = 0): HeaderPlaygroundScrollState {
  const initialY = Math.max(0, scrollY)
  return {
    compact: initialY > HEADER_PLAYGROUND_TOP_THRESHOLD,
    lastY: initialY,
    downDistance: 0,
    upDistance: 0,
  }
}

export function nextHeaderPlaygroundScrollState(state: HeaderPlaygroundScrollState, scrollY: number): HeaderPlaygroundScrollState {
  const nextY = Math.max(0, scrollY)
  if (nextY <= HEADER_PLAYGROUND_TOP_THRESHOLD) return initialHeaderPlaygroundScrollState(nextY)
  if (nextY === state.lastY) return state

  const delta = nextY - state.lastY
  if (delta > 0) {
    const downDistance = state.downDistance + delta
    return {
      compact: state.compact || downDistance >= HEADER_PLAYGROUND_DOWN_THRESHOLD,
      lastY: nextY,
      downDistance,
      upDistance: 0,
    }
  }

  const upDistance = state.upDistance - delta
  return {
    compact: state.compact && upDistance < HEADER_PLAYGROUND_UP_THRESHOLD,
    lastY: nextY,
    downDistance: 0,
    upDistance,
  }
}
