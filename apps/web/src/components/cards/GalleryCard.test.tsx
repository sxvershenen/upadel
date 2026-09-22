import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { GalleryCard } from './GalleryCard'

test('GalleryCard exposes button interaction only when a lightbox action exists', () => {
  const staticCard = renderToStaticMarkup(<GalleryCard src="/club.webp" alt="Жизнь клуба" onOpen={undefined} />)
  assert.match(staticCard, /disabled=""/)
  assert.match(staticCard, /cursor-default/)
  assert.doesNotMatch(staticCard, /Открыть изображение/)

  const interactiveCard = renderToStaticMarkup(<GalleryCard src="/club.webp" alt="Жизнь клуба" onOpen={() => {}} />)
  assert.doesNotMatch(interactiveCard, /disabled=""/)
  assert.match(interactiveCard, /aria-label="Открыть изображение: Жизнь клуба"/)
  assert.match(interactiveCard, /cursor-pointer/)
})
