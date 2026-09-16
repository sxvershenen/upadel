import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import config from '@payload-config'
import { getPayload } from 'payload'

import { aggregateDate, aggregateRecent, moscowDate } from '../analytics/aggregate'
import { sanitizeAnalyticsEvent, type AnalyticsEventName } from '../analytics/contract'
import { persistAnalyticsEvent } from '../analytics/ingest'
import { analyticsReport } from '../analytics/report'

const payload = await getPayload({ config })
const marker = `analytics-it-${Date.now()}-${randomBytes(5).toString('hex')}`
const anonymousId = `${marker}-browser`; const sessionId = `${marker}-session`; const path = `/__${marker}`; const date = moscowDate(new Date())
const eventIDs: string[] = []; let leadID: number | string | null = null
const event = (name: AnalyticsEventName, suffix: string, extra: Record<string, unknown> = {}) => {
  const eventId = `${marker}-${suffix}`; eventIDs.push(eventId)
  const sanitized = sanitizeAnalyticsEvent({ eventId, anonymousId, sessionId, pageViewId: `${marker}-pageview`, schemaVersion: 1, occurredAt: new Date().toISOString(), name, path, title: 'Analytics integration fixture', language: 'ru', consentState: 'accepted', currentSource: { channel: 'campaign', source: marker, medium: 'integration', campaign: marker }, firstSource: { channel: 'campaign', source: marker, medium: 'integration', campaign: marker }, ...extra })
  assert.ok(sanitized); return sanitized
}

try {
  const page = event('page_view', 'page')
  assert.equal(await persistAnalyticsEvent(payload, page, 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120'), 'created')
  assert.equal(await persistAnalyticsEvent(payload, page, 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120'), 'duplicate')
  const initialBrowser = await payload.find({ collection: 'analytics-browsers', limit: 1, depth: 0, overrideAccess: true, where: { anonymousId: { equals: anonymousId } } })
  await payload.update({ collection: 'analytics-browsers', id: initialBrowser.docs[0]!.id, overrideAccess: true, data: { firstSourceCapturedAt: new Date(Date.now() - 61 * 86_400_000).toISOString() } })
  await persistAnalyticsEvent(payload, event('cta_click', 'renewed-source', { actionKind: 'external', firstSource: { channel: 'social', source: 'vk', medium: 'social', campaign: `${marker}-renewed` } }), 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120')
  await aggregateDate(payload, date)
  const late = event('cta_click', 'late', { actionKind: 'booking' })
  await persistAnalyticsEvent(payload, late, 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120')
  const lateResults = await aggregateRecent(payload)
  assert.ok(lateResults.some((item) => item.date === date && item.rawEvents >= 2))
  const lateStored = await payload.find({ collection: 'analytics-events', limit: 1, depth: 0, overrideAccess: true, where: { eventId: { equals: late.eventId } } })
  assert.ok(lateStored.docs[0]?.aggregatedAt)
  const lead = await payload.create({ collection: 'leads', overrideAccess: true, data: { type: 'gift', status: 'new', name: 'Analytics Integration Fixture', email: `${marker}@example.test`, sourcePage: '/prices', sourceEntity: marker, idempotencyKey: marker, analyticsAnonymousId: anonymousId, analyticsSessionId: sessionId, analyticsChannel: 'campaign', analyticsDevice: 'desktop', analyticsLanguage: 'ru' } })
  leadID = lead.id
  for (const [index, name] of (['form_view', 'form_start', 'form_submit_attempt', 'form_submit_success'] as const).entries()) {
    await persistAnalyticsEvent(payload, event(name, `form-${index}`, { formType: 'gift', objectType: 'form', objectId: marker, actionKind: name === 'form_submit_success' ? 'lead' : '' }), 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120', name === 'form_submit_success' ? lead.id : undefined)
  }
  await aggregateDate(payload, date)
  const report = await analyticsReport(payload, { from: date, to: date }, 'previous', { channel: 'campaign', device: 'desktop', language: 'ru' })
  assert.equal(report.kpis.leads.value, 1)
  assert.deepEqual(report.funnel.map((step) => step.sessions), [1, 1, 1, 1])
  const browser = await payload.find({ collection: 'analytics-browsers', limit: 1, depth: 0, overrideAccess: true, where: { anonymousId: { equals: anonymousId } } })
  assert.equal(browser.docs[0]?.firstCampaign, `${marker}-renewed`)
  const session = await payload.find({ collection: 'analytics-sessions', limit: 1, depth: 0, overrideAccess: true, where: { sessionId: { equals: sessionId } } })
  assert.ok(session.docs[0]?.endedAt && new Date(session.docs[0].endedAt) > new Date(session.docs[0].lastActivityAt))
  payload.logger.info({ marker }, 'Analytics DB integration fixture passed.')
} finally {
  await payload.delete({ collection: 'analytics-events', overrideAccess: true, where: { eventId: { in: eventIDs } } }).catch(() => undefined)
  await payload.delete({ collection: 'analytics-sessions', overrideAccess: true, where: { sessionId: { equals: sessionId } } }).catch(() => undefined)
  await payload.delete({ collection: 'analytics-browsers', overrideAccess: true, where: { anonymousId: { equals: anonymousId } } }).catch(() => undefined)
  if (leadID !== null) await payload.delete({ collection: 'leads', id: leadID, overrideAccess: true }).catch(() => undefined)
  await aggregateDate(payload, date).catch(() => undefined)
}
process.exit(0)
