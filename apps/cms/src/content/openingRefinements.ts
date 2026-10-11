import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, PayloadRequest } from 'payload'

const revision = 'opening-november-2026-v2'
const finalRevision = 'opening-november-2026-v7'
const offerImageRevision = 'opening-november-2026-v8'
const suppliedPhotosRevision = 'opening-november-2026-v9'
const suppliedRobotCopyRevision = 'opening-november-2026-v10'
const rentalPricingRevision = 'opening-november-2026-v11'
const offerBadgeRevision = 'opening-november-2026-v12'
const completedRevisions = [finalRevision, offerImageRevision, suppliedPhotosRevision, suppliedRobotCopyRevision, rentalPricingRevision, offerBadgeRevision]
const richText = (text: string) => ({ root: { type: 'root', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children: [{ type: 'paragraph', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }] }] } })

/** Apply the owner's follow-up once; preserve subsequent editor changes. */
export async function applyOpeningRefinements(payload: Payload, req?: PayloadRequest): Promise<boolean> {
  const options = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
  const home = await payload.findGlobal({ ...options, slug: 'homepage', draft: false })
  if ([revision, visualRevision, eventRevision, phoneRevision, cardRevision, ...completedRevisions].includes(home.openingContentVersion ?? '')) return false
  if (home.openingContentVersion !== 'opening-november-2026-v1') throw new Error('Apply the first opening content update before its refinements.')
  const site = await payload.findGlobal({ ...options, slug: 'site-settings', draft: false })
  const telegram = site.socialLinks?.find((link) => link.url?.includes('t.me/'))?.url
  if (!telegram) throw new Error('Configure the club Telegram link before applying refinements.')
  const patchRate = async (seedKey: string, data: Record<string, unknown>) => {
    const rate = (await payload.find({ ...options, collection: 'rental-rates', where: { seedKey: { equals: seedKey } }, pagination: false })).docs[0]
    if (rate) await payload.update({ ...options, collection: 'rental-rates', id: rate.id, draft: false, data } as never)
  }
  await patchRate('prototype:rental-rate:trial', { isActive: false, showOnHomepage: false, homepageOrder: null })
  await patchRate('opening:rental-rate:memberships', { cardVariant: 'membership-offer', meshTone: 'sky', homepageOrder: 3 })
  await patchRate('prototype:rental-rate:standards', {
    description: 'При аренде корта мячи и ракетки оплачиваются отдельно. Корзина мячей — 800 ₽ / час, аренда ракетки — 500 ₽ / час.',
    includedItems: [
      { text: 'В индивидуальную тренировку входят мячи; аренда ракетки оплачивается отдельно.' },
      { text: 'В детскую группу включены и мячи, и ракетки.' },
      { text: 'Комфортные раздевалки и душ' },
      { text: 'Лаунж-пространство с кофе' },
      { text: 'Полотенца' },
    ],
  })
  const prices = await payload.findGlobal({ ...options, slug: 'prices-page', draft: false })
  const rules = (prices.rules ?? []).filter((rule) => rule.title !== 'Стандарты Unlim Riga').map((rule) => {
    if (/абонемент/i.test(rule.title)) return { ...rule, icon: 'CreditCard' }
    if (/брони/i.test(rule.title)) return { ...rule, icon: 'CalendarCheck', content: richText('Стоимость фиксируется при бронировании.') }
    if (/отмен|перенос/i.test(rule.title)) return { ...rule, icon: 'RefreshCw' }
    if (/инвентарь/i.test(rule.title)) return { ...rule, icon: 'PackageCheck', content: richText('При аренде корта мячи и ракетки оплачиваются отдельно. В индивидуальную тренировку входят мячи; аренда ракетки оплачивается отдельно. В детскую группу включены и мячи, и ракетки. Корзина мячей — 800 ₽ / час. Аренда ракетки — 500 ₽ / час.') }
    return { ...rule, icon: 'ClipboardCheck' }
  })
  rules.push({ title: 'Стандарты Unlim Riga', icon: 'ShowerHead', content: richText('Комфортные раздевалки и душ, лаунж-пространство с кофе и полотенца для гостей клуба.') })
  await payload.updateGlobal({ ...options, slug: 'prices-page', draft: false, data: { rules, _status: 'published' } } as never)

  const mediaKey = 'opening-media:robot-solo:v2'
  let robot = (await payload.find({ ...options, collection: 'media', where: { seedKey: { equals: mediaKey } }, pagination: false })).docs[0]
  if (!robot) {
    const bytes = await readFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../web/public/images/opening/robot-solo.webp'))
    robot = await payload.create({ ...options, collection: 'media', data: { seedKey: mediaKey, alt: 'Девушка тренируется против робопушки на синем падел-корте', credit: 'AI-generated for UNLIM RIGA PADEL', sourceURL: 'apps/web/public/images/opening/robot-solo.webp' }, file: { data: bytes, mimetype: 'image/webp', name: 'opening-robot-solo.webp', size: bytes.byteLength } })
  }
  const descriptions: Record<string, string> = {
    parking: '', lockers: 'Экипировка популярных брендов', shower: 'Оставьте авто пока играете', chill: 'Закажите прямо на территории клуба',
    'online-booking': 'Без звонков - прямо с телефона', 'coaches-metric': 'Мастер спорта, призёры турниров и методисты',
    'kids-wide': 'Бережная постановка биомеханики, развитие координации и подвижности',
  }
  const cards = (home.benefitsSection?.cards ?? []).filter((card) => card.variant !== 'community').map((card) => ({ ...card, description: descriptions[card.variant] ?? card.description }))
  const kidsIndex = cards.findIndex((card) => card.variant === 'kids-wide')
  cards.splice(kidsIndex < 0 ? cards.length : kidsIndex, 0, { variant: 'community', eyebrow: 'Играйте вместе', title: 'Комьюнити клуба', description: 'Находите партнёров и следите за жизнью клуба', meshTone: 'deep-blue', action: { mode: 'external-link', href: telegram, label: 'Вступить в Telegram' } } as never)
  await payload.updateGlobal({ ...options, slug: 'site-settings', data: { email: 'info@unlimpadel.ru', address: 'Новорижское шоссе, 3к1', directionsURL: 'https://yandex.ru/maps/?pt=37.158614,55.783974&z=17', map: { latitude: 55.783974, longitude: 37.158614, zoom: 16 } } })
  await payload.updateGlobal({ ...options, slug: 'homepage', draft: false, data: {
    benefitsSection: { ...home.benefitsSection, cards },
    methodistBanner: { ...home.methodistBanner, eyebrow: 'Самостоятельная практика', icon: 'Target', decorativeMedia: robot.id },
    openingContentVersion: revision, _status: 'published',
  } } as never)
  return true
}

