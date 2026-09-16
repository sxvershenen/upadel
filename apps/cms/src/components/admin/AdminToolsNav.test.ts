import assert from 'node:assert/strict'
import test from 'node:test'

import { createPrefetchQueue, resolveAdminPrefetchHref } from './adminNavPrefetch'

test('resolves same-origin admin links without hashes', () => {
  assert.equal(
    resolveAdminPrefetchHref('/admin/collections/media?limit=50#top', 'https://cms.example/admin', '/admin'),
    '/admin/collections/media?limit=50',
  )
})

test('rejects external, non-admin, and current routes', () => {
  assert.equal(resolveAdminPrefetchHref('https://example.org/admin', 'https://cms.example/admin', '/admin'), null)
  assert.equal(resolveAdminPrefetchHref('/api/media', 'https://cms.example/admin', '/admin'), null)
  assert.equal(resolveAdminPrefetchHref('/admin/media', 'https://cms.example/admin/media', '/admin'), null)
})

test('prefetch queue deduplicates and processes one route per idle turn', () => {
  const callbacks: Array<() => void> = []
  const prefetched: string[] = []
  const queue = createPrefetchQueue((href) => prefetched.push(href), (callback) => callbacks.push(callback))

  queue.enqueue('/admin/one')
  queue.enqueue('/admin/one')
  queue.enqueue('/admin/two')
  assert.deepEqual(prefetched, [])
  callbacks.shift()?.()
  assert.deepEqual(prefetched, ['/admin/one'])
  callbacks.shift()?.()
  assert.deepEqual(prefetched, ['/admin/one', '/admin/two'])
})
