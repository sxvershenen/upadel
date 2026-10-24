import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createLocalReq, type Payload } from 'payload'
import { clubCoachRoster } from './clubUpdateData'

const revision = 'club-roster-documents-20261023-v3'
export const currentAnalyticsMode = (mode: unknown): 'disabled' | 'consent-required' => mode === 'disabled' ? 'disabled' : 'consent-required'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../seed-media/club-update-20261023')
export function documentRichText(lines: string[]) {
  return { root: { type: 'root', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children: lines.map((text) => ({
    type: /^\d+\.\s+\D/.test(text.trim()) ? 'heading' : 'paragraph',
    ...(/^\d+\.\s+\D/.test(text.trim()) ? { tag: 'h2' } : {}),
    version: 1, direction: 'ltr' as const, format: '' as const, indent: 0,
    children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }],
  })) } }
}

/** Explicit owner update; a single marker preserves subsequent CMS edits on repeat runs. */
export async function applyClubContentUpdate(payload: Payload): Promise<boolean> {
  const transactionID = await payload.db.beginTransaction()
  if (transactionID == null) throw new Error('A transaction is required for club content updates.')
  try {
    const req = await createLocalReq({ req: { transactionID } }, payload)
    const opts = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
    const site = await payload.findGlobal({ ...opts, slug: 'site-settings', draft: false })
    if ([revision, 'club-launch-20261023-v1', 'club-launch-20261023-v2', 'club-offer-20261024-v1', 'club-hero-copy-20261024-v2'].includes(site.clubUpdateVersion ?? '')) { await payload.db.rollbackTransaction(transactionID); return false }
    const draftSite = await payload.findGlobal({ ...opts, slug: 'site-settings', draft: true })
    const upload = async (name: string, alt: string) => {
      const seedKey = `club-update-20261023:${name}`
      const found = await payload.find({ ...opts, collection: 'media', pagination: false, where: { seedKey: { equals: seedKey } } })
      if (found.docs[0]) return found.docs[0].id
      return (await payload.create({ ...opts, collection: 'media', data: { seedKey, alt }, filePath: path.join(root, name) })).id
    }
    const wordmark = await upload('unlimpadel.svg', 'UNLIM PADEL')
    const coaches = await payload.find({ ...opts, collection: 'coaches', pagination: false, draft: false })
    const rosterKeys = new Set(clubCoachRoster.map(({ slug }) => `club-coach-20261023:${slug}`))
    // Retain old records and URLs in CMS; only the new roster remains publicly active.
    for (const coach of coaches.docs) if (!rosterKeys.has(coach.seedKey ?? '')) {
      await payload.update({ ...opts, collection: 'coaches', id: coach.id, draft: false, data: { isActive: false, showOnHomepage: false, homepageOrder: null } })
    }
    const newCoachIDs: number[] = []
    for (const [index, coach] of clubCoachRoster.entries()) {
      const seedKey = `club-coach-20261023:${coach.slug}`
      const photo = await upload(`${coach.slug}.jpg`, coach.name)
      const existing = coaches.docs.find((item) => item.seedKey === seedKey)
      const data = { ...coach, photo, seedKey, level: 'Уточните при записи', languages: 'Уточните при записи', levels: [], focusAreas: [], languageCodes: [], certificates: [], rating: 0, reviewsCount: 0, isActive: true, showOnHomepage: true, homepageOrder: index + 1, action: { mode: 'booking' as const, label: 'Выбрать тренера' }, seo: { title: `${coach.name} — тренер UNLIM PADEL`, description: coach.bio.slice(0, 160), robots: 'index-follow' as const }, _status: 'published' as const }
      const saved = existing ? await payload.update({ ...opts, collection: 'coaches', id: existing.id, draft: false, data }) : await payload.create({ ...opts, collection: 'coaches', draft: false, data })
      newCoachIDs.push(saved.id)
    }
    const home = await payload.findGlobal({ ...opts, slug: 'homepage', draft: false })
    const draftHome = await payload.findGlobal({ ...opts, slug: 'homepage', draft: true })
    const socialProof = { ratingLabel: '4.9', caption: 'Яндекс', coaches: newCoachIDs.slice(0, 3) }
    await payload.updateGlobal({ ...opts, slug: 'homepage', draft: false, data: { hero: { ...home.hero, socialProof }, _status: 'published' } })
    if (draftHome._status === 'draft') {
      const { id, createdAt, updatedAt, ...draft } = draftHome
      await payload.updateGlobal({ ...opts, slug: 'homepage', draft: true, data: { ...draft, hero: { ...draft.hero, socialProof }, _status: 'draft' } })
    }
    const documents = JSON.parse(await readFile(path.join(root, 'documents.json'), 'utf8')) as Record<string, string[]>
    for (const kind of ['policy', 'oferta'] as const) {
      const title = kind === 'policy' ? 'Политика конфиденциальности' : 'Публичная оферта'
      await payload.updateGlobal({ ...opts, slug: `${kind}-page`, draft: false, data: {
        title, intro: kind === 'policy' ? 'Порядок обработки и защиты персональных данных пользователей сайта и сервисов клуба.' : 'Условия бронирования, оплаты и оказания услуг клуба UNLIM PADEL.', content: documentRichText(documents[kind]), approved: true,
        notice: 'Документ предоставлен владельцем клуба.',
        seo: { title: `${title} — UNLIM PADEL`, description: title, robots: 'index-follow' }, _status: 'published',
      } })
    }
    const gift = await payload.findGlobal({ ...opts, slug: 'gift-page', draft: false })
    const draftGift = await payload.findGlobal({ ...opts, slug: 'gift-page', draft: true })
    const consentLabel = 'Согласие на обработку персональных данных'
    await payload.updateGlobal({ ...opts, slug: 'gift-page', draft: false, data: { form: { ...gift.form, consentLabel }, _status: 'published' } })
    if (draftGift._status === 'draft') {
      const { id, createdAt, updatedAt, ...draft } = draftGift
      await payload.updateGlobal({ ...opts, slug: 'gift-page', draft: true, data: { ...draft, form: { ...draft.form, consentLabel }, _status: 'draft' } })
    }
    await payload.updateGlobal({ ...opts, slug: 'site-settings', draft: false, data: { brandWordmark: wordmark, clubUpdateVersion: revision, analytics: { ...site.analytics, mode: currentAnalyticsMode(site.analytics?.mode) }, _status: 'published' } })
    if (draftSite._status === 'draft') {
      const { id, createdAt, updatedAt, ...draft } = draftSite
      await payload.updateGlobal({ ...opts, slug: 'site-settings', draft: true, data: { ...draft, brandWordmark: wordmark, clubUpdateVersion: revision, analytics: { ...draft.analytics, mode: currentAnalyticsMode(draft.analytics?.mode) }, _status: 'draft' } })
    }
    await payload.db.commitTransaction(transactionID)
    return true
  } catch (error) { await payload.db.rollbackTransaction(transactionID); throw error }
}
