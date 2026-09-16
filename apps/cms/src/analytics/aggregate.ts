import { createHash } from 'node:crypto'
import type { Payload } from 'payload'

import { addHLL, createHLL, serializeHLL } from './hll'
import { orderedFunnel, type FunnelInput } from './funnel'

const DAY_MS = 86_400_000
const MOSCOW_OFFSET_MS = 3 * 60 * 60_000

export function moscowDate(value: Date | string): string {
  return new Date(new Date(value).valueOf() + MOSCOW_OFFSET_MS).toISOString().slice(0, 10)
}

export function utcRangeForMoscowDate(date: string): { from: string; to: string } {
  const midnight = Date.parse(`${date}T00:00:00.000Z`) - MOSCOW_OFFSET_MS
  return { from: new Date(midnight).toISOString(), to: new Date(midnight + DAY_MS - 1).toISOString() }
}

export function completedRawRetentionCutoff(now: Date): string {
  return utcRangeForMoscowDate(moscowDate(new Date(now.valueOf() - 90 * DAY_MS))).from
}

type RawEvent = Record<string, unknown>
type Bucket = {
  keyParts: Record<string, string>
  eventCount: number
  activeMs: number
  exactLeadCount: number
  rawEventCount: number
  browserHll: ReturnType<typeof createHLL>
  sessionHll: ReturnType<typeof createHLL>
}

function value(event: RawEvent, key: string): string { return String(event[key] ?? '') }

function eventDimensions(event: RawEvent, date: string, firstSeen: Map<string, string>, eventName = value(event, 'name')): Record<string, string> {
  return {
    eventName, path: value(event, 'path'), objectType: value(event, 'objectType'), objectId: value(event, 'objectId'),
    actionKind: value(event, 'actionKind'), formType: value(event, 'formType'), channel: value(event, 'channel') || 'direct', source: value(event, 'source'),
    medium: value(event, 'medium'), campaign: value(event, 'campaign'), referrerDomain: value(event, 'referrerDomain'), firstChannel: value(event, 'firstChannel'), firstSource: value(event, 'firstSource'), firstMedium: value(event, 'firstMedium'), firstCampaign: value(event, 'firstCampaign'), device: value(event, 'device'),
    language: value(event, 'language'), visitorType: firstSeen.get(value(event, 'anonymousId')) === date ? 'new' : 'returning', os: value(event, 'os'), osVersion: value(event, 'osVersion'),
  }
}

function addToBucket(buckets: Map<string, Bucket>, date: string, event: RawEvent, keyParts: Record<string, string>, raw: boolean): void {
  const aggregateKey = createHash('sha256').update(JSON.stringify([date, ...Object.values(keyParts)])).digest('hex')
  let bucket = buckets.get(aggregateKey)
  if (!bucket) {
    bucket = { keyParts, eventCount: 0, activeMs: 0, exactLeadCount: 0, rawEventCount: 0, browserHll: createHLL(), sessionHll: createHLL() }
    buckets.set(aggregateKey, bucket)
  }
  bucket.eventCount += 1
  if (raw) {
    bucket.rawEventCount += 1
    if (keyParts.eventName === 'active_time') bucket.activeMs += Number(event.value ?? 0)
    if (keyParts.eventName === 'form_submit_success' && event.lead) bucket.exactLeadCount += 1
  }
  addHLL(bucket.browserHll, value(event, 'anonymousId')); addHLL(bucket.sessionHll, value(event, 'sessionId'))
}