const visualRevision = 'opening-november-2026-v3'

/** Replace the two owner-rejected visuals and simplify membership copy once. */
export async function applyOpeningVisualRefinements(payload: Payload, req?: PayloadRequest): Promise<boolean> {
  const options = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
  const home = await payload.findGlobal({ ...options, slug: 'homepage', draft: false })
  if ([visualRevision, eventRevision, phoneRevision, cardRevision, ...completedRevisions].includes(home.openingContentVersion ?? '')) return false
  if (home.openingContentVersion !== revision) throw new Error('Apply opening refinements before the visual update.')
  const publicRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../web/public/images/opening')
  const media = async (name: string, extension: 'png' | 'webp', alt: string) => {
    const seedKey = `opening-media:${name}:v3`
    const existing = (await payload.find({ ...options, collection: 'media', where: { seedKey: { equals: seedKey } }, pagination: false })).docs[0]
    if (existing) return existing.id
    const bytes = await readFile(path.join(publicRoot, `${name}.${extension}`))
    return (await payload.create({ ...options, collection: 'media', data: { seedKey, alt, credit: 'AI-generated for UNLIM RIGA PADEL', sourceURL: `apps/web/public/images/opening/${name}.${extension}` }, file: { data: bytes, mimetype: `image/${extension}`, name: `opening-${name}.${extension}`, size: bytes.byteLength } })).id
  }
  const robot = await media('robot-candid', 'webp', 'Девушка отрабатывает удар против робопушки на синем крытом падел-корте')
  const phone = await media('community-chat', 'png', 'iPhone с групповым чатом клуба: игроки договариваются о встрече на корте')
  const offer = (await payload.find({ ...options, collection: 'rental-rates', where: { seedKey: { equals: 'opening:rental-rate:memberships' } }, pagination: false })).docs[0]
  if (offer) await payload.update({ ...options, collection: 'rental-rates', id: offer.id, draft: false, data: { title: 'Абонементы', description: 'Скидки для постоянных игроков', _status: 'published' } })
  await payload.updateGlobal({ ...options, slug: 'homepage', draft: false, data: {
    benefitsSection: { ...home.benefitsSection, cards: (home.benefitsSection?.cards ?? []).map((card) => card.variant === 'community' ? { ...card, meshTone: 'sky' as const, media: phone } : card) },
    methodistBanner: { ...home.methodistBanner, decorativeMedia: robot },
    openingContentVersion: visualRevision, _status: 'published',
  } })
  return true
}

