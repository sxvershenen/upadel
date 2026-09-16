import assert from 'node:assert/strict'
import test from 'node:test'
import { ANALYTICS_BROWSER_KEY, BROWSER_TTL_MS, FIRST_SOURCE_TTL_MS, browserIdentity, firstSource, sessionIdentity, sourceFromLocation } from './identity'

class MemoryStorage implements Storage {
  private values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() } getItem(key: string) { return this.values.get(key) ?? null } key(index: number) { return [...this.values.keys()][index] ?? null } removeItem(key: string) { this.values.delete(key) } setItem(key: string, value: string) { this.values.set(key, value) }
}
test('browser expiry is fixed and session rolls after inactivity', () => {
  const storage = new MemoryStorage(); const first = browserIdentity(storage, 1_000); const same = browserIdentity(storage, 2_000)
  assert.equal(same.expiresAt, first.expiresAt); assert.equal(first.expiresAt, 1_000 + BROWSER_TTL_MS)
  const expired = browserIdentity(storage, first.expiresAt + 1); assert.notEqual(expired.id, first.id)
  const session = sessionIdentity(storage, 10_000); const renewed = sessionIdentity(storage, 20_000); assert.equal(session.id, renewed.id)
  const next = sessionIdentity(storage, renewed.expiresAt + 1); assert.notEqual(next.id, session.id)
  assert.ok(storage.getItem(ANALYTICS_BROWSER_KEY))
})
test('first source expires after 60 days and current source is independently parsed', () => {
  const storage = new MemoryStorage()
  const paid = sourceFromLocation(new URL('https://club.test/?utm_source=yandex&utm_medium=cpc&yclid=abc'), '')
  const social = sourceFromLocation(new URL('https://club.test/?fbclid=xyz'), 'https://vk.com/path?private=1')
  assert.equal(paid.channel, 'paid-search'); assert.equal(social.channel, 'social'); assert.equal(social.referrerDomain, 'vk.com')
  assert.equal(firstSource(storage, paid, 1_000).source, 'yandex')
  assert.equal(firstSource(storage, social, 1_000 + FIRST_SOURCE_TTL_MS - 1).source, 'yandex')
  assert.equal(firstSource(storage, social, 1_000 + FIRST_SOURCE_TTL_MS + 1).channel, 'social')
})