export async function aggregateDate(payload: Payload, date: string): Promise<{ date: string; rawEvents: number; rows: number }> {
  const range = utcRangeForMoscowDate(date)
  const result = await payload.find({ collection: 'analytics-events', depth: 0, pagination: false, overrideAccess: true, sort: 'occurredAt', where: { and: [{ occurredAt: { greater_than_equal: range.from } }, { occurredAt: { less_than_equal: range.to } }] } })
  const events = result.docs as unknown as RawEvent[]
  const anonymousIDs = [...new Set(events.map((event) => value(event, 'anonymousId')))]
  const firstSeen = new Map<string, string>()
  for (let index = 0; index < anonymousIDs.length; index += 100) {
    const ids = anonymousIDs.slice(index, index + 100)
    if (!ids.length) continue
    const browsers = await payload.find({ collection: 'analytics-browsers', depth: 0, pagination: false, overrideAccess: true, where: { anonymousId: { in: ids } } })
    for (const browser of browsers.docs as unknown as RawEvent[]) firstSeen.set(value(browser, 'anonymousId'), moscowDate(value(browser, 'firstSeenAt')))
  }
  const buckets = new Map<string, Bucket>()
  for (const event of events) {
    addToBucket(buckets, date, event, eventDimensions(event, date, firstSeen), true)
  }
  const formSteps = ['form_view', 'form_start', 'form_submit_attempt', 'form_submit_success']
  const sessionIDs = [...new Set(events.filter((event) => formSteps.includes(value(event, 'name'))).map((event) => value(event, 'sessionId')))]
  const funnelContext: RawEvent[] = []
  for (let index = 0; index < sessionIDs.length; index += 100) {
    const ids = sessionIDs.slice(index, index + 100)
    const context = await payload.find({ collection: 'analytics-events', depth: 0, pagination: false, overrideAccess: true, sort: 'occurredAt', where: { and: [{ sessionId: { in: ids } }, { occurredAt: { less_than_equal: range.to } }] } })
    funnelContext.push(...context.docs as unknown as RawEvent[])
  }
  const funnelInputs: FunnelInput[] = funnelContext.filter((event) => formSteps.includes(value(event, 'name'))).map((event) => ({ occurredAt: value(event, 'occurredAt'), sessionId: value(event, 'sessionId'), objectKey: `${value(event, 'formType')}\u0001${value(event, 'objectId')}`, step: value(event, 'name') }))
  const achieved = orderedFunnel(funnelInputs, formSteps)
  for (const [step, keys] of Object.entries(achieved)) {
    for (const key of keys) {
      const [sessionId, objectKey] = key.split('\u0000'); const [formType, objectId] = objectKey.split('\u0001')
      const representative = events.find((event) => value(event, 'sessionId') === sessionId && value(event, 'formType') === formType && value(event, 'objectId') === objectId && value(event, 'name') === step)
      if (representative) addToBucket(buckets, date, representative, eventDimensions(representative, date, firstSeen, `funnel_${step}`), false)
    }
  }
  const verifiedAt = new Date().toISOString()
  const writtenKeys: string[] = []
  for (const [aggregateKey, bucket] of buckets) {
    const data = { aggregateKey, date: `${date}T00:00:00.000Z`, ...bucket.keyParts, eventCount: bucket.eventCount, activeMs: bucket.activeMs, exactLeadCount: bucket.exactLeadCount, browserHll: serializeHLL(bucket.browserHll), sessionHll: serializeHLL(bucket.sessionHll), rawEventCount: bucket.rawEventCount, verifiedAt }
    const found = await payload.find({ collection: 'analytics-daily', depth: 0, limit: 1, overrideAccess: true, where: { aggregateKey: { equals: aggregateKey } } })
    if (found.docs[0]) await payload.update({ collection: 'analytics-daily', id: found.docs[0].id, overrideAccess: true, data: data as never })
    else await payload.create({ collection: 'analytics-daily', overrideAccess: true, data: data as never })
    writtenKeys.push(aggregateKey)
  }
  const stale = await payload.find({ collection: 'analytics-daily', depth: 0, pagination: false, overrideAccess: true, where: { date: { equals: `${date}T00:00:00.000Z` } } })
  for (const row of stale.docs as unknown as RawEvent[]) if (!writtenKeys.includes(value(row, 'aggregateKey'))) await payload.delete({ collection: 'analytics-daily', id: row.id as number | string, overrideAccess: true })
  const verification = await payload.find({ collection: 'analytics-daily', depth: 0, pagination: false, overrideAccess: true, where: { date: { equals: `${date}T00:00:00.000Z` } } })
  const aggregateCount = (verification.docs as unknown as RawEvent[]).reduce((sum, row) => sum + Number(row.rawEventCount ?? 0), 0)
  if (aggregateCount !== events.length) throw new Error(`Aggregate verification failed for ${date}: raw=${events.length}, aggregated=${aggregateCount}.`)
  for (let index = 0; index < events.length; index += 100) {
    const ids = events.slice(index, index + 100).map((event) => event.id as number | string)
    await payload.update({ collection: 'analytics-events', overrideAccess: true, where: { id: { in: ids } }, data: { aggregatedAt: verifiedAt } })
  }
  return { date, rawEvents: events.length, rows: buckets.size }
}

export async function aggregateRecent(payload: Payload, now = new Date()): Promise<Array<{ date: string; rawEvents: number; rows: number }>> {
  const pending = await payload.find({ collection: 'analytics-events', depth: 0, pagination: false, overrideAccess: true, where: { aggregatedAt: { exists: false } } })
  const dates = [moscowDate(new Date(now.valueOf() - DAY_MS)), moscowDate(now), ...(pending.docs as unknown as RawEvent[]).map((event) => moscowDate(value(event, 'occurredAt')))]
  return Promise.all([...new Set(dates)].map((date) => aggregateDate(payload, date)))
}