const eventRevision = 'opening-november-2026-v4'

/** Keep the second offer editable but hidden; subsequent runs preserve editor choices. */
export async function applyOpeningEventRefinements(payload: Payload, req?: PayloadRequest): Promise<boolean> {
  const options = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
  const home = await payload.findGlobal({ ...options, slug: 'homepage', draft: false })
  if ([eventRevision, phoneRevision, cardRevision, ...completedRevisions].includes(home.openingContentVersion ?? '')) return false
  if (home.openingContentVersion !== visualRevision) throw new Error('Apply the visual refinements before updating events.')
  const seedKey = 'opening-media:corporate-tournament:v4'
  let photo = (await payload.find({ ...options, collection: 'media', where: { seedKey: { equals: seedKey } }, pagination: false })).docs[0]
  if (!photo) {
    const bytes = await readFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../web/public/images/opening/corporate-tournament.webp'))
    photo = await payload.create({ ...options, collection: 'media', data: { seedKey, alt: 'Участники корпоративного падел-турнира празднуют победу девушки с кубком', credit: 'AI-generated for UNLIM RIGA PADEL', sourceURL: 'apps/web/public/images/opening/corporate-tournament.webp' }, file: { data: bytes, mimetype: 'image/webp', name: 'opening-corporate-tournament.webp', size: bytes.byteLength } })
  }
  const previous = home.offersSection?.cards ?? []
  const primary = previous.find((card) => card.variant === 'tournament-venue') ?? previous[0]
  const cards = [{ ...primary, enabled: true, variant: primary?.variant ?? 'event', title: 'Ваше мероприятие', badge: 'Под ваш формат', description: 'Корпоративные турниры, праздники и частные события — соберите свою компанию на корте.', image: photo.id, meshTone: 'deep-blue' as const, icon: 'Trophy' as const, action: { mode: 'none' as const } }, ...previous.filter((card) => card !== primary).map((card) => ({ ...card, enabled: false }))]
  await payload.updateGlobal({ ...options, slug: 'homepage', draft: false, data: { offersSection: { ...home.offersSection, cards }, openingContentVersion: eventRevision, _status: 'published' } })
  return true
}

const phoneRevision = 'opening-november-2026-v5'

