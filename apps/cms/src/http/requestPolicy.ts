import { createHash } from 'node:crypto'
import { isIP } from 'node:net'

/** Nginx (or the same-origin LAN proxy) overwrites X-Real-IP. Never trust client XFF. */
export function clientAddress(headers: Headers): string {
  const address = headers.get('x-real-ip')?.trim() ?? ''
  return isIP(address) ? address : 'unknown'
}

export function createRateLimiter(limit: number, windowMs: number, maxKeys = 10_000, now = Date.now) {
  const buckets = new Map<string, { count: number; expires: number }>()
  let sweepAt = 0
  return (headers: Headers): boolean => {
    const time = now()
    if (time >= sweepAt) {
      for (const [key, bucket] of buckets) if (bucket.expires <= time) buckets.delete(key)
      sweepAt = time + Math.min(windowMs, 60_000)
    }
    const key = createHash('sha256').update(clientAddress(headers)).digest('hex')
    const bucket = buckets.get(key)
    if (bucket && bucket.expires > time) return ++bucket.count > limit
    buckets.delete(key)
    while (buckets.size >= maxKeys) buckets.delete(buckets.keys().next().value!)
    buckets.set(key, { count: 1, expires: time + windowMs })
    return false
  }
}

export class BodyReadError extends Error {
  constructor(readonly status: number) { super('Invalid request body.') }
}

export async function readBoundedText(request: Request, maxBytes: number, timeoutMs = 5_000): Promise<string> {
  const length = request.headers.get('content-length')
  if (length && (!/^\d+$/.test(length) || Number(length) > maxBytes)) throw new BodyReadError(413)
  if (!request.body) return ''
  const reader = request.body.getReader()
  let timer: ReturnType<typeof setTimeout> | undefined
  let finished = false
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => { reject(new BodyReadError(408)); void reader.cancel().catch(() => {}) }, timeoutMs)
  })
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true })
    let size = 0; let text = ''
    for (;;) {
      const { done, value } = await Promise.race([reader.read(), deadline])
      if (done) { finished = true; return text + decoder.decode() }
      size += value.byteLength
      if (size > maxBytes) throw new BodyReadError(413)
      text += decoder.decode(value, { stream: true })
    }
  } catch (error) {
    throw error instanceof BodyReadError ? error : new BodyReadError(400)
  } finally {
    clearTimeout(timer)
    if (!finished) void reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}
