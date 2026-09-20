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

test('tournament projection derives dates, defaults, SEO and keeps manual result order and external action', async () => {
  const tournament = {
    id: 1,
    slug: 'americano',
    title: 'Game Party',
    description: 'Клубный турнир.',
    lifecycle: 'upcoming',
    startsAt: '2026-09-20T16:30:00.000Z',
    endsAt: '2026-09-20T19:30:00.000Z',
    levelFrom: '2.0',
    levelTo: '4.0',
    format: 'americano',
    participantMode: 'players',
    totalSlots: 16,
    action: { label: 'Регистрация', mode: 'external-link', href: 'https://booking.example/tournament' },
    useClubCoordinatorContacts: true,
    visualStyle: 'mesh',
    meshStyle: 'deep-blue',
    icon: 'Trophy',
    participants: [{ id: 'p1', name: 'Первый игрок', level: '2.5', status: 'confirmed' }],
    standings: [
      { id: 's1', name: 'Победитель по регламенту', matches: 3, points: 5, difference: '-1', award: 'Чемпион' },
      { id: 's2', name: 'Больше очков, второе место', matches: 3, points: 99, difference: '+50' },
    ],
    entryFee: '2 500 ₽',
    prizeLabel: 'Призовой фонд',
    prize: '30 000 ₽',
    prizes: [{ id: 'pr1', title: 'Победитель', reward: '30 000 ₽', description: 'Главный приз' }],
    useDefaultChecklist: true,
    useDefaultPerks: true,
    useDefaultMatchday: true,
    useDefaultFaq: true,
    faqs: [] as Array<{ id: string; question: string; answer: string }>,
    regulation: { root: { type: 'root', children: [] } },
    seo: { robots: 'index-follow' },
    _status: 'published',
  }
  const site = {
    _status: 'published',
    brandName: 'UNLIM RIGA PADEL',
    socialLinks: [{ provider: 'telegram', label: 'Клуб в Telegram', url: 'https://t.me/club' }],
    phoneDisplay: '+7 999 000-00-00',
    phoneValue: '+79990000000',
    booking: { mode: 'disabled' },
  }
  const defaults = {
    _status: 'published',
    checklist: [{ id: 'c1', text: 'Приехать заранее' }],
    perks: [{ id: 'perk1', icon: 'Droplets', title: 'Вода', description: 'Включена' }],
    matchday: [{ id: 'm1', timing: 'Старт', title: 'Матчи', description: 'Играем' }],
    faqs: [{ id: 'f1', question: 'Вопрос?', answer: 'Ответ.' }],
  }
  const payload = {
    findGlobal: async ({ slug }: { slug: string }) => slug === 'tournaments-page'
      ? { _status: 'published', eyebrow: 'Турниры', title: 'Турниры', intro: 'События', seo: { robots: 'index-follow' } }
      : slug === 'site-settings' ? site : defaults,
    find: async (args: Record<string, unknown>) => {
      if (args.collection === 'partners') return { docs: [] }
      const where = args.where as { and?: Array<Record<string, unknown>> } | undefined
      return { docs: where?.and?.some((condition) => 'slug' in condition) ? [tournament] : [] }
    },
  }

  const result = await createDetailProjection(payload as never, { kind: 'tournaments', origin: 'https://cms.example.test', preview: false, slug: 'americano' })
  assert.equal(result?.kind, 'tournaments')
  if (result?.kind !== 'tournaments') return
  assert.equal(result.item.scheduleLabel, 'Воскресенье, 20 сентября · 19:30–22:30')
  assert.equal(result.item.levelLabel, '2.0–4.0')
  assert.equal(result.item.action.mode, 'external-link')
  assert.equal(result.item.action.href, 'https://booking.example/tournament')
  assert.deepEqual(result.item.standings.map(({ rank, name }) => ({ rank, name })), [
    { rank: 1, name: 'Победитель по регламенту' },
    { rank: 2, name: 'Больше очков, второе место' },
  ])
  assert.equal(result.item.faqs[0]?.question, 'Вопрос?')
  assert.equal(result.item.coordinator.telegramURL, 'https://t.me/club')
  assert.equal(result.item.seo.title, 'Game Party — падел турнир Москва')
  assert.match(result.item.seo.description ?? '', /падел-турнир в Москве.*Americano.*уровень 2\.0–4\.0.*30 000 ₽/)
  assert.ok((result.item.seo.description?.length ?? 0) <= 160)

  tournament.useDefaultFaq = false
  tournament.faqs = [{ id: 'custom-faq', question: 'Свой вопрос?', answer: 'Свой ответ.' }]
  const customized = await createDetailProjection(payload as never, { kind: 'tournaments', origin: 'https://cms.example.test', preview: false, slug: 'americano' })
  assert.equal(customized?.kind === 'tournaments' ? customized.item.faqs[0]?.question : null, 'Свой вопрос?')
})
