import { homepageDTOversion, parseThematicPageDTO, type HomepageDTO, type ThematicPageDTO } from '@unlim/content-contract'
import type { Payload } from 'payload'

import { richContentHTML } from './catalogProjection'
import { actionDTO, mediaDTO, pageHeroDTO, requiredMedia, seoDTO, siteDTO } from './normalize'
import type { ThematicPageKind, ThematicPageSlug } from '../globals/ThematicPages'

const pageSlugs = Object.fromEntries(['prices', 'training', 'gift', 'courts', 'gallery', 'about', 'contacts', 'policy', 'oferta'].map((kind) => [kind, `${kind}-page`])) as Record<ThematicPageKind, ThematicPageSlug>
type Row = Record<string, any>

const rentalRate = (item: Row): HomepageDTO['entities']['rentalRates'][number] => ({ id: String(item.id), title: String(item.title), eyebrow: item.eyebrow, timeLabel: item.timeLabel, description: String(item.description), price: item.price, priceLabel: item.priceLabel, priceSuffix: item.priceSuffix, badge: item.badge, badgeTone: item.badgeTone, cardVariant: item.cardVariant, meshTone: item.meshTone, includedItems: (item.includedItems ?? []).map(({ text }: Row) => String(text)), action: actionDTO(item.action) })
const program = (item: Row, origin: string): HomepageDTO['entities']['trainingPrograms'][number] => ({ id: String(item.id), slug: String(item.slug), title: String(item.title), badge: String(item.badge), description: String(item.description), image: requiredMedia(item.image, origin), overlay: String(item.overlay), icon: item.icon, priceFrom: Number(item.priceFrom), action: actionDTO(item.action) })
const membership = (item: Row): HomepageDTO['entities']['memberships'][number] => ({ id: String(item.id), title: String(item.title), badge: item.badge, badgeTone: item.badgeTone, description: String(item.description), cardVariant: item.cardVariant, meshTone: item.meshTone, price: item.price, oldPrice: item.oldPrice, priceLabel: item.priceLabel, benefits: (item.benefits ?? []).map(({ text }: Row) => String(text)), giftAmountLimits: item.giftAmountLimits, action: actionDTO(item.action) })
const court = (item: Row): HomepageDTO['entities']['courts'][number] => ({ id: String(item.id), slug: String(item.slug), title: String(item.title), eyebrow: item.eyebrow, description: item.description, cardVariant: item.cardVariant, metrics: item.metrics })
const galleryItem = (item: Row, origin: string): HomepageDTO['entities']['gallery'][number] => ({ id: String(item.id), title: String(item.title), media: requiredMedia(item.media, origin, 'original'), caption: item.caption })
const coachItem = (coach: Row, origin: string): HomepageDTO['entities']['coaches'][number] => ({ id: String(coach.id), name: String(coach.name), slug: String(coach.slug), photo: requiredMedia(coach.photo, origin), specialization: String(coach.specialization), bio: String(coach.bio), level: String(coach.level), experience: String(coach.experience), languages: String(coach.languages), rating: Number(coach.rating), reviewsCount: Number(coach.reviewsCount), certificates: Array.isArray(coach.certificates) ? coach.certificates.map((item) => String((item as { title: unknown }).title)) : [], priceFrom: Number(coach.priceFrom), action: actionDTO(coach.action) })

async function publishedCollection(payload: Payload, collection: 'partners' | 'rental-rates' | 'training-programs' | 'memberships' | 'courts' | 'gallery-items' | 'coaches', preview: boolean, extraWhere?: Row, sort: string | string[] = 'homepageOrder') {
  const conditions: Row[] = preview ? [] : [{ _status: { equals: 'published' } }, { isActive: { equals: true } }]
  if (extraWhere) conditions.push(extraWhere)
  return payload.find({ collection, depth: 2, draft: preview, pagination: false, overrideAccess: true, sort, where: conditions.length ? { and: conditions } : undefined } as never) as unknown as Promise<{ docs: Row[] }>
}

