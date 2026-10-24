import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createLocalReq, type GlobalSlug, type Payload } from 'payload'

export const clubOfferRevision = 'club-offer-20261024-v1'
export const clubOfferPriceUpdates = {
  'anastasia-sekamova': 7500,
  'maksim-skapenko': 7500,
  'roman-bardin': 7500,
} as const

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../seed-media/club-update-20261024')
export const clubOpeningPromo = { title: '2 недели с открытия', caption: 'Аренда со скидкой 50%' }

export function updateCeilingStats(items: Array<Record<string, unknown>> = []) {
  return items.map((item) => item.value === '11.5 м' ? { ...item, value: '13 м' } : item)
}

/** One-time owner update; preserve unrelated CMS edits and sync an existing homepage draft. */
export async function applyClubOfferUpdate(payload: Payload): Promise<boolean> {
  const transactionID = await payload.db.beginTransaction()
  if (transactionID == null) throw new Error('A transaction is required for the club offer update.')
  try {
    const req = await createLocalReq({ req: { transactionID } }, payload)
    const opts = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
    const site = await payload.findGlobal({ ...opts, slug: 'site-settings', draft: false })
    if ([clubOfferRevision, 'club-hero-copy-20261024-v2', 'club-hero-copy-20261024-v3'].includes(site.clubUpdateVersion ?? '')) {
      await payload.db.rollbackTransaction(transactionID)
      return false
    }
    if (site.clubUpdateVersion !== 'club-launch-20261023-v2') throw new Error('Apply the club refinements before the offer update.')
    const draftSite = await payload.findGlobal({ ...opts, slug: 'site-settings', draft: true })

    const patchGlobal = async (slug: GlobalSlug, patch: (doc: any) => Record<string, unknown>) => {
      const live = await payload.findGlobal({ ...opts, slug, draft: false })
      const pending = await payload.findGlobal({ ...opts, slug, draft: true })
      await payload.updateGlobal({ ...opts, slug, draft: false, data: { ...patch(live), _status: 'published' } } as never)
      if (pending._status === 'draft') {
        const { id, createdAt, updatedAt, ...draft } = pending
        await payload.updateGlobal({ ...opts, slug, draft: true, data: { ...draft, ...patch(pending), _status: 'draft' } } as never)
      }
    }

    await patchGlobal('homepage', (home) => {
      const hero = home.hero ?? {}
      const controls = hero.buttonsAndElements ?? {}
      return {
        hero: {
          ...hero,
          openingNotice: { ...hero.openingNotice, ...clubOpeningPromo },
          buttonsAndElements: {
            ...controls,
            desktop: { ...controls.desktop, slot3: { ...controls.desktop?.slot3, ...clubOpeningPromo } },
            mobile: { ...controls.mobile, slot2: { ...controls.mobile?.slot2, ...clubOpeningPromo } },
          },
          stats: updateCeilingStats(hero.stats),
        },
      }
    })
    await patchGlobal('courts-page', (page) => ({ metrics: updateCeilingStats(page.metrics) }))

    const metricsCourt = (await payload.find({ ...opts, collection: 'courts', pagination: false, where: { slug: { equals: 'metrics' } } })).docs[0]
    if (metricsCourt) await payload.update({ ...opts, collection: 'courts', id: metricsCourt.id, draft: false, data: { metrics: updateCeilingStats(metricsCourt.metrics as Array<Record<string, unknown>>) } })

    for (const [slug, priceFrom] of Object.entries(clubOfferPriceUpdates)) {
      const result = await payload.find({ ...opts, collection: 'coaches', pagination: false, where: { slug: { equals: slug } } })
      const coach = result.docs[0]
      if (!coach) throw new Error(`Coach ${slug} was not found.`)
      await payload.update({ ...opts, collection: 'coaches', id: coach.id, draft: false, data: { priceFrom } })
      const draft = await payload.findByID({ ...opts, collection: 'coaches', id: coach.id, draft: true })
      if (draft?._status === 'draft') await payload.update({ ...opts, collection: 'coaches', id: coach.id, draft: true, data: { priceFrom } })
    }

    const imageSeedKey = 'club-offer-20261024:training-individual'
    let image = (await payload.find({ ...opts, collection: 'media', pagination: false, where: { seedKey: { equals: imageSeedKey } } })).docs[0]
    if (!image) image = await payload.create({ ...opts, collection: 'media', data: { seedKey: imageSeedKey, alt: 'Мячи и ракетка на крытом падел-корте', credit: 'AI-generated for UNLIM PADEL', sourceURL: 'apps/cms/seed-media/club-update-20261024/training-individual.webp' }, filePath: path.join(root, 'training-individual.webp') })
    const programs = await payload.find({ ...opts, collection: 'training-programs', pagination: false, where: { slug: { equals: 'individual' } } })
    const individual = programs.docs[0]
    if (!individual) throw new Error('The individual training program was not found.')
    await payload.update({ ...opts, collection: 'training-programs', id: individual.id, draft: false, data: { image: image.id } })
    const programDraft = await payload.findByID({ ...opts, collection: 'training-programs', id: individual.id, draft: true })
    if (programDraft?._status === 'draft') await payload.update({ ...opts, collection: 'training-programs', id: individual.id, draft: true, data: { image: image.id } })

    await payload.updateGlobal({ ...opts, slug: 'site-settings', draft: false, data: { clubUpdateVersion: clubOfferRevision, _status: 'published' } })
    if (draftSite._status === 'draft') {
      const { id, createdAt, updatedAt, ...draft } = draftSite
      await payload.updateGlobal({ ...opts, slug: 'site-settings', draft: true, data: { ...draft, clubUpdateVersion: clubOfferRevision, _status: 'draft' } })
    }
    await payload.db.commitTransaction(transactionID)
    return true
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}
