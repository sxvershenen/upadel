import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Window } from 'happy-dom'
import { ContentProvider } from '../content/ContentContext'
import { MethodistBanner } from './MethodistBanner'

test('robot banner separates the top icon and badge from the lower title and price without a CTA', () => {
  const content = { site: { contactConfirmation: { channels: [] } }, home: { methodistBanner: { icon: 'Target', eyebrow: 'Практика', title: 'Тренировочная робопушка', description: 'Отработка ударов', price: 3000, decorativeMedia: { url: '/robot-candid.webp', alt: 'Тренировка', mimeType: 'image/webp' } } } }
  const html = renderToStaticMarkup(<ContentProvider content={content as any}><MethodistBanner /></ContentProvider>)
  const document = new Window().document
  document.body.innerHTML = html
  const top = document.querySelector('[data-robot-banner-top]')!
  assert.ok(top.querySelector('.lucide-target'))
  assert.match(top.textContent!, /Практика/)
  assert.match(top.className, /justify-between/)
  const price = document.querySelector('[data-robot-banner-price]')!
  assert.ok(!top.contains(price))
  assert.match(price.className, /self-end/)
  assert.match(price.textContent!, /3\s*000\s*₽/)
  assert.equal(document.querySelectorAll('h2').length, 1)
  assert.equal(document.querySelectorAll('button,a').length, 0)
  assert.ok(document.querySelector('[data-parallax-layer]'))
})