export async function createThematicPageProjection(payload: Payload, options: { kind: ThematicPageKind; origin: string; preview: boolean }): Promise<ThematicPageDTO> {
  const { kind, origin, preview } = options
  const [page, site, partners] = await Promise.all([
    payload.findGlobal({ slug: pageSlugs[kind], draft: preview, depth: 2, overrideAccess: true, showHiddenFields: false } as never) as unknown as Promise<Row>,
    payload.findGlobal({ slug: 'site-settings', draft: preview, depth: 2, overrideAccess: true, showHiddenFields: false }),
    publishedCollection(payload, 'partners', preview),
  ])
  if (!preview && (page._status !== 'published' || site._status !== 'published')) throw new Error('Published page globals are unavailable.')
  const hero = pageHeroDTO(page, kind, origin)
  const seo = seoDTO(page.seo, origin)
  const base = {
    version: homepageDTOversion, preview, generatedAt: new Date().toISOString(),
    page: { eyebrow: String(page.eyebrow ?? ''), title: String(page.title ?? ''), intro: String(page.intro ?? ''), hero, seo: { ...seo, socialImage: seo.socialImage ?? hero.media } },
    site: siteDTO(site, origin, partners.docs),
  }

  if (kind === 'prices') {
    const [rates, programs, memberships] = await Promise.all([publishedCollection(payload, 'rental-rates', preview), publishedCollection(payload, 'training-programs', preview), publishedCollection(payload, 'memberships', preview)])
    return parseThematicPageDTO({ ...base, kind, tabs: { rent: page.rentTabLabel, training: page.trainingTabLabel, memberships: page.membershipsTabLabel }, rules: (page.rules ?? []).map((item: Row) => ({ title: String(item.title), contentHTML: richContentHTML(item.content) })), rentalRates: rates.docs.map(rentalRate), trainingPrograms: programs.docs.map((item) => program(item, origin)), memberships: memberships.docs.map(membership) })
  }
  if (kind === 'training') {
    const [programs, rates, coachesDocs] = await Promise.all([
      publishedCollection(payload, 'training-programs', preview),
      publishedCollection(payload, 'rental-rates', preview),
      publishedCollection(payload, 'coaches', preview, undefined, 'homepageOrder'),
    ])
    const trial = rates.docs.find((item) => item.cardVariant === 'trial')
    return parseThematicPageDTO({
      ...base,
      kind,
      infographicEyebrow: String(page.infographicEyebrow ?? ''),
      infographicTitle: String(page.infographicTitle ?? ''),
      infographicCopy: String(page.infographicCopy ?? ''),
      programsTitle: String(page.programsTitle ?? ''),
      blocks: (page.blocks ?? []).map(({ title, body, icon }: Row) => ({ title, body, icon })),
      articleHTML: richContentHTML(page.article ?? {}),
      action: actionDTO(page.action),
      programs: programs.docs.map((item) => program(item, origin)),
      trial: trial ? rentalRate(trial) : null,
      coaches: coachesDocs.docs.map((item) => coachItem(item, origin)),
    })
  }
  if (kind === 'gift') return parseThematicPageDTO({
    ...base,
    kind,
    offerEyebrow: page.offerEyebrow,
    offerTitle: page.offerTitle,
    offerCopy: page.offerCopy,
    formatsTitle: page.formatsTitle,
    formatsCopy: page.formatsCopy,
    termsTitle: page.termsTitle,
    termsCopy: page.termsCopy,
    benefits: (page.benefits ?? []).map(({ badge, title, body, icon }: Row) => ({ badge: String(badge ?? ''), title: String(title ?? ''), body: String(body ?? ''), icon })),
    formats: (page.formats ?? []).map(({ formatId, badge, title, image, features, buttonText, buttonSelectedText }: Row) => ({
      id: formatId,
      badge: String(badge ?? ''),
      title: String(title ?? ''),
      image: requiredMedia(image, origin, 'original'),
      features: (features ?? []).map(({ text }: Row) => String(text ?? '')),
      buttonText: String(buttonText ?? ''),
      buttonSelectedText: String(buttonSelectedText ?? ''),
    })),
    terms: (page.terms ?? []).map(({ title, text, icon }: Row) => ({ title: String(title ?? ''), text: String(text ?? ''), icon })),
    stepsEyebrow: page.stepsEyebrow,
    stepsTitle: page.stepsTitle,
    steps: page.steps ?? [],
    articleHTML: richContentHTML(page.article ?? {}),
    faqTitle: page.faqTitle,
    faq: page.faq ?? [],
    form: page.form,
    action: actionDTO(page.action),
  })
  if (kind === 'courts') {
    const [courts, gallery] = await Promise.all([publishedCollection(payload, 'courts', preview), publishedCollection(payload, 'gallery-items', preview, { showOnCourtsPage: { equals: true } }, ['courtsPageOrder', '-createdAt', 'id'])])
    return parseThematicPageDTO({ ...base, kind, infographicTitle: page.infographicTitle, infographicCopy: page.infographicCopy, metrics: page.metrics ?? [], courts: courts.docs.map(court), gallery: gallery.docs.map((item) => galleryItem(item, origin)) })
  }
  if (kind === 'gallery') {
    const gallery = await publishedCollection(payload, 'gallery-items', preview, undefined, ['galleryPageOrder', '-createdAt', 'id'])
    return parseThematicPageDTO({ ...base, kind, gallery: gallery.docs.map((item) => galleryItem(item, origin)) })
  }
  if (kind === 'about') {
    const gallery = await publishedCollection(payload, 'gallery-items', preview, { showOnAboutPage: { equals: true } }, ['aboutPageOrder', '-createdAt', 'id'])
    return parseThematicPageDTO({ ...base, kind, storyHTML: richContentHTML(page.story), stats: page.stats ?? [], gallery: gallery.docs.map((item) => galleryItem(item, origin)) })
  }
  if (kind === 'contacts') return parseThematicPageDTO({ ...base, kind, directionsTitle: page.directionsTitle, directionsText: page.directionsText, arrivalNotes: page.arrivalNotes ?? [] })
  return parseThematicPageDTO({ ...base, kind, notice: page.notice, contentHTML: richContentHTML(page.content), approved: page.approved === true })
}
