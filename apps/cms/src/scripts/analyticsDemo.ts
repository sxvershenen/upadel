import config from '@payload-config'
import { getPayload } from 'payload'

import { aggregateDate, moscowDate } from '../analytics/aggregate'
import { sanitizeAnalyticsEvent, type AnalyticsEventName } from '../analytics/contract'
import { persistAnalyticsEvent } from '../analytics/ingest'

const DAY = 86_400_000
const payload = await getPayload({ config })
const demoVersion = 'analytics-demo-v1'
const userAgents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/126.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0',
]
const paths = ['/', '/prices', '/training', '/tournaments', '/blog/first-visit']
const channels = ['direct', 'campaign', 'social', 'referral'] as const

function dateDaysAgo(days: number): string {
  return moscowDate(new Date(Date.now() - days * DAY))
}

function source(dayIndex: number, visitorIndex: number) {
  const channel = channels[(dayIndex + visitorIndex) % channels.length]
  const campaign = channel === 'campaign' ? visitorIndex % 2 === 0 ? 'trial-training' : 'autumn-open' : ''
  return {
    channel,
    source: channel === 'direct' ? '' : channel === 'social' ? 'vk' : channel === 'referral' ? 'google' : 'yandex',
    medium: channel === 'direct' ? '' : channel === 'social' ? 'social' : channel === 'referral' ? 'organic' : 'cpc',
    campaign,
    content: '',
    term: '',
    referrerDomain: channel === 'referral' ? 'google.com' : channel === 'social' ? 'vk.com' : '',
    clickIdType: '',
    clickId: '',
  } as const
}

function event(
  name: AnalyticsEventName,
  eventId: string,
  anonymousId: string,
  sessionId: string,
  occurredAt: Date,
  dayIndex: number,
  visitorIndex: number,
  extra: Record<string, unknown> = {},
) {
  const currentSource = source(dayIndex, visitorIndex)
  const sanitized = sanitizeAnalyticsEvent({
    eventId,
    anonymousId,
    sessionId,
    pageViewId: `${sessionId}-pageview`,
    schemaVersion: 1,
    occurredAt: occurredAt.toISOString(),
    name,
    path: paths[(dayIndex + visitorIndex) % paths.length],
    title: 'UNLIM Riga Padel — демо аналитики',
    language: 'ru',
    consentState: 'accepted',
    currentSource,
    firstSource: currentSource,
    ...extra,
  }, new Date(occurredAt.valueOf() + 60 * 60_000))
  if (!sanitized) throw new Error(`Не удалось подготовить демо-событие ${eventId}.`)
  return sanitized
}

async function ensureLead(idempotencyKey: string, sessionId: string, path: string, visitorIndex: number, occurredAt: Date): Promise<number | string> {
  const found = await payload.find({
    collection: 'leads',
    limit: 1,
    depth: 0,
    overrideAccess: true,
    where: { idempotencyKey: { equals: idempotencyKey } },
  } as never) as unknown as { docs: Array<{ id: number | string }> }
  if (found.docs[0]) {
    await payload.update({ collection: 'leads', id: found.docs[0].id, overrideAccess: true, data: { createdAt: occurredAt.toISOString(), updatedAt: occurredAt.toISOString() } } as never)
    return found.docs[0].id
  }
  const created = await payload.create({
    collection: 'leads',
    overrideAccess: true,
    data: {
      type: visitorIndex % 2 === 0 ? 'gift' : 'trial',
      status: 'new',
      name: `Демо посетитель ${visitorIndex + 1}`,
      email: `${idempotencyKey}@example.test`,
      sourcePage: path,
      sourceEntity: 'analytics-demo',
      idempotencyKey,
      analyticsAnonymousId: `${demoVersion}-browser-${String(visitorIndex % 12).padStart(2, '0')}`,
      analyticsSessionId: sessionId,
      analyticsChannel: 'campaign',
      analyticsDevice: visitorIndex % 3 === 1 ? 'mobile' : 'desktop',
      analyticsLanguage: 'ru',
      createdAt: occurredAt.toISOString(),
      updatedAt: occurredAt.toISOString(),
    },
  } as never) as unknown as { id: number | string }
  await payload.update({ collection: 'leads', id: created.id, overrideAccess: true, data: { createdAt: occurredAt.toISOString(), updatedAt: occurredAt.toISOString() } } as never)
  return created.id
}

