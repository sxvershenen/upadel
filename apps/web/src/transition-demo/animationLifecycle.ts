/** Wait for either terminal GSAP path without replacing callbacks owned by the tween. */
export function waitForGsapAnimation(animation: gsap.core.Animation) {
  if (animation.progress() >= 1) return Promise.resolve()

  return new Promise<void>((resolve) => {
    let settled = false
    const complete = () => {
      if (settled) return
      settled = true
      resolve()
    }
    const onComplete = animation.eventCallback('onComplete')
    const onInterrupt = animation.eventCallback('onInterrupt')

    animation.eventCallback('onComplete', (...args: unknown[]) => {
      try {
        onComplete?.apply(animation, args)
      } finally {
        complete()
      }
    })
    animation.eventCallback('onInterrupt', (...args: unknown[]) => {
      try {
        onInterrupt?.apply(animation, args)
      } finally {
        complete()
      }
    })
  })
}
