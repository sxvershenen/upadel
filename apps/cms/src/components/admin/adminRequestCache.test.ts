import assert from 'node:assert/strict'
import test from 'node:test'

import { createAdminRequestCache } from './adminRequestCache'
import { analyticsReportCacheKey } from './analyticsReportCache'
import { isAdminFieldVisible } from './adminFieldVisibility'

test('admin request cache deduplicates in-flight calls and reuses fresh values', async () => {
  const cache = createAdminRequestCache<string>({ ttlMs: 60_000, maxEntries: 2 })
  let calls = 0
  let resolveRequest: ((value: string) => void) | undefined
  const loader = () => {
    calls += 1
    return new Promise<string>((resolve) => { resolveRequest = resolve })
  }

  const first = cache.request('report', loader)
  const second = cache.request('report', loader)
  assert.equal(calls, 1)
  resolveRequest?.('fresh')
  assert.deepEqual(await Promise.all([first, second]), ['fresh', 'fresh'])
  assert.equal(await cache.request('report', loader), 'fresh')
  assert.equal(calls, 1)
})

test('analytics cache keys preserve period, compare mode, and filters', () => {
  const base = { from: '2026-01-01', to: '2026-01-30', compare: 'previous' as const, channel: 'all', device: 'all' }
  assert.notEqual(analyticsReportCacheKey(base), analyticsReportCacheKey({ ...base, compare: 'year' }))
  assert.notEqual(analyticsReportCacheKey(base), analyticsReportCacheKey({ ...base, device: 'mobile' }))
})

test('admin field visibility requires layout and visible computed styles', () => {
  assert.equal(isAdminFieldVisible({ display: 'block', hasLayout: true, visibility: 'visible' }), true)
  assert.equal(isAdminFieldVisible({ display: 'none', hasLayout: false, visibility: 'visible' }), false)
  assert.equal(isAdminFieldVisible({ display: 'block', hasLayout: true, visibility: 'hidden' }), false)
})
