import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ContentProvider } from '../content/ContentContext'
import { Hero, resolveHeroParallaxTarget } from './Hero'

const content = {
  site: {
    brandLogoMode: 'text', brandName: 'UNLIM', headerSubtitle: 'RIGA',
    contacts: {}, booking: { ready: false, buttonLabel: 'Забронировать' },
    contactConfirmation: { channels: [] },
  },
  home: { hero: {
    titleLine: 'Первая тренировка', titleConnector: 'за', titleAccent: '1 990 ₽', description: 'Падел-клуб',
    primaryAction: { mode: 'booking', label: 'Забронировать' },
    secondaryAction: { mode: 'trial-booking', label: 'Попробовать' },
    socialProof: { coachPhotos: [], ratingLabel: '4.9', caption: 'Рейтинг' }, stats: [],
  } },
} as any

test('hero CTAs have one SSR entrance owner and no nested GSAP reveal', () => {
  const html = renderToStaticMarkup(<ContentProvider content={content}><Hero /></ContentProvider>)
  const actions = html.match(/<div data-hero-cta="(?:primary|secondary)"[\s\S]*?<\/div>/g) ?? []
  assert.equal(actions.length, 2)
  actions.forEach((action) => {
    assert.match(action, /<button/)
    assert.doesNotMatch(action, /data-gsap-reveal/)
  })
  assert.match(actions[0], /Забронировать/)
  assert.match(actions[1], /Попробовать/)
})

test('mobile hero parallax falls back to desktop media when no mobile asset is configured', () => {
  const desktop = { id: 'desktop' }
  const mobile = { id: 'mobile' }
  assert.equal(resolveHeroParallaxTarget(true, desktop, null), desktop)
  assert.equal(resolveHeroParallaxTarget(true, desktop, mobile), mobile)
  assert.equal(resolveHeroParallaxTarget(false, desktop, mobile), desktop)
})
