import assert from 'node:assert/strict'
import test from 'node:test'

import { payloadPublicURLConfig } from './publicURLs'

test('configures Payload server URL and trusted CSRF origins from existing public URL env vars', () => {
  assert.deepEqual(payloadPublicURLConfig({
    PUBLIC_CMS_URL: 'https://cms.example.test/admin',
    PUBLIC_WEB_URL: 'https://www.example.test/path',
  }), {
    serverURL: 'https://cms.example.test',
    csrf: ['https://cms.example.test', 'https://www.example.test'],
  })
})

test('omits unset or unsafe public URLs so local development defaults still work', () => {
  assert.deepEqual(payloadPublicURLConfig({}), {})
  assert.deepEqual(payloadPublicURLConfig({ PUBLIC_CMS_URL: 'javascript:alert(1)' }), {})
  assert.deepEqual(payloadPublicURLConfig({ PUBLIC_WEB_URL: 'https://www.example.test' }), {})
})
