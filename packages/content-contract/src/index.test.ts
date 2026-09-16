import assert from 'node:assert/strict'
import test from 'node:test'

import { homepageDTOversion, parseCatalogDTO } from './index'

const page = { eyebrow: 'Блог', title: 'Блог', intro: 'Статьи', hero: { media: { alt: 'Фон', mimeType: 'image/webp', url: '/hero.webp' }, grayscale: false }, seo: {} }

test('catalog contract accepts an optional image icon for desktop navigation', () => {
  const dto = parseCatalogDTO({
    version: homepageDTOversion,
    preview: false,
    generatedAt: new Date().toISOString(),
    kind: 'blog',
    page,
    site: {
      desktopNavigation: [{
        label: 'Цены',
        href: '/prices',
        icon: { alt: '', mimeType: 'image/svg+xml', url: '/icons/prices.svg' },
        children: [{ label: 'Тренеры', href: '/coaches', icon: { alt: '', mimeType: 'image/png', url: '/icons/coaches.png' } }],
      }],
    },
    items: [],
  })

  assert.equal(dto.site.desktopNavigation[0].icon?.mimeType, 'image/svg+xml')
  assert.equal(dto.site.desktopNavigation[0].children?.[0].href, '/coaches')
})

test('catalog contract rejects non-image desktop navigation icons', () => {
  assert.throws(() => parseCatalogDTO({
    version: homepageDTOversion,
    preview: false,
    generatedAt: new Date().toISOString(),
    kind: 'blog',
    page,
    site: {
      desktopNavigation: [{ label: 'Цены', href: '/prices', icon: { alt: '', mimeType: 'text/html', url: '/icons/prices.html' } }],
    },
    items: [],
  }), /invalid icon/)
})

test('catalog contract rejects malformed desktop navigation children', () => {
  assert.throws(() => parseCatalogDTO({
    version: homepageDTOversion,
    preview: false,
    generatedAt: new Date().toISOString(),
    kind: 'blog',
    page,
    site: { desktopNavigation: [{ label: 'Цены', href: '/prices', children: { label: 'Аренда', href: '/prices' } }] },
    items: [],
  }), /invalid children/)
})
