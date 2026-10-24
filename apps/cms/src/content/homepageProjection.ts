import { ContentUnavailableError } from './projectionCache'
import { defaultHeroTint, defaultHeroTitleFontSize, homepageDTOversion, parseHomepageDTO, type HeroSlotDTO, type HeroTitleFontSizeDTO, type HeroTintDTO, type HomepageDTO } from '@unlim/content-contract'
import type { Payload } from 'payload'

import type { ArticleCategory, Tournament } from '../payload-types'
import { actionDTO, mediaDTO, requiredMedia, seoDTO, siteDTO } from './normalize'
import { tournamentCard } from './catalogProjection'
import { resolveHomepageArticles } from '../hooks/resolveHomepageArticles'
import { homepageCollectionLimits, resolveHomepageEntities } from '../hooks/resolveHomepageEntities'

/** Visibility is resolved in CMS; disabled content never enters the public DTO. */
export function projectOffers(cards: NonNullable<import('../payload-types').Homepage['offersSection']>['cards'], origin: string): HomepageDTO['home']['offers'] {
  return (cards ?? []).filter((card) => card.enabled !== false).map((card, index) => ({
    id: card.id ?? `offer-${index}`, variant: card.variant ?? 'event', badge: card.badge ?? '', title: card.title ?? '',
    description: card.description ?? '', image: mediaDTO(card.image, origin),
    meshTone: card.meshTone ?? 'deep-blue', icon: card.icon, action: actionDTO(card.action),
  }))
}

