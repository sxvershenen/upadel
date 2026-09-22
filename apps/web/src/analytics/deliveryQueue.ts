export type AnalyticsQueueEvent = Record<string, unknown> & { eventId: string }

type DeliveryOptions = {
  endpoint: string
  unloading: boolean
  fetcher: typeof fetch
  sendBeacon?: typeof navigator.sendBeacon
}

export function createAnalyticsDeliveryQueue(storage: Pick<Storage, 'getItem' | 'setItem'>, storageKey: string) {
  let queue: AnalyticsQueueEvent[] = []
  let inFlight: Promise<void> | null = null
  try { queue = JSON.parse(storage.getItem(storageKey) ?? '[]').slice(-50) as AnalyticsQueueEvent[] } catch { queue = [] }

  const save = () => {
    queue = queue.slice(-50)
    try { storage.setItem(storageKey, JSON.stringify(queue)) } catch { /* quota/private mode */ }
  }
  const acknowledge = (batch: AnalyticsQueueEvent[]) => {
    const acknowledged = new Set(batch.map(({ eventId }) => eventId))
    queue = queue.filter(({ eventId }) => !acknowledged.has(eventId))
    save()
  }

  return {
    enqueue(event: AnalyticsQueueEvent) { queue.push(event); save() },
    clear() { queue = []; save() },
    size() { return queue.length },
    snapshot() { return [...queue] },
    flush(options: DeliveryOptions): Promise<void> {
      if (!queue.length) return inFlight ?? Promise.resolve()
      if (inFlight) return inFlight

      const deliver = async () => {
        do {
          const batch = queue.slice(0, 25)
          if (!batch.length) return
          const body = JSON.stringify({ events: batch })
          if (options.unloading && options.sendBeacon) {
            const sent = options.sendBeacon(options.endpoint, new Blob([body], { type: 'text/plain' }))
            if (sent) acknowledge(batch)
            return
          }
          try {
            const response = await options.fetcher(options.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body, credentials: 'omit', keepalive: true })
            if (!response.ok) return
            acknowledge(batch)
          } catch {
            return
          }
        } while (queue.length >= 10)
      }

      inFlight = deliver().finally(() => { inFlight = null })
      return inFlight
    },
  }
}

export type AnalyticsDeliveryQueue = ReturnType<typeof createAnalyticsDeliveryQueue>