/** Update only the two phone benefits once; keep their links and all editor changes afterwards. */
export async function applyOpeningPhoneRefinements(payload: Payload, req?: PayloadRequest): Promise<boolean> {
  const options = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
  const home = await payload.findGlobal({ ...options, slug: 'homepage', draft: false })
  if ([phoneRevision, cardRevision, ...completedRevisions].includes(home.openingContentVersion ?? '')) return false
  if (home.openingContentVersion !== eventRevision) throw new Error('Apply event refinements before updating phone benefits.')
  const seedKey = 'opening-media:booking-hand:v5'
  let hand = (await payload.find({ ...options, collection: 'media', where: { seedKey: { equals: seedKey } }, pagination: false })).docs[0]
  if (!hand) {
    const bytes = await readFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../web/public/images/opening/booking-hand.png'))
    hand = await payload.create({ ...options, collection: 'media', data: { seedKey, alt: 'Руки держат телефон и нажимают кнопку «В ИГРУ» в интерфейсе бронирования падел-корта', credit: 'AI-generated for UNLIM RIGA PADEL', sourceURL: 'apps/web/public/images/opening/booking-hand.png' }, file: { data: bytes, mimetype: 'image/png', name: 'opening-booking-hand.png', size: bytes.byteLength } })
  }
  const cards = (home.benefitsSection?.cards ?? []).map((card) => card.variant === 'online-booking' ? { ...card, meshTone: 'indigo' as const, media: hand.id } : card.variant === 'community' ? { ...card, meshTone: 'dark' as const } : card)
  await payload.updateGlobal({ ...options, slug: 'homepage', draft: false, data: { benefitsSection: { ...home.benefitsSection, cards }, openingContentVersion: phoneRevision, _status: 'published' } })
  return true
}

const cardRevision = 'opening-november-2026-v6'

/** Keep equipment terms in standards; replace the rejected booking photo once. */
export async function applyOpeningCardRefinements(payload: Payload, req?: PayloadRequest): Promise<boolean> {
  const options = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
  const home = await payload.findGlobal({ ...options, slug: 'homepage', draft: false })
  if ([cardRevision, ...completedRevisions].includes(home.openingContentVersion ?? '')) return false
  if (home.openingContentVersion !== phoneRevision) throw new Error('Apply phone refinements before updating the card recipes.')
  const seedKey = 'opening-media:booking-one-hand:v6'
  let phone = (await payload.find({ ...options, collection: 'media', where: { seedKey: { equals: seedKey } }, pagination: false })).docs[0]
  if (!phone) {
    const bytes = await readFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../web/public/images/opening/booking-one-hand.png'))
    phone = await payload.create({ ...options, collection: 'media', data: { seedKey, alt: 'Правая рука держит телефон: большой палец нажимает «В ИГРУ» в минималистичном интерфейсе бронирования', credit: 'AI-generated for UNLIM RIGA PADEL', sourceURL: 'apps/web/public/images/opening/booking-one-hand.png' }, file: { data: bytes, mimetype: 'image/png', name: 'opening-booking-one-hand.png', size: bytes.byteLength } })
  }
  const cleanEquipment = (text: string) => text.replace(/При аренде корта мячи и ракетки оплачиваются отдельно\./g, '').replace(/В индивидуальную тренировку входят мячи[.;]\s*(?:Аренда|аренда) ракетки оплачивается отдельно\./g, '').replace(/В детскую группу включены и мячи, и ракетки\./g, '').trim()
  for (const [collection, keys] of [['rental-rates', ['prototype:rental-rate:day', 'prototype:rental-rate:prime', 'prototype:rental-rate:trial']], ['training-programs', ['prototype:training:individual', 'prototype:training:kids']]] as const) {
    for (const key of keys) {
      const item = (await payload.find({ ...options, collection, where: { seedKey: { equals: key } }, pagination: false })).docs[0]
      if (item?.description) {
        const description = cleanEquipment(item.description)
        if (description && description !== item.description) await payload.update({ ...options, collection, id: item.id, draft: false, data: { description, _status: 'published' } } as never)
      }
    }
  }
  const standards = (await payload.find({ ...options, collection: 'rental-rates', where: { seedKey: { equals: 'prototype:rental-rate:standards' } }, pagination: false })).docs[0]
  if (standards?.includedItems) await payload.update({ ...options, collection: 'rental-rates', id: standards.id, draft: false, data: { includedItems: standards.includedItems.map((item) => ({ ...item, text: item.text.replace(/с[\s\u00a0]+кофе/gi, 'с едой и напитками') })), _status: 'published' } })
  const prices = await payload.findGlobal({ ...options, slug: 'prices-page', draft: false })
  const equipment = 'При аренде корта мячи и ракетки оплачиваются отдельно. В индивидуальную тренировку входят мячи; аренда ракетки оплачивается отдельно. В детскую группу включены и мячи, и ракетки. Корзина мячей — 800 ₽ / час. Аренда ракетки — 500 ₽ / час.'
  const comfort = 'Комфортные раздевалки и душ, лаунж-пространство с едой и напитками и полотенца для гостей клуба.'
  const rules = (prices.rules ?? []).filter((rule) => !/инвентарь/i.test(rule.title)).map((rule) => /Стандарты Unlim Riga/i.test(rule.title) ? { ...rule, content: richText(`${equipment} ${comfort}`) } : rule)
  if (!rules.some((rule) => /Стандарты Unlim Riga/i.test(rule.title))) rules.push({ title: 'Стандарты Unlim Riga', icon: 'ShowerHead', content: richText(`${equipment} ${comfort}`) })
  await payload.updateGlobal({ ...options, slug: 'prices-page', draft: false, data: { rules, _status: 'published' } })
  await payload.updateGlobal({ ...options, slug: 'homepage', draft: false, data: {
    benefitsSection: { ...home.benefitsSection, cards: (home.benefitsSection?.cards ?? []).map((card) => card.variant === 'online-booking' ? { ...card, media: phone.id } : card) },
    methodistBanner: { ...home.methodistBanner, meshTone: 'deep-blue' },
    openingContentVersion: cardRevision, _status: 'published',
  } })
  return true
}