function relationTitle(value: unknown): string {
  return typeof value === 'object' && value !== null && 'title' in value ? String(value.title) : ''
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function projectHeroTintStop(value: unknown, fallback: HeroTintDTO['desktop']['stop1']): HeroTintDTO['desktop']['stop1'] {
  const stop = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
  return {
    opacity: clamp(numberOr(stop.opacity, fallback.opacity), 0, 100),
    position: clamp(numberOr(stop.position, fallback.position), 0, 200),
  }
}

function projectHeroTint(value: unknown): HeroTintDTO {
  const tint = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
  const projectDevice = (name: 'desktop' | 'mobile'): HeroTintDTO['desktop'] => {
    const device = typeof tint[name] === 'object' && tint[name] !== null ? tint[name] as Record<string, unknown> : {}
    const fallback = defaultHeroTint[name]
    return {
      centerX: clamp(numberOr(device.centerX, fallback.centerX), 0, 100),
      centerY: clamp(numberOr(device.centerY, fallback.centerY), 0, 100),
      stop1: projectHeroTintStop(device.stop1, fallback.stop1),
      stop2: projectHeroTintStop(device.stop2, fallback.stop2),
      stop3: projectHeroTintStop(device.stop3, fallback.stop3),
    }
  }
  return { desktop: projectDevice('desktop'), mobile: projectDevice('mobile') }
}

function projectHeroTitleFontSize(value: unknown): HeroTitleFontSizeDTO {
  const fontSize = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
  return {
    mobile: clamp(numberOr(fontSize.mobile, defaultHeroTitleFontSize.mobile), 24, 160),
    desktop: clamp(numberOr(fontSize.desktop, defaultHeroTitleFontSize.desktop), 24, 160),
  }
}

const heroSlotIcons = new Set<HeroSlotDTO['icon']>(['CalendarCheck', 'CalendarDays', 'UserRound', 'ArrowUpRight', 'Info', 'Sparkles'])

function projectHeroSlot(value: unknown, fallback: HeroSlotDTO): HeroSlotDTO {
  const slot = value && typeof value === 'object' ? value as Record<string, any> : {}
  const icon = heroSlotIcons.has(slot.icon) ? slot.icon : fallback.icon
  const enabled = slot.enabled !== false
  if (slot.type === 'info') return { type: 'info', enabled, icon, title: String(slot.title ?? ''), caption: String(slot.caption ?? '') }
  if (slot.type === 'button') {
    const action = slot.action && typeof slot.action === 'object' ? { ...slot.action, leadType: slot.action.leadType ?? slot.action.lead } : slot.action
    return { type: 'button', enabled, icon, action: actionDTO(action) }
  }
  return { ...fallback, enabled: false }
}

function projectHeroSlots(hero: Record<string, any>) {
  const config = hero.buttonsAndElements ?? {}
  const notice = hero.openingNotice ?? {}
  return {
    desktop: [
      projectHeroSlot(config.desktop?.slot1, { type: 'button', enabled: true, icon: 'CalendarCheck', action: actionDTO(hero.primaryAction ?? { mode: 'booking', label: 'Забронировать' }) }),
      projectHeroSlot(config.desktop?.slot2, { type: 'button', enabled: true, icon: 'UserRound', action: actionDTO(hero.secondaryAction ?? { mode: 'account', label: 'Личный кабинет' }) }),
      projectHeroSlot(config.desktop?.slot3, { type: 'info', enabled: true, icon: 'CalendarDays', title: String(notice.title ?? '2 недели с открытия'), caption: String(notice.caption ?? 'Аренда со скидкой 50%') }),
    ] as [HeroSlotDTO, HeroSlotDTO, HeroSlotDTO],
    mobile: [
      projectHeroSlot(config.mobile?.slot1, { type: 'button', enabled: true, icon: 'CalendarCheck', action: actionDTO(hero.primaryAction ?? { mode: 'booking', label: 'Забронировать' }) }),
      projectHeroSlot(config.mobile?.slot2, { type: 'info', enabled: true, icon: 'CalendarDays', title: String(notice.title ?? '2 недели с открытия'), caption: String(notice.caption ?? 'Аренда со скидкой 50%') }),
    ] as [HeroSlotDTO, HeroSlotDTO],
  }
}

export async function createHomepageProjection(
  payload: Payload,
  options: { origin: string; preview: boolean },
): Promise<HomepageDTO> {
  const { origin, preview } = options
  const collections = Object.keys(homepageCollectionLimits) as Array<keyof typeof homepageCollectionLimits>
  const [homepage, siteSettings, articles, ...entityResults] = await Promise.all([
    payload.findGlobal({ slug: 'homepage', draft: preview, depth: 2, overrideAccess: true, showHiddenFields: false }),
    payload.findGlobal({ slug: 'site-settings', draft: preview, depth: 2, overrideAccess: true, showHiddenFields: false }),
    resolveHomepageArticles(payload, { preview }),
    ...collections.map((collection) => resolveHomepageEntities(payload, collection, { preview })),
  ])

  if (!preview && (homepage._status !== 'published' || siteSettings._status !== 'published')) {
    throw new ContentUnavailableError()
  }

  const articleRowsResult = await payload.find({
    collection: 'articles',
    select: { id: true, slug: true, title: true, excerpt: true },
    draft: preview,
    depth: 0,
    limit: 6,
    overrideAccess: true,
    sort: ['-publishedAt', '-createdAt'],
    where: {
      and: [
        ...(!preview ? [{ _status: { equals: 'published' } }] : []),
        { id: { not_in: articles.map(({ id }) => id) } },
      ],
    },
  })

  const entities = Object.fromEntries(collections.map((collection, index) => [collection, entityResults[index]])) as unknown as Record<keyof typeof homepageCollectionLimits, Array<Record<string, unknown>>>
  const homeHeroMedia = mediaDTO(homepage.hero.desktopMedia, origin, 'hero')
  const heroSlots = projectHeroSlots(homepage.hero as unknown as Record<string, any>)
  const homepageSEO = seoDTO(homepage.seo, origin)

  const dto: HomepageDTO = {
    version: homepageDTOversion,
    preview,
    generatedAt: new Date().toISOString(),
    sections: homepage.sections.map(({ section, visible }) => ({ key: section, visible: visible !== false })),
    seo: {
      title: homepageSEO.title,
      description: homepageSEO.description,
      canonical: homepageSEO.canonical,
      robots: homepageSEO.robots,
      socialImage: homepageSEO.socialImage ?? homeHeroMedia,
    },
    site: siteDTO(siteSettings, origin, entities.partners),
    home: {
      hero: {
        desktopSlots: heroSlots.desktop, mobileSlots: heroSlots.mobile,
        seoHeading: homepage.hero.seoHeading ?? 'Премиальный крытый падел-клуб', titleLine: homepage.hero.titleLine ?? '', titleConnector: homepage.hero.titleConnector ?? '', titleAccent: homepage.hero.titleAccent ?? '',
        description: homepage.hero.description ?? '', desktopMedia: homeHeroMedia,
        mobileMedia: mediaDTO(homepage.hero.mobileMedia, origin, 'hero'), desktopPoster: mediaDTO(homepage.hero.desktopVideoPoster, origin),
        mobilePoster: mediaDTO(homepage.hero.mobileVideoPoster, origin), tint: projectHeroTint(homepage.hero.tint), titleFontSize: projectHeroTitleFontSize(homepage.hero.titleFontSize),
        socialProof: {
          ratingLabel: homepage.hero.socialProof?.ratingLabel ?? '', caption: homepage.hero.socialProof?.caption ?? '',
          coachPhotos: (homepage.hero.socialProof?.coaches ?? []).flatMap((coach) => {
            if (typeof coach !== 'object' || coach === null || !('photo' in coach)) return []
            const photo = mediaDTO(coach.photo, origin, 'thumbnail')
            return photo ? [photo] : []
          }),
        },
        stats: (homepage.hero.stats ?? []).map(({ value, label }) => ({ value, label })),
      },
      benefits: {
        eyebrow: homepage.benefitsSection?.eyebrow ?? '', title: homepage.benefitsSection?.title ?? '',
        cards: (homepage.benefitsSection?.cards ?? []).map((card) => ({ id: card.id ?? card.variant, variant: card.variant, eyebrow: card.eyebrow, title: card.title, description: card.description ?? '', supportingText: card.supportingText, media: mediaDTO(card.media, origin), overlay: card.overlay, meshTone: card.meshTone, action: actionDTO(card.action) })),
      },
      offers: projectOffers(homepage.offersSection?.cards, origin),
      courtsSection: { titleLineOne: homepage.courtsSection?.titleLineOne ?? '', titleLineTwo: homepage.courtsSection?.titleLineTwo ?? '', background: mediaDTO(homepage.courtsSection?.backgroundMedia, origin, 'hero'), backgroundAlt: homepage.courtsSection?.backgroundAlt ?? '' },
      pricingSection: {
        eyebrow: homepage.pricingSection.eyebrow ?? '', title: homepage.pricingSection.title ?? '', defaultTab: homepage.pricingSection.defaultTab,
        rentTabLabel: homepage.pricingSection.rentTabLabel ?? '', trainingTabLabel: homepage.pricingSection.trainingTabLabel ?? '', membershipsTabLabel: homepage.pricingSection.membershipsTabLabel ?? '',
        membershipOffer: { enabled: Boolean(homepage.pricingSection.membershipOffer?.enabled), showOnHomepage: Boolean(homepage.pricingSection.membershipOffer?.showOnHomepage), title: String(homepage.pricingSection.membershipOffer?.title ?? ''), eyebrow: homepage.pricingSection.membershipOffer?.eyebrow, description: String(homepage.pricingSection.membershipOffer?.description ?? ''), priceLabel: homepage.pricingSection.membershipOffer?.priceLabel, meshTone: homepage.pricingSection.membershipOffer?.meshTone, action: actionDTO(homepage.pricingSection.membershipOffer?.action) },
        rentalStandards: { enabled: Boolean(homepage.pricingSection.rentalStandards?.enabled), showOnHomepage: Boolean(homepage.pricingSection.rentalStandards?.showOnHomepage), title: String(homepage.pricingSection.rentalStandards?.title ?? ''), eyebrow: homepage.pricingSection.rentalStandards?.eyebrow, timeLabel: homepage.pricingSection.rentalStandards?.timeLabel, description: String(homepage.pricingSection.rentalStandards?.description ?? ''), meshTone: homepage.pricingSection.rentalStandards?.meshTone, includedItems: Array.isArray(homepage.pricingSection.rentalStandards?.includedItems) ? homepage.pricingSection.rentalStandards.includedItems.map((entry) => String(entry.text)) : [] },
      },
      methodistBanner: { eyebrow: homepage.methodistBanner.eyebrow ?? '', icon: homepage.methodistBanner.icon ?? 'Target', price: homepage.methodistBanner.price, title: homepage.methodistBanner.title ?? '', description: homepage.methodistBanner.description ?? '', decorativeMedia: mediaDTO(homepage.methodistBanner.decorativeMedia, origin), meshTone: homepage.methodistBanner.meshTone ?? 'lavender', action: actionDTO(homepage.methodistBanner.action) },
      coachesSection: { eyebrow: homepage.coachesSection?.eyebrow ?? '', title: homepage.coachesSection?.title ?? '' },
      tournamentsSection: { eyebrow: homepage.tournamentsSection?.eyebrow ?? '', title: homepage.tournamentsSection?.title ?? '' },
      gallerySection: { eyebrow: homepage.gallerySection.eyebrow ?? '', title: homepage.gallerySection.title ?? '', action: actionDTO(homepage.gallerySection.action) },
      blogSection: { eyebrow: homepage.blogSection.eyebrow ?? '', title: homepage.blogSection.title ?? '', action: actionDTO(homepage.blogSection.action) },
      reviewsSection: { reviewsEyebrow: homepage.reviewsSection?.reviewsEyebrow ?? '', reviewsTitle: homepage.reviewsSection?.reviewsTitle ?? '', faqEyebrow: homepage.reviewsSection?.faqEyebrow ?? '', faqTitle: homepage.reviewsSection?.faqTitle ?? '', externalRatingLabel: homepage.reviewsSection?.externalRatingLabel ?? '', externalReviewsLabel: homepage.reviewsSection?.externalReviewsLabel ?? '', externalReviewsURL: homepage.reviewsSection?.externalReviewsURL ?? '' },
    },
    entities: {
      coaches: entities.coaches.map((coach) => ({ id: String(coach.id), name: String(coach.name), slug: String(coach.slug), photo: requiredMedia(coach.photo, origin), specialization: String(coach.specialization), bio: String(coach.bio), level: String(coach.level), experience: String(coach.experience), languages: String(coach.languages), rating: Number(coach.rating), reviewsCount: Number(coach.reviewsCount), certificates: Array.isArray(coach.certificates) ? coach.certificates.map((item) => String((item as { title: unknown }).title)) : [], priceFrom: Number(coach.priceFrom), action: actionDTO(coach.action) })),
      tournaments: entities.tournaments.map((item) => tournamentCard(item as unknown as Tournament, origin)),
      articles: articles.map((article) => ({ id: String(article.id), slug: article.slug, image: requiredMedia(article.previewImage, origin), category: relationTitle(article.category as ArticleCategory), readingTimeMinutes: article.readingTimeMinutes, title: article.title, excerpt: article.excerpt })),
      articleRows: articleRowsResult.docs.map((article) => ({ id: String(article.id), slug: article.slug, title: article.title, excerpt: article.excerpt })),
      courts: entities.courts.map((item) => ({ id: String(item.id), slug: String(item.slug), title: String(item.title), eyebrow: item.eyebrow as string | null, description: item.description as string | null, cardVariant: item.cardVariant as 'panoramic' | 'metrics' | 'damping' | 'surface', metrics: item.metrics as HomepageDTO['entities']['courts'][number]['metrics'] })),
      rentalRates: entities['rental-rates'].map((item) => ({ id: String(item.id), title: String(item.title), eyebrow: item.eyebrow as string | null, timeLabel: item.timeLabel as string | null, description: String(item.description), price: item.price as number | null, priceLabel: item.priceLabel as string | null, priceSuffix: item.priceSuffix as string | null, badge: item.badge as string | null, badgeTone: item.badgeTone as string | null, cardVariant: 'rate' as const, meshTone: item.meshTone as string | null, includedItems: Array.isArray(item.includedItems) ? item.includedItems.map((entry) => String((entry as { text: unknown }).text)) : [], action: actionDTO(item.action) })),
      trainingPrograms: entities['training-programs'].map((item) => ({ id: String(item.id), slug: String(item.slug), title: String(item.title), badge: String(item.badge), description: String(item.description), image: requiredMedia(item.image, origin), overlay: String(item.overlay), icon: item.icon as 'User' | 'Users' | 'Baby', priceFrom: Number(item.priceFrom), action: actionDTO(item.action) })),
      memberships: entities.memberships.map((item) => ({ id: String(item.id), title: String(item.title), badge: item.badge as string | null, badgeTone: item.badgeTone as string | null, description: String(item.description), cardVariant: item.cardVariant as 'gift' | 'package' | 'featured-package' | 'resident', meshTone: item.meshTone as string | null, price: item.price as number | null, oldPrice: item.oldPrice as number | null, priceLabel: item.priceLabel as string | null, benefits: Array.isArray(item.benefits) ? item.benefits.map((entry) => String((entry as { text: unknown }).text)) : [], giftAmountLimits: item.giftAmountLimits as HomepageDTO['entities']['memberships'][number]['giftAmountLimits'], action: actionDTO(item.action) })),
      gallery: entities['gallery-items'].map((item) => ({ id: String(item.id), title: String(item.title), media: requiredMedia(item.media, origin), caption: item.caption as string | null })),
      reviews: entities.reviews.map((item) => ({ id: String(item.id), authorName: String(item.authorName), authorMeta: String(item.authorMeta), avatar: mediaDTO(item.avatar, origin, 'thumbnail'), rating: Number(item.rating), text: String(item.text) })),
      faqs: entities.faqs.map((item) => ({ id: String(item.id), question: String(item.question), answer: String(item.answer) })),
    },
  }

  return parseHomepageDTO(dto)
}
