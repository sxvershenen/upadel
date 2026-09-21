import assert from 'node:assert/strict'
import test from 'node:test'

import { payloadPublicURLConfig, publicContentOrigin } from './publicURLs'

test('configures Payload server URL and trusted CSRF origins from existing public URL env vars', () => {
  assert.deepEqual(payloadPublicURLConfig({
    PUBLIC_CMS_URL: 'https://cms.example.test/admin',
    PUBLIC_WEB_URL: 'https://www.example.test/path',
  }), {
    serverURL: 'https://cms.example.test',
    csrf: ['https://cms.example.test', 'https://www.example.test'],
  })
})

test('public content origin can use a same-origin web proxy without changing the CMS server URL', () => {
  assert.equal(publicContentOrigin('http://127.0.0.1:3000', 'http://192.168.1.20:4321/path'), 'http://192.168.1.20:4321')
  assert.equal(publicContentOrigin('http://127.0.0.1:3000', 'javascript:alert(1)'), 'http://127.0.0.1:3000')
})

test('omits unset or unsafe public URLs so local development defaults still work', () => {
  assert.deepEqual(payloadPublicURLConfig({}), {})
  assert.deepEqual(payloadPublicURLConfig({ PUBLIC_CMS_URL: 'javascript:alert(1)' }), {})
  assert.deepEqual(payloadPublicURLConfig({ PUBLIC_WEB_URL: 'https://www.example.test' }), {})
})
