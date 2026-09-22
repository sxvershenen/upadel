import type { Payload } from 'payload'

import { analyticsTransaction, databaseRow, insertValues } from './database'
import { isTargetEvent, type SanitizedAnalyticsEvent } from './contract'

const THIRTEEN_MONTHS_MS = 13 * 30.4375 * 24 * 60 * 60_000
const FIRST_SOURCE_MS = 60 * 24 * 60 * 60_000

export function detectClient(userAgent: string): { browser: string; device: 'desktop' | 'mobile' | 'tablet'; os: string; osVersion: string } {
  const ua = userAgent.slice(0, 500)
  const device = /ipad|tablet|playbook|silk/i.test(ua) ? 'tablet' : /mobi|android|iphone/i.test(ua) ? 'mobile' : 'desktop'
  const browser = /edg\//i.test(ua) ? 'Edge' : /firefox\//i.test(ua) ? 'Firefox' : /opr\//i.test(ua) ? 'Opera' : /chrome\//i.test(ua) ? 'Chrome' : /safari\//i.test(ua) ? 'Safari' : 'Other'
  const windows = ua.match(/Windows NT ([0-9.]+)/i); const android = ua.match(/Android ([0-9.]+)/i); const ios = ua.match(/(?:CPU (?:iPhone )?OS|iPhone OS) ([0-9_]+)/i); const mac = ua.match(/Mac OS X ([0-9_]+)/i)
  const os = windows ? 'Windows' : android ? 'Android' : ios ? 'iOS' : mac ? 'macOS' : /linux/i.test(ua) ? 'Linux' : 'Other'
  const osVersion = (windows?.[1] ?? android?.[1] ?? ios?.[1] ?? mac?.[1] ?? '').replaceAll('_', '.').slice(0, 30)
  return { browser, device, os, osVersion }
}

type Outcome = 'created' | 'duplicate'

