import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { aggregateDate, aggregateRecent, moscowDate, runMaintenance } from '../analytics/aggregate'
import { sanitizeAnalyticsEvent, type AnalyticsEventName, type SanitizedAnalyticsEvent } from '../analytics/contract'
import { persistAnalyticsEvent, persistAnalyticsEvents } from '../analytics/ingest'
import { deserializeHLL, estimateHLL } from '../analytics/hll'

const database = new URL(process.env.DATABASE_URL ?? '').pathname.slice(1)
assert.ok(/(?:_test|_fixes_)/.test(database) && process.env.ANALYTICS_TEST_DATABASE === database, 'Use an explicitly named disposable test database.')
assert.equal(process.env.PAYLOAD_DISABLE_JOBS, '1', 'Disable background jobs in this test process.')
assert.notEqual(process.env.NODE_ENV, 'production', 'Do not run analytics fixtures in production.')
const payload = await getPayload({ config })
const marker = `batch-it-${Date.now()}-${randomBytes(3).toString('hex')}`
const path = `/__${marker}`; const anonymousId = `${marker}-browser`; const sessionId = `${marker}-session`
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120'
const date = moscowDate(new Date())
let leadID: number | undefined
const event = (name: AnalyticsEventName, suffix: string, extra: Record<string, unknown> = {}): SanitizedAnalyticsEvent => {
  const result = sanitizeAnalyticsEvent({ eventId: `${marker}-${suffix}`, anonymousId, sessionId, schemaVersion: 1, occurredAt: new Date().toISOString(), name, path, consentState: 'accepted', language: 'ru', currentSource: { channel: 'campaign', source: marker }, firstSource: { channel: 'campaign', source: marker }, ...extra })
  assert.ok(result); return result
}
const tracked = (before: (text: string) => Promise<void> | void = () => {}) => ({ ...payload, db: { ...payload.db, pool: {
  query: payload.db.pool.query.bind(payload.db.pool),
  async connect() {
    const client = await payload.db.pool.connect()
    return { async query(text: string, values?: unknown[]) { await before(text); return client.query(text, values) }, release: client.release.bind(client) }
  },
} } }) as unknown as Payload
const storedEvent = async (eventId: string) => (await payload.db.pool.query('SELECT * FROM analytics_events WHERE event_id = $1', [eventId])).rows[0]
const daily = async (day = date) => (await payload.db.pool.query('SELECT * FROM analytics_daily WHERE date = $1::timestamptz AND path = $2 ORDER BY aggregate_key', [`${day}T00:00:00.000Z`, path])).rows

