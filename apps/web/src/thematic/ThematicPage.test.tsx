import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { Prices } from './ThematicPage'

test('Prices keeps full-width tabs on mobile and content-sized tabs on desktop', () => {
  const html = renderToStaticMarkup(<Prices dto={{
    tabs: { rent: 'Аренда', memberships: 'Абонементы' },
    rentalRates: [],
    memberships: [],
    rules: [],
  } as any} />)

  assert.match(html, /class="container-page sticky top-\[var\(--page-gutter\)\] z-30/)
  assert.match(html, /role="tablist" aria-label="Разделы цен"/)
  assert.match(html, /class="[^"]*bg-control[^"]*w-full[^"]*"/)
  assert.match(html, /w-full \[&amp;&gt;button\]:flex-1 md:w-auto md:\[&amp;&gt;button\]:flex-none/)
  assert.match(html, /aria-controls="price-panel-rent"/)
  assert.match(html, /aria-controls="price-panel-memberships"/)
  assert.doesNotMatch(html, /max-w-\[560px\]/)
  assert.doesNotMatch(html, /grid grid-cols-2 gap-1 rounded-2xl bg-ink/)
})
