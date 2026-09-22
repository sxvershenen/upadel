import assert from 'node:assert/strict'
import test from 'node:test'

import { publicRouteError } from './publicRouteError'

test('CMS 404 remains a real public 404', () => {
  assert.equal(publicRouteError({ status: 404 }).status, 404)
})

test('network and upstream failures are exposed as temporary failures', () => {
  assert.equal(publicRouteError(new Error('connection failed')).status, 503)
  assert.equal(publicRouteError({ status: 500 }).status, 503)
})
