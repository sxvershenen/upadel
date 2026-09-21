import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ProgressiveImage } from './ProgressiveImage'

test('ProgressiveImage renders an element-sized skeleton by default', () => {
  const html = renderToStaticMarkup(<ProgressiveImage src="/avatar.webp" alt="Тренер" />)

  assert.match(html, /data-progressive-image="loading"/)
})

test('ProgressiveImage lets logos and transparent artwork opt out of the skeleton', () => {
  const html = renderToStaticMarkup(<ProgressiveImage src="/logo.svg" alt="UNLIM" skeleton={false} />)

  assert.match(html, /data-progressive-image="fade-loading"/)
  assert.doesNotMatch(html, /data-progressive-image="loading"/)
})