try {
  const queryLog: string[] = []
  const batch = Array.from({ length: 25 }, (_, index) => event('page_view', `initial-${index}`))
  assert.equal((await persistAnalyticsEvents(tracked((text) => { queryLog.push(text) }), batch, userAgent)).filter((value) => value === 'created').length, 25)
  assert.ok(queryLog.length <= 8, `Batch made ${queryLog.length} queries instead of bounded bulk work.`)
  assert.ok((await persistAnalyticsEvents(payload, batch, userAgent)).every((value) => value === 'duplicate'))
  const within = event('page_view', 'within-batch')
  assert.deepEqual(await persistAnalyticsEvents(payload, [within, within], userAgent), ['created', 'duplicate'])

  const race = Array.from({ length: 25 }, (_, index) => event(index === 0 ? 'cta_click' : 'page_view', `race-${index}`, index === 0 ? { actionKind: 'booking' } : {}))
  const raced = await Promise.all([persistAnalyticsEvents(payload, race, userAgent), persistAnalyticsEvents(payload, [...race].reverse(), userAgent)])
  assert.equal(raced.flat().filter((value) => value === 'created').length, 25)
  const session = (await payload.db.pool.query('SELECT * FROM analytics_sessions WHERE session_id = $1', [sessionId])).rows[0]
  assert.equal(session.has_target_action, true)
  assert.equal(new Date(session.ended_at).valueOf() - new Date(session.last_activity_at).valueOf(), 30 * 60_000)

  const beforeBrowser = (await payload.db.pool.query('SELECT * FROM analytics_browsers WHERE anonymous_id = $1', [anonymousId])).rows[0]
  await payload.db.pool.query("UPDATE analytics_browsers SET first_source_captured_at = now() - interval '61 days' WHERE anonymous_id = $1", [anonymousId])
  const renewal = event('page_view', 'renewal', { firstSource: { channel: 'social', source: 'vk', campaign: 'renewed' } })
  await persistAnalyticsEvents(payload, [renewal, event('page_view', 'preserved', { firstSource: { channel: 'campaign', source: 'must-not-replace' } })], userAgent)
  assert.equal((await storedEvent(renewal.eventId)).first_campaign, 'renewed')
  assert.equal((await storedEvent(`${marker}-preserved`)).first_campaign, 'renewed')
  const afterBrowser = (await payload.db.pool.query('SELECT * FROM analytics_browsers WHERE anonymous_id = $1', [anonymousId])).rows[0]
  assert.equal(new Date(afterBrowser.expires_at).valueOf(), new Date(beforeBrowser.expires_at).valueOf())
  assert.equal(new Date(afterBrowser.first_seen_at).valueOf(), new Date(beforeBrowser.first_seen_at).valueOf())

  const rejected = event('form_submit_success', 'atomic-failure', { anonymousId: `${marker}-failed-browser`, sessionId: `${marker}-failed-session` })
  await assert.rejects(persistAnalyticsEvent(payload, rejected, userAgent, 2_147_483_647))
  assert.equal(await storedEvent(rejected.eventId), undefined)
  assert.equal((await payload.db.pool.query('SELECT id FROM analytics_browsers WHERE anonymous_id = $1', [rejected.anonymousId])).rowCount, 0)

  for (let offset = 0; offset < 150; offset += 25) await persistAnalyticsEvents(payload, Array.from({ length: 25 }, (_, index) => event('page_view', `many-${offset + index}`)), userAgent)
  const lead = await payload.create({ collection: 'leads', overrideAccess: true, data: { type: 'gift', status: 'new', name: 'Disposable analytics fixture', email: 'fixture@example.test', sourcePage: '/gift', idempotencyKey: marker } })
  leadID = lead.id
  const yesterday = new Date(Date.now() - 86_400_000).toISOString()
  const object = { objectType: 'form', objectId: marker, formType: 'gift' }
  await persistAnalyticsEvent(payload, event('form_view', 'form-view', { ...object, occurredAt: yesterday }), userAgent)
  await persistAnalyticsEvents(payload, [event('form_start', 'form-start', object), event('form_submit_attempt', 'form-attempt', object)], userAgent)
  await persistAnalyticsEvent(payload, event('form_submit_success', 'form-success', object), userAgent, leadID)
  await aggregateDate(payload, date)
  const rows = await daily()
  assert.equal(rows.reduce((sum, row) => sum + Number(row.exact_lead_count), 0), 1)
  for (const name of ['funnel_form_start', 'funnel_form_submit_attempt', 'funnel_form_submit_success']) {
    assert.equal(rows.filter((row) => row.event_name === name).reduce((sum, row) => sum + Number(row.event_count), 0), 1)
  }
  assert.ok(rows.filter((row) => row.event_name === 'page_view').every((row) => estimateHLL(deserializeHLL(row.browser_hll)) === 1))

  const late = event('page_view', 'snapshot-late'); let insertedLate = false
  await aggregateDate(tracked(async (text) => {
    if (!insertedLate && text.startsWith('SELECT * FROM analytics_events WHERE occurred_at')) { insertedLate = true; await persistAnalyticsEvent(payload, late, userAgent) }
  }), date)
  assert.equal((await storedEvent(late.eventId)).aggregated_at, null)
  await aggregateRecent(payload)
  assert.ok((await storedEvent(late.eventId)).aggregated_at)
  const complete = await daily()
  const unmarked = event('page_view', 'rollback-pending'); await persistAnalyticsEvent(payload, unmarked, userAgent)
  await assert.rejects(aggregateDate(tracked((text) => { if (text.startsWith('INSERT INTO analytics_daily')) throw new Error('injected aggregate failure') }), date), /injected aggregate failure/)
  assert.deepEqual(await daily(), complete)
  assert.equal((await storedEvent(unmarked.eventId)).aggregated_at, null)
  const concurrent = await Promise.all([aggregateDate(payload, date), aggregateDate(payload, date)])
  assert.equal(concurrent[0].rawEvents, concurrent[1].rawEvents)
  assert.equal((await daily()).reduce((sum, row) => sum + Number(row.raw_event_count), 0), (await payload.db.pool.query('SELECT count(*) FROM analytics_events WHERE path = $1 AND occurred_at >= $2::date - interval \'3 hours\' AND occurred_at < $2::date + interval \'21 hours\'', [path, date])).rows[0].count * 1)

  const oldOne = new Date(Date.now() - 102 * 86_400_000).toISOString(); const oldTwo = new Date(Date.now() - 101 * 86_400_000).toISOString()
  const oldSession = `${marker}-old-session`
  const oldEvents = [
    { ...event('form_view', 'old-view', { ...object, sessionId: oldSession }), occurredAt: oldOne },
    ...(['form_start', 'form_submit_attempt', 'form_submit_success'] as const).map((name, index) => ({ ...event(name, `old-${index}`, { ...object, sessionId: oldSession }), occurredAt: oldTwo })),
  ]
  await persistAnalyticsEvents(payload, oldEvents, userAgent)
  const retention = await runMaintenance(payload)
  assert.ok(retention.deletedRaw >= 4)
  assert.equal(await storedEvent(oldEvents[0].eventId), undefined)
  assert.equal((await daily(moscowDate(oldTwo))).filter((row) => row.event_name === 'funnel_form_submit_success').reduce((sum, row) => sum + Number(row.event_count), 0), 1)
  const retainedDay = await daily(moscowDate(oldTwo))
  await aggregateDate(payload, moscowDate(oldTwo))
  assert.deepEqual(await daily(moscowDate(oldTwo)), retainedDay, 'a delayed worker must preserve verified history after raw retention')
  console.log(JSON.stringify({ result: 'passed', batchQueries: queryLog.length, checks: ['batch+duplicate races', 'first-source expiry', 'identity lifetime', 'atomic failure', 'bounded aggregation', 'cross-day funnel', 'exact leads', 'HLL', 'late events', 'aggregate rollback', 'concurrent rebuild', 'verified retention', 'retained aggregate replay'] }))
} finally {
  await payload.db.pool.query('DELETE FROM analytics_events WHERE path = $1', [path])
  await payload.db.pool.query('DELETE FROM analytics_sessions WHERE session_id LIKE $1', [`${marker}%`])
  await payload.db.pool.query('DELETE FROM analytics_browsers WHERE anonymous_id LIKE $1', [`${marker}%`])
  await payload.db.pool.query('DELETE FROM analytics_daily WHERE path = $1', [path])
  if (leadID) await payload.delete({ collection: 'leads', id: leadID, overrideAccess: true })
  await payload.destroy()
}

process.exit(0)