/** Apply the final copy refinements once; later CMS edits remain authoritative. */
export async function applyOpeningFinalRefinements(payload: Payload, req?: PayloadRequest): Promise<boolean> {
  const options = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
  const home = await payload.findGlobal({ ...options, slug: 'homepage', draft: false })
  if (completedRevisions.includes(home.openingContentVersion ?? '')) return false
  if (home.openingContentVersion !== cardRevision) throw new Error('Apply card refinements before final copy updates.')

  const membership = (await payload.find({ ...options, collection: 'rental-rates', where: { seedKey: { equals: 'opening:rental-rate:memberships' } }, pagination: false })).docs[0]
  if (membership?.description) {
    const description = `${membership.description.trim().replace(/[.!?…]+$/, '')}.`
    if (description !== membership.description) await payload.update({ ...options, collection: 'rental-rates', id: membership.id, draft: false, data: { description, _status: 'published' } } as never)
  }

  const standards = (await payload.find({ ...options, collection: 'rental-rates', where: { seedKey: { equals: 'prototype:rental-rate:standards' } }, pagination: false })).docs[0]
  if (standards?.includedItems) {
    const existingItems = standards.includedItems
    const includedItems = existingItems.map((item) => ({ ...item, text: item.text.replace(/(корзина)[\s\u00a0]+(мячей)/gi, '$1\u00a0$2') }))
    if (includedItems.some((item, index) => item.text !== existingItems[index]?.text)) {
      await payload.update({ ...options, collection: 'rental-rates', id: standards.id, draft: false, data: { includedItems, _status: 'published' } })
    }
  }

  const prices = await payload.findGlobal({ ...options, slug: 'prices-page', draft: false })
  const replaceText = (node: any): any => {
    if (Array.isArray(node)) return node.map(replaceText)
    if (!node || typeof node !== 'object') return node
    return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, key === 'text' && typeof value === 'string' ? value.replace(/(корзина)[\s\u00a0]+(мячей)/gi, '$1\u00a0$2') : replaceText(value)]))
  }
  const rules = (prices.rules ?? []).map((rule) => ({ ...rule, content: replaceText(rule.content) }))
  if (JSON.stringify(rules) !== JSON.stringify(prices.rules ?? [])) {
    await payload.updateGlobal({ ...options, slug: 'prices-page', draft: false, data: { rules, _status: 'published' } })
  }

  await payload.updateGlobal({ ...options, slug: 'homepage', draft: false, data: {
    methodistBanner: { ...home.methodistBanner, description: 'Отрабатывайте удары и точность в своём темпе.\nАрендуйте робопушку для самостоятельной тренировки на падел-корте.' },
    openingContentVersion: finalRevision, _status: 'published',
  } })
  return true
}

