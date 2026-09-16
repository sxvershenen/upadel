import { createHash, randomBytes } from 'node:crypto'

import config from '@payload-config'
import { getPayload } from 'payload'

import { sanitizeAnalyticsEvent } from '@/analytics/contract'
import { persistAnalyticsEvent } from '@/analytics/ingest'

export const dynamic = 'force-dynamic'
const rate = new Map<string, { count: number; resetAt: number }>()
const rateSecret = randomBytes(32)
const BOT = /bot|crawler|spider|headless|preview|lighthouse|pagespeed|facebookexternalhit|slurp/i

function configuredOrigins(): string[] {
  return [process.env.PUBLIC_WEB_URL, ...(process.env.ANALYTICS_ALLOWED_ORIGINS ?? '').split(',')].flatMap((value) => {
    try { return value ? [new URL(value).origin] : [] } catch { return [] }
  })
}
function allowedOrigin(origin: string | null): origin is string { return Boolean(origin && configuredOrigins().includes(origin)) }
function cors(origin: string | null): HeadersInit { return allowedOrigin(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {} }
function clientLimited(request: Request): boolean {
  const address = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
  const key = createHash('sha256').update(rateSecret).update(address).digest('hex')
  const now = Date.now(); const current = rate.get(key)
  if (!current || current.resetAt <= now) { rate.set(key, { count: 1, resetAt: now + 60_000 }); return false }
  current.count += 1
  return current.count > 120
}
function response(status: number, origin: string | null, body: Record<string, unknown>): Response {
  return Response.json(body, { status, headers: { ...cors(origin), 'Cache-Control': 'no-store' } })
}

export async function OPTIONS(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  if (!allowedOrigin(origin)) return new Response(null, { status: 403 })
  return new Response(null, { status: 204, headers: { ...cors(origin), 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Max-Age': '600' } })
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  if (!allowedOrigin(origin)) return response(403, origin, { ok: false })
  if (clientLimited(request)) return response(429, origin, { ok: false })
  const contentType = request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase()
  if (contentType !== 'application/json' && contentType !== 'text/plain') return response(415, origin, { ok: false })
  const userAgent = request.headers.get('user-agent') ?? ''
  if (!userAgent || userAgent.length > 500) return response(400, origin, { ok: false })
  if (BOT.test(userAgent)) return response(202, origin, { ok: true, accepted: 0, ignored: true })
  try {
    const raw = await request.text()
    if (raw.length > 64_000) return response(413, origin, { ok: false })
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Object.keys(parsed).length !== 1 || !('events' in parsed) || !Array.isArray((parsed as { events: unknown }).events)) return response(400, origin, { ok: false })
    const values = (parsed as { events: unknown[] }).events
    if (values.length < 1 || values.length > 25) return response(400, origin, { ok: false })
    const events = values.map((value) => sanitizeAnalyticsEvent(value))
    if (events.some((event) => !event)) return response(400, origin, { ok: false })
    const payload = await getPayload({ config })
    let accepted = 0; let duplicates = 0
    for (const event of events) {
      const outcome = await persistAnalyticsEvent(payload, event!, userAgent)
      if (outcome === 'created') accepted += 1
      else duplicates += 1
    }
    return response(202, origin, { ok: true, accepted, duplicates })
  } catch {
    return response(400, origin, { ok: false })
  }
}
