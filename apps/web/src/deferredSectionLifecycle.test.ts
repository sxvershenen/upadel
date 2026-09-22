import assert from 'node:assert/strict'
import test from 'node:test'

import { disconnectDeferredSectionObservers, waitUntilSectionIsNear } from './deferredSectionLifecycle'

test('route swap disconnects deferred observers tied to the outgoing homepage', async () => {
  const originalWindow = globalThis.window
  const originalDocument = globalThis.document
  const originalObserver = globalThis.IntersectionObserver
  let disconnects = 0
  const outgoing = { getBoundingClientRect: () => ({ top: 5000, bottom: 5200 }) }

  class FakeObserver {
    constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
    observe() {}
    disconnect() { disconnects += 1 }
  }

  Object.assign(globalThis, {
    window: { innerHeight: 800, IntersectionObserver: FakeObserver },
    document: { querySelector: () => outgoing },
    IntersectionObserver: FakeObserver,
  })

  try {
    const cleanups = new Set<() => void>()
    void waitUntilSectionIsNear('pricing', cleanups)
    assert.equal(cleanups.size, 1)

    disconnectDeferredSectionObservers(cleanups)
    assert.equal(disconnects, 1)
    assert.equal(cleanups.size, 0)

    void waitUntilSectionIsNear('pricing', cleanups)
    assert.equal(cleanups.size, 1, 'a returning homepage creates a fresh observer for its own DOM')
  } finally {
    Object.assign(globalThis, { window: originalWindow, document: originalDocument, IntersectionObserver: originalObserver })
  }
})
