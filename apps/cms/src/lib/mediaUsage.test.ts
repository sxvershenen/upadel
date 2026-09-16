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
