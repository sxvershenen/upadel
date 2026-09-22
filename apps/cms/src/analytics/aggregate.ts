import { createHash } from 'node:crypto'
import type { Payload } from 'payload'

import { addHLL, createHLL, deserializeHLL, mergeHLL, serializeHLL } from './hll'
import { analyticsTransaction, databaseRow, insertValues, type AnalyticsClient } from './database'

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

const PAGE_SIZE = 100
const formSteps = ['form_view', 'form_start', 'form_submit_attempt', 'form_submit_success']

function applicationRow(row: Record<string, unknown>): RawEvent {
  return Object.fromEntries(Object.entries(row).map(([key, item]) => [key === 'lead_id' ? 'lead' : key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()), item instanceof Date ? item.toISOString() : item]))
}

async function firstSeenFor(client: AnalyticsClient, events: RawEvent[]): Promise<Map<string, string>> {
  const ids = [...new Set(events.map((event) => value(event, 'anonymousId')))]
  if (!ids.length) return new Map()
  const result = await client.query('SELECT anonymous_id, first_seen_at FROM analytics_browsers WHERE anonymous_id = ANY($1::text[])', [ids])
  return new Map(result.rows.map((row) => [row.anonymous_id as string, moscowDate(row.first_seen_at as Date)]))
}

/** Merge one bounded page into this transaction's rebuilt day, not an earlier snapshot. */
async function flushBuckets(client: AnalyticsClient, date: string, buckets: Map<string, Bucket>, verifiedAt: string) {
  const entries = [...buckets]
  for (let offset = 0; offset < entries.length; offset += PAGE_SIZE) {
    const batch = entries.slice(offset, offset + PAGE_SIZE)
    const previous = await client.query('SELECT * FROM analytics_daily WHERE aggregate_key = ANY($1::text[])', [batch.map(([key]) => key)])
    const previousByKey = new Map(previous.rows.map((row) => [row.aggregate_key, row]))
    const data = batch.map(([aggregateKey, bucket]) => {
      const old = previousByKey.get(aggregateKey)
      if (old) { mergeHLL(bucket.browserHll, deserializeHLL(old.browser_hll)); mergeHLL(bucket.sessionHll, deserializeHLL(old.session_hll)) }
      return databaseRow({ aggregateKey, date: `${date}T00:00:00.000Z`, ...bucket.keyParts,
        eventCount: bucket.eventCount + Number(old?.event_count ?? 0), activeMs: bucket.activeMs + Number(old?.active_ms ?? 0), exactLeadCount: bucket.exactLeadCount + Number(old?.exact_lead_count ?? 0),
        browserHll: serializeHLL(bucket.browserHll), sessionHll: serializeHLL(bucket.sessionHll), rawEventCount: bucket.rawEventCount + Number(old?.raw_event_count ?? 0), verifiedAt,
      })
    })
    const insert = insertValues(data)
    await client.query(`INSERT INTO analytics_daily (${insert.columns}) VALUES ${insert.placeholders} ON CONFLICT (aggregate_key) DO UPDATE SET ${Object.keys(data[0]).filter((column) => column !== 'aggregate_key').map((column) => `"${column}" = EXCLUDED."${column}"`).join(',')}`, insert.values)
  }
}

