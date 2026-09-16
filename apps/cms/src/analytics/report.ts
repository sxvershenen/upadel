import type { Payload, Where } from 'payload'

import { createHLL, deserializeHLL, estimateHLL, HLL_RELATIVE_ERROR, mergeHLL } from './hll'

const DAY_MS = 86_400_000
type Row = Record<string, unknown>
type Filters = { channel?: string; device?: string; language?: string }
export type Period = { from: string; to: string }

export function comparisonPeriod(period: Period, mode: 'previous' | 'year'): Period {
  const from = Date.parse(`${period.from}T00:00:00.000Z`)
  const to = Date.parse(`${period.to}T00:00:00.000Z`)
  if (mode === 'year') {
    const start = new Date(from); const end = new Date(to)
    start.setUTCFullYear(start.getUTCFullYear() - 1); end.setUTCFullYear(end.getUTCFullYear() - 1)
    return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) }
  }
  const duration = Math.round((to - from) / DAY_MS) + 1
  const previousTo = from - DAY_MS
  return { from: new Date(previousTo - (duration - 1) * DAY_MS).toISOString().slice(0, 10), to: new Date(previousTo).toISOString().slice(0, 10) }
}

export function changePercent(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function inPeriod(row: Row, period: Period): boolean {
  const date = String(row.date ?? '').slice(0, 10)
  return date >= period.from && date <= period.to
}

function matches(row: Row, filters: Filters): boolean {
  return (!filters.channel || filters.channel === 'all' || row.channel === filters.channel) &&
    (!filters.device || filters.device === 'all' || row.device === filters.device) &&
    (!filters.language || filters.language === 'all' || row.language === filters.language)
}

function summarize(rows: Row[]) {
  const browsers = createHLL(); const sessions = createHLL(); const targetSessions = createHLL()
  let actions = 0; let leads = 0; let activeMs = 0
  for (const row of rows) {
    const name = String(row.eventName ?? '')
    if (!name.startsWith('funnel_') && name !== 'page_view' && name !== 'active_time' && name !== 'web_vital') actions += Number(row.eventCount ?? 0)
    leads += Number(row.exactLeadCount ?? 0); activeMs += Number(row.activeMs ?? 0)
    mergeHLL(browsers, deserializeHLL(String(row.browserHll ?? '')))
    mergeHLL(sessions, deserializeHLL(String(row.sessionHll ?? '')))
    if (name === 'form_submit_success' || (name === 'cta_click' && row.actionKind === 'booking') || (name === 'contact_click' && row.actionKind === 'phone')) mergeHLL(targetSessions, deserializeHLL(String(row.sessionHll ?? '')))
  }
  return { browsers: estimateHLL(browsers), sessions: estimateHLL(sessions), targetSessions: estimateHLL(targetSessions), actions, leads, activeMs }
}

function grouped(rows: Row[], key: string) {
  const groups = new Map<string, Row[]>()
  for (const row of rows) {
    const value = String(row[key] ?? '') || 'Не определено'
    const group = groups.get(value) ?? []; group.push(row); groups.set(value, group)
  }
  return [...groups].map(([name, group]) => ({ name, ...summarize(group) })).sort((a, b) => b.browsers - a.browsers || b.actions - a.actions)
}

function eventSessions(rows: Row[], predicate: (row: Row) => boolean): number {
  const hll = createHLL()
  for (const row of rows) if (predicate(row)) mergeHLL(hll, deserializeHLL(String(row.sessionHll ?? '')))
  return estimateHLL(hll)
}

async function exactLeadCount(payload: Payload, period: Period, filters: Filters): Promise<number> {
  const from = new Date(Date.parse(`${period.from}T00:00:00.000Z`) - 3 * 60 * 60_000).toISOString()
  const to = new Date(Date.parse(`${period.to}T00:00:00.000Z`) + DAY_MS - 3 * 60 * 60_000).toISOString()
  const and: Where[] = [{ createdAt: { greater_than_equal: from } }, { createdAt: { less_than: to } }]
  if (filters.channel && filters.channel !== 'all') and.push({ analyticsChannel: { equals: filters.channel } })
  if (filters.device && filters.device !== 'all') and.push({ analyticsDevice: { equals: filters.device } })
  if (filters.language && filters.language !== 'all') and.push({ analyticsLanguage: { equals: filters.language } })
  return (await payload.count({ collection: 'leads', overrideAccess: true, where: { and } })).totalDocs
}

export async function analyticsReport(payload: Payload, period: Period, compare: 'previous' | 'year', filters: Filters) {
  const comparison = comparisonPeriod(period, compare)
  const earliest = comparison.from < period.from ? comparison.from : period.from
  const latest = comparison.to > period.to ? comparison.to : period.to
  const result = await payload.find({ collection: 'analytics-daily', depth: 0, pagination: false, overrideAccess: true, where: { and: [{ date: { greater_than_equal: `${earliest}T00:00:00.000Z` } }, { date: { less_than_equal: `${latest}T23:59:59.999Z` } }] } })
  const all = (result.docs as unknown as Row[]).filter((row) => matches(row, filters))
  const currentRows = all.filter((row) => inPeriod(row, period)); const previousRows = all.filter((row) => inPeriod(row, comparison))
  const current = summarize(currentRows); const previous = summarize(previousRows)
  ;[current.leads, previous.leads] = await Promise.all([exactLeadCount(payload, period, filters), exactLeadCount(payload, comparison, filters)])
  const kpis = Object.fromEntries((['browsers', 'sessions', 'targetSessions', 'actions', 'leads'] as const).map((key) => [key, { value: current[key], comparison: previous[key], changePercent: changePercent(current[key], previous[key]) }]))
  const trend = Array.from({ length: Math.round((Date.parse(`${period.to}T00:00:00Z`) - Date.parse(`${period.from}T00:00:00Z`)) / DAY_MS) + 1 }, (_, index) => {
    const date = new Date(Date.parse(`${period.from}T00:00:00Z`) + index * DAY_MS).toISOString().slice(0, 10)
    return { date, ...summarize(currentRows.filter((row) => String(row.date).slice(0, 10) === date)) }
  })
  const pageViews = currentRows.filter((row) => row.eventName === 'page_view')
  const topPages = grouped(pageViews, 'path').slice(0, 10)
  const audience = {
    visitorType: grouped(pageViews, 'visitorType'), device: grouped(pageViews, 'device'), language: grouped(pageViews, 'language'),
    averageActiveSeconds: current.sessions ? Math.round(current.activeMs / current.sessions / 1000) : 0,
    sessionsPerBrowser: current.browsers ? Math.round(current.sessions / current.browsers * 100) / 100 : 0,
  }
  const funnel = [
    { name: 'Просмотр формы', sessions: eventSessions(currentRows, (row) => row.eventName === 'funnel_form_view') },
    { name: 'Начало формы', sessions: eventSessions(currentRows, (row) => row.eventName === 'funnel_form_start') },
    { name: 'Попытка отправки', sessions: eventSessions(currentRows, (row) => row.eventName === 'funnel_form_submit_attempt') },
    { name: 'Сохранённое обращение', sessions: eventSessions(currentRows, (row) => row.eventName === 'funnel_form_submit_success') },
  ]
  const interactions = {
    forms: grouped(currentRows.filter((row) => String(row.eventName).startsWith('form_')), 'formType'),
    coaches: grouped(currentRows.filter((row) => row.objectType === 'coach'), 'objectId'),
    tournaments: grouped(currentRows.filter((row) => row.objectType === 'tournament'), 'objectId'),
    articles: grouped(currentRows.filter((row) => row.objectType === 'article'), 'objectId'),
    contacts: grouped(currentRows.filter((row) => row.eventName === 'contact_click'), 'actionKind'),
  }
  const sources = { channels: grouped(currentRows, 'channel'), campaigns: grouped(currentRows.filter((row) => row.campaign), 'campaign'), referrers: grouped(currentRows.filter((row) => row.referrerDomain), 'referrerDomain'), firstChannels: grouped(currentRows.filter((row) => row.firstChannel), 'firstChannel'), firstCampaigns: grouped(currentRows.filter((row) => row.firstCampaign), 'firstCampaign') }
  const lastUpdated = currentRows.reduce((latestDate, row) => String(row.verifiedAt ?? '') > latestDate ? String(row.verifiedAt) : latestDate, '')
  return {
    period, comparisonPeriod: comparison, compare, filters, kpis, trend, funnel, topPages, audience, interactions, sources,
    definitions: { browsers: `Приблизительные уникальные браузеры; HLL p=14, типичная ошибка ${(HLL_RELATIVE_ERROR * 100).toFixed(2)}%.`, sessions: 'Сессия завершается после 30 минут бездействия.', leads: 'Только обращения, которые сервер успешно сохранил.', targetSessions: 'Сессии с кликом бронирования, кликом телефона или сохранённым обращением.' },
    health: { status: currentRows.length ? 'ok' : 'empty', lastUpdated: lastUpdated || null, collectorError: null },
  }
}
