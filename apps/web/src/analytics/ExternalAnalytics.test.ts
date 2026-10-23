import assert from 'node:assert/strict'
import test from 'node:test'
import { shouldInitializeMetrica, shouldInitializeVendor, shouldLoadExternalVendor, shouldLoadMetricaScript, shouldReloadForVendorRevoke } from './ExternalAnalytics'

test('external vendors require explicit accepted consent and valid enabled config', () => {
  assert.equal(shouldLoadExternalVendor(null, true, '1'), false)
  assert.equal(shouldLoadExternalVendor('rejected', true, '1'), false)
  assert.equal(shouldLoadExternalVendor('accepted', false, '1'), false)
  assert.equal(shouldLoadExternalVendor('accepted', true, ''), false)
  assert.equal(shouldLoadExternalVendor('accepted', true, '1'), true)
})

test('vendor revoke reloads only after accepted and already loaded state', () => {
  assert.equal(shouldReloadForVendorRevoke(true, true), true)
  assert.equal(shouldReloadForVendorRevoke(false, true), false)
  assert.equal(shouldReloadForVendorRevoke(true, false), false)
})

test('Metrica library can load before consent without initializing collection', () => {
  assert.equal(shouldLoadMetricaScript(true, true, '113700320'), true)
  assert.equal(shouldLoadMetricaScript(true, false, '113700320'), false)
  assert.equal(shouldLoadMetricaScript(false, true, '113700320'), false)
  assert.equal(shouldLoadMetricaScript(true, true, ''), false)
  assert.equal(shouldInitializeMetrica(null, true, true, '113700320'), false)
  assert.equal(shouldInitializeMetrica('rejected', true, true, '113700320'), false)
  assert.equal(shouldInitializeMetrica('accepted', false, true, '113700320'), false)
  assert.equal(shouldInitializeMetrica('accepted', true, false, '113700320'), false)
  assert.equal(shouldInitializeMetrica('accepted', true, true, ''), false)
  assert.equal(shouldInitializeMetrica('accepted', true, true, '113700320'), true)
})

test('vendor initialization is deduplicated by stable vendor key', () => {
  assert.equal(shouldInitializeVendor(new Set(), 'ga4:G-TEST'), true)
  assert.equal(shouldInitializeVendor(new Set(['ga4:G-TEST']), 'ga4:G-TEST'), false)
})
