import assert from 'node:assert/strict'
import test from 'node:test'

import { homepageDTOversion, parseCatalogDTO, parsePadelCourtZakazPageDTO } from './index'

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
    pagination: { page: 1, limit: 12, totalDocs: 0, totalPages: 1 },
    query: { page: 1 },
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
    pagination: { page: 1, limit: 12, totalDocs: 0, totalPages: 1 },
    query: { page: 1 },
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
    pagination: { page: 1, limit: 12, totalDocs: 0, totalPages: 1 },
    query: { page: 1 },
  }), /invalid children/)
})

const padelPage = {
  version: homepageDTOversion,
  preview: false,
  generatedAt: new Date().toISOString(),
  kind: 'padel-court-zakaz',
  page,
  site: { desktopNavigation: [] },
  hero: { metrics: [] },
  distributor: { advantages: [] },
  turnkey: { steps: [] },
  price: { factors: [] },
  technology: { background: { alt: '', mimeType: 'image/webp', url: '/tech.webp' }, items: [] },
  gallery: { items: [] },
  models: { items: [] },
  cta: { guarantees: [] },
}

test('padel court page contract accepts typed content and rejects unapproved visual tokens', () => {
  const dto = parsePadelCourtZakazPageDTO(padelPage)
  assert.equal(dto.kind, 'padel-court-zakaz')
  assert.throws(() => parsePadelCourtZakazPageDTO({
    ...padelPage,
    turnkey: { steps: [{ icon: 'UnknownIcon', overlay: 'overlay-blue' }] },
  }), /visual token/)
})
