import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { GalleryCard } from './GalleryCard'
import { Marquee } from '../ui/Marquee'

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

test('interactive marquee copies keep gallery photos clickable', () => {
  const html = renderToStaticMarkup(<Marquee interactiveCopies><GalleryCard src="/club.webp" alt="Жизнь клуба" onOpen={() => {}} /></Marquee>)
  assert.equal((html.match(/aria-hidden="true"/g) ?? []).length, 3)
  assert.doesNotMatch(html, /inert=""/)
})
