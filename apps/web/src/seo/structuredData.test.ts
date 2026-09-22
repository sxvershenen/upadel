import assert from 'node:assert/strict'
import test from 'node:test'

import { detailStructuredData, giftStructuredData, resolveCanonicalURL, serializeStructuredData } from './structuredData'

test('canonical URLs have one trailing slash, preserve approved queries and ignore fragments', () => {
  assert.equal(resolveCanonicalURL('https://unlim.test', '/blog/post'), 'https://unlim.test/blog/post/')
  assert.equal(resolveCanonicalURL('https://unlim.test/', '/', 'https://canonical.test/about?page=2#top'), 'https://canonical.test/about/?page=2')
})

test('structured data serialization cannot close its script element', () => {
  assert.equal(serializeStructuredData({ name: '</script><script>alert(1)</script>' }).includes('<'), false)
  assert.match(serializeStructuredData({ name: '<club>' }), /\\u003cclub>/)
})

test('article schema uses the organization publisher and does not invent an author', () => {
  const [article, trail] = detailStructuredData({
    kind: 'blog',
    item: {
      title: 'Статья', excerpt: 'Описание', publishedAt: '2026-09-22T10:00:00.000Z',
      image: { url: 'https://cms.test/article.webp' },
    },
  } as any, 'https://unlim.test', 'https://unlim.test/blog/article/')

  assert.equal(article['@type'], 'Article')
  assert.deepEqual(article.publisher, { '@id': 'https://unlim.test/#organization' })
  assert.equal('author' in article, false)
  assert.equal(trail['@type'], 'BreadcrumbList')
})

test('coach fallback schema contains only DTO-backed identity and role data', () => {
  const [coach] = detailStructuredData({
    kind: 'coaches',
    item: { name: 'Имя Фамилия', bio: 'Тренер клуба', photo: { url: 'https://cms.test/coach.webp' }, languageCodes: [] },
  } as any, 'https://unlim.test/', 'https://unlim.test/coaches/coach/')

  assert.equal(coach['@type'], 'Person')
  assert.equal(coach.jobTitle, 'Тренер по паделу')
  assert.equal('aggregateRating' in coach, false)
  assert.equal('knowsLanguage' in coach, false)
})

test('tournament schema publishes a real event without inferred ticket offers', () => {
  const [event] = detailStructuredData({
    kind: 'tournaments',
    item: {
      title: 'Клубный турнир', description: 'Турнир для игроков клуба',
      startsAt: '2026-10-01T10:00:00.000Z', endsAt: '2026-10-01T14:00:00.000Z',
      lifecycle: 'finished', image: null,
    },
  } as any, 'https://unlim.test', 'https://unlim.test/tournaments/club-cup/')

  assert.equal(event['@type'], 'SportsEvent')
  assert.equal(event.eventStatus, 'https://schema.org/EventScheduled')
  assert.equal('offers' in event, false)
  assert.equal('image' in event, false)
})

test('gift certificate schema keeps breadcrumbs and FAQ without invented prices', () => {
  const nodes = giftStructuredData({
    page: {
      title: 'Подарочный сертификат',
      intro: 'Сертификат на услуги клуба',
      hero: { media: { url: 'https://cms.test/gift.webp' } },
      seo: {},
    },
    faq: [{ question: 'Как оформить?', answer: 'Оставьте заявку.' }],
  } as any, 'https://unlim.test', 'https://unlim.test/gift/')

  assert.deepEqual(nodes.map((node) => node['@type']), ['Product', 'BreadcrumbList', 'FAQPage'])
  assert.equal('offers' in nodes[0], false)
  assert.doesNotMatch(serializeStructuredData(nodes), /price|AggregateOffer/)
})
