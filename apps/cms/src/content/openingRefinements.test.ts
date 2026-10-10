import assert from 'node:assert/strict'
import test from 'node:test'
import { applyOpeningRefinements } from './openingRefinements'
import { applyOpeningContent } from './openingContent'

test('refinements update only requested content, preserve cancellation rules and never reapply the first update', async () => {
  const cancellation = { root: { children: [{ text: 'Отмена за 24 часа' }] } }
  const globals: Record<string, any> = {
    homepage: { openingContentVersion: 'opening-november-2026-v1', seedVersion: 'existing', benefitsSection: { cards: [{ variant: 'parking', title: 'Парковка', description: 'Старое' }, { variant: 'kids-wide', title: 'Дети' }] }, methodistBanner: { price: 3000 } },
    'site-settings': { socialLinks: [{ provider: 'telegram', url: 'https://t.me/unlimpadel' }] },
    'prices-page': { rules: [{ title: 'Абонементы' }, { title: 'Отмена и перенос', content: cancellation }] },
  }
  const rates = [{ id: 1, seedKey: 'prototype:rental-rate:trial', isActive: true }, { id: 2, seedKey: 'opening:rental-rate:memberships' }, { id: 3, seedKey: 'prototype:rental-rate:standards' }, { id: 4, seedKey: 'editor-record', title: 'Авторский тариф' }]
  let writes = 0
  const payload = {
    findGlobal: async ({ slug }: any) => structuredClone(globals[slug]),
    find: async ({ collection, where }: any) => ({ docs: collection === 'media' ? [{ id: 5 }] : rates.filter((rate) => rate.seedKey === where.seedKey.equals) }),
    update: async ({ id, data }: any) => { writes++; Object.assign(rates.find((rate) => rate.id === id)!, data) },
    updateGlobal: async ({ slug, data }: any) => { writes++; Object.assign(globals[slug], data) },
  }
  assert.equal(await applyOpeningRefinements(payload as never), true)
  assert.equal(rates[0].isActive, false)
  assert.equal((rates[1] as any).cardVariant, 'membership-offer')
  assert.equal(rates[3].title, 'Авторский тариф')
  assert.deepEqual(globals['prices-page'].rules[1].content, cancellation)
  assert.equal(globals['prices-page'].rules[0].icon, 'CreditCard')
  assert.equal(globals.homepage.benefitsSection.cards[0].description, '')
  assert.equal(globals.homepage.benefitsSection.cards[1].variant, 'community')
  assert.equal(globals.homepage.benefitsSection.cards[1].action.href, 'https://t.me/unlimpadel')
  assert.equal(globals.homepage.benefitsSection.cards[2].variant, 'kids-wide')
  assert.equal(globals['site-settings'].email, 'info@unlimpadel.ru')
  assert.equal(globals.homepage.methodistBanner.price, 3000)
  globals.homepage.methodistBanner.eyebrow = 'Редактор изменил'
  const before = writes
  assert.equal(await applyOpeningRefinements(payload as never), false)
  assert.equal(await applyOpeningContent(payload as never), false)
  assert.equal(writes, before)
  assert.equal(globals.homepage.methodistBanner.eyebrow, 'Редактор изменил')
})

test('refinements refuse missing initial update before writing', async () => {
  await assert.rejects(applyOpeningRefinements({ findGlobal: async () => ({}) } as never), /first opening content/)
})
