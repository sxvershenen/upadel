import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { BenefitCard } from './BenefitCards'
import { ImageCard } from '../ui/Card'

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

test('mobile benefits swiper uses a horizontal track with protected side gutters and real overlays', () => {
  const sectionSource = readFileSync(new URL('../../sections/Benefits.tsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8')
  const cardSource = readFileSync(new URL('../ui/Card.tsx', import.meta.url), 'utf8')

  assert.doesNotMatch(sectionSource, /<Swiper[^>]*cssMode/)
  assert.match(sectionSource, /className="swiper-page-gutter lg:hidden"/)
  assert.match(css, /\.swiper-page-gutter > \.swiper \{ padding-inline: var\(--page-gutter\); touch-action: pan-y; \}/)
  assert.match(cardSource, /data-image-overlay=\{overlay\}/)
  assert.match(css, /\.benefits-swiper:not\(\.swiper-initialized\) \.swiper-wrapper,[\s\S]*?gap: 12px;/)
  assert.match(css, /\.benefits-swiper:not\(\.swiper-initialized\) \.swiper-slide \{ width: 100%; \}/)
  assert.match(css, /\.benefits-swiper \[data-image-card="true"\][\s\S]*?-webkit-mask-image: none;[\s\S]*?contain: none;/)
  assert.doesNotMatch(css, /\.benefits-swiper[^\{]*\{[^}]*translate3d/)
})

test('UI kit overlay previews use the production overlay element', () => {
  const kitSource = readFileSync(new URL('../../ui-kit/UiKitPage.tsx', import.meta.url), 'utf8')
  const overlays = readFileSync(new URL('../../styles/surfaces.css', import.meta.url), 'utf8')
  assert.match(kitSource, /overlayTones\.map\(\(overlay\) =>[\s\S]*?data-image-overlay=\{overlay\}/)
  assert.match(kitSource, /overlayTones\.map\(\(overlay\) =>[\s\S]*?data-linear-overlay="true"/)
  assert.match(overlays, /\[data-image-overlay="overlay-blue"\] \{ background:/)
})

test('mobile photo benefits and training cards keep parallax with filter-free image loading', () => {
  const benefit = renderToStaticMarkup(<BenefitCard benefit={{
    ...baseBenefit,
    variant: 'chill',
    title: 'Еда и напитки',
    media: { url: '/food.webp', alt: 'Еда и напитки', mimeType: 'image/webp' },
    overlay: 'overlay-sunset',
  } as any} mobile />)
  const trainingCard = renderToStaticMarkup(<ImageCard src="/training.webp" alt="Тренировка" overlay="overlay-blue" parallax fadeImage reveal={false} interactive={false} data-linear-overlay="true" />)
  const styles = readFileSync(new URL('../../styles/surfaces.css', import.meta.url), 'utf8')
  const trainingSource = readFileSync(new URL('./TrainingCard.tsx', import.meta.url), 'utf8')
  const sectionSource = readFileSync(new URL('../../sections/Benefits.tsx', import.meta.url), 'utf8')

  for (const html of [benefit, trainingCard]) {
    assert.match(html, /data-linear-overlay="true"/)
    assert.match(html, /data-progressive-image="fade-loading"/)
    assert.match(html, /data-parallax-viewport/)
    assert.match(html, /data-parallax-layer/)
    assert.doesNotMatch(html, /data-gsap-reveal=/)
  }
  assert.match(trainingSource, /data-linear-overlay="true" fadeImage parallax/)
  assert.match(sectionSource, /<BenefitCard benefit=\{card\} mobile \/>/)
  for (const tone of ['lime', 'blue', 'cyan', 'violet', 'sunset', 'emerald', 'dark']) {
    const gradient = styles.match(new RegExp(`\\[data-linear-overlay="true"\\] \\[data-image-overlay="overlay-${tone}"\\] \\{ background: linear-gradient\\(to bottom, ([^;]+)\\);`))?.[1]
    assert.ok(gradient, `missing ${tone} linear overlay`)
    assert.match(gradient, /^transparent 0%, rgb\(.+ \/ 12%\) 30%, rgb\(.+ \/ 90%\) 70%, #[0-9a-f]{6} 75%, #[0-9a-f]{6} 100%$/)
    const [, strong, light] = gradient.match(/(#[0-9a-f]{6}) 75%, (#[0-9a-f]{6}) 100%$/) ?? []
    const brightness = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16))
      return r * 0.2126 + g * 0.7152 + b * 0.0722
    }
    const saturation = (hex: string) => {
      const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16))
      return (Math.max(...channels) - Math.min(...channels)) / Math.max(...channels)
    }
    assert.ok(brightness(light) > brightness(strong), `${tone} must get lighter at the bottom`)
    assert.ok(saturation(strong) > saturation(light), `${tone} must peak in saturation at 75%`)
  }
  assert.match(styles, /\[data-linear-overlay="true"\] \[data-image-overlay="overlay-blue"\] \{ background: linear-gradient\(to bottom, transparent 0%, rgb\(8 18 30 \/ 12%\) 30%, rgb\(0 86 196 \/ 90%\) 70%, #0044dc 75%, #588cff 100%\)/)
})