/** One bounded database transaction per browser batch; analytics collections have no application hooks. */
export async function persistAnalyticsEvents(payload: Payload, events: SanitizedAnalyticsEvent[], userAgent: string, lead?: number | string): Promise<Outcome[]> {
  if (!events.length || events.length > 25) throw new Error('An analytics batch requires 1–25 events.')
  const now = new Date()
  const clientInfo = detectClient(userAgent)
  return analyticsTransaction(payload, async (client) => {
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended(key, 0)) FROM (SELECT unnest($1::text[]) AS key ORDER BY key) AS keys', [events.map((event) => `unlim-event:${event.eventId}`)])
    const duplicate = await client.query<{ event_id: string }>('SELECT event_id FROM analytics_events WHERE event_id = ANY($1::text[])', [events.map((event) => event.eventId)])
    const seen = new Set(duplicate.rows.map((row) => row.event_id))
    const fresh = events.filter((event) => { if (seen.has(event.eventId)) return false; seen.add(event.eventId); return true })
    if (!fresh.length) return events.map(() => 'duplicate')

    const browsers = new Map<string, SanitizedAnalyticsEvent>()
    const sessions = new Map<string, { event: SanitizedAnalyticsEvent; target: boolean }>()
    for (const event of fresh) {
      if (!browsers.has(event.anonymousId)) browsers.set(event.anonymousId, event)
      const session = sessions.get(event.sessionId)
      if (session) session.target ||= isTargetEvent(event)
      else sessions.set(event.sessionId, { event, target: isTargetEvent(event) })
    }
    // Deterministic row-lock order avoids deadlocks between overlapping batches.
    const browserRows = [...browsers].sort(([a], [b]) => a.localeCompare(b)).map(([, event]) => databaseRow({
      anonymousId: event.anonymousId, firstSeenAt: now.toISOString(), lastSeenAt: now.toISOString(), expiresAt: new Date(now.valueOf() + THIRTEEN_MONTHS_MS).toISOString(),
      firstSourceCapturedAt: now.toISOString(), firstChannel: event.firstSource.channel, firstSource: event.firstSource.source || null,
      firstMedium: event.firstSource.medium || null, firstCampaign: event.firstSource.campaign || null,
    }))
    const browserInsert = insertValues(browserRows)
    const renew = `analytics_browsers.first_source_captured_at IS NULL OR analytics_browsers.first_source_captured_at < $${browserInsert.values.length + 1}::timestamptz`
    const firstFields = ['first_source_captured_at', 'first_channel', 'first_source', 'first_medium', 'first_campaign']
    const storedBrowsers = await client.query(`INSERT INTO analytics_browsers (${browserInsert.columns}) VALUES ${browserInsert.placeholders}
      ON CONFLICT (anonymous_id) DO UPDATE SET last_seen_at = GREATEST(analytics_browsers.last_seen_at, EXCLUDED.last_seen_at),
      ${firstFields.map((field) => `${field} = CASE WHEN ${renew} THEN EXCLUDED.${field} ELSE analytics_browsers.${field} END`).join(',')}
      RETURNING anonymous_id, first_channel, first_source, first_medium, first_campaign`, [...browserInsert.values, new Date(now.valueOf() - FIRST_SOURCE_MS).toISOString()])
    const firstByBrowser = new Map(storedBrowsers.rows.map((row) => [row.anonymous_id as string, row]))

    const sessionInsert = insertValues([...sessions].sort(([a], [b]) => a.localeCompare(b)).map(([, { event, target }]) => databaseRow({
      sessionId: event.sessionId, anonymousId: event.anonymousId, startedAt: event.occurredAt, lastActivityAt: now.toISOString(), endedAt: new Date(now.valueOf() + 30 * 60_000).toISOString(),
      channel: event.currentSource.channel, source: event.currentSource.source, medium: event.currentSource.medium, campaign: event.currentSource.campaign,
      device: clientInfo.device, language: event.language, os: clientInfo.os, osVersion: clientInfo.osVersion, hasTargetAction: target,
    })))
    await client.query(`INSERT INTO analytics_sessions (${sessionInsert.columns}) VALUES ${sessionInsert.placeholders}
      ON CONFLICT (session_id) DO UPDATE SET last_activity_at = GREATEST(analytics_sessions.last_activity_at, EXCLUDED.last_activity_at),
      ended_at = GREATEST(analytics_sessions.ended_at, EXCLUDED.ended_at), has_target_action = COALESCE(analytics_sessions.has_target_action, false) OR EXCLUDED.has_target_action`, sessionInsert.values)

    const eventInsert = insertValues(fresh.map((event) => {
      const first = firstByBrowser.get(event.anonymousId)!
      return databaseRow({
        eventId: event.eventId, schemaVersion: event.schemaVersion, occurredAt: event.occurredAt, receivedAt: now.toISOString(),
        anonymousId: event.anonymousId, sessionId: event.sessionId, pageViewId: event.pageViewId || null, name: event.name,
        path: event.path, title: event.title || null, language: event.language, objectType: event.objectType || null, objectId: event.objectId || null,
        actionKind: event.actionKind || null, formType: event.formType || null, step: event.step, value: event.value, metricName: event.metricName || null,
        consentState: event.consentState, channel: event.currentSource.channel, source: event.currentSource.source || null, medium: event.currentSource.medium || null,
        campaign: event.currentSource.campaign || null, content: event.currentSource.content || null, term: event.currentSource.term || null,
        referrerDomain: event.currentSource.referrerDomain || null, clickIdType: event.currentSource.clickIdType || null, clickId: event.currentSource.clickId || null,
        firstChannel: first.first_channel || null, firstSource: first.first_source || null, firstMedium: first.first_medium || null, firstCampaign: first.first_campaign || null,
        device: clientInfo.device, browser: clientInfo.browser, os: clientInfo.os, osVersion: clientInfo.osVersion, isBot: false, leadId: lead ?? null,
      })
    }))
    const inserted = await client.query<{ event_id: string }>(`INSERT INTO analytics_events (${eventInsert.columns}) VALUES ${eventInsert.placeholders} ON CONFLICT (event_id) DO NOTHING RETURNING event_id`, eventInsert.values)
    const created = new Set(inserted.rows.map((row) => row.event_id))
    return events.map((event) => created.delete(event.eventId) ? 'created' : 'duplicate')
  })
}

export async function persistAnalyticsEvent(payload: Payload, event: SanitizedAnalyticsEvent, userAgent: string, lead?: number | string): Promise<Outcome> {
  return (await persistAnalyticsEvents(payload, [event], userAgent, lead))[0]
}
