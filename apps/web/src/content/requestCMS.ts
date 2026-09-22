export class CMSReadError extends Error {
  constructor(message: string, readonly status = 503, readonly retryable = false) { super(message) }
}

type Entry = { value: unknown; receivedAt: number; bytes: number }

/** Always contacts CMS. Last-good data is only an outage fallback, never a fresh TTL. */
export function createCMSReader({ fetcher = fetch, now = Date.now, timeoutMs = 5_000, fallbackMs = 120_000, maxEntries = 64, maxBytes = 8 * 1024 * 1024 } = {}) {
  const previous = new Map<string, Entry>()
  const latest = new Map<string, symbol>()
  let bytes = 0
  const remove = (key: string) => { bytes -= previous.get(key)?.bytes ?? 0; previous.delete(key) }

  return async function read<T>(url: URL, parse: (input: unknown) => T, { preview = false, fallback = true }: { preview?: boolean; fallback?: boolean } = {}): Promise<T> {
    const key = url.toString()
    const sequence = Symbol(key)
    if (!preview) {
      latest.delete(key)
      if (latest.size >= maxEntries) latest.delete(latest.keys().next().value!)
      latest.set(key, sequence)
    }
    const isLatest = () => latest.get(key) === sequence
    const task = (async () => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)
      try {
        let response: Response
        try { response = await fetcher(url, { headers: { Accept: 'application/json' }, cache: 'no-store', signal: controller.signal }) }
        catch { throw new CMSReadError('CMS is temporarily unreachable.', 503, true) }
        if (!response.ok) throw new CMSReadError(`CMS returned HTTP ${response.status}.`, response.status, [502, 503, 504].includes(response.status))
        let value: T
        try { value = parse(await response.json()) }
        catch { throw new CMSReadError('CMS returned invalid content.', 503, controller.signal.aborted) }
        if (!preview && isLatest()) {
          const size = new TextEncoder().encode(JSON.stringify(value)).length
          remove(key)
          for (const [entryKey, entry] of previous) if (now() - entry.receivedAt > fallbackMs) remove(entryKey)
          if (fallback && size <= maxBytes) {
            while (previous.size && (previous.size >= maxEntries || bytes + size > maxBytes)) remove(previous.keys().next().value!)
            previous.set(key, { value, receivedAt: now(), bytes: size }); bytes += size
          }
        }
        return value
      } catch (error) {
        const stored = !preview && fallback ? previous.get(key) : undefined
        if (error instanceof CMSReadError && error.retryable && stored && now() - stored.receivedAt <= fallbackMs) return stored.value as T
        if (!preview && isLatest()) remove(key)
        throw error
      } finally { clearTimeout(timer) }
    })()
    try { return structuredClone(await task) } finally { if (isLatest()) latest.delete(key) }
  }
}

export const requestCMS = createCMSReader()
