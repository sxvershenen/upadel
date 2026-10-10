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
  const { applyOpeningCardRefinements, applyOpeningEventRefinements, applyOpeningFinalRefinements, applyOpeningOfferImageRefinements, applyOpeningPhoneRefinements, applyOpeningVisualRefinements } = await import('./openingRefinements')
  const cancellation = { title: 'Отмена', content: { root: { children: [{ text: 'За 24 часа' }] } } }
  const globals: Record<string, any> = {
    homepage: { openingContentVersion: 'opening-november-2026-v5', benefitsSection: { cards: [{ variant: 'online-booking', meshTone: 'indigo', action: { mode: 'internal-link', href: '/prices' } }, { variant: 'community', media: 7, meshTone: 'dark' }] }, methodistBanner: { title: 'Робопушка', price: 3000 }, offersSection: { cards: [{ variant: 'tournament-venue', title: 'Ваше мероприятие', enabled: true, image: 9, action: { mode: 'none' } }, { enabled: false }] } },
    'prices-page': { rules: [cancellation, { title: 'Инвентарь' }, { title: 'Стандарты Unlim Riga', content: { root: { children: [{ text: 'Корзина мячей — 800 ₽ / час.' }] } } }] },
  }
  const records: any[] = [
    { id: 1, seedKey: 'prototype:rental-rate:day', description: 'Спокойные часы. При аренде корта мячи и ракетки оплачиваются отдельно.' },
    { id: 2, seedKey: 'prototype:training:individual', description: 'Техника с тренером. В индивидуальную тренировку входят мячи. Аренда ракетки оплачивается отдельно.' },
    { id: 3, seedKey: 'prototype:training:kids', description: 'Обучение. В детскую группу включены и мячи, и ракетки.' },
    { id: 4, seedKey: 'prototype:rental-rate:standards', includedItems: [{ text: 'Лаунж-пространство с кофе' }, { text: 'Полотенца' }] },
    { id: 5, seedKey: 'custom-editor', description: 'Авторское описание' },
    { id: 6, seedKey: 'opening:rental-rate:memberships', description: 'Скидки для постоянных игроков' },
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
  assert.equal(home.offersSection.cards[0].enabled, true)
  assert.equal(home.offersSection.cards[0].action.mode, 'none')
  home.methodistBanner.title = 'Редактор изменил'
  const before = writes
  for (const apply of [applyOpeningContent, applyOpeningRefinements, applyOpeningVisualRefinements, applyOpeningEventRefinements, applyOpeningPhoneRefinements, applyOpeningCardRefinements]) assert.equal(await apply(payload as never), false)
  assert.equal(writes, before)
  assert.equal(home.methodistBanner.title, 'Редактор изменил')
  assert.equal(await applyOpeningFinalRefinements(payload as never), true)
  assert.equal(records.find((r) => r.id === 6).description, 'Скидки для постоянных игроков.')
  assert.equal(globals.homepage.methodistBanner.description, 'Отрабатывайте удары и точность в своём темпе.\nАрендуйте робопушку для самостоятельной тренировки на падел-корте.')
  assert.equal(globals.homepage.openingContentVersion, 'opening-november-2026-v7')
  assert.match(JSON.stringify(globals['prices-page'].rules), /Корзина\u00a0мячей/)
  assert.equal(await applyOpeningOfferImageRefinements(payload as never), true)
  assert.equal(globals.homepage.offersSection.cards[0].image, 60)
  assert.equal(globals.homepage.offersSection.cards[0].action.mode, 'none')
  assert.equal(globals.homepage.offersSection.cards[1].enabled, false)
  assert.equal(globals.homepage.openingContentVersion, 'opening-november-2026-v8')
  const writesAfterFinal = writes
  globals.homepage.methodistBanner.title = 'Второе изменение редактора'
  assert.equal(await applyOpeningCardRefinements(payload as never), false)
  assert.equal(await applyOpeningFinalRefinements(payload as never), false)
  assert.equal(await applyOpeningOfferImageRefinements(payload as never), false)
  assert.equal(writes, writesAfterFinal)
  assert.equal(globals.homepage.methodistBanner.title, 'Второе изменение редактора')
})

test('wide offer image updater migrates only its own source path once after a version was already applied', async () => {
  const { applyOpeningOfferImageRefinements } = await import('./openingRefinements')
  const home = { openingContentVersion: 'opening-november-2026-v8', offersSection: { cards: [{ title: 'Editor title' }] } }
  const media = { id: 60, seedKey: 'opening-media:corporate-tournament-wide:v8', sourceURL: 'apps/web/public/images/opening/corporate-tournament-wide-v2.png' }
  let writes = 0
  const payload = {
    findGlobal: async () => structuredClone(home),
    find: async () => ({ docs: [media] }),
    update: async ({ data }: any) => { writes++; Object.assign(media, data) },
  }

  assert.equal(await applyOpeningOfferImageRefinements(payload as never), true)
  assert.equal(media.sourceURL, 'apps/web/public/images/opening/corporate-tournament-wide-v2.webp')
  assert.equal(home.offersSection.cards[0].title, 'Editor title')
  assert.equal(await applyOpeningOfferImageRefinements(payload as never), false)
  assert.equal(writes, 1)
})