export async function aggregateDate(payload: Payload, date: string, retentionNow = new Date()): Promise<{ date: string; rawEvents: number; rows: number; verifiedAt: string }> {
  const range = utcRangeForMoscowDate(date)
  return analyticsTransaction(payload, async (client) => {
    const verifiedAt = new Date().toISOString()
    if (date < moscowDate(new Date(retentionNow.valueOf() - 90 * DAY_MS))) {
      const raw = await client.query('SELECT id FROM analytics_events WHERE occurred_at >= $1::timestamptz AND occurred_at <= $2::timestamptz LIMIT 1', [range.from, range.to])
      if (!raw.rows.length) {
        // Another retention worker may already have removed this verified day's raw data.
        // Replaying that day must not replace its historical aggregate with an empty one.
        const retained = await client.query('SELECT count(*) AS rows, max(verified_at) AS verified_at FROM analytics_daily WHERE date = $1::timestamptz', [`${date}T00:00:00.000Z`])
        if (Number(retained.rows[0].rows) > 0 && retained.rows[0].verified_at) return {
          date, rawEvents: 0, rows: Number(retained.rows[0].rows), verifiedAt: new Date(retained.rows[0].verified_at).toISOString(),
        }
      }
    }
    // Readers retain the preceding complete day until this entire rebuild commits.
    await client.query('DELETE FROM analytics_daily WHERE date = $1::timestamptz', [`${date}T00:00:00.000Z`])
    let lastID = 0; let rawEvents = 0
    const sessionIDs = new Set<string>()
    for (;;) {
      const result = await client.query('SELECT * FROM analytics_events WHERE occurred_at >= $1::timestamptz AND occurred_at <= $2::timestamptz AND id > $3 ORDER BY id LIMIT $4', [range.from, range.to, lastID, PAGE_SIZE])
      if (!result.rows.length) break
      const events = result.rows.map(applicationRow)
      const firstSeen = await firstSeenFor(client, events)
      const buckets = new Map<string, Bucket>()
      for (const event of events) {
        addToBucket(buckets, date, event, eventDimensions(event, date, firstSeen), true)
        if (formSteps.includes(value(event, 'name'))) sessionIDs.add(value(event, 'sessionId'))
      }
      await flushBuckets(client, date, buckets, verifiedAt)
      rawEvents += events.length; lastID = Number(events.at(-1)!.id)
    }

    const sessions = [...sessionIDs]
    for (let offset = 0; offset < sessions.length; offset += PAGE_SIZE) {
      const batch = sessions.slice(offset, offset + PAGE_SIZE)
      const progress = new Map<string, number>()
      const achieved = new Set<string>()
      const representatives = new Map<string, RawEvent>()
      let cursorTime: string | null = null; let cursorID = 0
      for (;;) {
        const result = await client.query(`SELECT * FROM analytics_events WHERE session_id = ANY($1::text[]) AND name = ANY($2::text[]) AND occurred_at <= $3::timestamptz
          AND ($4::timestamptz IS NULL OR (occurred_at, id) > ($4::timestamptz, $5)) ORDER BY occurred_at, id LIMIT $6`, [batch, formSteps, range.to, cursorTime, cursorID, PAGE_SIZE])
        if (!result.rows.length) break
        for (const row of result.rows) {
          const event = applicationRow(row)
          const key = `${value(event, 'sessionId')}\u0000${value(event, 'formType')}\u0001${value(event, 'objectId')}`
          const step = value(event, 'name'); const stepKey = `${step}\u0000${key}`
          const expected = progress.get(key) ?? 0
          if (step === formSteps[expected]) { achieved.add(stepKey); progress.set(key, expected + 1) }
          if (value(event, 'occurredAt') >= range.from && !representatives.has(stepKey)) representatives.set(stepKey, event)
          cursorTime = value(event, 'occurredAt'); cursorID = Number(event.id)
        }
      }
      const completed = [...representatives].filter(([key]) => achieved.has(key)).map(([, event]) => event)
      for (let index = 0; index < completed.length; index += PAGE_SIZE) {
        const events = completed.slice(index, index + PAGE_SIZE)
        const firstSeen = await firstSeenFor(client, events)
        const buckets = new Map<string, Bucket>()
        for (const event of events) addToBucket(buckets, date, event, eventDimensions(event, date, firstSeen, `funnel_${value(event, 'name')}`), false)
        await flushBuckets(client, date, buckets, verifiedAt)
      }
    }

    const verification = await client.query('SELECT count(*) AS rows, COALESCE(sum(raw_event_count), 0) AS raw_count FROM analytics_daily WHERE date = $1::timestamptz', [`${date}T00:00:00.000Z`])
    if (Number(verification.rows[0].raw_count) !== rawEvents) throw new Error(`Aggregate verification failed for ${date}.`)
    await client.query('UPDATE analytics_events SET aggregated_at = $1::timestamptz WHERE occurred_at >= $2::timestamptz AND occurred_at <= $3::timestamptz AND id <= $4', [verifiedAt, range.from, range.to, lastID])
    return { date, rawEvents, rows: Number(verification.rows[0].rows), verifiedAt }
  }, `unlim-analytics-day:${date}`)
}

export async function aggregateRecent(payload: Payload, now = new Date()): Promise<Array<{ date: string; rawEvents: number; rows: number; verifiedAt: string }>> {
  const pending = await payload.db.pool.query("SELECT DISTINCT to_char(occurred_at AT TIME ZONE 'Europe/Moscow', 'YYYY-MM-DD') AS date FROM analytics_events WHERE aggregated_at IS NULL")
  const dates = new Set([moscowDate(new Date(now.valueOf() - DAY_MS)), moscowDate(now), ...pending.rows.map((row) => row.date as string)])
  const results = []
  for (const date of dates) results.push(await aggregateDate(payload, date, now))
  return results
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
  const oldDays = await payload.db.pool.query("SELECT DISTINCT to_char(occurred_at AT TIME ZONE 'Europe/Moscow', 'YYYY-MM-DD') AS date FROM analytics_events WHERE occurred_at < $1::timestamptz ORDER BY date", [completedCutoff])
  const days = oldDays.rows.map((row) => row.date as string).filter((date) => date < cutoffMoscowDate)
  const verified = new Map<string, string>()
  const deletedRaw = await executeRetentionDays(days, {
    aggregateAndVerify: async (date) => {
      const result = await aggregateDate(payload, date, now)
      if (!result.rows || !result.verifiedAt) throw new Error(`Retention stopped: ${date} has no verified aggregate.`)
      verified.set(date, result.verifiedAt)
    },
    removeRaw: async (date) => {
      const range = utcRangeForMoscowDate(date)
      // A late row inserted after verification remains raw and pending for the next run.
      const removed = await payload.db.pool.query('DELETE FROM analytics_events WHERE occurred_at >= $1::timestamptz AND occurred_at <= $2::timestamptz AND aggregated_at = $3::timestamptz', [range.from, range.to, verified.get(date)])
      return removed.rowCount ?? 0
    },
  })
  const firstSourceCutoff = new Date(now.valueOf() - 60 * DAY_MS).toISOString()
  const sourceRows = await payload.db.pool.query('UPDATE analytics_browsers SET first_source_captured_at = NULL, first_channel = NULL, first_source = NULL, first_medium = NULL, first_campaign = NULL WHERE first_source_captured_at < $1::timestamptz', [firstSourceCutoff])
  const expiredBrowsers = await payload.db.pool.query('DELETE FROM analytics_browsers WHERE expires_at < $1::timestamptz', [now.toISOString()])
  await payload.db.pool.query('DELETE FROM analytics_sessions WHERE last_activity_at < $1::timestamptz', [new Date(now.valueOf() - 13 * 30.4375 * DAY_MS).toISOString()])
  const expiredDaily = await payload.db.pool.query('DELETE FROM analytics_daily WHERE date < $1::timestamptz', [new Date(now.valueOf() - 36 * 30.4375 * DAY_MS).toISOString()])
  return { ...preview, deletedRaw, clearedFirstSources: sourceRows.rowCount ?? 0, deletedBrowsers: expiredBrowsers.rowCount ?? 0, deletedDailyRows: expiredDaily.rowCount ?? 0 }
}