export async function executeRetentionDays(
  dates: string[],
  operations: { aggregateAndVerify: (date: string) => Promise<void>; removeRaw: (date: string) => Promise<number> },
): Promise<number> {
  for (const date of dates) await operations.aggregateAndVerify(date)
  let removed = 0
  for (const date of dates) removed += await operations.removeRaw(date)
  return removed
}

export async function maintenancePreview(payload: Payload, now = new Date()): Promise<Record<string, number>> {
  const rawBefore = completedRawRetentionCutoff(now)
  const browserBefore = now.toISOString()
  const dailyBefore = new Date(now.valueOf() - 36 * 30.4375 * DAY_MS).toISOString()
  const firstSourceBefore = new Date(now.valueOf() - 60 * DAY_MS).toISOString()
  const [raw, browsers, daily, source] = await Promise.all([
    payload.count({ collection: 'analytics-events', overrideAccess: true, where: { occurredAt: { less_than: rawBefore } } }),
    payload.count({ collection: 'analytics-browsers', overrideAccess: true, where: { expiresAt: { less_than: browserBefore } } }),
    payload.count({ collection: 'analytics-daily', overrideAccess: true, where: { date: { less_than: dailyBefore } } }),
    payload.count({ collection: 'analytics-browsers', overrideAccess: true, where: { firstSourceCapturedAt: { less_than: firstSourceBefore } } }),
  ])
  return { rawEvents: raw.totalDocs, expiredBrowsers: browsers.totalDocs, expiredDailyRows: daily.totalDocs, expiredFirstSources: source.totalDocs }
}

export async function runMaintenance(payload: Payload, now = new Date()): Promise<Record<string, number>> {
  const preview = await maintenancePreview(payload, now)
  const cutoff = new Date(now.valueOf() - 90 * DAY_MS)
  const cutoffMoscowDate = moscowDate(cutoff)
  const completedCutoff = completedRawRetentionCutoff(now)
  const oldEvents = await payload.find({ collection: 'analytics-events', depth: 0, pagination: false, overrideAccess: true, sort: 'occurredAt', where: { occurredAt: { less_than: completedCutoff } } })
  const days = [...new Set((oldEvents.docs as unknown as RawEvent[]).map((event) => moscowDate(value(event, 'occurredAt'))))].filter((date) => date < cutoffMoscowDate)
  const deletedRaw = await executeRetentionDays(days, {
    aggregateAndVerify: async (date) => {
      await aggregateDate(payload, date)
      const rows = await payload.find({ collection: 'analytics-daily', depth: 0, pagination: false, overrideAccess: true, where: { date: { equals: `${date}T00:00:00.000Z` } } })
      if (!rows.docs.length || rows.docs.some((row) => !row.verifiedAt)) throw new Error(`Retention stopped: ${date} has no verified aggregate.`)
    },
    removeRaw: async (date) => {
      const range = utcRangeForMoscowDate(date)
      const removed = await payload.delete({ collection: 'analytics-events', overrideAccess: true, where: { and: [{ occurredAt: { greater_than_equal: range.from } }, { occurredAt: { less_than_equal: range.to } }] } })
      return removed.docs.length
    },
  })
  const firstSourceCutoff = new Date(now.valueOf() - 60 * DAY_MS).toISOString()
  const sourceRows = await payload.find({ collection: 'analytics-browsers', depth: 0, pagination: false, overrideAccess: true, where: { firstSourceCapturedAt: { less_than: firstSourceCutoff } } })
  for (const browser of sourceRows.docs) await payload.update({ collection: 'analytics-browsers', id: browser.id, overrideAccess: true, data: { firstSourceCapturedAt: null, firstChannel: null, firstSource: null, firstMedium: null, firstCampaign: null } as never })
  const expiredBrowsers = await payload.delete({ collection: 'analytics-browsers', overrideAccess: true, where: { expiresAt: { less_than: now.toISOString() } } })
  await payload.delete({ collection: 'analytics-sessions', overrideAccess: true, where: { lastActivityAt: { less_than: new Date(now.valueOf() - 13 * 30.4375 * DAY_MS).toISOString() } } })
  const expiredDaily = await payload.delete({ collection: 'analytics-daily', overrideAccess: true, where: { date: { less_than: new Date(now.valueOf() - 36 * 30.4375 * DAY_MS).toISOString() } } })
  return { ...preview, deletedRaw, clearedFirstSources: sourceRows.docs.length, deletedBrowsers: expiredBrowsers.docs.length, deletedDailyRows: expiredDaily.docs.length }
}
