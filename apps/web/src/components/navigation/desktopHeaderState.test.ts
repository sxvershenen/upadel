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

test('header scroll binding rebinds after an Astro page swap without duplicate listeners', () => {
  let scrollY = 80
  let nextFrame = 1
  const scrollListeners = new Set<EventListener>()
  const lifecycleListeners = new Set<EventListener>()
  const scrollTarget = {
    get scrollY() { return scrollY },
    addEventListener: (_type: string, listener: EventListener) => { scrollListeners.add(listener) },
    removeEventListener: (_type: string, listener: EventListener) => { scrollListeners.delete(listener) },
    requestAnimationFrame: (callback: FrameRequestCallback) => { callback(0); return nextFrame++ },
    cancelAnimationFrame: () => undefined,
  }
  const lifecycleTarget = {
    addEventListener: (_type: string, listener: EventListener) => { lifecycleListeners.add(listener) },
    removeEventListener: (_type: string, listener: EventListener) => { lifecycleListeners.delete(listener) },
  }
  const values: number[] = []
  const dispose = bindHeaderScroll({ scrollTarget, lifecycleTarget, onScroll: (value) => values.push(value) })

  scrollY = 140
  scrollListeners.forEach((listener) => listener(new Event('scroll')))
  lifecycleListeners.forEach((listener) => listener(new Event('astro:after-swap')))
  scrollY = 170
  scrollListeners.forEach((listener) => listener(new Event('scroll')))
  dispose()

  assert.deepEqual(values, [80, 140, 140, 170])
  assert.equal(scrollListeners.size, 0)
  assert.equal(lifecycleListeners.size, 0)
})
