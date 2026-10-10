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

test('visual update reuses media, preserves card links and skips all opening updates after later editor changes', async () => {
  const { applyOpeningVisualRefinements } = await import('./openingRefinements')
  const home: any = { openingContentVersion: 'opening-november-2026-v2', benefitsSection: { cards: [{ variant: 'community', title: 'Комьюнити', action: { mode: 'external-link', href: 'https://t.me/unlimpadel' } }, { variant: 'parking', title: 'Парковка' }] }, methodistBanner: { title: 'Робопушка', price: 3000, eyebrow: 'Практика', icon: 'Target' } }
  const offer: any = { id: 20, action: { mode: 'phone' }, priceLabel: 'Цена по запросу' }
  let writes = 0
  const payload = {
    findGlobal: async () => structuredClone(home),
    find: async ({ collection, where }: any) => ({ docs: collection === 'rental-rates' ? [offer] : [{ id: where.seedKey.equals.includes('robot') ? 11 : 12 }] }),
    update: async ({ data }: any) => { writes++; Object.assign(offer, data) },
    updateGlobal: async ({ data }: any) => { writes++; Object.assign(home, data) },
  }
  assert.equal(await applyOpeningVisualRefinements(payload as never), true)
  assert.equal(home.methodistBanner.decorativeMedia, 11)
  assert.equal(home.methodistBanner.price, 3000)
  assert.equal(home.methodistBanner.icon, 'Target')
  assert.equal(home.benefitsSection.cards[0].media, 12)
  assert.equal(home.benefitsSection.cards[0].meshTone, 'sky')
  assert.equal(home.benefitsSection.cards[0].action.href, 'https://t.me/unlimpadel')
  assert.equal(home.benefitsSection.cards[1].title, 'Парковка')
  assert.equal(offer.title, 'Абонементы')
  assert.equal(offer.action.mode, 'phone')
  home.methodistBanner.title = 'Редактор изменил'
  const before = writes
  assert.equal(await applyOpeningVisualRefinements(payload as never), false)
  assert.equal(await applyOpeningRefinements(payload as never), false)
  assert.equal(await applyOpeningContent(payload as never), false)
  assert.equal(writes, before)
  assert.equal(home.methodistBanner.title, 'Редактор изменил')
})

test('phone update changes only the two benefits and preserves later CMS edits across every updater', async () => {
  const { applyOpeningEventRefinements, applyOpeningPhoneRefinements, applyOpeningVisualRefinements } = await import('./openingRefinements')
  const home: any = { openingContentVersion: 'opening-november-2026-v4', benefitsSection: { title: 'Преимущества', cards: [{ id: 'booking', variant: 'online-booking', title: 'Бронь', action: { mode: 'internal-link', href: '/prices' }, media: 2, meshTone: 'sky' }, { id: 'community', variant: 'community', title: 'Комьюнити', action: { mode: 'external-link', href: 'https://t.me/unlimpadel' }, media: 3, meshTone: 'sky' }, { id: 'kids', variant: 'kids-wide', title: 'Дети', meshTone: 'sky' }] }, offersSection: { cards: [{ enabled: false }] } }
  let writes = 0
  const payload = { findGlobal: async () => structuredClone(home), find: async () => ({ docs: [{ id: 50 }] }), updateGlobal: async ({ data }: any) => { writes++; Object.assign(home, data) } }
  assert.equal(await applyOpeningPhoneRefinements(payload as never), true)
  const [booking, community, kids] = home.benefitsSection.cards
  assert.equal(booking.media, 50)
  assert.equal(booking.meshTone, 'indigo')
  assert.equal(booking.action.href, '/prices')
  assert.equal(community.media, 3)
  assert.equal(community.meshTone, 'dark')
  assert.equal(community.action.href, 'https://t.me/unlimpadel')
  assert.equal(kids.meshTone, 'sky')
  assert.equal(home.offersSection.cards[0].enabled, false)
  community.meshTone = 'indigo'
  booking.title = 'Редактор изменил'
  const before = writes
  for (const apply of [applyOpeningContent, applyOpeningRefinements, applyOpeningVisualRefinements, applyOpeningEventRefinements, applyOpeningPhoneRefinements]) assert.equal(await apply(payload as never), false)
  assert.equal(writes, before)
  assert.equal(community.meshTone, 'indigo')
  assert.equal(booking.title, 'Редактор изменил')
})

