import assert from 'node:assert/strict'
import test from 'node:test'

import { waitForGsapAnimation } from './animationLifecycle'

function fakeAnimation(progress = 0) {
  const callbacks = new Map<string, (...args: unknown[]) => unknown>()
  const animation = {
    eventCallback(type: string, callback?: (...args: unknown[]) => unknown) {
      if (callback) { callbacks.set(type, callback); return animation }
      return callbacks.get(type)
    },
    progress: () => progress,
  }
  return { animation: animation as unknown as gsap.core.Animation, callbacks }
}

test('GSAP wait preserves tween cleanup before resolving on completion', async () => {
  const { animation, callbacks } = fakeAnimation()
  let cleanupCalls = 0
  animation.eventCallback('onComplete', () => { cleanupCalls += 1 })

  const completed = waitForGsapAnimation(animation)
  callbacks.get('onComplete')?.()
  await completed

  assert.equal(cleanupCalls, 1)
})

test('GSAP wait resolves on interruption and preserves interruption cleanup', async () => {
  const { animation, callbacks } = fakeAnimation()
  let cleanupCalls = 0
  animation.eventCallback('onInterrupt', () => { cleanupCalls += 1 })

  const interrupted = waitForGsapAnimation(animation)
  callbacks.get('onInterrupt')?.()
  await interrupted

  assert.equal(cleanupCalls, 1)
})

test('GSAP wait resolves immediately for an already completed animation', async () => {
  const { animation, callbacks } = fakeAnimation(1)
  await waitForGsapAnimation(animation)
  assert.equal(callbacks.size, 0)
})
