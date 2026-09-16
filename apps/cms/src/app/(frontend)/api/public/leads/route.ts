import { createHash } from 'node:crypto'

import config from '@payload-config'
import { getPayload } from 'payload'
import { sanitizeAnalyticsEvent } from '@/analytics/contract'
import { detectClient, persistAnalyticsEvent } from '@/analytics/ingest'
import { parseLeadSubmission } from '@/leads/validation'
import { deliverOnlyForNewLead, notifyAndRecord } from '@/notifications/leadNotifications'

export const dynamic = 'force-dynamic'
const rate = new Map<string, { count: number; resetAt: number }>()

function allowedOrigin(origin: string | null): boolean {
  if (!origin) return true
  const configured = [process.env.PUBLIC_WEB_URL, ...(process.env.LEAD_ALLOWED_ORIGINS ?? '').split(',')].filter(Boolean).map((value) => new URL(value!).origin)
  return configured.includes(origin)
}
function cors(origin: string | null): HeadersInit { return origin && allowedOrigin(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {} }
function limited(request: Request): boolean {
  const raw = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
  const key = createHash('sha256').update(raw).digest('hex')
  const now = Date.now(); const current = rate.get(key)
  if (!current || current.resetAt <= now) { rate.set(key, { count: 1, resetAt: now + 10 * 60_000 }); return false }
  current.count += 1
  return current.count > 8
}

export async function OPTIONS(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  if (!allowedOrigin(origin)) return new Response(null, { status: 403 })
  return new Response(null, { status: 204, headers: { ...cors(origin), 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } })
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  const headers = { ...cors(origin), 'Cache-Control': 'no-store' }
  if (!allowedOrigin(origin) || limited(request)) return Response.json({ ok: false, error: 'Не удалось отправить обращение.' }, { status: allowedOrigin(origin) ? 429 : 403, headers })
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return Response.json({ ok: false, error: 'Некорректный запрос.' }, { status: 415, headers })
  try {
    const raw = await request.text()
    if (raw.length > 12_000) return Response.json({ ok: false, error: 'Некорректный запрос.' }, { status: 413, headers })
    const input = JSON.parse(raw) as Record<string, unknown>
    const submission = parseLeadSubmission(input)
    if (!submission) return Response.json({ ok: false, error: 'Проверьте заполненные поля и согласие.' }, { status: 400, headers })
    const { name, phone, email, telegram, vk, comment, type, sourcePage, sourceEntity, idempotencyKey } = submission
    const payload = await getPayload({ config })
    const analyticsInput = input.analytics && typeof input.analytics === 'object' ? input.analytics as Record<string, unknown> : null
    const analyticsEvent = analyticsInput ? sanitizeAnalyticsEvent({ ...analyticsInput, name: 'form_submit_success', path: sourcePage, objectType: 'form', objectId: sourceEntity || type, formType: type, actionKind: 'lead', value: null, metricName: '' }) : null
    const existing = await payload.find({ collection: 'leads', limit: 1, depth: 0, overrideAccess: true, where: { idempotencyKey: { equals: idempotencyKey } } })
    if (existing.docs.length) {
      await deliverOnlyForNewLead(true, async () => notifyAndRecord(payload, existing.docs[0]))
      if (analyticsEvent) await persistAnalyticsEvent(payload, analyticsEvent, request.headers.get('user-agent') ?? 'Other', existing.docs[0].id).catch(() => undefined)
      return Response.json({ ok: true, duplicate: true }, { status: 200, headers })
    }
    const client = detectClient(request.headers.get('user-agent') ?? '')
    const lead = await payload.create({ collection: 'leads', overrideAccess: true, data: { type, status: 'new', name, phone: phone || null, email: email || null, telegram: telegram || null, vk: vk || null, comment: comment || null, sourcePage, sourceEntity: sourceEntity || null, idempotencyKey, analyticsAnonymousId: analyticsEvent?.anonymousId || null, analyticsSessionId: analyticsEvent?.sessionId || null, analyticsChannel: analyticsEvent?.currentSource.channel || null, analyticsDevice: analyticsEvent ? client.device : null, analyticsLanguage: analyticsEvent?.language || null } as never })
    if (analyticsEvent) await persistAnalyticsEvent(payload, analyticsEvent, request.headers.get('user-agent') ?? 'Other', lead.id).catch(() => undefined)
    await deliverOnlyForNewLead(false, async () => notifyAndRecord(payload, lead)).catch(() => undefined)
    return Response.json({ ok: true, duplicate: false }, { status: 201, headers })
  } catch {
    return Response.json({ ok: false, error: 'Не удалось отправить обращение.' }, { status: 400, headers })
  }
}
