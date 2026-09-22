import assert from 'node:assert/strict'
import test from 'node:test'
import { catalogPath, parseCatalogQuery } from './catalog'

test('catalog URLs preserve supported filters and give subsequent pages their own URL', () => {
  const query = parseCatalogQuery('blog', new URLSearchParams('page=2&category=guide&sort=popular&utm_source=test&where[secret]=x'))
  assert.deepEqual(query, { page: 2, category: 'guide', sort: 'popular' })
  assert.equal(catalogPath('blog', query), '/blog/?category=guide&sort=popular&page=2')
  assert.equal(catalogPath('coaches', { page: 1 }), '/coaches/')
})

test('invalid page numbers and unsupported filter operators never enter catalog queries', () => {
  for (const page of ['-1', '0', '2.5', 'Infinity', '1000000000', 'oops']) assert.equal(parseCatalogQuery('coaches', new URLSearchParams({ page })).page, 1)
  assert.deepEqual(parseCatalogQuery('coaches', new URLSearchParams('level=advanced&focus=unknown&sort=popular&category=guide')), { page: 1 })
  assert.deepEqual(parseCatalogQuery('tournaments', new URLSearchParams('level=2.5&format=americano&lifecycle=upcoming')), { page: 1, level: '2.5', format: 'americano', lifecycle: 'upcoming' })
})