/** Replace only the seed-owned event photo once; preserve later offer edits. */
export async function applyOpeningOfferImageRefinements(payload: Payload, req?: PayloadRequest): Promise<boolean> {
  const options = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
  const home = await payload.findGlobal({ ...options, slug: 'homepage', draft: false })
  const seedKey = 'opening-media:corporate-tournament-wide:v8'
  if ([suppliedPhotosRevision, suppliedRobotCopyRevision, rentalPricingRevision, offerBadgeRevision].includes(home.openingContentVersion ?? '')) return false
  if (home.openingContentVersion === offerImageRevision) {
    const existingPhoto = (await payload.find({ ...options, collection: 'media', where: { seedKey: { equals: seedKey } }, pagination: false })).docs[0]
    if (existingPhoto?.sourceURL === 'apps/web/public/images/opening/corporate-tournament-wide-v2.png') {
      await payload.update({ ...options, collection: 'media', id: existingPhoto.id, data: { sourceURL: 'apps/web/public/images/opening/corporate-tournament-wide-v2.webp' } })
      return true
    }
    return false
  }
  if (home.openingContentVersion !== finalRevision) throw new Error('Apply final opening copy refinements before replacing the offer image.')

  let photo = (await payload.find({ ...options, collection: 'media', where: { seedKey: { equals: seedKey } }, pagination: false })).docs[0]
  if (!photo) {
    const bytes = await readFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../web/public/images/opening/corporate-tournament-wide-v2.webp'))
    photo = await payload.create({ ...options, collection: 'media', data: { seedKey, alt: 'Победительница поднимает кубок в окружении игроков на падел-корте', credit: 'AI-generated for UNLIM RIGA PADEL', sourceURL: 'apps/web/public/images/opening/corporate-tournament-wide-v2.webp' }, file: { data: bytes, mimetype: 'image/webp', name: 'opening-corporate-tournament-wide-v2.webp', size: bytes.byteLength } })
  }
  const cards = (home.offersSection?.cards ?? []).map((card) => card.variant === 'tournament-venue' || card.title === 'Ваше мероприятие' ? { ...card, image: photo.id } : card)
  await payload.updateGlobal({ ...options, slug: 'homepage', draft: false, data: { offersSection: { ...home.offersSection, cards }, openingContentVersion: offerImageRevision, _status: 'published' } })
  return true
}

/** Replace only the two requested media references while preserving their CMS copy and actions. */
export async function applyOpeningSuppliedPhotoRefinements(payload: Payload, req?: PayloadRequest): Promise<boolean> {
  const options = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
  const home = await payload.findGlobal({ ...options, slug: 'homepage', draft: false })
  if ([suppliedPhotosRevision, suppliedRobotCopyRevision, rentalPricingRevision, offerBadgeRevision].includes(home.openingContentVersion ?? '')) return false
  if (home.openingContentVersion !== offerImageRevision) throw new Error('Apply the wide offer photo before replacing supplied opening images.')

  const media = async (seedKey: string, fileName: string, alt: string) => {
    let item = (await payload.find({ ...options, collection: 'media', where: { seedKey: { equals: seedKey } }, pagination: false })).docs[0]
    if (!item) {
      const bytes = await readFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), `../../../web/public/images/opening/${fileName}`))
      item = await payload.create({ ...options, collection: 'media', data: { seedKey, alt, credit: 'Предоставлено владельцем UNLIM RIGA PADEL', sourceURL: `apps/web/public/images/opening/${fileName}` }, file: { data: bytes, mimetype: 'image/webp', name: fileName, size: bytes.byteLength } })
    }
    return item
  }
  const offerPhoto = await media('opening-media:offer-medal-group:v9', 'opening-offer-medal-group-v9.webp', 'Игроки с медалями на синем падел-корте')
  const robotPhoto = await media('opening-media:robot-independent-practice:v9', 'robot-independent-practice-v9.webp', 'Два игрока тренируются с робопушкой на синем падел-корте')

  const cards = (home.offersSection?.cards ?? []).map((card) => card.variant === 'tournament-venue' || card.title === 'Ваше мероприятие' ? { ...card, image: offerPhoto.id } : card)
  await payload.updateGlobal({ ...options, slug: 'homepage', draft: false, data: {
    offersSection: { ...home.offersSection, cards },
    methodistBanner: { ...home.methodistBanner, decorativeMedia: robotPhoto.id },
    openingContentVersion: suppliedPhotosRevision, _status: 'published',
  } })
  return true
}

