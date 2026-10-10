import assert from 'node:assert/strict'
import test from 'node:test'
import { applyOpeningContent } from './openingContent'

test('opening update applies requested facts once, unpublishes old events and preserves later editor changes', async () => {
  const globals: Record<string, any> = {
    homepage: { seedVersion: 'existing', hero: {}, benefitsSection: { cards: [{ variant: 'lockers', action: { href: 'https://varlion.su' } }] }, offersSection: { cards: [] }, methodistBanner: {}, coachesSection: {} },
    'prices-page': { rules: [{ title: 'Отмены и переносы', content: { root: { children: [{ text: 'Действующее правило' }] } } }] },
    'training-page': { firstVisitItems: [], faq: [] },
    'gift-page': { terms: [{ title: 'Экипировка Varlion включена', text: 'Бесплатно', icon: 'PackageCheck' }], benefits: [], faq: [] },
  }
  const docs: Record<string, any[]> = {
    'rental-rates': [{ id: 1, seedKey: 'prototype:rental-rate:day' }, { id: 2, seedKey: 'prototype:rental-rate:prime' }],
    memberships: [{ id: 3, isActive: true, price: 10000 }],
    tournaments: [{ id: 4, slug: 'americano', _status: 'published', entryFee: '2500', prizeLabel: 'Стоимость за участника', prize: '2500' }],
  }
  let writes = 0
  const payload = {
    findGlobal: async ({ slug }: any) => structuredClone(globals[slug]),
    find: async ({ collection, where }: any) => ({ docs: (docs[collection] ?? []).filter((doc) => !where?.seedKey || doc.seedKey === where.seedKey.equals) }),
    create: async ({ collection, data }: any) => { writes++; const doc = { ...data, id: writes + 100 }; (docs[collection] ??= []).push(doc); return doc },
    update: async ({ collection, id, data }: any) => { writes++; const doc = docs[collection].find((item) => item.id === id); Object.assign(doc, data); return doc },
    updateGlobal: async ({ slug, data }: any) => { writes++; Object.assign(globals[slug], data); return globals[slug] },
  }
  assert.equal(await applyOpeningContent(payload as never), true)
  assert.equal(docs['rental-rates'][0].price, 3500)
  assert.equal(docs['rental-rates'][1].timeLabel, '09:00–23:00')
  assert.equal(docs['rental-rates'][1].price, 5500)
  assert.equal(docs.memberships[0].isActive, false)
  assert.equal(docs.memberships[0].price, null)
  assert.equal(docs.tournaments[0]._status, 'draft')
  assert.equal(docs.tournaments[0].prize, null)
  assert.equal(docs.tournaments[1].cardLinkEnabled, false)
  assert.equal(globals['prices-page'].rules[0].title, 'Абонементы')
  assert.match(globals['prices-page'].faq.at(-1).answer, /Действующее правило/)
  assert.equal(globals['gift-page'].terms.length, 1)
  assert.match(globals['gift-page'].terms[0].text, /800 ₽.*500 ₽/)
  assert.equal(globals.homepage.benefitsSection.cards[0].action.href, 'https://varlion.su')
  globals.homepage.hero.titleAccent = 'Редактор изменил'
  docs.memberships[0].isActive = true
  const writesBefore = writes
  assert.equal(await applyOpeningContent(payload as never), false)
  assert.equal(writes, writesBefore)
  assert.equal(globals.homepage.hero.titleAccent, 'Редактор изменил')
  assert.equal(docs.memberships[0].isActive, true)
})

test('opening update refuses an uninitialized CMS before creating any records', async () => {
  await assert.rejects(applyOpeningContent({ findGlobal: async () => ({}) } as never), /Initialize CMS/)
})
