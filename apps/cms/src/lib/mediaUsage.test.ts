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
    findVersions: async () => ({ docs: [] }),
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
    findVersions: async () => ({ docs: [] }),
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

test('runs all global usage checks when a request is threaded through the transaction', async () => {
  const calls: string[] = []
  const request = { id: 'request' }
  const payload = {
    find: async () => ({ docs: [] }),
    findVersions: async () => ({ docs: [] }),
    findGlobal: async ({ draft, req, slug }: { draft: boolean; req?: unknown; slug: string }) => {
      assert.equal(req, request)
      calls.push(`${slug}:${draft}`)
      return slug === 'padel-court-zakaz-page' && draft
        ? { _status: 'draft', heroImage: 77 }
        : { _status: 'draft' }
    },
  }

  const usage = await getMediaUsage(payload as never, [77], request as never)
  assert.ok(calls.includes('padel-court-zakaz-page:false'))
  assert.ok(calls.includes('padel-court-zakaz-page:true'))
  assert.match(usage[0]?.location ?? '', /Падел-корты JUBO/)
})

test('reports article body uploads from published, draft and retained versions', async () => {
  const upload = (value: unknown) => ({ root: { type: 'root', children: [{ type: 'upload', relationTo: 'media', value }] } })
  const payload = {
    find: async ({ collection, draft }: { collection: string; draft: boolean }) => collection === 'articles'
      ? { docs: draft
        ? [{ id: 2, title: 'Черновик', content: upload({ id: 22 }) }]
        : [{ id: 1, title: 'Опубликована', content: upload(21) }] }
      : { docs: [] },
    findVersions: async () => ({ docs: [{ parent: 3, version: { title: 'Архив', content: upload('23') } }] }),
    findGlobal: async () => ({ _status: 'draft' }),
  }

  const usage = await getMediaUsage(payload as never, [21, 22, 23])
  assert.deepEqual(new Set(usage.map(({ mediaID }) => mediaID)), new Set(['21', '22', '23']))
  assert.equal(usage.find(({ mediaID }) => mediaID === '21')?.state, 'live')
  assert.equal(usage.find(({ mediaID }) => mediaID === '22')?.state, 'draft-only')
  assert.match(usage.find(({ mediaID }) => mediaID === '23')?.location ?? '', /сохранённая версия/)
  assert.equal(usage.find(({ mediaID }) => mediaID === '23')?.state, 'version')
  assert.equal(usage.find(({ mediaID }) => mediaID === '23')?.href, '/admin/collections/articles/3')
})

test('admin display cache is invalidated on content changes; deletion checks always rescan', async () => {
  const { markContentChanged } = await import('../content/projectionCache')
  let mediaID = 11; let scans = 0
  const payload = { find: async () => ({ docs: [] }), findVersions: async () => ({ docs: [] }), findGlobal: async ({ slug }: { slug: string }) => {
    scans++; return slug === 'site-settings' ? { _status: 'published', brandLogo: mediaID } : { _status: 'draft' }
  } }
  assert.equal((await getMediaUsage(payload as never, [11])).length, 1)
  const before = scans; await getMediaUsage(payload as never, [11]); assert.equal(scans, before)
  mediaID = 12
  assert.equal((await getMediaUsage(payload as never, [12], {} as never)).length, 1)
  assert.ok(scans > before)
  await markContentChanged({})
  assert.equal((await getMediaUsage(payload as never, [11])).length, 0)
})

test('later article/version pages retain deletion references and scan failures reject', async () => {
  const upload = { root: { children: [{ type: 'upload', relationTo: 'media', value: 55 }] } }
  const payload = {
    find: async () => ({ docs: [] }),
    findVersions: async ({ page }: { page: number }) => page === 1 ? { docs: [], hasNextPage: true, nextPage: 2 } : { docs: [{ parent: 8, version: { content: upload, title: 'Archived' } }], hasNextPage: false },
    findGlobal: async () => ({ _status: 'draft' }),
  }
  assert.equal((await getMediaUsage(payload as never, [55], {} as never))[0]?.state, 'version')
  payload.findVersions = async () => { throw new Error('scan failed') }
  await assert.rejects(getMediaUsage(payload as never, [55], {} as never), /scan failed/)
})
