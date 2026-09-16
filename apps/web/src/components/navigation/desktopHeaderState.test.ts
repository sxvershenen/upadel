import assert from 'node:assert/strict'
import test from 'node:test'

import { bindHeaderScroll, desktopSubmenuKeyAction, initialHeaderScrollState, navigationIconPreset, nextHeaderScrollState } from './desktopHeaderState'

test('header compacts after downward scroll and expands after upward scroll', () => {
  let state = initialHeaderScrollState()
  state = nextHeaderScrollState(state, 80)
  assert.equal(state.compact, true)
  state = nextHeaderScrollState(state, 60)
  assert.equal(state.compact, false)
})

test('header returns to expanded state near the top', () => {
  let state = initialHeaderScrollState(120)
  state = { ...state, compact: true, direction: 'down' }
  state = nextHeaderScrollState(state, 20)
  assert.equal(state.compact, false)
  assert.equal(state.direction, null)
})

test('header starts compact when hydration happens below the top threshold', () => {
  assert.equal(initialHeaderScrollState(33).compact, true)
  assert.equal(initialHeaderScrollState(32).compact, false)
})

test('header uses fixed directional thresholds for hysteresis', () => {
  let state = { ...initialHeaderScrollState(40), compact: false }
  state = nextHeaderScrollState(state, 63)
  assert.equal(state.compact, false)
  state = nextHeaderScrollState(state, 64)
  assert.equal(state.compact, true)
  state = nextHeaderScrollState(state, 48)
  assert.equal(state.compact, false)
})

test('navigation icons use stable route fallbacks', () => {
  assert.equal(navigationIconPreset('/'), 'home')
  assert.equal(navigationIconPreset('/blog'), 'article')
  assert.equal(navigationIconPreset('/unknown'), 'default')
})

test('submenu keyboard actions open, close, and preserve the link fallback', () => {
  assert.equal(desktopSubmenuKeyAction(' ', false), 'open')
  assert.equal(desktopSubmenuKeyAction('Enter', false), 'open')
  assert.equal(desktopSubmenuKeyAction('Escape', true), 'close')
  assert.equal(desktopSubmenuKeyAction('Enter', true), 'navigate')
  assert.equal(desktopSubmenuKeyAction('ArrowDown', true), null)
})

test('header scroll binding syncs after an Astro page swap without duplicate listeners', () => {
  let scrollY = 80
  let nextFrame = 1
  const frames = new Map<number, FrameRequestCallback>()
  const scrollListeners = new Set<EventListener>()
  const lifecycleListeners = new Set<EventListener>()
  const scrollTarget = {
    get scrollY() { return scrollY },
    addEventListener: (_type: string, listener: EventListener) => { scrollListeners.add(listener) },
    removeEventListener: (_type: string, listener: EventListener) => { scrollListeners.delete(listener) },
    requestAnimationFrame: (callback: FrameRequestCallback) => { const id = nextFrame++; frames.set(id, callback); return id },
    cancelAnimationFrame: (id: number) => { frames.delete(id) },
  }
  const lifecycleTarget = {
    addEventListener: (_type: string, listener: EventListener) => { lifecycleListeners.add(listener) },
    removeEventListener: (_type: string, listener: EventListener) => { lifecycleListeners.delete(listener) },
  }
  const values: number[] = []
  const dispose = bindHeaderScroll({ scrollTarget, lifecycleTarget, onScroll: (value) => values.push(value) })

  scrollY = 140
  scrollListeners.forEach((listener) => listener(new Event('scroll')))
  assert.equal(scrollListeners.size, 1)
  frames.forEach((callback, id) => { frames.delete(id); callback(0) })
  lifecycleListeners.forEach((listener) => listener(new Event('astro:after-swap')))
  scrollY = 170
  scrollListeners.forEach((listener) => listener(new Event('scroll')))
  frames.forEach((callback, id) => { frames.delete(id); callback(0) })
  dispose()

  assert.deepEqual(values, [80, 140, 140, 170])
  assert.equal(scrollListeners.size, 0)
  assert.equal(lifecycleListeners.size, 0)
})
