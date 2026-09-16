type CacheEntry<T> = {
  expiresAt: number
  lastAccessAt: number
  value: T
}

type RequestCacheOptions = {
  maxEntries?: number
  ttlMs?: number
}

export type CachedValue<T> = {
  expiresAt: number
  fresh: boolean
  value: T
}

export function createAdminRequestCache<T>({ maxEntries = 32, ttlMs = 60_000 }: RequestCacheOptions = {}) {
  const values = new Map<string, CacheEntry<T>>()
  const pending = new Map<string, Promise<T>>()

  const prune = () => {
    while (values.size > maxEntries) {
      const oldest = [...values.entries()].sort(([, left], [, right]) => left.lastAccessAt - right.lastAccessAt)[0]
      if (!oldest) return
      values.delete(oldest[0])
    }
  }

  const read = (key: string): CachedValue<T> | null => {
    const entry = values.get(key)
    if (!entry) return null
    entry.lastAccessAt = Date.now()
    return { expiresAt: entry.expiresAt, fresh: entry.expiresAt > Date.now(), value: entry.value }
  }

  const request = (key: string, loader: () => Promise<T>): Promise<T> => {
    const cached = read(key)
    if (cached?.fresh) return Promise.resolve(cached.value)

    const existing = pending.get(key)
    if (existing) return existing

    const promise = loader().then((value) => {
      values.set(key, { expiresAt: Date.now() + ttlMs, lastAccessAt: Date.now(), value })
      prune()
      return value
    }).finally(() => pending.delete(key))
    pending.set(key, promise)
    return promise
  }

  return {
    clear: () => { values.clear(); pending.clear() },
    read,
    request,
  }
}