async function run() {
  let eventCount = 0
  let leadCount = 0
  for (let dayIndex = 0; dayIndex < 30; dayIndex += 1) {
    const date = dateDaysAgo(dayIndex + 1)
    const visitors = 8 + (dayIndex % 5)
    for (let visitorIndex = 0; visitorIndex < visitors; visitorIndex += 1) {
      const anonymousId = `${demoVersion}-browser-${String(visitorIndex % 12).padStart(2, '0')}`
      const sessionId = `${demoVersion}-${date}-${String(visitorIndex).padStart(2, '0')}`
      const base = new Date(`${date}T${String(8 + (visitorIndex % 10)).padStart(2, '0')}:00:00.000Z`)
      const path = paths[(dayIndex + visitorIndex) % paths.length]
      const page = event('page_view', `${demoVersion}-${date}-${visitorIndex}-page`, anonymousId, sessionId, base, dayIndex, visitorIndex, { path })
      await persistAnalyticsEvent(payload, page, userAgents[visitorIndex % userAgents.length]!)
      eventCount += 1

      const active = event('active_time', `${demoVersion}-${date}-${visitorIndex}-active`, anonymousId, sessionId, new Date(base.valueOf() + 60_000), dayIndex, visitorIndex, { path, value: 35_000 + (visitorIndex % 4) * 5_000 })
      await persistAnalyticsEvent(payload, active, userAgents[visitorIndex % userAgents.length]!)
      eventCount += 1

      if (visitorIndex % 3 === 0) {
        const click = event('cta_click', `${demoVersion}-${date}-${visitorIndex}-booking`, anonymousId, sessionId, new Date(base.valueOf() + 3 * 60_000), dayIndex, visitorIndex, { path, objectType: 'booking', objectId: 'demo-booking', actionKind: 'booking' })
        await persistAnalyticsEvent(payload, click, userAgents[visitorIndex % userAgents.length]!)
        eventCount += 1
      }

      if (visitorIndex % 5 === 0) {
        const leadKey = `${demoVersion}-${date}-${visitorIndex}-lead`
        const lead = await ensureLead(leadKey, sessionId, path, visitorIndex, new Date(base.valueOf() + 8 * 60_000))
        leadCount += 1
        for (const [stepIndex, name] of (['form_view', 'form_start', 'form_submit_attempt', 'form_submit_success'] as const).entries()) {
          const formEvent = event(name, `${demoVersion}-${date}-${visitorIndex}-form-${stepIndex}`, anonymousId, sessionId, new Date(base.valueOf() + (5 + stepIndex) * 60_000), dayIndex, visitorIndex, { path, objectType: 'form', objectId: 'demo-gift', formType: 'gift', actionKind: name === 'form_submit_success' ? 'lead' : '' })
          await persistAnalyticsEvent(payload, formEvent, userAgents[visitorIndex % userAgents.length]!, name === 'form_submit_success' ? lead : undefined)
          eventCount += 1
        }
      }
    }
    await aggregateDate(payload, date)
  }
  const newestDemoDate = dateDaysAgo(1)
  const newestFirstSeenAt = new Date(`${newestDemoDate}T10:00:00.000Z`).toISOString()
  const browserRows = await payload.find({ collection: 'analytics-browsers', limit: 20, pagination: false, depth: 0, overrideAccess: true, where: { anonymousId: { like: `${demoVersion}-browser-%` } } } as never) as unknown as { docs: Array<{ id: number | string; anonymousId: string }> }
  for (const browser of browserRows.docs) {
    if (Number(browser.anonymousId.slice(-2)) < 6) {
      await payload.update({ collection: 'analytics-browsers', id: browser.id, overrideAccess: true, data: { firstSeenAt: newestFirstSeenAt } } as never)
    }
  }
  for (let dayIndex = 0; dayIndex < 30; dayIndex += 1) await aggregateDate(payload, dateDaysAgo(dayIndex + 1))
  payload.logger.info({ demoVersion, eventCount, leadCount }, 'Analytics demo data is ready.')
}

try {
  await run()
} finally {
  await payload.destroy()
}