test('supplied photo and robot copy updates preserve other CMS edits and skip after their version is applied', async () => {
  const { applyOpeningRobotCopyRefinements, applyOpeningSuppliedPhotoRefinements, applyOpeningOfferImageRefinements } = await import('./openingRefinements')
  const home: any = {
    openingContentVersion: 'opening-november-2026-v8',
    offersSection: { title: 'Events', cards: [
      { id: 'event', variant: 'tournament-venue', title: 'Editor offer title', description: 'Editor offer description', enabled: true, badge: 'Editor badge', image: 8, meshTone: 'indigo', action: { mode: 'none', label: '' } },
      { id: 'disabled', enabled: false, title: 'Hidden offer', image: 9 },
    ] },
    methodistBanner: { title: 'Editor robot title', description: 'line one\nline two', eyebrow: 'Editor badge', icon: 'Bot', decorativeMedia: 10, price: 3500, meshTone: 'deep-blue', action: { mode: 'none' } },
  }
  const media: any[] = []
  let nextId = 20
  let writes = 0
  const payload = {
    findGlobal: async () => structuredClone(home),
    find: async ({ where }: any) => ({ docs: media.filter((item) => item.seedKey === where.seedKey.equals) }),
    create: async ({ data, file }: any) => {
      const item = { id: nextId++, ...data, name: file.name, mimeType: file.mimetype }
      media.push(item)
      return item
    },
    updateGlobal: async ({ data }: any) => { writes++; Object.assign(home, data) },
  }
  assert.equal(await applyOpeningSuppliedPhotoRefinements(payload as never), true)
  assert.equal(home.offersSection.cards[0].image, 20)
  assert.equal(home.offersSection.cards[0].title, 'Editor offer title')
  assert.equal(home.offersSection.cards[0].description, 'Editor offer description')
  assert.equal(home.offersSection.cards[0].badge, 'Editor badge')
  assert.equal(home.offersSection.cards[0].meshTone, 'indigo')
  assert.deepEqual(home.offersSection.cards[0].action, { mode: 'none', label: '' })
  assert.deepEqual(home.offersSection.cards[1], { id: 'disabled', enabled: false, title: 'Hidden offer', image: 9 })
  assert.equal(home.methodistBanner.decorativeMedia, 21)
  assert.equal(home.methodistBanner.title, 'Editor robot title')
  assert.equal(home.methodistBanner.description, 'line one\nline two')
  assert.equal(home.methodistBanner.eyebrow, 'Editor badge')
  assert.equal(home.methodistBanner.icon, 'Bot')
  assert.equal(home.methodistBanner.price, 3500)
  assert.equal(home.openingContentVersion, 'opening-november-2026-v9')
  assert.equal(media[0].sourceURL, 'apps/web/public/images/opening/opening-offer-medal-group-v9.webp')
  assert.equal(media[0].mimeType, 'image/webp')
  assert.equal(media[1].sourceURL, 'apps/web/public/images/opening/robot-independent-practice-v9.webp')
  assert.equal(await applyOpeningRobotCopyRefinements(payload as never), true)
  assert.equal(home.methodistBanner.description, 'Отрабатывайте удары и точность в своём темпе.')
  assert.equal(home.methodistBanner.title, 'Editor robot title')
  assert.equal(home.methodistBanner.eyebrow, 'Editor badge')
  assert.equal(home.methodistBanner.icon, 'Bot')
  assert.equal(home.openingContentVersion, 'opening-november-2026-v10')
  home.methodistBanner.title = 'Editor changed after v10'
  home.methodistBanner.eyebrow = 'Custom badge after v10'
  const before = writes
  assert.equal(await applyOpeningSuppliedPhotoRefinements(payload as never), false)
  assert.equal(await applyOpeningOfferImageRefinements(payload as never), false)
  assert.equal(await applyOpeningRobotCopyRefinements(payload as never), false)
  assert.equal(writes, before)
  assert.equal(home.methodistBanner.description, 'Отрабатывайте удары и точность в своём темпе.')
  assert.equal(home.methodistBanner.title, 'Editor changed after v10')
  assert.equal(home.methodistBanner.eyebrow, 'Custom badge after v10')
})
