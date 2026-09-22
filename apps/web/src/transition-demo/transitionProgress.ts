let completionTimer: number | null = null
let releaseFrame: number | null = null

function progressBar() {
  return document.querySelector<HTMLElement>('.route-transition-progress > span')
}

function clearProgressBarOverride() {
  if (releaseFrame !== null) window.cancelAnimationFrame(releaseFrame)
  releaseFrame = null
  const bar = progressBar()
  bar?.style.removeProperty('animation')
  bar?.style.removeProperty('transform')
}

export function beginTransitionProgress() {
  if (typeof document === 'undefined') return
  if (completionTimer !== null) window.clearTimeout(completionTimer)
  completionTimer = null
  clearProgressBarOverride()
  document.documentElement.dataset.routeTransition = 'loading'
}

export function completeTransitionProgress() {
  if (typeof document === 'undefined') return
  if (completionTimer !== null) window.clearTimeout(completionTimer)
  clearProgressBarOverride()
  const bar = progressBar()
  if (bar) {
    const currentTransform = window.getComputedStyle(bar).transform
    bar.style.animation = 'none'
    bar.style.transform = currentTransform === 'none' ? 'scaleX(0)' : currentTransform
    bar.getBoundingClientRect()
  }
  document.documentElement.dataset.routeTransition = 'done'
  if (bar) {
    releaseFrame = window.requestAnimationFrame(() => {
      releaseFrame = null
      bar.style.removeProperty('animation')
      bar.style.removeProperty('transform')
    })
  }
  completionTimer = window.setTimeout(() => {
    delete document.documentElement.dataset.routeTransition
    clearProgressBarOverride()
    completionTimer = null
  }, 320)
}
