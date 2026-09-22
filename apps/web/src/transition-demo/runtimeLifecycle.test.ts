import assert from 'node:assert/strict'
import test from 'node:test'

import { createPostNavigationSceneLoader } from './postNavigationScene'
import { createRetryableRuntimeLoader, loadRuntimeForNavigation } from './runtimeLoader'

test('next click retries after an idle runtime import failure without falling back', async () => {
  let attempts = 0
  const accepted: string[] = []
  const load = createRetryableRuntimeLoader(async () => {
    attempts += 1
    if (attempts === 1) throw new Error('temporary chunk failure')
    return 'runtime'
  }, (runtime) => accepted.push(runtime))

  assert.equal(await load(), false)
  const fallbacks: string[] = []
  assert.equal(await loadRuntimeForNavigation({ load, href: '/prices', isReady: () => false, assign: (href) => fallbacks.push(href) }), true)
  assert.equal(attempts, 2)
  assert.deepEqual(accepted, ['runtime'])
  assert.deepEqual(fallbacks, [])
})

test('failed click-time runtime import falls back to native navigation', async () => {
  const fallbacks: string[] = []
  const loaded = await loadRuntimeForNavigation({
    load: async () => false,
    href: '/prices?page=2',
    isReady: () => false,
    assign: (href) => fallbacks.push(href),
  })
  assert.equal(loaded, false)
  assert.deepEqual(fallbacks, ['/prices?page=2'])
})

test('scene loads on idle only after the first completed visit destination is ready', async () => {
  const idleCallbacks: Array<() => void> = []
  let loads = 0
  let accepted = 0
  const loader = createPostNavigationSceneLoader({
    load: async () => { loads += 1; return 'scene' },
    accept: () => { accepted += 1 },
    isReducedMotion: () => false,
    scheduleIdle: (callback) => { idleCallbacks.push(callback); return idleCallbacks.length },
    cancelIdle: () => {},
  })

  loader.destinationBecameReady()
  assert.equal(idleCallbacks.length, 0, 'initial page readiness must not load WebGL2 scene code')
  loader.visitStarted()
  loader.destinationBecameReady()
  assert.equal(idleCallbacks.length, 0, 'destination hydration during the first visit must not delay that visit')
  loader.visitCompleted()
  assert.equal(idleCallbacks.length, 1)
  idleCallbacks[0]()
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(loads, 1)
  assert.equal(accepted, 0, 'import completion only stages the scene module')
  assert.equal(idleCallbacks.length, 2)
  idleCallbacks[1]()
  assert.equal(accepted, 1)
})

test('reduced motion prevents post-navigation scene warmup', () => {
  let scheduled = 0
  const loader = createPostNavigationSceneLoader({
    load: async () => 'scene',
    accept: () => {},
    isReducedMotion: () => true,
    scheduleIdle: () => { scheduled += 1; return scheduled },
    cancelIdle: () => {},
  })
  loader.visitStarted()
  loader.destinationBecameReady()
  loader.visitCompleted()
  assert.equal(scheduled, 0)
})

test('scene waits for destination readiness when visit completion arrives first', () => {
  let scheduled = 0
  const loader = createPostNavigationSceneLoader({
    load: async () => 'scene',
    accept: () => {},
    isReducedMotion: () => false,
    scheduleIdle: () => { scheduled += 1; return scheduled },
    cancelIdle: () => {},
  })
  loader.visitStarted()
  loader.visitCompleted()
  assert.equal(scheduled, 0)
  loader.destinationBecameReady()
  assert.equal(scheduled, 1)
})

test('a second visit before idle cancels warmup and stale idle cannot import the WebGL2 scene', () => {
  const idleCallbacks: Array<() => void> = []
  const cancelled: number[] = []
  let loads = 0
  const loader = createPostNavigationSceneLoader({
    load: async () => { loads += 1; return 'scene' },
    accept: () => {},
    isReducedMotion: () => false,
    scheduleIdle: (callback) => { idleCallbacks.push(callback); return idleCallbacks.length },
    cancelIdle: (handle) => { cancelled.push(handle) },
  })
  loader.visitStarted()
  loader.destinationBecameReady()
  loader.visitCompleted()
  assert.equal(idleCallbacks.length, 1)

  loader.visitStarted()
  assert.deepEqual(cancelled, [1])
  idleCallbacks[0]()
  assert.equal(loads, 0)
})

test('scene module resolving mid-visit stays staged until a stable destination idle', async () => {
  const idleCallbacks: Array<() => void> = []
  let resolveImport!: (scene: string) => void
  let accepted = 0
  const loader = createPostNavigationSceneLoader({
    load: () => new Promise<string>((resolve) => { resolveImport = resolve }),
    accept: () => { accepted += 1 },
    isReducedMotion: () => false,
    scheduleIdle: (callback) => { idleCallbacks.push(callback); return idleCallbacks.length },
    cancelIdle: () => {},
  })
  loader.visitStarted()
  loader.destinationBecameReady()
  loader.visitCompleted()
  idleCallbacks[0]()

  loader.visitStarted()
  resolveImport('scene')
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(accepted, 0)
  assert.equal(idleCallbacks.length, 1, 'active visit must not schedule scene mounting')

  loader.destinationBecameReady()
  loader.visitCompleted()
  assert.equal(idleCallbacks.length, 2)
  idleCallbacks[1]()
  assert.equal(accepted, 1)
})

test('an aborted initial visit never makes scene loading eligible', () => {
  let scheduled = 0
  const loader = createPostNavigationSceneLoader({
    load: async () => 'scene',
    accept: () => {},
    isReducedMotion: () => false,
    scheduleIdle: () => { scheduled += 1; return scheduled },
    cancelIdle: () => {},
  })
  loader.visitStarted()
  loader.destinationBecameReady()
  loader.visitSettled()
  assert.equal(scheduled, 0)
})
