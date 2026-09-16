export const analyticsSchemaVersion = 1 as const

export const analyticsEventNames = [
  'page_view', 'active_time', 'cta_click', 'contact_click', 'form_view', 'form_start',
  'form_step', 'form_submit_attempt', 'form_submit_success', 'form_error', 'object_view',
  'article_read', 'web_vital',
] as const
export type AnalyticsEventName = typeof analyticsEventNames[number]

export const objectTypes = ['coach', 'tournament', 'article', 'membership', 'gift', 'form', 'contact', 'booking'] as const
export type AnalyticsObjectType = typeof objectTypes[number]

export const actionKinds = ['booking', 'phone', 'email', 'telegram', 'vk', 'directions', 'lead', 'internal', 'external'] as const
export type AnalyticsActionKind = typeof actionKinds[number]

export const consentStates = ['not-required', 'accepted'] as const
export type AnalyticsConsentState = typeof consentStates[number]

export type AnalyticsSource = {
  channel: string
  source: string
  medium: string
  campaign: string
  content: string
  term: string
  referrerDomain: string
  clickIdType: '' | 'gclid' | 'yclid' | 'vk_click_id' | 'fbclid'
  clickId: string
}

export type SanitizedAnalyticsEvent = {
  eventId: string
  schemaVersion: typeof analyticsSchemaVersion
  occurredAt: string
  anonymousId: string
  sessionId: string
  pageViewId: string
  name: AnalyticsEventName
  path: string
  title: string
  language: string
  objectType: AnalyticsObjectType | ''
  objectId: string
  actionKind: AnalyticsActionKind | ''
  formType: string
  step: number | null
  value: number | null
  metricName: '' | 'LCP' | 'INP' | 'CLS' | 'TTFB' | 'FCP'
  consentState: AnalyticsConsentState
  currentSource: AnalyticsSource
  firstSource: AnalyticsSource
}

const eventSet = new Set<string>(analyticsEventNames)
const objectSet = new Set<string>(objectTypes)
const actionSet = new Set<string>(actionKinds)
const consentSet = new Set<string>(consentStates)
const metricSet = new Set(['LCP', 'INP', 'CLS', 'TTFB', 'FCP'])
const eventProperties = new Set(['eventId', 'schemaVersion', 'occurredAt', 'anonymousId', 'sessionId', 'pageViewId', 'name', 'path', 'title', 'language', 'objectType', 'objectId', 'actionKind', 'formType', 'step', 'value', 'metricName', 'consentState', 'currentSource', 'firstSource'])
const sourceProperties = new Set(['channel', 'source', 'medium', 'campaign', 'content', 'term', 'referrerDomain', 'clickIdType', 'clickId'])

function short(value: unknown, max: number, pattern?: RegExp): string {
  if (typeof value !== 'string') return ''
  const result = value.trim().slice(0, max)
  return !pattern || pattern.test(result) ? result : ''
}

export function sanitizePath(value: unknown): string {
  const path = short(value, 240)
  if (!path.startsWith('/') || path.includes('?') || path.includes('#') || /[\x00-\x1f]/.test(path)) return '/'
  return path
}

function source(input: unknown): AnalyticsSource {
  const data = input && typeof input === 'object' ? input as Record<string, unknown> : {}
  const clickIdType = short(data.clickIdType, 16)
  return {
    channel: short(data.channel, 40, /^[\p{L}\p{N} ._+/-]*$/u) || 'direct',
    source: short(data.source, 80, /^[\p{L}\p{N} ._+/-]*$/u),
    medium: short(data.medium, 80, /^[\p{L}\p{N} ._+/-]*$/u),
    campaign: short(data.campaign, 120, /^[\p{L}\p{N} ._+:/-]*$/u),
    content: short(data.content, 120, /^[\p{L}\p{N} ._+:/-]*$/u),
    term: short(data.term, 120, /^[\p{L}\p{N} ._+:/-]*$/u),
    referrerDomain: short(data.referrerDomain, 160, /^(?:[a-z0-9-]+\.)*[a-z0-9-]+$/i),
    clickIdType: (['gclid', 'yclid', 'vk_click_id', 'fbclid'].includes(clickIdType) ? clickIdType : '') as AnalyticsSource['clickIdType'],
    clickId: short(data.clickId, 180, /^[A-Za-z0-9._~-]*$/),
  }
}

