import assert from 'node:assert/strict'
import test from 'node:test'
import { codeDefinedRouteRegistry, publicRouteRegistry } from '@unlim/content-contract'
import type { Payload } from 'payload'

import { buildPagePath, isSystemPagePath, normalizePagePath, normalizePageSegment, pagePathExists } from './pages'

test('normalizes canonical parent paths without accepting query or hash fragments', () => {
  assert.equal(normalizePagePath(' /club//events/ '), '/club/events')
  assert.equal(normalizePagePath('/'), '/')
  assert.equal(normalizePagePath('club'), '')
  assert.equal(normalizePagePath('/club?draft=1'), '')
  assert.equal(normalizePagePath('/club#details'), '')
  assert.equal(normalizePagePath('/club/%ZZ'), '')
})

test('builds nested paths only from safe URL segments', () => {
  assert.equal(normalizePageSegment('summer-camp-2027'), 'summer-camp-2027')
  assert.equal(normalizePageSegment('Summer Camp'), '')
  assert.equal(buildPagePath('/', 'summer-camp'), '/summer-camp')
  assert.equal(buildPagePath('/training', 'summer-camp'), '/training/summer-camp')
  assert.equal(buildPagePath('/training', '../admin'), '')
})

test('reserves CMS and API route namespaces', () => {
  assert.equal(isSystemPagePath('/admin'), true)
  assert.equal(isSystemPagePath('/api/admin/page-map'), true)
  assert.equal(isSystemPagePath('/about'), false)
  assert.equal(isSystemPagePath('/gift'), false)
})

test('typed registries include CMS thematic routes and the code-defined padel landing', async () => {
  const fixedPaths = new Set(publicRouteRegistry.map(({ path }) => path))
  assert.equal(fixedPaths.has('/training'), true)
  assert.equal(fixedPaths.has('/gift'), true)
  assert.deepEqual(codeDefinedRouteRegistry.map(({ path }) => path), ['/padel-courts'])

  const payload = { find: async () => { throw new Error('registry path must not query the database') } } as unknown as Payload
  assert.equal(await pagePathExists(payload, '/padel-courts'), true)
})
