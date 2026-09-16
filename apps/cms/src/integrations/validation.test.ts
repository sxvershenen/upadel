import assert from 'node:assert/strict'
import test from 'node:test'
import { bookingReadiness, validateBookingAdapter, validateBookingCredentialEnv, validateGA4MeasurementID, validateMetricaCounterID, validateWebmasterVerification } from './validation'

test('vendor identifiers accept only supported formats', () => {
  assert.equal(validateMetricaCounterID('123456'), true)
  assert.notEqual(validateMetricaCounterID('12x'), true)
  assert.equal(validateGA4MeasurementID('G-ABCD1234'), true)
  assert.notEqual(validateGA4MeasurementID('UA-123'), true)
  assert.equal(validateWebmasterVerification('abc_DEF-12'), true)
  assert.notEqual(validateWebmasterVerification('<meta>'), true)
})

test('booking readiness is fail-closed and provider network remains unimplemented', () => {
  assert.deepEqual(bookingReadiness({ mode: 'disabled' }, {}), { ready: false, status: 'disabled' })
  assert.deepEqual(bookingReadiness({ mode: 'external-link', externalURL: 'https://booking.example' }, {}), { ready: true, status: 'ready-external' })
  assert.equal(bookingReadiness({ mode: 'provider-adapter', providerAdapter: 'vivacrm', providerAccountID: 'club', credentialEnvironmentVariable: 'BOOKING_TOKEN' }, { BOOKING_TOKEN: 'secret' }).status, 'integration-not-implemented')
  assert.equal(bookingReadiness({ mode: 'provider-adapter' }, {}).status, 'missing-config')
  assert.notEqual(validateBookingAdapter('vivacrm', { mode: 'provider-adapter' }), true)
  assert.notEqual(validateBookingCredentialEnv('MISSING_TOKEN', { mode: 'provider-adapter' }, {}), true)
})
