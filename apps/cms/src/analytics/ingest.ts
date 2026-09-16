import type { Payload } from 'payload'

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

async function ensureBrowser(payload: Payload, event: SanitizedAnalyticsEvent, now: Date): Promise<{ firstChannel: string; firstSource: string; firstMedium: string; firstCampaign: string }> {
  const found = await payload.find({ collection: 'analytics-browsers', depth: 0, limit: 1, overrideAccess: true, where: { anonymousId: { equals: event.anonymousId } } })
  const existing = found.docs[0] as unknown as undefined | Record<string, unknown>
  if (existing) {
    const capturedAt = existing.firstSourceCapturedAt ? new Date(String(existing.firstSourceCapturedAt)) : null
    const sourceCurrent = capturedAt && now.valueOf() - capturedAt.valueOf() <= FIRST_SOURCE_MS
    await payload.update({ collection: 'analytics-browsers', id: existing.id as number | string, overrideAccess: true, data: { lastSeenAt: now.toISOString() } as never })
    if (!sourceCurrent) {
      const first = event.firstSource
      await payload.update({ collection: 'analytics-browsers', id: existing.id as number | string, overrideAccess: true, data: { firstSourceCapturedAt: now.toISOString(), firstChannel: first.channel, firstSource: first.source || null, firstMedium: first.medium || null, firstCampaign: first.campaign || null } as never })
      return { firstChannel: first.channel, firstSource: first.source, firstMedium: first.medium, firstCampaign: first.campaign }
    }
    return {
      firstChannel: String(existing.firstChannel ?? ''), firstSource: String(existing.firstSource ?? ''), firstMedium: String(existing.firstMedium ?? ''), firstCampaign: String(existing.firstCampaign ?? ''),
    }
  }
  const first = event.firstSource
  const data = {
    anonymousId: event.anonymousId, firstSeenAt: now.toISOString(), lastSeenAt: now.toISOString(), expiresAt: new Date(now.valueOf() + THIRTEEN_MONTHS_MS).toISOString(),
    firstSourceCapturedAt: now.toISOString(), firstChannel: first.channel, firstSource: first.source, firstMedium: first.medium, firstCampaign: first.campaign,
  }
  try {
    await payload.create({ collection: 'analytics-browsers', overrideAccess: true, data: data as never })
  } catch {
    const raced = await payload.find({ collection: 'analytics-browsers', depth: 0, limit: 1, overrideAccess: true, where: { anonymousId: { equals: event.anonymousId } } })
    if (!raced.docs.length) throw new Error('Browser record could not be persisted.')
  }
  return { firstChannel: first.channel, firstSource: first.source, firstMedium: first.medium, firstCampaign: first.campaign }
}

async function ensureSession(payload: Payload, event: SanitizedAnalyticsEvent, now: Date, client: ReturnType<typeof detectClient>): Promise<void> {
  const found = await payload.find({ collection: 'analytics-sessions', depth: 0, limit: 1, overrideAccess: true, where: { sessionId: { equals: event.sessionId } } })
  const existing = found.docs[0] as unknown as undefined | Record<string, unknown>
  if (existing) {
    await payload.update({ collection: 'analytics-sessions', id: existing.id as number | string, overrideAccess: true, data: { lastActivityAt: now.toISOString(), endedAt: new Date(now.valueOf() + 30 * 60_000).toISOString(), hasTargetAction: Boolean(existing.hasTargetAction) || isTargetEvent(event) } as never })
    return
  }
  try {
    await payload.create({ collection: 'analytics-sessions', overrideAccess: true, data: {
      sessionId: event.sessionId, anonymousId: event.anonymousId, startedAt: event.occurredAt, lastActivityAt: now.toISOString(), endedAt: new Date(now.valueOf() + 30 * 60_000).toISOString(),
      channel: event.currentSource.channel, source: event.currentSource.source, medium: event.currentSource.medium, campaign: event.currentSource.campaign,
      device: client.device, language: event.language, os: client.os, osVersion: client.osVersion, hasTargetAction: isTargetEvent(event),
    } as never })
  } catch {
    const raced = await payload.find({ collection: 'analytics-sessions', depth: 0, limit: 1, overrideAccess: true, where: { sessionId: { equals: event.sessionId } } })
    if (!raced.docs.length) throw new Error('Session record could not be persisted.')
  }
}

export async function persistAnalyticsEvent(payload: Payload, event: SanitizedAnalyticsEvent, userAgent: string, lead?: number | string): Promise<'created' | 'duplicate'> {
  const duplicate = await payload.find({ collection: 'analytics-events', depth: 0, limit: 1, overrideAccess: true, where: { eventId: { equals: event.eventId } } })
  if (duplicate.docs.length) return 'duplicate'
  const now = new Date()
  const client = detectClient(userAgent)
  const first = await ensureBrowser(payload, event, now)
  await ensureSession(payload, event, now, client)
  try {
    await payload.create({ collection: 'analytics-events', overrideAccess: true, data: {
      eventId: event.eventId, schemaVersion: event.schemaVersion, occurredAt: event.occurredAt, receivedAt: now.toISOString(),
      anonymousId: event.anonymousId, sessionId: event.sessionId, pageViewId: event.pageViewId || null, name: event.name,
      path: event.path, title: event.title || null, language: event.language, objectType: event.objectType || null, objectId: event.objectId || null,
      actionKind: event.actionKind || null, formType: event.formType || null, step: event.step, value: event.value, metricName: event.metricName || null,
      consentState: event.consentState, channel: event.currentSource.channel, source: event.currentSource.source || null, medium: event.currentSource.medium || null,
      campaign: event.currentSource.campaign || null, content: event.currentSource.content || null, term: event.currentSource.term || null,
      referrerDomain: event.currentSource.referrerDomain || null, clickIdType: event.currentSource.clickIdType || null, clickId: event.currentSource.clickId || null,
      firstChannel: first.firstChannel || null, firstSource: first.firstSource || null, firstMedium: first.firstMedium || null, firstCampaign: first.firstCampaign || null,
      device: client.device, browser: client.browser, os: client.os, osVersion: client.osVersion, isBot: false, lead: lead ?? null,
    } as never })
    return 'created'
  } catch {
    const raced = await payload.find({ collection: 'analytics-events', depth: 0, limit: 1, overrideAccess: true, where: { eventId: { equals: event.eventId } } })
    if (raced.docs.length) return 'duplicate'
    throw new Error('Analytics event could not be persisted.')
  }
}
