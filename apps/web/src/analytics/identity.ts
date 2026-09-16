export const ANALYTICS_CONSENT_KEY = 'unlim-analytics-consent-v1'
export const ANALYTICS_BROWSER_KEY = 'unlim-analytics-browser-v1'
export const ANALYTICS_SESSION_KEY = 'unlim-analytics-session-v1'
export const ANALYTICS_FIRST_SOURCE_KEY = 'unlim-analytics-first-source-v1'
export const ANALYTICS_QUEUE_KEY = 'unlim-analytics-queue-v1'

const MONTH_MS = 30.4375 * 24 * 60 * 60_000
export const BROWSER_TTL_MS = 13 * MONTH_MS
export const FIRST_SOURCE_TTL_MS = 60 * 24 * 60 * 60_000
export const SESSION_IDLE_MS = 30 * 60_000

export type StoredIdentity = { id: string; createdAt: number; expiresAt: number }
export type Source = { channel: string; source: string; medium: string; campaign: string; content: string; term: string; referrerDomain: string; clickIdType: '' | 'gclid' | 'yclid' | 'vk_click_id' | 'fbclid'; clickId: string }

function randomId(): string {
  return globalThis.crypto?.randomUUID?.().replaceAll('-', '') ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
}
function parse<T>(storage: Storage, key: string): T | null {
  try { return JSON.parse(storage.getItem(key) ?? 'null') as T | null } catch { return null }
}

export function browserIdentity(storage: Storage, now = Date.now()): StoredIdentity {
  const existing = parse<StoredIdentity>(storage, ANALYTICS_BROWSER_KEY)
  if (existing && typeof existing.id === 'string' && existing.id.length >= 16 && existing.createdAt <= now && existing.expiresAt > now && existing.expiresAt - existing.createdAt <= BROWSER_TTL_MS + 1000) return existing
  const created = { id: randomId(), createdAt: now, expiresAt: now + BROWSER_TTL_MS }
  storage.setItem(ANALYTICS_BROWSER_KEY, JSON.stringify(created))
  return created
}

export function sessionIdentity(storage: Storage, now = Date.now()): StoredIdentity {
  const existing = parse<StoredIdentity>(storage, ANALYTICS_SESSION_KEY)
  if (existing && typeof existing.id === 'string' && existing.id.length >= 16 && existing.expiresAt > now) {
    const updated = { ...existing, expiresAt: now + SESSION_IDLE_MS }
    storage.setItem(ANALYTICS_SESSION_KEY, JSON.stringify(updated)); return updated
  }
  const created = { id: randomId(), createdAt: now, expiresAt: now + SESSION_IDLE_MS }
  storage.setItem(ANALYTICS_SESSION_KEY, JSON.stringify(created)); return created
}

function hostname(referrer: string): string {
  try { return referrer ? new URL(referrer).hostname.toLowerCase().slice(0, 160) : '' } catch { return '' }
}
function clean(value: string | null, max: number): string { return (value ?? '').trim().slice(0, max).replace(/[^\p{L}\p{N} ._+:/-]/gu, '') }

export function sourceFromLocation(url: URL, referrer: string): Source {
  const params = url.searchParams
  const click = (['gclid', 'yclid', 'vk_click_id', 'fbclid'] as const).find((key) => params.has(key)) ?? ''
  const source = clean(params.get('utm_source'), 80)
  const medium = clean(params.get('utm_medium'), 80)
  const referrerDomain = hostname(referrer)
  const channel = click === 'gclid' || click === 'yclid' || /cpc|ppc|paid|search/i.test(medium) ? 'paid-search'
    : click === 'vk_click_id' || click === 'fbclid' || /social/i.test(medium) ? 'social'
      : /email/i.test(medium) ? 'email' : source ? 'campaign' : referrerDomain ? 'referral' : 'direct'
  return { channel, source, medium, campaign: clean(params.get('utm_campaign'), 120), content: clean(params.get('utm_content'), 120), term: clean(params.get('utm_term'), 120), referrerDomain, clickIdType: click, clickId: click ? clean(params.get(click), 180) : '' }
}

export function firstSource(storage: Storage, current: Source, now = Date.now()): Source {
  const existing = parse<{ source: Source; expiresAt: number }>(storage, ANALYTICS_FIRST_SOURCE_KEY)
  if (existing?.expiresAt && existing.expiresAt > now && existing.source) return existing.source
  storage.setItem(ANALYTICS_FIRST_SOURCE_KEY, JSON.stringify({ source: current, expiresAt: now + FIRST_SOURCE_TTL_MS }))
  return current
}

export function resetAnalyticsStorage(storage: Storage): void {
  for (const key of [ANALYTICS_BROWSER_KEY, ANALYTICS_SESSION_KEY, ANALYTICS_FIRST_SOURCE_KEY, ANALYTICS_QUEUE_KEY]) storage.removeItem(key)
}
