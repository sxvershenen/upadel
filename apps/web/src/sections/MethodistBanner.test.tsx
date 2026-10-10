import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Window } from 'happy-dom'
import { ContentProvider } from '../content/ContentContext'
import { MethodistBanner } from './MethodistBanner'

test('robot banner puts its icon in the practice badge and uses a section-sized price footer without a CTA', () => {
  const content = { site: { contactConfirmation: { channels: [] } }, home: { methodistBanner: { meshTone: 'deep-blue', icon: 'Target', eyebrow: 'Практика', title: 'Тренировочная робопушка', description: 'Отработка ударов', price: 3000, decorativeMedia: { url: '/robot-candid.webp', alt: 'Тренировка', mimeType: 'image/webp' } } } }
  const html = renderToStaticMarkup(<ContentProvider content={content as any}><MethodistBanner /></ContentProvider>)
  const document = new Window().document
  document.body.innerHTML = html
  const top = document.querySelector('[data-robot-banner-top]')!
  assert.ok(top.querySelector('.lucide-target'))
  assert.match(top.querySelector('.lucide-target')!.parentElement!.className, /glass-overlay/)
  assert.ok(document.querySelector('[data-image-overlay="overlay-blue"]'))
  assert.match(top.textContent!, /Практика/)
  assert.equal(top.querySelectorAll('.lucide-target').length, 1)
  const price = document.querySelector('[data-robot-banner-mobile-price] [data-robot-banner-price]')!
  assert.ok(price.querySelector('.type-section'))
  assert.match(price.textContent!, /3\s*000\s*₽/)
  assert.ok(document.querySelector('[data-robot-banner-price-desktop]'))
  assert.match(top.parentElement!.className, /h-\[500px\]/)
  assert.match(document.querySelector('[data-parallax-layer]')!.innerHTML, /object-\[62%_center\]/)
  assert.match(document.querySelector('[data-parallax-layer]')!.innerHTML, /md:object-\[50%_15%\]/)
  assert.match(document.querySelector('[data-parallax-layer] img')!.getAttribute('sizes')!, /max\(100vw, 1200px\)/)
  assert.match(document.querySelector('[data-robot-banner-mobile-price]')!.className, /border-t/)
  assert.equal(document.querySelectorAll('h2').length, 1)
  assert.equal(document.querySelectorAll('button,a').length, 0)
  assert.ok(document.querySelector('[data-parallax-layer]'))
})
