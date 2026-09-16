import assert from 'node:assert/strict'
import test from 'node:test'

import type { SiteDTO } from '@unlim/content-contract'
import { normalizeSiteChrome, persistentNavigationHref } from './siteChromeState'

test('persistent chrome roots homepage fragments so they survive Swup page replacement', () => {
  assert.equal(persistentNavigationHref('#pricing'), '/#pricing')
  assert.equal(persistentNavigationHref('/prices'), '/prices')
  assert.equal(persistentNavigationHref('https://example.com'), 'https://example.com')
})

test('persistent chrome normalizes desktop, submenu, mobile, and mobile-menu links', () => {
  const site = {
    desktopNavigation: [{ label: 'Цены', href: '#pricing', children: [{ label: 'Тренировки', href: '#training' }] }],
    mobileNavigation: [{ label: 'Главная', href: '#top', icon: 'Home' }],
    mobileMenuNavigation: [{ label: 'Контакты', href: '#footer' }],
  } as SiteDTO

  const normalized = normalizeSiteChrome(site)
  assert.equal(normalized.desktopNavigation[0]?.href, '/#pricing')
  assert.equal(normalized.desktopNavigation[0]?.children?.[0]?.href, '/#training')
  assert.equal(normalized.mobileNavigation[0]?.href, '/#top')
  assert.equal(normalized.mobileMenuNavigation[0]?.href, '/#footer')
})