test('card refinements consolidate equipment copy while preserving custom records, actions and cancellations', async () => {
  const { applyOpeningCardRefinements, applyOpeningEventRefinements, applyOpeningPhoneRefinements, applyOpeningVisualRefinements } = await import('./openingRefinements')
  const cancellation = { title: 'Отмена', content: { root: { children: [{ text: 'За 24 часа' }] } } }
  const globals: Record<string, any> = {
    homepage: { openingContentVersion: 'opening-november-2026-v5', benefitsSection: { cards: [{ variant: 'online-booking', meshTone: 'indigo', action: { mode: 'internal-link', href: '/prices' } }, { variant: 'community', media: 7, meshTone: 'dark' }] }, methodistBanner: { title: 'Робопушка', price: 3000 }, offersSection: { cards: [{ enabled: false }] } },
    'prices-page': { rules: [cancellation, { title: 'Инвентарь' }, { title: 'Стандарты Unlim Riga' }] },
  }
  const records: any[] = [
    { id: 1, seedKey: 'prototype:rental-rate:day', description: 'Спокойные часы. При аренде корта мячи и ракетки оплачиваются отдельно.' },
    { id: 2, seedKey: 'prototype:training:individual', description: 'Техника с тренером. В индивидуальную тренировку входят мячи. Аренда ракетки оплачивается отдельно.' },
    { id: 3, seedKey: 'prototype:training:kids', description: 'Обучение. В детскую группу включены и мячи, и ракетки.' },
    { id: 4, seedKey: 'prototype:rental-rate:standards', includedItems: [{ text: 'Лаунж-пространство с кофе' }, { text: 'Полотенца' }] },
    { id: 5, seedKey: 'custom-editor', description: 'Авторское описание' },
  ]
  let writes = 0
  const payload = {
    findGlobal: async ({ slug }: any) => structuredClone(globals[slug]),
    find: async ({ collection, where }: any) => ({ docs: collection === 'media' ? [{ id: 60 }] : records.filter((r) => r.seedKey === where.seedKey.equals) }),
    update: async ({ id, data }: any) => { writes++; Object.assign(records.find((r) => r.id === id), data) },
    updateGlobal: async ({ slug, data }: any) => { writes++; Object.assign(globals[slug], data) },
  }
  assert.equal(await applyOpeningCardRefinements(payload as never), true)
  assert.equal(records[0].description, 'Спокойные часы.')
  assert.equal(records[1].description, 'Техника с тренером.')
  assert.equal(records[2].description, 'Обучение.')
  assert.equal(records[3].includedItems[0].text, 'Лаунж-пространство с едой и напитками')
  assert.equal(records[3].includedItems[1].text, 'Полотенца')
  assert.equal(records[4].description, 'Авторское описание')
  assert.deepEqual(globals['prices-page'].rules[0], cancellation)
  assert.equal(globals['prices-page'].rules.length, 2)
  assert.match(JSON.stringify(globals['prices-page'].rules[1].content), /800.*500.*едой и напитками/)
  const home = globals.homepage
  assert.equal(home.benefitsSection.cards[0].media, 60)
  assert.equal(home.benefitsSection.cards[0].meshTone, 'indigo')
  assert.equal(home.benefitsSection.cards[0].action.href, '/prices')
  assert.equal(home.benefitsSection.cards[1].media, 7)
  assert.equal(home.methodistBanner.meshTone, 'deep-blue')
  assert.equal(home.methodistBanner.price, 3000)
  assert.equal(home.offersSection.cards[0].enabled, false)
  home.methodistBanner.title = 'Редактор изменил'
  const before = writes
  for (const apply of [applyOpeningContent, applyOpeningRefinements, applyOpeningVisualRefinements, applyOpeningEventRefinements, applyOpeningPhoneRefinements, applyOpeningCardRefinements]) assert.equal(await apply(payload as never), false)
  assert.equal(writes, before)
  assert.equal(home.methodistBanner.title, 'Редактор изменил')
})
