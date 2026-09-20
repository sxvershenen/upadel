import assert from 'node:assert/strict'
import test from 'node:test'

import { captureRevealStyles, settleRevealTarget, shouldOwnRevealTarget, isRevealRootReady, startGsapReveals, stopGsapReveals } from './gsapReveals'

class TestStyle {
  private properties = new Map<string, { priority: string; value: string }>()

  getPropertyPriority(name: string) { return this.properties.get(name)?.priority ?? '' }
  getPropertyValue(name: string) { return this.properties.get(name)?.value ?? '' }
  removeProperty(name: string) { const value = this.getPropertyValue(name); this.properties.delete(name); return value }
  setProperty(name: string, value: string, priority = '') { this.properties.set(name, { priority, value }) }
}

test('an interrupted reveal becomes visible and restores the author inline styles', () => {
  const style = new TestStyle()
  style.setProperty('opacity', '0.72', 'important')
  const target = { dataset: { gsapRevealOwner: 'true' }, style } as unknown as HTMLElement
  const snapshot = captureRevealStyles(target)

  style.setProperty('opacity', '0.31')
  style.setProperty('visibility', 'hidden')
  style.setProperty('--gsap-reveal-offset', '13px')
  settleRevealTarget(target, snapshot)

  assert.equal(target.dataset.gsapRevealVisible, 'true')
  assert.equal(target.dataset.gsapRevealOwner, undefined)
  assert.equal(style.getPropertyValue('opacity'), '0.72')
  assert.equal(style.getPropertyPriority('opacity'), 'important')
  assert.equal(style.getPropertyValue('visibility'), '')
  assert.equal(style.getPropertyValue('--gsap-reveal-offset'), '')
})

test('a visible target retains reveal ownership until its active tween settles', () => {
  assert.equal(shouldOwnRevealTarget(false, false), true)
  assert.equal(shouldOwnRevealTarget(true, true), true)
  assert.equal(shouldOwnRevealTarget(true, false), false)
})


test('page reveals wait for the React commit but static HTML needs no hydration', () => {
  const root = { dataset: {}, querySelector: () => ({}) } as unknown as HTMLElement
  assert.equal(isRevealRootReady(root), false)
  root.dataset.mainReady = 'true'
  assert.equal(isRevealRootReady(root), true)
  const staticRoot = { dataset: {}, querySelector: () => null } as unknown as HTMLElement
  assert.equal(isRevealRootReady(staticRoot), true)
})


test('visible SSR content is not hidden again and repeated readiness does not restart reveals', async () => {
  // Load GSAP in the Node environment: this scenario must never create a tween.
  await import('gsap')
  const target = (top: number, cssEntrance: boolean) => ({
    dataset: {} as Record<string, string>,
    style: new TestStyle(),
    parentElement: null,
    querySelector: () => null,
    closest: () => cssEntrance ? {} : null,
    getBoundingClientRect: () => ({ top, bottom: top + 100, left: 0, right: 200, width: 200, height: 100 }),
  })
  const visible = target(120, true)
  const plainVisible = target(340, false)
  const belowFold = target(1500, true)
  const root = { dataset: { mainReady: 'true' }, isConnected: true, querySelectorAll: () => [visible, plainVisible, belowFold] }
  const observed = new Set<unknown>()
  let observerCount = 0
  class Observer {
    constructor() { observerCount += 1 }
    observe(element: unknown) { observed.add(element) }
    unobserve(element: unknown) { observed.delete(element) }
    disconnect() { observed.clear() }
  }
  const replacements = {
    window: { matchMedia: () => ({ matches: false }), innerWidth: 1440, innerHeight: 900 },
    document: { querySelector: () => root, documentElement: { setAttribute() {}, removeAttribute() {} } },
    IntersectionObserver: Observer,
    MutationObserver: class { observe() {} disconnect() {} },
  }
  const descriptors = new Map(Object.keys(replacements).map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]))
  try {
    Object.entries(replacements).forEach(([name, value]) => Object.defineProperty(globalThis, name, { value, configurable: true }))
    await startGsapReveals()
    assert.equal(visible.dataset.gsapRevealVisible, 'true')
    assert.equal(plainVisible.dataset.gsapRevealVisible, 'true')
    assert.equal(plainVisible.dataset.gsapRevealOwner, undefined)
    assert.equal(plainVisible.style.getPropertyValue('opacity'), '')
    assert.equal(visible.dataset.gsapRevealOwner, undefined)
    assert.equal(visible.style.getPropertyValue('opacity'), '')
    assert.equal(visible.style.getPropertyValue('--gsap-reveal-offset'), '')
    assert.ok(observed.has(belowFold))
    assert.equal(belowFold.dataset.gsapRevealVisible, undefined)

    await startGsapReveals()
    assert.equal(observerCount, 1)
    assert.equal(visible.style.getPropertyValue('opacity'), '')
    assert.ok(observed.has(belowFold))
  } finally {
    stopGsapReveals()
    descriptors.forEach((descriptor, name) => {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor)
      else Reflect.deleteProperty(globalThis, name)
    })
  }
})
