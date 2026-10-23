import assert from 'node:assert/strict'
import test from 'node:test'
import { hasAnalyticsPreference, readAnalyticsPreferences, saveAnalyticsPreferences } from './consent'
import { ANALYTICS_CONSENT_KEY } from './identity'

class MemoryStorage extends Map<string, string> {
  getItem(key: string) { return this.get(key) ?? null }
  setItem(key: string, value: string) { this.set(key, value) }
  removeItem(key: string) { this.delete(key) }
}

test('analytics preferences are absent until a complete explicit choice is saved', () => {
  const storage = new MemoryStorage() as unknown as Storage
  assert.equal(readAnalyticsPreferences(storage), null)
  storage.setItem(ANALYTICS_CONSENT_KEY, 'accepted')
  assert.equal(readAnalyticsPreferences(storage), null)
})

test('legacy internal preference remains readable while external vendor choices stay independent', () => {
  const storage = new MemoryStorage() as unknown as Storage
  const preferences = { siteAnalytics: false, yandexMetrica: true, ga4: false }
  assert.equal(saveAnalyticsPreferences(storage, preferences), true)
  assert.deepEqual(readAnalyticsPreferences(storage), preferences)
  assert.equal(hasAnalyticsPreference(readAnalyticsPreferences(storage), 'siteAnalytics'), false)
  assert.equal(hasAnalyticsPreference(readAnalyticsPreferences(storage), 'yandexMetrica'), true)
  assert.equal(hasAnalyticsPreference(readAnalyticsPreferences(storage), 'ga4'), false)
})
