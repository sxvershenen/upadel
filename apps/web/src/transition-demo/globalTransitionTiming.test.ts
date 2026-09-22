import assert from 'node:assert/strict'
import test, { type TestContext } from 'node:test'
import { gsap } from 'gsap'
import type Swup from 'swup'

import { installPageTransitionAnimations } from './GlobalPageTransitionRuntime'
import type { ReferenceBallSceneHandle } from './ReferenceBallScene'
import { transitionAudio } from './transitionAudio'

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((done) => { resolve = done })
  return { promise, resolve }
}

function harness(context: TestContext, available = true, reduced = false) {
  const hooks = new Map<string, () => unknown>()
  const tweens: { duration: number; finish: () => void; interrupt: () => void }[] = []
  const flights: ReturnType<typeof deferred>[] = []
  const durations: number[] = []
  let visible = false
  let cancelled = 0
  const scene: ReferenceBallSceneHandle = {
    startFlight(_trajectory, duration) {
      if (!available) return null
      durations.push(duration)
      const flight = deferred()
      flights.push(flight)
      visible = true
      return flight.promise
    },
    cancel() {
      cancelled += 1
      visible = false
      flights.at(-1)?.resolve()
    },
  }
  const surface = {}
  for (const [key, value] of Object.entries({
    window: { matchMedia: () => ({ matches: reduced }) },
    document: { querySelector: () => surface },
  })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key)
    Object.defineProperty(globalThis, key, { configurable: true, value })
    context.after(() => {
      if (original) Object.defineProperty(globalThis, key, original)
      else Reflect.deleteProperty(globalThis, key)
    })
  }
  const audio = context.mock.method(transitionAudio, 'playWhoosh', () => {})
  context.mock.method(gsap, 'set', () => ({} as gsap.core.Tween))
  context.mock.method(gsap, 'to', (_target: gsap.TweenTarget, vars: gsap.TweenVars) => {
    const callbacks = new Map<string, (...args: unknown[]) => unknown>()
    if (vars.onComplete) callbacks.set('onComplete', vars.onComplete)
    if (vars.onInterrupt) callbacks.set('onInterrupt', vars.onInterrupt)
    const tween = {
      progress: () => 0,
      eventCallback(name: string, callback?: (...args: unknown[]) => unknown) {
        if (callback) { callbacks.set(name, callback); return tween }
        return callbacks.get(name)
      },
    }
    tweens.push({ duration: Number(vars.duration), finish: () => callbacks.get('onComplete')?.(), interrupt: () => callbacks.get('onInterrupt')?.() })
    return tween as unknown as gsap.core.Tween
  })
  const register = (name: string, callback: () => unknown) => {
    hooks.set(name, callback)
    return () => { hooks.delete(name) }
  }
  const swup = { hooks: { on: register, replace: register } } as unknown as Pick<Swup, 'hooks'>
  let currentScene: ReferenceBallSceneHandle | null = scene
  const dispose = installPageTransitionAnimations(swup, () => currentScene)
  context.after(dispose)
  return {
    emit: (name: string) => hooks.get(name)?.(), hooks, dispose, tweens, flights, durations, audio,
    finishFlight() { visible = false; flights.at(-1)!.resolve() },
    isVisible: () => visible,
    cancellations: () => cancelled,
    removeScene: () => { currentScene = null },
  }
}

const flush = async () => { await new Promise<void>((resolve) => queueMicrotask(resolve)) }

test('DOM replacement waits past the 340ms surface exit until the 980ms ball has cleared', async (context) => {
  const h = harness(context)
  h.emit('animation:out:start')
  let replaced = false
  const out = Promise.resolve(h.emit('animation:out:await')).then(() => {
    assert.equal(h.isVisible(), false, 'destination hydration must never start with a visible ball')
    replaced = true
  })
  assert.deepEqual(h.durations, [980])
  assert.equal(h.tweens[0].duration, 0.34)
  h.tweens[0].finish()
  await flush()
  assert.equal(replaced, false)
  h.finishFlight()
  await out
  assert.equal(replaced, true)
  const enter = h.emit('animation:in:await')
  assert.equal(h.tweens[1].duration, 0.2, 'flight plus reveal stays at 1180ms, excluding content work')
  h.tweens[1].finish()
  await enter
  assert.equal(h.audio.mock.callCount(), 1)
})

test('early flight completion still waits for the surface exit', async (context) => {
  const h = harness(context)
  h.emit('animation:out:start')
  let settled = false
  const out = Promise.resolve(h.emit('animation:out:await')).then(() => { settled = true })
  h.finishFlight()
  await flush()
  assert.equal(settled, false)
  h.tweens[0].finish()
  await out
})

for (const missing of ['renderer', 'scene'] as const) {
  test(`unavailable ${missing} adds no flight delay or sound and retains the normal page reveal`, async (context) => {
    const h = harness(context, false)
    if (missing === 'scene') h.removeScene()
    h.emit('animation:out:start')
    const out = h.emit('animation:out:await')
    h.tweens[0].finish()
    await out
    assert.equal(h.flights.length, 0)
    assert.equal(h.audio.mock.callCount(), 0)
    const enter = h.emit('animation:in:await')
    assert.equal(h.tweens[1].duration, 0.64)
    h.tweens[1].finish()
    await enter
  })
}

test('reduced motion schedules neither flight nor surface animations', async (context) => {
  const h = harness(context, true, true)
  h.emit('animation:out:start')
  await h.emit('animation:out:await')
  await h.emit('animation:in:await')
  assert.equal(h.flights.length, 0)
  assert.equal(h.tweens.length, 0)
  assert.equal(h.audio.mock.callCount(), 0)
})

for (const reason of ['visit:abort', 'visit:fail', 'dispose']) {
  test(`${reason} releases the flight barrier and cancels before a subsequent visit`, async (context) => {
    const h = harness(context)
    h.emit('animation:out:start')
    const oldOut = h.emit('animation:out:await')
    // The runtime's resetTransitionStyles kills the outgoing tween on failure.
    h.tweens[0].interrupt()
    const before = h.cancellations()
    if (reason === 'dispose') h.dispose()
    else h.emit(reason)
    await oldOut
    assert.equal(h.isVisible(), false)
    assert.equal(h.cancellations(), before + 1)
    if (reason === 'dispose') {
      assert.equal(h.hooks.size, 0)
      return
    }
    h.emit('animation:out:start')
    let replaced = false
    const nextOut = Promise.resolve(h.emit('animation:out:await')).then(() => { replaced = true })
    h.tweens[1].finish()
    h.flights[0].resolve() // a stale completion must not release the new flight
    await flush()
    assert.equal(replaced, false)
    h.finishFlight()
    await nextOut
  })
}
