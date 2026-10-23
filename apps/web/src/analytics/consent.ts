import { ANALYTICS_CONSENT_KEY } from './identity'

export type AnalyticsPreferences = {
  siteAnalytics: boolean
  yandexMetrica: boolean
  ga4: boolean
}

const preferenceKeys = ['siteAnalytics', 'yandexMetrica', 'ga4'] as const

export function readAnalyticsPreferences(storage: Storage): AnalyticsPreferences | null {
  try {
    const value = JSON.parse(storage.getItem(ANALYTICS_CONSENT_KEY) ?? 'null') as Partial<AnalyticsPreferences> | null
    if (!value || !preferenceKeys.every((key) => typeof value[key] === 'boolean')) return null
    return { siteAnalytics: value.siteAnalytics!, yandexMetrica: value.yandexMetrica!, ga4: value.ga4! }
  } catch {
    return null
  }
}

export function saveAnalyticsPreferences(storage: Storage, preferences: AnalyticsPreferences): boolean {
  try {
    storage.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify({ version: 2, ...preferences }))
    return true
  } catch {
    return false
  }
}

export function hasAnalyticsPreference(preferences: AnalyticsPreferences | null, key: keyof AnalyticsPreferences): boolean {
  return preferences?.[key] === true
}
