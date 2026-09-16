import assert from 'node:assert/strict'
import test from 'node:test'
import { sanitizeAnalyticsEvent } from './contract'

const base = { eventId: '1234567890abcdef', anonymousId: 'abcdefghijklmnop', sessionId: 'qrstuvwxyz123456', pageViewId: '1111111111111111', schemaVersion: 1, occurredAt: '2026-01-01T00:00:00Z', name: 'page_view', path: '/prices', language: 'ru', consentState: 'accepted', currentSource: {}, firstSource: {} }
test('event sanitizer rejects stale events and strips query-bearing paths', () => {
  assert.equal(sanitizeAnalyticsEvent(base, new Date('2026-01-09T00:00:01Z')), null)
  const sanitized = sanitizeAnalyticsEvent({ ...base, path: '/prices?phone=secret' }, new Date('2026-01-01T00:01:00Z'))
  assert.equal(sanitized?.path, '/')
})
test('active time and web vital values have strict bounds', () => {
  assert.equal(sanitizeAnalyticsEvent({ ...base, name: 'active_time', value: 999_999 }, new Date('2026-01-01T00:01:00Z')), null)
  assert.ok(sanitizeAnalyticsEvent({ ...base, name: 'web_vital', metricName: 'INP', value: 120 }, new Date('2026-01-01T00:01:00Z')))
})
test('arbitrary event and form properties are rejected, never stored as JSON', () => {
  assert.equal(sanitizeAnalyticsEvent({ ...base, formValues: { phone: '+79990000000' } }, new Date('2026-01-01T00:01:00Z')), null)
  assert.equal(sanitizeAnalyticsEvent({ ...base, currentSource: { channel: 'direct', privateQuery: 'secret' } }, new Date('2026-01-01T00:01:00Z')), null)
})
