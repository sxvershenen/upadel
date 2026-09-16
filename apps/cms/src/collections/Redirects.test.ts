import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeRedirectPath, validateRedirectTraversal } from './Redirects'

test('redirect paths normalize and reject query/hash', () => {
  assert.equal(normalizeRedirectPath(' //old//path/ '), '/old/path')
  assert.equal(normalizeRedirectPath('/old?q=1'), '')
  assert.equal(normalizeRedirectPath('/old#part'), '')
})

test('redirect traversal rejects self, cycles and long chains', async () => {
  assert.notEqual(await validateRedirectTraversal('/a', '/a', async () => null), true)
  const cycle = new Map([['/b', '/c'], ['/c', '/a']])
  assert.match(String(await validateRedirectTraversal('/a', '/b', async (path) => cycle.get(path) ?? null)), /Цикл/)
  const chain = new Map(Array.from({ length: 7 }, (_, index) => [`/${index}`, `/${index + 1}`]))
  assert.match(String(await validateRedirectTraversal('/source', '/0', async (path) => chain.get(path) ?? null)), /шесть/)
  assert.equal(await validateRedirectTraversal('/a', '/b', async () => null), true)
})
