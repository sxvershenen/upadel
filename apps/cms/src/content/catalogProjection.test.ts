import assert from 'node:assert/strict'
import test from 'node:test'

import { createDetailProjection } from './catalogProjection'

const media = {
  id: 1,
  alt: 'Корт',
  height: 600,
  mimeType: 'image/webp',
  sizes: { card: { height: 600, mimeType: 'image/webp', url: '/media/card.webp', width: 1200 } },
  url: '/media/original.webp',
  width: 1200,
}

const article = {
  id: 10,
  slug: 'draft-article',
  title: 'Черновик статьи',
  excerpt: 'Описание',
  category: { slug: 'guide', title: 'Гид' },
  content: { root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Текст', format: 0 }] }] } },
  previewImage: media,
  readingTimeMinutes: 2,
  popularityScore: 0,
  publishedAt: '2026-09-18T00:00:00.000Z',
  createdAt: '2026-09-18T00:00:00.000Z',
  seo: { robots: 'noindex-nofollow' },
}

test('draft article preview resolves related cards from published documents only', async () => {
  let relatedArgs: Record<string, unknown> | undefined
  const payload = {
    findGlobal: async ({ slug }: { slug: string }) => slug === 'blog-page'
      ? { eyebrow: 'Блог', title: 'Блог', intro: 'Материалы', seo: { robots: 'index-follow' } }
      : { socialLinks: [], seo: { robots: 'index-follow' } },
    find: async (args: Record<string, unknown>) => {
      if (args.collection === 'partners') return { docs: [] }
      const where = args.where as { and?: Array<Record<string, unknown>> } | undefined
      if (where?.and?.some((condition) => 'slug' in condition)) return { docs: [article] }
      relatedArgs = args
      return { docs: [] }
    },
    findByID: async () => null,
  }

  const result = await createDetailProjection(payload as never, {
    kind: 'blog',
    origin: 'https://cms.example.test',
    preview: true,
    slug: article.slug,
  })

  assert.equal(result?.kind, 'blog')
  assert.equal(relatedArgs?.draft, false)
  assert.deepEqual(relatedArgs?.where, {
    and: [
      { id: { not_equals: article.id } },
      { _status: { equals: 'published' } },
    ],
  })
})
