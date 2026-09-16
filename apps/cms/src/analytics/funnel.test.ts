import assert from 'node:assert/strict'
import test from 'node:test'
import { orderedFunnel } from './funnel'

test('funnel counts each session/object once and ignores retries and out-of-order steps', () => {
  const steps = ['view', 'start', 'submit', 'success']
  const result = orderedFunnel([
    { occurredAt: '2026-01-01T10:00:00Z', sessionId: 's1', objectKey: 'gift', step: 'view' },
    { occurredAt: '2026-01-01T10:00:01Z', sessionId: 's1', objectKey: 'gift', step: 'view' },
    { occurredAt: '2026-01-01T10:00:02Z', sessionId: 's1', objectKey: 'gift', step: 'start' },
    { occurredAt: '2026-01-01T10:00:03Z', sessionId: 's1', objectKey: 'gift', step: 'submit' },
    { occurredAt: '2026-01-01T10:00:04Z', sessionId: 's1', objectKey: 'gift', step: 'success' },
    { occurredAt: '2026-01-01T10:00:00Z', sessionId: 's2', objectKey: 'gift', step: 'success' },
  ], steps)
  assert.deepEqual(steps.map((step) => result[step].size), [1, 1, 1, 1])
})
test('funnel preserves a session/object sequence across Moscow midnight', () => {
  const steps = ['view', 'start', 'success']
  const result = orderedFunnel([
    { occurredAt: '2026-01-01T20:59:50Z', sessionId: 'cross-day', objectKey: 'membership', step: 'view' },
    { occurredAt: '2026-01-01T21:00:05Z', sessionId: 'cross-day', objectKey: 'membership', step: 'start' },
    { occurredAt: '2026-01-01T21:00:20Z', sessionId: 'cross-day', objectKey: 'membership', step: 'success' },
  ], steps)
  assert.deepEqual(steps.map((step) => result[step].size), [1, 1, 1])
})
