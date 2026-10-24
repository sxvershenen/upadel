import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createLocalReq, type GlobalSlug, type Payload } from 'payload'
import { documentRichText } from './clubContentUpdate'

export const clubLaunchRevision = 'club-launch-20261023-v1'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../seed-media/club-update-20261023')
const equipmentWithoutGroups = (value: string) => value.replace(/\s*В детскую группу включены и мячи, и ракетки\.\s*/g, ' ').trim()
export function parseClubRules(lines: string[]) {
  const sections: Array<{ title: string; lines: string[] }> = []
  const closing: string[] = []
  for (const line of lines) {
    if (/^\d+\.\s*/.test(line)) { sections.push({ title: line, lines: [] }); continue }
    if (!sections.length) continue
    if (sections.length === 10 && !line.includes('🎾')) { closing.push(line); continue }
    sections.at(-1)!.lines.push(...line.split('🎾').map((text) => text.trim()).filter(Boolean))
  }
  return { sections: sections.map(({ title, lines }) => ({ title, content: documentRichText(lines) })), closingText: closing.join('\n\n') }
}

export async function applyClubLaunchUpdate(payload: Payload): Promise<boolean> {
  const transactionID = await payload.db.beginTransaction()
  if (transactionID == null) throw new Error('A transaction is required for the club launch update.')
  try {
    const req = await createLocalReq({ req: { transactionID } }, payload)
    const opts = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
    const site = await payload.findGlobal({ ...opts, slug: 'site-settings', draft: false })
    if ([clubLaunchRevision, 'club-launch-20261023-v2', 'club-offer-20261024-v1', 'club-hero-copy-20261024-v2'].includes(site.clubUpdateVersion ?? '')) { await payload.db.rollbackTransaction(transactionID); return false }
    if (site.clubUpdateVersion !== 'club-roster-documents-20261023-v3') throw new Error('Apply the club roster and documents first.')
    const patchGlobal = async (slug: GlobalSlug, patch: (doc: any) => Record<string, unknown>) => {
      const live = await payload.findGlobal({ ...opts, slug, draft: false })
      const pending = await payload.findGlobal({ ...opts, slug, draft: true })
      await payload.updateGlobal({ ...opts, slug, draft: false, data: { ...patch(live), _status: 'published' } } as never)
      if (pending._status === 'draft') {
        const { id, createdAt, updatedAt, ...draft } = pending
        await payload.updateGlobal({ ...opts, slug, draft: true, data: { ...draft, ...patch(pending), _status: 'draft' } } as never)
      }
    }
    const programs = await payload.find({ ...opts, collection: 'training-programs', pagination: false })
    for (const program of programs.docs) if (program.icon !== 'User' || /групп/i.test(`${program.title} ${program.description}`)) {
      await payload.update({ ...opts, collection: 'training-programs', id: program.id, draft: false, data: { isActive: false, showOnHomepage: false, homepageOrder: null } })
    }
    const reviews = await payload.find({ ...opts, collection: 'reviews', pagination: false })
    for (const review of reviews.docs) if (/групп/i.test(`${review.authorMeta} ${review.text}`)) {
      await payload.update({ ...opts, collection: 'reviews', id: review.id, draft: false, data: { isActive: false, showOnHomepage: false, homepageOrder: null } })
    }
    const coaches = await payload.find({ ...opts, collection: 'coaches', pagination: false, where: { isActive: { equals: true } } })
    for (const coach of coaches.docs) if (/мини-группы и группы, /.test(coach.bio)) await payload.update({ ...opts, collection: 'coaches', id: coach.id, data: { bio: coach.bio.replace('мини-группы и группы, ', '') } })
    const faqs = await payload.find({ ...opts, collection: 'faqs', pagination: false })
    for (const faq of faqs.docs) if (/групп/i.test(faq.answer)) {
      const answer = /детск|ребён|ребен/i.test(`${faq.question} ${faq.answer}`) && !/инвентар|мячи|ракетки/i.test(faq.answer)
        ? 'Детские индивидуальные тренировки доступны с 5 лет в сопровождении родителей или ответственных взрослых. Программу и тренера поможет подобрать администратор.'
        : equipmentWithoutGroups(faq.answer)
      await payload.update({ ...opts, collection: 'faqs', id: faq.id, data: { answer } })
    }
    await patchGlobal('homepage', (home) => ({
      pricingSection: { ...home.pricingSection, rentalStandards: { ...home.pricingSection?.rentalStandards, includedItems: (home.pricingSection?.rentalStandards?.includedItems ?? []).filter(({ text }: any) => !/детскую группу/.test(text)) } },
      benefitsSection: { ...home.benefitsSection, cards: (home.benefitsSection?.cards ?? []).map((card: any) => card.variant === 'kids-wide' ? { ...card, title: 'Падел для детей', description: 'Индивидуальные тренировки для детей от 5 лет: техника, координация и первые матчи.' } : card) },
    }))
    const cancellation = 'Перенос или отмена с полным возвратом средств — не позднее чем за 12 часов до начала. Для брони, созданной в день визита, — не менее чем за 3 часа. Запрос принимается письменно в MAX с номера телефона, на который оформлена бронь.'
    await patchGlobal('prices-page', (page) => ({
      rules: (page.rules ?? []).map((rule: any) => /брони/i.test(rule.title) ? { ...rule, content: documentRichText(['Бронирование подтверждается после 100% предоплаты. Забронировать корт можно не ранее чем за 7 календарных дней. При бронировании через администратора оплатите ссылку в течение 15 минут после получения.']) }
        : /отмен|перенос/i.test(rule.title) ? { ...rule, content: documentRichText([cancellation]) }
        : /стандарт|инвентар/i.test(rule.title) ? { ...rule, content: stripGroupParagraphs(rule.content) } : rule),
      faq: (page.faq ?? []).map((item: any) => ({ ...item, answer: /отмен|перенос/i.test(item.question) ? cancellation : equipmentWithoutGroups(item.answer) })),
    }))
    await patchGlobal('training-page', (page) => ({
      blocks: (page.blocks ?? []).map((block: any) => ({ ...block, body: /групп/i.test(block.body) ? 'Индивидуальные занятия доступны в разные часы клуба. Время согласуем при записи.' : block.body })),
      firstVisitItems: (page.firstVisitItems ?? []).map((item: any) => ({ ...item, body: equipmentWithoutGroups(item.body) })),
      faq: (page.faq ?? []).map((item: any) => ({ ...item, answer: /групп/i.test(item.answer) && !/мячи|ракетки/i.test(item.answer) ? 'Индивидуальная программа строится под ваш уровень и задачи. Администратор поможет выбрать тренера и согласовать время.' : equipmentWithoutGroups(item.answer) })),
      seo: { ...page.seo, title: 'Индивидуальные тренировки по паделу — UNLIM PADEL', description: 'Индивидуальные тренировки по паделу в Москве и Красногорске. Тренеры клуба, техника и тактика игры, занятия для взрослых и детей.' },
    }))
    const seedKey = 'club-update-20261023:rules-hero.webp'
    let hero = (await payload.find({ ...opts, collection: 'media', pagination: false, where: { seedKey: { equals: seedKey } } })).docs[0]
    if (!hero) hero = await payload.create({ ...opts, collection: 'media', data: { seedKey, alt: 'Падел-ракетка и мячи на синем корте', credit: 'AI-generated for UNLIM PADEL' }, filePath: path.join(root, 'rules-hero.webp') })
    const documents = JSON.parse(await readFile(path.join(root, 'documents.json'), 'utf8')) as Record<string, string[]>
    const rules = parseClubRules(documents.rules)
    await payload.updateGlobal({ ...opts, slug: 'rules-page', draft: false, data: { seedVersion: clubLaunchRevision, eyebrow: 'Документы клуба', title: 'Правила посещения клуба', intro: 'Бронирование, тренировки, безопасность и порядок на кортах UNLIM PADEL.', heroImage: hero.id, heroGrayscale: false, ...rules, seo: { title: 'Правила посещения клуба — UNLIM PADEL', description: 'Правила бронирования и отмены, тренировок, использования инвентаря и посещения падел-клуба UNLIM PADEL.', robots: 'index-follow' }, _status: 'published' } })
    await patchGlobal('site-settings', (settings) => ({
      clubUpdateVersion: clubLaunchRevision,
      footerNavigation: [...(settings.footerNavigation ?? []).filter(({ href }: any) => href !== '/rules'), { label: 'Правила клуба', href: '/rules', column: '2' }],
      waitlist: { enabled: true, title: 'Лист ожидания открыт', description: 'Оставьте контакты.\nСохраним скидку 50% и сообщим об открытии.', submitLabel: 'Сохранить скидку', successTitle: 'Вы в листе ожидания', successText: 'Сохранили заявку на скидку 50%. Свяжемся с вами и сообщим об открытии.', telegramTitle: 'Открытый чат в Telegram', telegramCopy: 'Общение, поиск игроков, новости', telegramURL: settings.socialLinks?.find(({ provider }: any) => provider === 'telegram')?.url ?? 'https://t.me/unlimpadel' },
    }))
    await payload.db.commitTransaction(transactionID)
    return true
  } catch (error) { await payload.db.rollbackTransaction(transactionID); throw error }
}
function stripGroupParagraphs(value: any): any {
  if (!value || typeof value !== 'object') return value
  if (typeof value.text === 'string') return { ...value, text: equipmentWithoutGroups(value.text) }
  if (Array.isArray(value)) return value.map(stripGroupParagraphs)
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, stripGroupParagraphs(child)]))
}
