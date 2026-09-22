import assert from 'node:assert/strict'
import test from 'node:test'

import { createAnalyticsDeliveryQueue } from './deliveryQueue'

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
  }
}

test('concurrent flush calls share one request and preserve newer unsent events', async () => {
  const queue = createAnalyticsDeliveryQueue(memoryStorage(), 'events')
  for (let index = 0; index < 10; index += 1) queue.enqueue({ eventId: `event-${index}` })

  let resolveFetch!: (response: Response) => void
  let requests = 0
  const fetcher = (() => {
    requests += 1
    return new Promise<Response>((resolve) => { resolveFetch = resolve })
  }) as typeof fetch
  const options = { endpoint: '/analytics', unloading: false, fetcher }
  const first = queue.flush(options)
  const second = queue.flush(options)
  queue.enqueue({ eventId: 'not-yet-sent' })

  assert.equal(requests, 1)
  resolveFetch(new Response(null, { status: 204 }))
  await Promise.all([first, second])
  assert.deepEqual(queue.snapshot().map(({ eventId }) => eventId), ['not-yet-sent'])
})

test('acknowledgement removes captured IDs rather than the current queue prefix', async () => {
  const queue = createAnalyticsDeliveryQueue(memoryStorage(), 'events')
  queue.enqueue({ eventId: 'first' })
  queue.enqueue({ eventId: 'second' })
  await queue.flush({
    endpoint: '/analytics',
    unloading: false,
    fetcher: (async () => {
      queue.clear()
      queue.enqueue({ eventId: 'new' })
      return new Response(null, { status: 204 })
    }) as typeof fetch,
  })
  assert.deepEqual(queue.snapshot().map(({ eventId }) => eventId), ['new'])
})