/** Keep the owner's final one-sentence robot description as a versioned CMS edit. */
export async function applyOpeningRobotCopyRefinements(payload: Payload, req?: PayloadRequest): Promise<boolean> {
  const options = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
  const home = await payload.findGlobal({ ...options, slug: 'homepage', draft: false })
  if ([suppliedRobotCopyRevision, rentalPricingRevision, offerBadgeRevision].includes(home.openingContentVersion ?? '')) return false
  if (home.openingContentVersion !== suppliedPhotosRevision) throw new Error('Apply the supplied opening photos before updating the robot copy.')
  await payload.updateGlobal({ ...options, slug: 'homepage', draft: false, data: {
    methodistBanner: { ...home.methodistBanner, description: 'Отрабатывайте удары и точность в своём темпе.' },
    openingContentVersion: suppliedRobotCopyRevision, _status: 'published',
  } })
  return true
}

/** Move only the two known prototype pricing cards into homepage-owned pricing fields. */
export async function applyRentalPricingRefinements(payload: Payload, req?: PayloadRequest): Promise<boolean> {
  const options = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
  const latestGlobalDraft = async () => {
    const versions = await payload.findGlobalVersions({ ...options, slug: 'homepage', limit: 1, pagination: false, sort: '-updatedAt' })
    const version = (versions.docs[0] as any)?.version
    return version?._status === 'draft' ? version : undefined
  }
  const latestCollectionDraft = async (slug: 'rental-rates', item: any) => {
    const versions = await payload.findVersions({ ...options, collection: slug, where: { parent: { equals: item.id } }, limit: 1, pagination: false, sort: '-updatedAt' })
    const version = (versions.docs[0] as any)?.version
    return version?._status === 'draft' ? version : undefined
  }
  const findSeed = async (seedKey: string, draft = false) => (await payload.find({ ...options, collection: 'rental-rates', draft, where: { seedKey: { equals: seedKey } }, pagination: false } as never)).docs[0] as any
  const migrate = async (home: any, draft: boolean, membership: any, standards: any) => {
    if ([rentalPricingRevision, offerBadgeRevision].includes(home.openingContentVersion ?? '')) return false
    if (home.openingContentVersion !== suppliedRobotCopyRevision) throw new Error('Apply opening refinements before moving rental pricing content.')
    const oldPricing = home.pricingSection ?? {}
    const membershipOffer = membership ? {
      enabled: Boolean(membership.isActive), showOnHomepage: Boolean(membership.showOnHomepage),
      title: membership.title ?? '', eyebrow: membership.eyebrow ?? '', description: membership.description ?? '',
      priceLabel: membership.priceLabel ?? '', meshTone: membership.meshTone ?? 'dark', action: membership.action ?? { mode: 'none' },
    } : oldPricing.membershipOffer
    const rentalStandards = standards ? {
      enabled: Boolean(standards.isActive), showOnHomepage: Boolean(standards.showOnHomepage),
      title: standards.title ?? 'Стандарты Unlim Riga', eyebrow: standards.eyebrow ?? '',
      timeLabel: standards.timeLabel ?? '', description: standards.description ?? '',
      meshTone: standards.meshTone ?? 'dark', includedItems: standards.includedItems ?? [],
    } : oldPricing.rentalStandards
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...draftSnapshot } = home
    await payload.updateGlobal({ ...options, slug: 'homepage', draft, data: {
      ...(draft ? draftSnapshot : {}),
      pricingSection: { ...oldPricing, membershipOffer, rentalStandards },
      openingContentVersion: rentalPricingRevision, ...(draft ? { _status: 'draft' } : { _status: 'published' }),
    } as never })
    for (const item of [membership, standards]) if (item) {
      const { id: _itemID, createdAt: _itemCreatedAt, updatedAt: _itemUpdatedAt, parent: _parent, ...draftItem } = item
      await payload.update({ ...options, collection: 'rental-rates', id: item.id, draft, data: { ...(draft ? draftItem : {}), isActive: false, showOnHomepage: false, homepageOrder: null, ...(draft ? { _status: 'draft' } : {}) } } as never)
    }
    return true
  }

  const pendingHome = await latestGlobalDraft()
  let pendingRates: { membership?: any; standards?: any } = {}
  if (pendingHome?.openingContentVersion === suppliedRobotCopyRevision) {
    const [membershipPublished, standardsPublished] = await Promise.all([findSeed('opening:rental-rate:memberships'), findSeed('prototype:rental-rate:standards')])
    const [membershipDraft, standardsDraft] = await Promise.all([
      membershipPublished ? latestCollectionDraft('rental-rates', membershipPublished) : undefined,
      standardsPublished ? latestCollectionDraft('rental-rates', standardsPublished) : undefined,
    ])
    pendingRates = {
      membership: membershipDraft ? { ...membershipDraft, id: membershipPublished?.id } : membershipPublished,
      standards: standardsDraft ? { ...standardsDraft, id: standardsPublished?.id } : standardsPublished,
    }
  }
  const home = await payload.findGlobal({ ...options, slug: 'homepage', draft: false })
  let changed = false
  if (![rentalPricingRevision, offerBadgeRevision].includes(home.openingContentVersion ?? '')) {
    if (home.openingContentVersion !== suppliedRobotCopyRevision) throw new Error('Apply opening refinements before moving rental pricing content.')
    const [membership, standards] = await Promise.all([findSeed('opening:rental-rate:memberships'), findSeed('prototype:rental-rate:standards')])
    changed = await migrate(home, false, membership, standards) || changed
  }
  if (pendingHome?.openingContentVersion !== rentalPricingRevision) {
    if (pendingHome?.openingContentVersion === suppliedRobotCopyRevision) {
      changed = await migrate(pendingHome, true, pendingRates.membership, pendingRates.standards) || changed
    }
  }
  return changed
}

