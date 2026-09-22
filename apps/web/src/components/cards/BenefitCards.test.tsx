import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { BenefitCard } from './BenefitCards'

const baseBenefit = {
  id: 'benefit',
  eyebrow: 'Преимущество',
  description: 'Описание преимущества.',
  supportingText: null,
  media: null,
  overlay: null,
  meshTone: 'sky',
  action: { mode: 'none' },
}

test('non-linked parking and food cards do not advertise hover or pointer interaction', () => {
  const parking = renderToStaticMarkup(<BenefitCard benefit={{
    ...baseBenefit,
    variant: 'parking',
    title: 'Бесплатная парковка',
    meshTone: 'lime',
  } as any} />)
  const food = renderToStaticMarkup(<BenefitCard benefit={{
    ...baseBenefit,
    variant: 'chill',
    title: 'Еда и напитки',
    media: { url: '/food.webp', alt: 'Еда и напитки', mimeType: 'image/webp' },
    overlay: 'overlay-sunset',
  } as any} />)

  for (const html of [parking, food]) {
    assert.doesNotMatch(html, /cursor-pointer/)
    assert.doesNotMatch(html, /card-spring/)
    assert.doesNotMatch(html, /<a\b|<button\b/)
  }
})

test('kids card is an internal link to the training page', () => {
  const html = renderToStaticMarkup(<BenefitCard benefit={{
    ...baseBenefit,
    variant: 'kids-wide',
    title: 'Секции для детей с 5 лет',
    supportingText: 'Детские ракетки',
    action: { mode: 'internal-link', href: '#training' },
  } as any} />)

  assert.match(html, /href="\/training"/)
  assert.match(html, /aria-label="Открыть: Секции для детей с 5 лет"/)
  assert.doesNotMatch(html, /href="#training"/)
  assert.match(html, /cursor-pointer/)
})

test('mobile benefits swiper uses native scroll snap and real overlay elements for Safari', () => {
  const sectionSource = readFileSync(new URL('../../sections/Benefits.tsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8')
  const cardSource = readFileSync(new URL('../ui/Card.tsx', import.meta.url), 'utf8')

  assert.match(sectionSource, /<Swiper[^>]*cssMode/)
  assert.doesNotMatch(sectionSource, /benefits-swiper swiper-breathe !px-5/)
  assert.match(cardSource, /data-image-overlay=\{overlay\}/)
  assert.match(css, /\.benefits-swiper:not\(\.swiper-initialized\) \.swiper-wrapper,[\s\S]*?gap: 12px;/)
  assert.match(css, /\.benefits-swiper:not\(\.swiper-initialized\) \.swiper-slide \{ width: 100%; \}/)
  assert.match(css, /\.benefits-swiper \[data-image-card="true"\][\s\S]*?-webkit-mask-image: none;[\s\S]*?contain: none;/)
  assert.doesNotMatch(css, /\.benefits-swiper[^\{]*\{[^}]*translate3d/)
})
