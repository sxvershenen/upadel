import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, PayloadRequest } from 'payload'

const revision = 'opening-november-2026-v2'
const richText = (text: string) => ({ root: { type: 'root', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children: [{ type: 'paragraph', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }] }] } })

/** Apply the owner's follow-up once; preserve subsequent editor changes. */
export async function applyOpeningRefinements(payload: Payload, req?: PayloadRequest): Promise<boolean> {
  const options = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
  const home = await payload.findGlobal({ ...options, slug: 'homepage', draft: false })
  if (home.openingContentVersion === revision) return false
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
