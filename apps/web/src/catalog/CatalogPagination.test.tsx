import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CatalogPagination, visiblePageNumbers } from './CatalogPagination'

test('large catalog pagination stays bounded and exposes neighboring pages', () => {
  assert.deepEqual(visiblePageNumbers(500, 1000), [1, 'ellipsis', 499, 500, 501, 'ellipsis', 1000])
  const html = renderToStaticMarkup(<CatalogPagination dto={{ kind: 'blog', query: { page: 2, category: 'guide' }, pagination: { page: 2, totalPages: 4, totalDocs: 45, limit: 12 } } as never} />)
  assert.match(html, /href="\/blog\/\?category=guide&amp;page=3"/)
  assert.match(html, /aria-current="page"/)
  assert.match(html, /href="\/blog\/\?category=guide"/)
})

test('single-page catalogs have no pagination controls', () => {
  assert.equal(renderToStaticMarkup(<CatalogPagination dto={{ pagination: { page: 1, totalPages: 1 } } as never} />), '')
})