/** Shorten the event-card badge in published content and the latest pending draft. */
export async function applyOpeningOfferBadgeRefinements(payload: Payload, req?: PayloadRequest): Promise<boolean> {
  const options = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
  const home = await payload.findGlobal({ ...options, slug: 'homepage', draft: false })
  if (home.openingContentVersion === offerBadgeRevision) return false
  if (home.openingContentVersion !== rentalPricingRevision) throw new Error('Apply rental pricing refinements before updating the offer badge.')

  const updateBadge = (source: any) => {
    let found = false
    const cards = (source.offersSection?.cards ?? []).map((card: any) => {
      if (card.variant !== 'event' && card.variant !== 'tournament-venue' && card.title !== 'Ваше мероприятие') return card
      found = true
      if (card.badge === 'Под ваш формат') return card
      return { ...card, badge: 'Под ваш формат' }
    })
    return { found, offersSection: { ...source.offersSection, cards } }
  }
  const published = updateBadge(home)
  if (!published.found) throw new Error('The published event offer card was not found.')
  await payload.updateGlobal({ ...options, slug: 'homepage', draft: false, data: {
    offersSection: published.offersSection,
    openingContentVersion: offerBadgeRevision,
    _status: 'published',
  } })

  const versions = await payload.findGlobalVersions({ ...options, slug: 'homepage', limit: 1, pagination: false, sort: '-updatedAt' })
  const draft = (versions.docs[0] as any)?.version
  if (draft?._status === 'draft' && draft.openingContentVersion === rentalPricingRevision) {
    const pending = updateBadge(draft)
    await payload.updateGlobal({ ...options, slug: 'homepage', draft: true, data: {
      offersSection: pending.offersSection,
      openingContentVersion: offerBadgeRevision,
      _status: 'draft',
    } as never })
  }
  return true
}
