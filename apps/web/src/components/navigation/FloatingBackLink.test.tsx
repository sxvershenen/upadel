import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { FloatingBackLink } from './FloatingBackLink'

test('floating back link is desktop-only and positioned in the upper-left corner', () => {
  const html = renderToStaticMarkup(<FloatingBackLink href="/blog" />)

  assert.match(html, /href="\/blog"/)
  assert.match(html, /class="[^"]*fixed[^"]*left-\[var\(--page-gutter\)\][^"]*top-2\.5[^"]*hidden[^"]*backdrop-blur-xl[^"]*md:inline-flex/)
  assert.match(html, />[\s\S]*Назад[\s\S]*<\/a>/)
})
