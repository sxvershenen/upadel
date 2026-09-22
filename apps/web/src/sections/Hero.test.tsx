import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ContentProvider } from '../content/ContentContext'
import { Hero, heroTintGradient, resolveHeroParallaxTarget } from './Hero'

const content = {
  site: {
    brandLogoMode: 'text', brandName: 'UNLIM', headerSubtitle: 'RIGA',
    contacts: {}, booking: { ready: false, buttonLabel: 'Забронировать' },
    contactConfirmation: { channels: [] },
  },
  home: { hero: {
    seoHeading: 'Премиальный крытый падел-клуб', titleLine: 'Первая тренировка', titleConnector: 'за', titleAccent: '1 990 ₽', description: 'с испанскими панорамными кортами',
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

test('hero keeps the offer decorative and exposes the SEO heading below it', () => {
  const html = renderToStaticMarkup(<ContentProvider content={content}><Hero /></ContentProvider>)
  assert.equal((html.match(/<h1/g) ?? []).length, 1)
  assert.match(html, /<h1 class="inline">Премиальный крытый падел-клуб<\/h1> <span>с испанскими панорамными кортами<\/span>/)
  assert.doesNotMatch(html, /<h1[^>]*>[\s\S]*Первая тренировка/)
})

test('hero renders responsive image variants through one picture image', () => {
  const responsiveContent = structuredClone(content)
  responsiveContent.home.hero.desktopMedia = { url: '/desktop.webp', alt: 'Корт', mimeType: 'image/webp', srcSet: '/desktop-960.webp 960w, /desktop.webp 1920w' }
  responsiveContent.home.hero.mobileMedia = { url: '/mobile.webp', alt: 'Корт', mimeType: 'image/webp', srcSet: '/mobile-480.webp 480w, /mobile.webp 960w' }
  const html = renderToStaticMarkup(<ContentProvider content={responsiveContent}><Hero /></ContentProvider>)
  assert.match(html, /<picture><source media="\(max-width: 767px\)" srcSet="\/mobile-480\.webp 480w, \/mobile\.webp 960w"/)
  assert.equal((html.match(/data-hero-parallax-media/g) ?? []).length, 1)
})

test('hero renders separate desktop and mobile three-point black tints and keeps the mobile logo at spacing 8', () => {
  const responsiveContent = structuredClone(content)
  responsiveContent.home.hero.tint = {
    desktop: {
      point1: { opacity: 81, x: 11, y: 22 }, point2: { opacity: 62, x: 33, y: 44 }, point3: { opacity: 43, x: 55, y: 66 },
    },
    mobile: {
      point1: { opacity: 71, x: 17, y: 28 }, point2: { opacity: 52, x: 39, y: 50 }, point3: { opacity: 33, x: 61, y: 72 },
    },
  }
  const html = renderToStaticMarkup(<ContentProvider content={responsiveContent}><Hero /></ContentProvider>)
  assert.match(html, /data-hero-tint="desktop"/)
  assert.match(html, /data-hero-tint="mobile"/)
  assert.match(html, /radial-gradient\(ellipse[^)]* at 11% 22%, rgba\(0,0,0,0\.81\) 0%/)
  assert.match(html, /radial-gradient\(ellipse[^)]* at 17% 28%, rgba\(0,0,0,0\.71\) 0%/)
  assert.match(html, /container-page absolute inset-x-0 top-8 z-10 md:hidden/)
  assert.equal(heroTintGradient([
    responsiveContent.home.hero.tint.desktop.point1,
    responsiveContent.home.hero.tint.desktop.point2,
    responsiveContent.home.hero.tint.desktop.point3,
  ]).match(/radial-gradient/g)?.length, 3)
})
