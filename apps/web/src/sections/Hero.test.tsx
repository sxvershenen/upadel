import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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
  const primary = html.match(/<div data-hero-cta="primary"[\s\S]*?<\/div>/)?.[0] ?? ''
  const secondary = html.match(/<button[^>]*data-hero-cta="secondary"[^>]*>[\s\S]*?Попробовать[\s\S]*?<\/button>/)?.[0] ?? ''
  assert.match(primary, /<button/)
  assert.match(primary, /Забронировать/)
  assert.doesNotMatch(primary, /data-gsap-reveal/)
  assert.match(secondary, /glass/)
  assert.doesNotMatch(secondary, /data-gsap-reveal/)
  assert.doesNotMatch(html, /<div data-hero-cta="secondary"/)
})

test('glass hero CTA animates its own backdrop-filter layer', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const glassKeyframes = css.match(/@keyframes unlim-enter-glass \{([\s\S]*?)\n\}/)?.[1]
  const secondaryRule = css.match(/\[data-hero-cta="secondary"\] \{([\s\S]*?)\n\}/)?.[1]

  assert.match(glassKeyframes ?? '', /translate3d\(0, 0, 0\)/)
  assert.match(secondaryRule ?? '', /animation: unlim-enter-glass/)
  assert.match(secondaryRule ?? '', /will-change: opacity, transform, backdrop-filter/)
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

test('hero title entrance stays on the compositor for late words and the accent', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const wordKeyframes = css.match(/@keyframes unlim-enter-word \{([\s\S]*?)\n\}/)?.[1]
  const wordRule = css.match(/\[data-hero-word\] \{([\s\S]*?)\n\}/)?.[1]
  const accentRule = css.match(/\[data-hero-accent\] \{([^}]*)\}/)?.[1]

  assert.ok(wordKeyframes)
  assert.doesNotMatch(wordKeyframes, /filter\s*:/)
  assert.match(wordKeyframes, /from \{ opacity: 0; transform: translate3d\(0, \.7em, 0\); \}/)
  assert.match(wordKeyframes, /to \{ opacity: 1; transform: translate3d\(0, 0, 0\); \}/)
  assert.match(wordRule ?? '', /backface-visibility: hidden/)
  assert.match(wordRule ?? '', /will-change: opacity, transform/)
  assert.match(accentRule ?? '', /will-change: opacity, transform/)
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
      centerX: 11, centerY: 22,
      stop1: { opacity: 0, position: 30 }, stop2: { opacity: 64, position: 70 }, stop3: { opacity: 79, position: 154 },
    },
    mobile: {
      centerX: 50, centerY: 30,
      stop1: { opacity: 0, position: 30 }, stop2: { opacity: 39, position: 50 }, stop3: { opacity: 84, position: 90 },
    },
  }
  responsiveContent.home.hero.titleFontSize = { mobile: 42, desktop: 96 }
  const html = renderToStaticMarkup(<ContentProvider content={responsiveContent}><Hero /></ContentProvider>)
  const desktopTint = heroTintGradient(responsiveContent.home.hero.tint.desktop)
  assert.match(html, /data-hero-tint="desktop"/)
  assert.match(html, /data-hero-tint="mobile"/)
  assert.match(html, /radial-gradient\(ellipse 80% 60% at 11% 22%, rgb\(0 0 0 \/ 0%\) 30%, #000000a3 70%, #000000c9 154%\)/)
  assert.match(html, /radial-gradient\(ellipse 130% 50% at 50% 30%, rgb\(0 0 0 \/ 0%\) 30%, #00000063 50%, #000000d6 90%\)/)
  assert.match(html, /data-hero-description="" class="type-hero-lead mt-5 max-w-\[900px\] text-white\/75 sm:mt-7"/)
  assert.match(html, /data-hide-icons-narrow="true" class="mt-6 flex flex-nowrap items-center gap-2 sm:mt-8 sm:gap-3"/)
  assert.match(html, /container-page absolute inset-x-0 top-8 z-10 md:hidden/)
  assert.match(html, /data-hero-title=""[^>]*style="--hero-title-font-size-mobile:42px;--hero-title-font-size-desktop:96px"/)
  assert.equal(desktopTint, 'radial-gradient(ellipse 80% 60% at 11% 22%, rgb(0 0 0 / 0%) 30%, #000000a3 70%, #000000c9 154%)')
})
