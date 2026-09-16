import assert from 'node:assert/strict'
import test from 'node:test'
import { shouldInitializeVendor, shouldLoadExternalVendor, shouldReloadForVendorRevoke } from './ExternalAnalytics'

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

test('vendor initialization is deduplicated by stable vendor key', () => {
  assert.equal(shouldInitializeVendor(new Set(), 'ga4:G-TEST'), true)
  assert.equal(shouldInitializeVendor(new Set(['ga4:G-TEST']), 'ga4:G-TEST'), false)
})
