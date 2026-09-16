import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { FloatingBackLink } from './FloatingBackLink'

test('floating back link is desktop-only and positioned in the upper-left corner', () => {
  const html = renderToStaticMarkup(<FloatingBackLink href="/blog" />)

  assert.match(html, /href="\/blog"/)
  assert.match(html, /class="[^"]*fixed[^"]*left-4[^"]*top-2\.5[^"]*hidden[^"]*md:inline-flex/)
  assert.match(html, />[\s\S]*Назад[\s\S]*<\/a>/)
})
