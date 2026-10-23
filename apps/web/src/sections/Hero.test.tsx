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
    seoHeading: 'Премиальный крытый падел-клуб в Москве', titleLine: 'Первая тренировка', titleConnector: 'за', titleAccent: '1 990 ₽', description: 'с испанскими панорамными кортами',
    desktopSlots: [
      { type: 'button', enabled: true, icon: 'CalendarCheck', action: { mode: 'booking', label: 'Забронировать' } },
      { type: 'button', enabled: true, icon: 'UserRound', action: { mode: 'account', label: 'Личный кабинет' } },
      { type: 'info', enabled: true, icon: 'CalendarDays', title: 'Открытие в ноябре', caption: 'Акция с 01.11 до 15.11' },
    ],
    mobileSlots: [
      { type: 'button', enabled: true, icon: 'CalendarCheck', action: { mode: 'booking', label: 'Забронировать' } },
      { type: 'info', enabled: true, icon: 'CalendarDays', title: 'Открытие в ноябре', caption: 'Акция с 01.11 до 15.11' },
    ],
    socialProof: { coachPhotos: [], ratingLabel: '4.9 · 500+ игроков', caption: 'Рейтинг на Яндекс' }, stats: [],
  } },
} as any

test('hero CTAs have one SSR entrance owner and no nested GSAP reveal', () => {
  const html = renderToStaticMarkup(<ContentProvider content={content}><Hero /></ContentProvider>)
  const primary = html.match(/<div data-hero-slot="1" data-hero-slot-type="button"[\s\S]*?<button[^>]*data-hero-cta="primary"[\s\S]*?Забронировать[\s\S]*?<\/button>/)?.[0] ?? ''
  const secondary = html.match(/<div data-hero-slot="2" data-hero-slot-type="button"[\s\S]*?<button[^>]*data-hero-cta="secondary"[\s\S]*?Личный кабинет[\s\S]*?<\/button>/)?.[0] ?? ''
  assert.match(primary, /<button/)
  assert.match(primary, /Забронировать/)
  assert.doesNotMatch(primary, /data-gsap-reveal/)
  assert.match(secondary, /glass/)
  assert.match(secondary, /lucide-user-round/)
  assert.match(primary, /lucide-calendar-check/)
  assert.doesNotMatch(secondary, /data-gsap-reveal/)
  assert.doesNotMatch(html, /data-gsap-reveal/)
})

test('disabled hero slots are omitted from server-rendered markup', () => {
  const disabled = { ...content, home: { ...content.home, hero: { ...content.home.hero, mobileSlots: [{ ...content.home.hero.mobileSlots[0], enabled: false }, content.home.hero.mobileSlots[1]] } } }
  const html = renderToStaticMarkup(<ContentProvider content={disabled}><Hero /></ContentProvider>)
  assert.equal([...html.matchAll(/data-hero-slot="1" data-hero-slot-type="button"/g)].length, 1)
  assert.equal([...html.matchAll(/data-hero-cta="primary"/g)].length, 1)
  assert.match(html, /Открытие в ноябре/)
})

test('glass hero CTA animates its own backdrop-filter layer', () => {
  const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
  const glassKeyframes = css.match(/@keyframes unlim-enter-glass \{([\s\S]*?)\n\}/)?.[1]
  const secondaryRule = css.match(/\[data-hero-cta="secondary"\] \{([\s\S]*?)\n\}/)?.[1]

  assert.match(glassKeyframes ?? '', /translate3d\(0, 0, 0\)/)
  assert.match(secondaryRule ?? '', /animation: unlim-enter-glass/)
  assert.match(secondaryRule ?? '', /will-change: opacity, transform/)
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
  assert.ok(html.includes('в\u00a0Москве'))
  assert.ok(html.includes('data-no-typography=""'))
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
  assert.match(html, /<div data-hero-description="" data-no-typography="" class="type-hero-lead mt-5 max-w-\[900px\] text-white\/75 sm:mt-7"/)
  assert.ok(html.includes('в\u00a0Москве'))
  assert.match(readFileSync(new URL('../index.css', import.meta.url), 'utf8'), /\[data-hero-description\] \{ animation: unlim-enter-up \.58s cubic-bezier\(\.16, 1, \.3, 1\) \.18s backwards; will-change: opacity, transform; \}/)
  assert.match(html, /data-hero-slot="3" data-hero-slot-type="info"/)
  assert.match(html, /data-hide-icons-narrow="true" class="mt-6 flex flex-nowrap items-center gap-2 sm:mt-8 sm:gap-3"/)
  assert.match(html, /container-page absolute inset-x-0 top-8 z-10 flex items-center justify-between gap-2 md:hidden/)
  assert.match(html, /data-hero-social-proof=""[^>]*max-w-\[55%\]/)
  assert.match(html, /Рейтинг на Яндекс/)
  assert.doesNotMatch(html, /lucide-users/)
  assert.match(html, /data-hero-title=""[^>]*style="--hero-title-font-size-mobile:42px;--hero-title-font-size-desktop:96px"/)
  assert.equal(desktopTint, 'radial-gradient(ellipse 80% 60% at 11% 22%, rgb(0 0 0 / 0%) 30%, #000000a3 70%, #000000c9 154%)')
})


test('mobile opening notice reads its configured slot and receives the glass entrance animation', () => {
  const updated = structuredClone(content)
  updated.home.hero = { ...updated.home.hero, titleLine: '2 часа', titleConnector: 'по цене', titleAccent: 'одного', mobileSlots: [updated.home.hero.mobileSlots[0], { type: 'info', enabled: true, icon: 'CalendarDays', title: 'Открытие в ноябре', caption: 'Акция с 01.11 до 15.11' }] }
  const html = renderToStaticMarkup(<ContentProvider content={updated}><Hero /></ContentProvider>)
  assert.match(html, /data-hero-opening-notice="" data-hero-slot="2" data-hero-slot-type="info"/)
  assert.match(html, /Открытие в ноябре/)
  assert.match(html, /Акция с 01.11 до 15.11/)
  assert.match(html, /bg-white/)
  assert.match(html, /leading-tight/)
  assert.match(html, /data-hero-accent="" class="inline-block text-\[#c2f542\]">одного/)
})


test('social proof keeps full desktop copy alongside compact mobile text', () => {
  const html = renderToStaticMarkup(<ContentProvider content={content}><Hero /></ContentProvider>)
  assert.match(html, /class="md:hidden">4.9<\/span>/)
  assert.match(html, /class="hidden md:inline">4.9 · 500\+ игроков<\/span>/)
  assert.match(html, /class="md:hidden">Яндекс<\/span>/)
  assert.match(html, /class="hidden md:inline">Рейтинг на Яндекс<\/span>/)
})
