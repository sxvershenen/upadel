import assert from 'node:assert/strict'
import test from 'node:test'

import { createDeferredVitalDelivery, createSingleOwnerGate } from './documentVitals'

test('document metrics ownership is claimed once across page-island remounts', () => {
  const claim = createSingleOwnerGate()
  let starts = 0
  assert.equal(claim(() => { starts += 1 }), true)
  assert.equal(claim(() => { starts += 1 }), false)
  assert.equal(starts, 1)
})

test('delayed consent keeps initial document attribution and creates identity only when allowed', () => {
  let consent = false
  let identityCreations = 0
  const delivered: Array<{ path: string; names: string[] }> = []
  const delivery = createDeferredVitalDelivery({ path: '/' }, (context, events: Array<{ name: string }>) => {
    if (!consent) return false
    identityCreations += 1
    delivered.push({ path: context.path, names: events.map(({ name }) => name) })
    return true
  })

  delivery.add({ name: 'TTFB' })
  assert.equal(delivery.finish(), false)
  assert.equal(identityCreations, 0)
  consent = true
  assert.equal(delivery.policyChanged(), true)
  assert.deepEqual(delivered, [{ path: '/', names: ['TTFB'] }])
})

test('a live disabled policy drops finalized document metrics instead of using an old policy', () => {
  let mode: 'first-party' | 'disabled' = 'first-party'
  const delivered: string[] = []
  const delivery = createDeferredVitalDelivery({ path: '/' }, (_context, events: string[]) => {
    if (mode === 'disabled') return true
    delivered.push(...events)
    return true
  })
  delivery.add('LCP')
  mode = 'disabled'
  assert.equal(delivery.finish(), true)
  assert.deepEqual(delivered, [])
  assert.equal(delivery.pendingCount(), 0)
})
