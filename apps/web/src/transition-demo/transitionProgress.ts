let completionTimer: number | null = null

export function beginTransitionProgress() {
  if (typeof document === 'undefined') return
  if (completionTimer !== null) window.clearTimeout(completionTimer)
  completionTimer = null
  document.documentElement.dataset.routeTransition = 'loading'
}

export function completeTransitionProgress() {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.routeTransition = 'done'
  if (completionTimer !== null) window.clearTimeout(completionTimer)
  completionTimer = window.setTimeout(() => {
    delete document.documentElement.dataset.routeTransition
    completionTimer = null
  }, 320)
}
