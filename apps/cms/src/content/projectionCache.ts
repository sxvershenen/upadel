import type { CollectionConfig, GlobalConfig, Payload, PayloadRequest } from 'payload'

export class ContentUnavailableError extends Error {
  readonly status = 404
  constructor() { super('Published content is unavailable.') }
}

/** Single-node cache; generations prevent an old read refilling it across a publication. */
export class ProjectionCache {
  private generation = 0
  private entries = new Map<string, { value: unknown; until: number; bytes: number }>()
  private pending = new Map<string, Promise<unknown>>()
  private bytes = 0
  readonly transactions = new Set<string | number>()
  constructor(private ttl = 60_000, private maxEntries = 128, private maxBytes = 8 * 1024 * 1024, private now = Date.now, private timeoutMs = 4_500) {}

  invalidate() {
    this.generation++
    this.entries.clear(); this.pending.clear(); this.bytes = 0
  }

  async read<T>(key: string, load: () => Promise<T>, preview = false): Promise<T> {
    const boundedLoad = async () => {
      let timer: ReturnType<typeof setTimeout> | undefined
      try {
        return await Promise.race([load(), new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('CMS read deadline exceeded.')), this.timeoutMs)
        })])
      } finally { clearTimeout(timer) }
    }
    if (preview) return boundedLoad()
    for (let attempt = 0; attempt < 3; attempt++) {
      const generation = this.generation
      const entry = this.entries.get(key)
      if (!this.transactions.size && entry && entry.until > this.now()) return entry.value as T
      if (entry) { this.entries.delete(key); this.bytes -= entry.bytes }
      let task = this.pending.get(key) as Promise<T> | undefined
      if (!task) {
        task = boundedLoad()
        if (this.pending.size < this.maxEntries) this.pending.set(key, task)
      }
      let value: T
      try { value = await task } catch (error) {
        if (generation !== this.generation) continue
        throw error
      } finally {
        if (this.pending.get(key) === task) this.pending.delete(key)
      }
      if (generation !== this.generation) continue
      if (!this.transactions.size) {
        const bytes = Buffer.byteLength(JSON.stringify(value) ?? '')
        if (bytes <= this.maxBytes) {
          while (this.entries.size && (this.entries.size >= this.maxEntries || this.bytes + bytes > this.maxBytes)) {
            const oldest = this.entries.keys().next().value!
            this.bytes -= this.entries.get(oldest)!.bytes; this.entries.delete(oldest)
          }
          const previous = this.entries.get(key)
          if (previous) this.bytes -= previous.bytes
          this.entries.set(key, { value, until: this.now() + this.ttl, bytes }); this.bytes += bytes
        }
      }
      return value
    }
    throw new Error('Content changed while loading; retry the request.')
  }
}

// Next route bundles must share invalidation with the Payload config bundle.
const runtime = globalThis as typeof globalThis & { __unlimProjectionCache?: ProjectionCache; __unlimWrappedDatabases?: WeakSet<object> }
export const projectionCache = runtime.__unlimProjectionCache ??= new ProjectionCache()
const wrappedDatabases = runtime.__unlimWrappedDatabases ??= new WeakSet<object>()

export async function markContentChanged(req: Pick<PayloadRequest, 'transactionID'>, cache = projectionCache) {
  const id = await req.transactionID
  if (id != null) cache.transactions.add(id)
  cache.invalidate()
}

export function installTransactionInvalidation(payload: Pick<Payload, 'db'>, cache = projectionCache) {
  const db = payload.db
  if (wrappedDatabases.has(db)) return
  wrappedDatabases.add(db)
  for (const method of ['commitTransaction', 'rollbackTransaction'] as const) {
    const original = db[method]
    db[method] = async function (...args) {
      const id = await args[0]
      try { return await original.apply(this, args) } finally {
        if (cache.transactions.delete(id)) cache.invalidate()
      }
    }
  }
}

export function invalidateCollectionContent(collection: CollectionConfig): CollectionConfig {
  return { ...collection, hooks: { ...collection.hooks,
    afterChange: [...collection.hooks?.afterChange ?? [], async ({ doc, req }) => { await markContentChanged(req); return doc }],
    afterDelete: [...collection.hooks?.afterDelete ?? [], async ({ doc, req }) => { await markContentChanged(req); return doc }],
  } }
}

export function invalidateGlobalContent(global: GlobalConfig): GlobalConfig {
  return { ...global, hooks: { ...global.hooks,
    afterChange: [...global.hooks?.afterChange ?? [], async ({ doc, req }) => { await markContentChanged(req); return doc }],
  } }
}

export function publicProjectionError(error: unknown, route: string): Response {
  // No exception message, SQL, credentials or request query string reaches the client/log.
  const status = error instanceof ContentUnavailableError ? 404 : 503
  if (status !== 404) console.error('Public projection failed.', { route, name: error instanceof Error ? error.name : 'UnknownError' })
  return Response.json({ error: status === 404 ? 'Not found.' : 'Content temporarily unavailable.' }, { status, headers: { 'Cache-Control': 'no-store' } })
}
