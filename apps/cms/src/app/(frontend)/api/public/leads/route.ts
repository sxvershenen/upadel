import { BodyReadError, createRateLimiter, readBoundedText } from '@/http/requestPolicy'
import { persistLead } from '@/leads/persistLead'

import config from '@payload-config'
import { getPayload } from 'payload'
import { sanitizeAnalyticsEvent } from '@/analytics/contract'
import { detectClient, persistAnalyticsEvent } from '@/analytics/ingest'
import { isLeadHoneypotTriggered, parseLeadSubmission } from '@/leads/validation'
import { deliverOnlyForNewLead, notifyAndRecord } from '@/notifications/leadNotifications'

export const dynamic = 'force-dynamic'
const limited = createRateLimiter(8, 10 * 60_000)

function allowedOrigin(origin: string | null): boolean {
  if (!origin) return true
  const configured = [process.env.PUBLIC_WEB_URL, ...(process.env.LEAD_ALLOWED_ORIGINS ?? '').split(',')].flatMap((value) => { try { return value ? [new URL(value).origin] : [] } catch { return [] } })
  return configured.includes(origin)
}
function cors(origin: string | null): HeadersInit { return origin && allowedOrigin(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {} }

export async function OPTIONS(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  if (!allowedOrigin(origin)) return new Response(null, { status: 403 })
  return new Response(null, { status: 204, headers: { ...cors(origin), 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } })
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  const headers = { ...cors(origin), 'Cache-Control': 'no-store' }
  if (!allowedOrigin(origin) || limited(request.headers)) return Response.json({ ok: false, error: 'Не удалось отправить обращение.' }, { status: allowedOrigin(origin) ? 429 : 403, headers })
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return Response.json({ ok: false, error: 'Некорректный запрос.' }, { status: 415, headers })
  try {
    const raw = await readBoundedText(request, 12_000)
    const input = JSON.parse(raw) as Record<string, unknown>
    if (!input || typeof input !== 'object' || Array.isArray(input)) return Response.json({ ok: false, error: 'Некорректный запрос.' }, { status: 400, headers })
    if (isLeadHoneypotTriggered(input)) return Response.json({ ok: true, accepted: false }, { status: 200, headers })
    const submission = parseLeadSubmission(input)
    if (!submission) return Response.json({ ok: false, error: 'Проверьте заполненные поля и согласие.' }, { status: 400, headers })
    const { name, phone, email, telegram, vk, comment, type, sourcePage, sourceEntity, idempotencyKey } = submission
    const payload = await getPayload({ config })
    const analyticsInput = input.analytics && typeof input.analytics === 'object' ? input.analytics as Record<string, unknown> : null
    const analyticsEvent = analyticsInput ? sanitizeAnalyticsEvent({ ...analyticsInput, name: 'form_submit_success', path: sourcePage, objectType: 'form', objectId: sourceEntity || type, formType: type, actionKind: 'lead', value: null, metricName: '' }) : null
    const client = detectClient(request.headers.get('user-agent') ?? '')
    const { lead, duplicate } = await persistLead(payload, { type, status: 'new', name, phone: phone || null, email: email || null, telegram: telegram || null, vk: vk || null, comment: comment || null, sourcePage, sourceEntity: sourceEntity || null, idempotencyKey, analyticsAnonymousId: analyticsEvent?.anonymousId || null, analyticsSessionId: analyticsEvent?.sessionId || null, analyticsChannel: analyticsEvent?.currentSource.channel || null, analyticsDevice: analyticsEvent ? client.device : null, analyticsLanguage: analyticsEvent?.language || null })
    if (analyticsEvent) await persistAnalyticsEvent(payload, analyticsEvent, request.headers.get('user-agent') ?? 'Other', lead.id).catch(() => undefined)
    await deliverOnlyForNewLead(duplicate, async () => notifyAndRecord(payload, lead)).catch(() => undefined)
    return Response.json({ ok: true, duplicate }, { status: duplicate ? 200 : 201, headers })
  } catch (error) {
    if (!(error instanceof BodyReadError) && !(error instanceof SyntaxError)) console.error('Lead submission failed.', { name: error instanceof Error ? error.name : 'UnknownError' })
    return Response.json({ ok: false, error: 'Не удалось отправить обращение.' }, { status: error instanceof BodyReadError ? error.status : error instanceof SyntaxError ? 400 : 503, headers })
  }
}
