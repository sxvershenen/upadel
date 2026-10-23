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
