import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createLocalReq, type CollectionSlug, type Payload, type PayloadRequest } from 'payload'

import { applyOpeningCardRefinements, applyOpeningEventRefinements, applyOpeningFinalRefinements, applyOpeningOfferImageRefinements, applyOpeningPhoneRefinements, applyOpeningRefinements, applyOpeningVisualRefinements } from './openingRefinements'

const revision = 'opening-november-2026-v1'
const publicRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../web/public')
const equipment = {
  rental: 'При аренде корта мячи и ракетки оплачиваются отдельно.',
  individual: 'В индивидуальную тренировку входят мячи. Аренда ракетки оплачивается отдельно.',
  kids: 'В детскую группу включены и мячи, и ракетки.',
  prices: 'Корзина мячей — 800 ₽ / час. Аренда ракетки — 500 ₽ / час.',
}
const equipmentSummary = Object.values(equipment).join(' ')
const richText = (text: string) => ({ root: { type: 'root', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children: [{ type: 'paragraph', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }] }] } })

/** Apply this owner-requested update once. Later editor changes remain authoritative. */
export async function applyOpeningContent(payload: Payload, req?: PayloadRequest): Promise<boolean> {
  const options = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
  const home = await payload.findGlobal({ ...options, slug: 'homepage', draft: false })
  if (home.openingContentVersion?.startsWith('opening-november-2026-v')) return false
  // This updater also runs on later releases, without reseeding unrelated editor records.
  if (!home.seedVersion) throw new Error('Initialize CMS content before applying the opening update.')

  const all = async (collection: CollectionSlug, where?: Record<string, unknown>) => (await payload.find({ ...options, collection, pagination: false, draft: false, where } as never)).docs as Array<Record<string, any>>
  const patch = async (collection: CollectionSlug, id: string | number, data: Record<string, unknown>) => payload.update({ ...options, collection, id, draft: false, data } as never)
  const seeded = async (collection: CollectionSlug, key: string, data: Record<string, unknown>) => {
    const doc = (await all(collection, { seedKey: { equals: key } }))[0]
    if (doc) await patch(collection, doc.id, data)
    return doc
  }
  const media = async (name: string, alt: string) => {
    const seedKey = `opening-media:${name}:v1`
    const doc = (await all('media', { seedKey: { equals: seedKey } }))[0]
    if (doc) return doc.id
    const bytes = await readFile(path.join(publicRoot, `images/opening/${name}.webp`))
    const created = await payload.create({ ...options, collection: 'media', data: { seedKey, alt, credit: 'AI-generated for UNLIM RIGA PADEL', sourceURL: `apps/web/public/images/opening/${name}.webp` }, file: { data: bytes, mimetype: 'image/webp', name: `opening-${name}.webp`, size: bytes.byteLength } })
    return created.id
  }
  const shopImage = await media('shop', 'Спортивный магазин клуба: падел-ракетки, мячи и однотонные футболки')
  const tournamentImage = await media('tournament', 'Парный турнир на синем падел-корте')
  const robotImage = await media('robot', 'Девушка и мужчина тренируются с робопушкой на синем падел-корте')

  await seeded('rental-rates', 'prototype:rental-rate:day', { title: 'Утро', timeLabel: '07:00–09:00', price: 3500, description: `Спокойные утренние часы для игры и самостоятельной практики. ${equipment.rental}`, action: { label: 'Забронировать корт', mode: 'booking' } })
  await seeded('rental-rates', 'prototype:rental-rate:prime', { title: 'Прайм-тайм', timeLabel: '09:00–23:00', price: 5500, description: `Игры с друзьями и регулярные матчи в основное время клуба. ${equipment.rental}`, action: { label: 'Забронировать корт', mode: 'booking' } })
  await seeded('rental-rates', 'prototype:rental-rate:trial', { title: 'Индивидуальная тренировка', eyebrow: 'Персональная программа', description: equipment.individual, price: 9000, priceLabel: 'от', priceSuffix: '/ час', action: { label: 'Записаться на тренировку', mode: 'booking' } })
  await seeded('rental-rates', 'prototype:rental-rate:standards', { timeLabel: 'Условия аренды и тренировок', description: equipment.rental, includedItems: [{ text: equipment.individual }, { text: equipment.kids }, { text: 'Корзина мячей — 800 ₽ / час' }, { text: 'Аренда ракетки — 500 ₽ / час' }], action: { label: 'Забронировать корт', mode: 'booking' } })
  if (!(await all('rental-rates', { seedKey: { equals: 'opening:rental-rate:memberships' } })).length) {
    const rates = await all('rental-rates')
    const occupied = new Set(rates.filter((item) => item.showOnHomepage).map((item) => item.homepageOrder))
    const slot = [1, 2, 3, 4, 5].find((order) => !occupied.has(order))
    await payload.create({ ...options, collection: 'rental-rates', draft: false, data: {
      seedKey: 'opening:rental-rate:memberships', title: 'Специальные абонементы', eyebrow: 'Для постоянных игроков', description: 'Специальные абонементы со скидками для постоянных клиентов клуба. Условия подберёт администратор.', priceLabel: 'Цена по запросу', cardVariant: 'trial', meshTone: 'dark', action: { label: 'Узнать об абонементах', mode: 'phone' }, isActive: true, showOnHomepage: Boolean(slot), homepageOrder: slot, _status: 'published',
    } })
  }

  for (const item of await all('memberships')) await patch('memberships', item.id, { isActive: false, price: null, oldPrice: null, priceLabel: 'Цена по запросу', action: { label: 'Узнать стоимость', mode: 'phone' } })
  for (const item of await all('training-programs')) {
    if (item.seedKey === 'prototype:training:individual') await patch('training-programs', item.id, { priceFrom: 9000, description: `Персональная программа под ваш уровень: техника и тактика с тренером. ${equipment.individual}` })
    if (item.seedKey === 'prototype:training:kids') await patch('training-programs', item.id, { description: `Игровой формат обучения: техника, координация и первые матчи. ${equipment.kids}` })
  }
  for (const coach of await all('coaches')) if (coach.seedKey?.startsWith('prototype:coach:') && coach.priceFrom < 9000) await patch('coaches', coach.id, { priceFrom: 9000 })
  await seeded('faqs', 'prototype:faq:1', { answer: 'Нет. На индивидуальной тренировке тренер объяснит базовые правила, хватку и безопасность на корте перед первой игрой.' })
  await seeded('faqs', 'prototype:faq:2', { answer: equipmentSummary })
  await seeded('faqs', 'prototype:faq:3', { answer: `Да. На ресепшене подберём ракетку для вашего уровня. ${equipment.prices}` })

  const generalKey = 'opening:tournament:regular'
  let regular = (await all('tournaments', { seedKey: { equals: generalKey } }))[0]
  // The owner explicitly requested unpublishing every existing tournament.
  for (const item of await all('tournaments')) {
    if (item.seedKey === generalKey) continue
    const feeWasDuplicated = /стоимость|участник|взнос/i.test(item.prizeLabel ?? '')
    await patch('tournaments', item.id, { _status: 'draft', showOnHomepage: false, homepageOrder: null, ...(feeWasDuplicated ? { prize: null, prizeLabel: 'Призовой фонд' } : {}) })
  }
  if (!regular) regular = await payload.create({ ...options, collection: 'tournaments', draft: false, data: {
    seedKey: generalKey, slug: 'regular-tournaments', title: 'Регулярные турниры', customFormat: 'Необычные форматы', format: 'other', description: 'Играйте с новыми соперниками, пробуйте необычные форматы и участвуйте в регулярных турнирах клуба.', entryFee: 'от 4 000 ₽', visualStyle: 'image', image: tournamentImage, imageOverlay: 'overlay-dark', icon: 'Trophy', cardLinkEnabled: false, showOnHomepage: true, homepageOrder: 1, action: { mode: 'none' }, seo: { robots: 'noindex-follow' }, _status: 'published',
  } }) as unknown as Record<string, any>

  const prices = await payload.findGlobal({ ...options, slug: 'prices-page', draft: false })
  const bookingRules = (prices.rules ?? []).map((rule) => /брони/i.test(rule.title) ? { ...rule, content: richText(`Стоимость фиксируется при бронировании. ${equipment.rental} ${equipment.prices}`) } : rule)
  const rules = [
    { title: 'Абонементы', content: richText('Специальные абонементы со скидками для постоянных клиентов клуба. Цена по запросу; актуальные условия уточняйте у администратора.') },
    ...bookingRules.filter((rule) => !/абонемент/i.test(rule.title) && rule.title !== 'Инвентарь и тренировки'),
    { title: 'Инвентарь и тренировки', content: richText(`${equipment.individual} ${equipment.kids} ${equipment.prices}`) },
  ]
  await payload.updateGlobal({ ...options, slug: 'prices-page', draft: false, data: { termsTitle: 'Условия и правила', faqTitle: 'Частые вопросы', rules, faq: [
    { question: 'Как приобрести абонемент?', answer: 'Обратитесь к администратору: подберём специальный абонемент со скидками для регулярных игр. Цена по запросу.' },
    { question: 'Сколько стоит аренда корта?', answer: 'Утро 07:00–09:00 — 3 500 ₽ / час. Прайм-тайм 09:00–23:00 — 5 500 ₽ / час.' },
    { question: 'Что входит в аренду и тренировку?', answer: equipmentSummary },
    ...(prices.rules ?? []).filter((rule) => /отмен|перенос/i.test(rule.title)).map((rule) => ({ question: 'Как отменить или перенести бронирование?', answer: plainRichText(rule.content) })),
  ], _status: 'published' } })

  const training = await payload.findGlobal({ ...options, slug: 'training-page', draft: false })
  const trainingDefaults: Record<string, string> = {
    programsEyebrow: 'Программы', programsTitle: 'Форматы тренировок', coachesEyebrow: 'Команда наставников', coachesTitle: 'Тренеры клуба',
    coachesDesktopActionLabel: 'Все', coachesMobileActionLabel: 'Все тренеры', knowledgeEyebrow: 'База знаний', knowledgeTitle: 'Перед первой тренировкой',
    firstVisitTitle: 'Что нужно для первого визита', faqTitle: 'Частые вопросы', faqCopy: 'Коротко о формате занятий, прогрессе и первом визите.',
  }
  const trainingHeadings = Object.fromEntries(Object.entries(trainingDefaults).map(([key, fallback]) => [key, String((training as unknown as Record<string, unknown>)[key] ?? '').trim() || fallback]))
  await payload.updateGlobal({ ...options, slug: 'training-page', draft: false, data: {
    ...trainingHeadings,
    firstVisitCopy: 'Возьмите спортивную форму и сменную обувь. Инвентарь можно арендовать в клубе.',
    firstVisitItems: (training.firstVisitItems ?? []).map((item) => item.icon === 'Dumbbell' ? { ...item, body: `${equipment.individual} ${equipment.kids} ${equipment.prices}` } : item),
    faq: (training.faq ?? []).map((item) => /экипировк/i.test(item.question) ? { ...item, answer: equipmentSummary } : /выбрать формат/i.test(item.question) ? { ...item, answer: 'Индивидуальный формат даёт больше повторений, групповой — больше игровых ситуаций. Администратор поможет подобрать занятия под ваш уровень.' } : item),
    action: { label: 'Подобрать тренировку', mode: 'booking' }, seo: { ...training.seo, description: 'Падел-тренировки в Москве и Красногорске: индивидуальные занятия от 9 000 ₽ / час, групповые занятия и детские секции.' }, _status: 'published',
  } })
  const gift = await payload.findGlobal({ ...options, slug: 'gift-page', draft: false })
  await payload.updateGlobal({ ...options, slug: 'gift-page', draft: false, data: {
    intro: 'Подарите игру и эмоции в UNLIM RIGA PADEL: аренда корта, тренировки с тренером и инвентарь из спортивного магазина.',
    offerCopy: 'Получатель выбирает формат: игру с друзьями, урок с тренером или спортивный инвентарь.',
    benefits: (gift.benefits ?? []).map((item) => item.icon === 'CalendarCheck' ? { ...item, badge: 'Спортивный магазин', title: 'Падел-инвентарь', body: `Ракетки, мячи и экипировка разных брендов. ${equipment.prices}` } : item),
    terms: [...(gift.terms ?? []).filter((item) => item.title !== 'Инвентарь' && !/экипировк|ракетк|мячи/i.test(item.title)), { title: 'Инвентарь', text: equipmentSummary, icon: 'PackageCheck' }],
    faq: [...(gift.faq ?? []).filter((item) => item.question !== 'Включены ли мячи и ракетки?'), { question: 'Включены ли мячи и ракетки?', answer: equipmentSummary }], _status: 'published',
  } as never })

  await payload.updateGlobal({ ...options, slug: 'homepage', draft: false, data: {
    hero: { ...home.hero, titleLine: '2 часа', titleConnector: 'по цене', titleAccent: 'одного', openingNotice: { title: 'Открытие в ноябре', caption: 'Спец. оффер с 01.11 до 15.11' } },
    benefitsSection: { ...home.benefitsSection, cards: (home.benefitsSection?.cards ?? []).map((card) => card.variant === 'lockers' ? { ...card, eyebrow: 'Всё для падела', title: 'Спортивный магазин', description: 'Ракетки, мячи и спортивная экипировка разных брендов. Подберём инвентарь для вашего уровня и стиля игры.', media: shopImage } : card) },
    offersSection: { ...home.offersSection, cards: (home.offersSection?.cards ?? []).map((card) => card.variant === 'tournament-venue' ? { ...card, badge: 'Корпоративные турниры', title: 'Турнир для вашей команды', description: 'Корпоративный турнир по паделу: объедините коллег на корте и проведите командный день в клубе.' } : { ...card, badge: 'Корпоративные и частные мероприятия', title: 'События в падел-клубе', description: 'Корпоративные события, праздники и частные мероприятия. Подберём формат игры и отдыха для вашей компании.' }) },
    methodistBanner: { ...home.methodistBanner, title: 'Тренировочная робопушка', description: 'Отрабатывайте удары и точность в своём темпе. Арендуйте робопушку для самостоятельной тренировки на падел-корте.', decorativeMedia: robotImage, price: 3000, action: { mode: 'none' } },
    coachesSection: { ...home.coachesSection, title: 'Тренировки', eyebrow: 'Обучение и практика' },
    openingContentVersion: revision, _status: 'published',
  } as never })
  return true
}

