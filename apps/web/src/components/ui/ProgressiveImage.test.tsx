import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ProgressiveImage } from './ProgressiveImage'

test('CMS media emits responsive candidates and reserves intrinsic dimensions', () => {
  const html = renderToStaticMarkup(<ProgressiveImage media={{ url: '/large.webp', alt: 'Корт', mimeType: 'image/webp', width: 1200, height: 800, srcSet: '/small.webp 640w, /large.webp 1200w' }} sizes="(min-width: 768px) 50vw, 100vw" loading="lazy" />)
  assert.match(html, /srcSet="\/small.webp 640w, \/large.webp 1200w"/)
  assert.match(html, /width="1200"/)
  assert.match(html, /height="800"/)
  assert.match(html, /sizes="\(min-width: 768px\) 50vw, 100vw"/)
  assert.match(html, /fetchPriority="low"/)
})

test('ProgressiveImage renders an element-sized skeleton by default', () => {
  const html = renderToStaticMarkup(<ProgressiveImage src="/avatar.webp" alt="Тренер" />)

  assert.match(html, /data-progressive-image="loading"/)
})

test('ProgressiveImage lets logos and transparent artwork opt out of the skeleton', () => {
  const html = renderToStaticMarkup(<ProgressiveImage src="/logo.svg" alt="UNLIM" skeleton={false} />)

  assert.match(html, /data-progressive-image="fade-loading"/)
  assert.doesNotMatch(html, /data-progressive-image="loading"/)
})
