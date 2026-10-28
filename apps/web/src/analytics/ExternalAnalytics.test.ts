import assert from 'node:assert/strict'
import test from 'node:test'
import { shouldInitializeMetrica, shouldInitializeVendor, shouldLoadExternalVendor, shouldLoadMetricaScript, shouldReloadForVendorRevoke } from './ExternalAnalytics'

test('external vendors require their own explicit preference and valid enabled config', () => {
  assert.equal(shouldLoadExternalVendor(false, true, '1'), false)
  assert.equal(shouldLoadExternalVendor(true, false, '1'), false)
  assert.equal(shouldLoadExternalVendor(true, true, ''), false)
  assert.equal(shouldLoadExternalVendor(true, true, '1'), true)
})

test('vendor revoke reloads only after accepted and already loaded state', () => {
  assert.equal(shouldReloadForVendorRevoke(true, true), true)
  assert.equal(shouldReloadForVendorRevoke(false, true), false)
  assert.equal(shouldReloadForVendorRevoke(true, false), false)
})

test('Metrica only initializes after its explicit preference is enabled', () => {
  assert.equal(shouldLoadMetricaScript(true, true, '113700320'), true)
  assert.equal(shouldLoadMetricaScript(true, false, '113700320'), false)
  assert.equal(shouldLoadMetricaScript(false, true, '113700320'), false)
  assert.equal(shouldLoadMetricaScript(true, true, ''), false)
  assert.equal(shouldInitializeMetrica('consent-required', null, true, true, '113700320'), false)
  assert.equal(shouldInitializeMetrica('consent-required', { siteAnalytics: true, yandexMetrica: false, ga4: false }, true, true, '113700320'), false)
  assert.equal(shouldInitializeMetrica('consent-required', { siteAnalytics: true, yandexMetrica: true, ga4: false }, false, true, '113700320'), false)
  assert.equal(shouldInitializeMetrica('consent-required', { siteAnalytics: true, yandexMetrica: true, ga4: false }, true, false, '113700320'), false)
  assert.equal(shouldInitializeMetrica('consent-required', { siteAnalytics: true, yandexMetrica: true, ga4: false }, true, true, ''), false)
  assert.equal(shouldInitializeMetrica('consent-required', { siteAnalytics: false, yandexMetrica: true, ga4: false }, true, true, '113700320'), true)
  assert.equal(shouldInitializeMetrica('first-party', null, true, true, '113700320'), false)
})

test('vendor initialization is deduplicated by stable vendor key', () => {
  assert.equal(shouldInitializeVendor(new Set(), 'ga4:G-TEST'), true)
  assert.equal(shouldInitializeVendor(new Set(['ga4:G-TEST']), 'ga4:G-TEST'), false)
})

test('native bootstrap starts on an object-shaped consent event without a page reload', async () => {
  const { Window } = await import('happy-dom')
  const { initializeExternalAnalytics } = await import('./externalVendors')
  const { ANALYTICS_CONSENT_KEY } = await import('./identity')
  const browser = new Window({ url: 'https://unlimpadel.ru/' })
  const create = browser.document.createElement.bind(browser.document)
  browser.document.createElement = ((tag: string, options?: any) => { const node = create(tag, options); if (tag === 'script') node.setAttribute('type', 'application/x-unlim-test'); return node }) as any
  const keys = ['window', 'document', 'localStorage', 'sessionStorage', 'location', 'addEventListener', 'removeEventListener']
  const old = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  for (const key of keys) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: key.endsWith('EventListener') ? (browser as any)[key].bind(browser) : (browser as any)[key] })
  const calls: unknown[][] = []
  ;(browser as any).ym = (...args: unknown[]) => calls.push(args)
  const cleanup = initializeExternalAnalytics({ analyticsEnabled: true, analyticsMode: 'consent-required', vendors: { yandexMetrica: { enabled: true, counterId: '113700321', webvisor: false }, ga4: { enabled: false } } })
  try {
    assert.equal(browser.document.querySelectorAll('script').length, 0)
    const preference = { siteAnalytics: true, yandexMetrica: true, ga4: false }
    browser.localStorage.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify(preference))
    browser.dispatchEvent(new browser.CustomEvent('unlim:analytics-consent', { detail: preference }))
    browser.dispatchEvent(new browser.CustomEvent('unlim:analytics-consent', { detail: preference }))
    assert.equal(calls.filter(call => call[1] === 'init').length, 1)
    assert.equal(browser.document.querySelectorAll('script#unlim-yandex-metrica').length, 1)
  } finally {
    cleanup(); browser.close()
    for (const key of keys) { const value = old.get(key); if (value) Object.defineProperty(globalThis, key, value); else Reflect.deleteProperty(globalThis, key) }
  }
})
