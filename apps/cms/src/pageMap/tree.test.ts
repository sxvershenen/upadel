import assert from 'node:assert/strict'
import test from 'node:test'

import { buildPageMapTree, collectPageMapAncestors, filterPageMapTree, flattenPageMapTree, pageMapSearchPredicate } from './tree'
import type { PageMapRow } from './tree'

const row = (path: string, parent: string | null, title = path): PageMapRow => ({
  edit: `/edit${path}`,
  issues: [],
  parent,
  path,
  preview: null,
  public: null,
  robots: 'index-follow',
  status: 'published',
  template: 'page',
  title,
})

test('builds a preorder tree and sorts siblings', () => {
  const { roots } = buildPageMapTree([
    row('/z', '/', 'Z'),
    row('/', null, 'Root'),
    row('/a', '/', 'A'),
    row('/a/detail', '/a', 'Detail'),
  ])
  assert.deepEqual(flattenPageMapTree(roots).map((node) => node.path), ['/', '/a', '/a/detail', '/z'])
  assert.equal(roots[0].path, '/')
  assert.deepEqual(roots[0].children.map((node) => node.path), ['/a', '/z'])
  assert.equal(roots[0].children[0].children[0].path, '/a/detail')
})

test('hides collapsed descendants while keeping expanded preorder', () => {
  const { roots } = buildPageMapTree([row('/', null), row('/a', '/'), row('/a/detail', '/a'), row('/b', '/')])
  assert.deepEqual(flattenPageMapTree(roots, new Set(['/'])).map((node) => node.path), ['/', '/a', '/b'])
  assert.deepEqual(flattenPageMapTree(roots, new Set(['/','/a'])).map((node) => node.path), ['/', '/a', '/a/detail', '/b'])
})

test('retains ancestors of a matching descendant during filtering', () => {
  const { roots } = buildPageMapTree([row('/', null), row('/a', '/'), row('/a/detail', '/a', 'Needle'), row('/b', '/')])
  const predicate = pageMapSearchPredicate('needle')
  const filtered = filterPageMapTree(roots, predicate)
  assert.deepEqual(filtered.map((node) => node.path), ['/'])
  assert.deepEqual(filtered[0].children.map((node) => node.path), ['/a'])
  assert.equal(filtered[0].children[0].children[0].title, 'Needle')
  assert.deepEqual([...collectPageMapAncestors(roots, predicate)], ['/', '/a'])
})

test('guards missing parents, duplicate paths, and cycles', () => {
  const { roots, warnings } = buildPageMapTree([
    row('/missing-child', '/missing'),
    row('/duplicate', null),
    row('/duplicate', null),
    row('/cycle-a', '/cycle-b'),
    row('/cycle-b', '/cycle-a'),
  ])
  assert.equal(roots.length, 5)
  assert.equal(roots.find((node) => node.path === '/missing-child')?.treeWarning, 'missing-parent')
  assert.equal(roots.find((node) => node.key.endsWith('#duplicate-2'))?.treeWarning, 'duplicate')
  assert.ok(roots.some((node) => node.treeWarning === 'cycle'))
  assert.ok(warnings.some((warning) => warning.includes('Пропущен родитель')))
  assert.ok(warnings.some((warning) => warning.includes('Дублирующийся путь')))
  assert.ok(warnings.some((warning) => warning.includes('Циклическая иерархия')))
})

test('status predicate preserves draft-only and draft-with-published semantics', () => {
  const { roots } = buildPageMapTree([
    row('/', null),
    { ...row('/draft-only', '/'), status: 'draft-only' },
    { ...row('/draft-published', '/'), status: 'draft-with-published' },
  ])
  assert.deepEqual(filterPageMapTree(roots, pageMapSearchPredicate('', 'draft')).map((node) => node.path), ['/'])
  assert.deepEqual(filterPageMapTree(roots, pageMapSearchPredicate('', 'published')).map((node) => node.path), ['/'])
})