export async function applyOpeningContentTransaction(payload: Payload): Promise<boolean> {
  const transactionID = await payload.db.beginTransaction()
  if (transactionID == null) throw new Error('Opening content update requires a database transaction.')
  try {
    const req = await createLocalReq({ req: { transactionID } }, payload)
    const initialChanged = await applyOpeningContent(payload, req)
    const refinementsChanged = await applyOpeningRefinements(payload, req)
    const visualChanged = await applyOpeningVisualRefinements(payload, req)
    const eventChanged = await applyOpeningEventRefinements(payload, req)
    const phoneChanged = await applyOpeningPhoneRefinements(payload, req)
    const cardChanged = await applyOpeningCardRefinements(payload, req)
    const finalChanged = await applyOpeningFinalRefinements(payload, req)
    const offerImageChanged = await applyOpeningOfferImageRefinements(payload, req)
    const changed = initialChanged || refinementsChanged || visualChanged || eventChanged || phoneChanged || cardChanged || finalChanged || offerImageChanged
    await payload.db.commitTransaction(transactionID)
    return changed
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}

function plainRichText(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const node = value as { root?: unknown; children?: unknown[]; text?: string }
  return node.text ?? (node.root ? plainRichText(node.root) : (node.children ?? []).map(plainRichText).join(' '))
}