export function sanitizeAnalyticsEvent(value: unknown, now = new Date()): SanitizedAnalyticsEvent | null {
  if (!value || typeof value !== 'object') return null
  const data = value as Record<string, unknown>
  if (Object.keys(data).some((key) => !eventProperties.has(key))) return null
  for (const rawSource of [data.currentSource, data.firstSource]) {
    if (rawSource && (typeof rawSource !== 'object' || Object.keys(rawSource).some((key) => !sourceProperties.has(key)))) return null
  }
  const eventId = short(data.eventId, 80, /^[A-Za-z0-9_-]{16,80}$/)
  const anonymousId = short(data.anonymousId, 80, /^[A-Za-z0-9_-]{16,80}$/)
  const sessionId = short(data.sessionId, 80, /^[A-Za-z0-9_-]{16,80}$/)
  const pageViewId = short(data.pageViewId, 80, /^[A-Za-z0-9_-]{0,80}$/)
  const name = short(data.name, 40)
  const consentState = short(data.consentState, 20)
  const occurred = typeof data.occurredAt === 'string' ? new Date(data.occurredAt) : null
  if (!eventId || !anonymousId || !sessionId || !eventSet.has(name) || !consentSet.has(consentState) || data.schemaVersion !== analyticsSchemaVersion || !occurred || Number.isNaN(occurred.valueOf())) return null
  if (Math.abs(now.valueOf() - occurred.valueOf()) > 7 * 24 * 60 * 60_000 || occurred > new Date(now.valueOf() + 5 * 60_000)) return null
  const objectType = short(data.objectType, 24)
  const actionKind = short(data.actionKind, 24)
  const metricName = short(data.metricName, 8)
  const numericValue = typeof data.value === 'number' && Number.isFinite(data.value) ? data.value : null
  const numericStep = typeof data.step === 'number' && Number.isInteger(data.step) && data.step >= 0 && data.step <= 100 ? data.step : null
  if (objectType && !objectSet.has(objectType)) return null
  if (actionKind && !actionSet.has(actionKind)) return null
  if (metricName && !metricSet.has(metricName)) return null
  if ((name === 'active_time' && (numericValue === null || numericValue < 0 || numericValue > 60_000)) ||
      (name === 'article_read' && ![25, 50, 90].includes(numericValue ?? -1)) ||
      (name === 'web_vital' && (!metricName || numericValue === null || numericValue < 0 || numericValue > 3_600_000))) return null
  return {
    eventId, anonymousId, sessionId, pageViewId, name: name as AnalyticsEventName,
    schemaVersion: analyticsSchemaVersion, occurredAt: occurred.toISOString(), path: sanitizePath(data.path),
    title: short(data.title, 180).replace(/[\r\n]/g, ' '), language: short(data.language, 16, /^[A-Za-z]{2,3}(?:-[A-Za-z]{2,4})?$/) || 'ru',
    objectType: objectType as AnalyticsObjectType | '', objectId: short(data.objectId, 160, /^[\p{L}\p{N}._:/-]*$/u),
    actionKind: actionKind as AnalyticsActionKind | '', formType: short(data.formType, 40, /^[a-z0-9_-]*$/), step: numericStep,
    value: numericValue, metricName: metricName as SanitizedAnalyticsEvent['metricName'], consentState: consentState as AnalyticsConsentState,
    currentSource: source(data.currentSource), firstSource: source(data.firstSource),
  }
}

export function isTargetEvent(event: Pick<SanitizedAnalyticsEvent, 'name' | 'actionKind' | 'formType'>): boolean {
  return event.name === 'form_submit_success' || (event.name === 'cta_click' && event.actionKind === 'booking') || (event.name === 'contact_click' && event.actionKind === 'phone')
}
