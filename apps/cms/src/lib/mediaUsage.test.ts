import assert from 'node:assert/strict'
import test from 'node:test'

import { getMediaUsage } from './mediaUsage'

test('reports parent and nested desktop navigation icon usage', async () => {
  const siteSettings = {
    _status: 'published',
    desktopNavigation: [{
      label: 'Цены',
      icon: 11,
      children: [{ label: 'Аренда', icon: { id: 12 } }],
    }],
  }
  const payload = {
    find: async () => ({ docs: [] }),
    findGlobal: async ({ slug }: { slug: string }) => slug === 'site-settings' ? siteSettings : { _status: 'draft' },
  }

  const usage = await getMediaUsage(payload as never, [11, 12])

  assert.equal(usage.filter(({ mediaID }) => mediaID === '11').length, 1)
  assert.equal(usage.filter(({ mediaID }) => mediaID === '12').length, 1)
  assert.match(usage.find(({ mediaID }) => mediaID === '12')?.location ?? '', /Цены → Аренда → иконка/)
  assert.ok(usage.every(({ state }) => state === 'live'))
})

test('reports every direct padel landing media relation, including nested cards', async () => {
  const padelPage = {
    _status: 'published',
    heroImage: 11,
    heroVideo: 12,
    technology: { background: 13 },
    turnkey: { steps: [{ image: 14 }] },
    gallery: { items: [{ media: 15 }] },
    models: { items: [{ image: 16 }] },
    seo: { socialImage: 17 },
  }
  const payload = {
    find: async () => ({ docs: [] }),
    findGlobal: async ({ slug }: { slug: string }) => {
      if (slug === 'site-settings') return { _status: 'draft' }
      if (slug === 'padel-court-zakaz-page') return padelPage
      return { _status: 'draft' }
    },
  }

  const usage = await getMediaUsage(payload as never, [11, 12, 13, 14, 15, 16, 17])

  assert.deepEqual(new Set(usage.map(({ mediaID }) => mediaID)), new Set(['11', '12', '13', '14', '15', '16', '17']))
  assert.ok(usage.every(({ href }) => href === '/admin/globals/padel-court-zakaz-page'))
})
