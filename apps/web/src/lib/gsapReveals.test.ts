import assert from 'node:assert/strict'
import test from 'node:test'

import { captureRevealStyles, settleRevealTarget, shouldOwnRevealTarget, isRevealRootReady, selectRevealTargets, type RevealTarget } from './gsapReveals'

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


test('visible SSR targets remain eligible for an initial GSAP entrance', () => {
  assert.equal(shouldOwnRevealTarget(false, false), true)
  assert.equal(shouldOwnRevealTarget(true, false), false)
})

type FakeTarget = {
  dataset: { gsapRevealScope?: string; gsapRevealBoundary?: string }
  parentElement: FakeTarget | null
  closest: (selector: string) => FakeTarget | null
  querySelector: (selector: string) => FakeTarget | null
}

function fakeTarget({ scope = false, boundary = false, parent = null as FakeTarget | null, descendants = [] as FakeTarget[] } = {}) {
  let target: FakeTarget
  target = {
    dataset: {
      gsapRevealScope: scope ? 'true' : undefined,
      gsapRevealBoundary: boundary ? 'true' : undefined,
    },
    parentElement: parent,
    closest(selector: string) {
      let current: FakeTarget | null = target
      while (current) {
        if (selector.includes('scope') && current.dataset.gsapRevealScope === 'true') return current
        if (selector.includes('boundary') && current.dataset.gsapRevealBoundary === 'true') return current
        current = current.parentElement
      }
      return null
    },
    querySelector(selector: string) {
      return descendants.find((item) => selector.includes('scope') && item.dataset.gsapRevealScope === 'true')
        ?? descendants.find((item) => selector.includes('data-gsap-reveal') && (item.dataset.gsapRevealScope === 'true' || item.dataset.gsapRevealBoundary === 'true'))
        ?? null
    },
  }
  return target
}

test('leaf Reveal scopes take ownership over atomic targets inside them', () => {
  const root = fakeTarget()
  const sectionDescendants: FakeTarget[] = []
  const section = fakeTarget({ scope: true, parent: root, descendants: sectionDescendants })
  const badge = fakeTarget({ parent: section })
  assert.deepEqual(selectRevealTargets([section, badge] as unknown as RevealTarget[]), [section])

  const nested = fakeTarget({ scope: true, parent: section })
  sectionDescendants.push(nested)
  const nestedButton = fakeTarget({ parent: nested })

  assert.deepEqual(selectRevealTargets([section, nested, nestedButton] as unknown as RevealTarget[]), [nested])
})
