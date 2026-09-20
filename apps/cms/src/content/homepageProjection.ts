import { homepageDTOversion, parseHomepageDTO, type HomepageDTO } from '@unlim/content-contract'
import type { Payload } from 'payload'

import type { ArticleCategory, Tournament } from '../payload-types'
import { actionDTO, mediaDTO, requiredMedia, seoDTO, siteDTO } from './normalize'
import { tournamentCard } from './catalogProjection'
import { resolveHomepageArticles } from '../hooks/resolveHomepageArticles'
import { homepageCollectionLimits, resolveHomepageEntities } from '../hooks/resolveHomepageEntities'

function relationTitle(value: unknown): string {
  return typeof value === 'object' && value !== null && 'title' in value ? String(value.title) : ''
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
    throw new Error('Published homepage globals are not available.')
  }

  const articleRowsResult = await payload.find({
    collection: 'articles',
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
        titleLine: homepage.hero.titleLine ?? '', titleConnector: homepage.hero.titleConnector ?? '', titleAccent: homepage.hero.titleAccent ?? '',
        description: homepage.hero.description ?? '', desktopMedia: homeHeroMedia,
        mobileMedia: mediaDTO(homepage.hero.mobileMedia, origin, 'hero'), desktopPoster: mediaDTO(homepage.hero.desktopVideoPoster, origin),
        mobilePoster: mediaDTO(homepage.hero.mobileVideoPoster, origin), primaryAction: actionDTO(homepage.hero.primaryAction),
        secondaryAction: actionDTO(homepage.hero.secondaryAction),
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
        cards: (homepage.benefitsSection?.cards ?? []).map((card) => ({ id: card.id ?? card.variant, variant: card.variant, eyebrow: card.eyebrow, title: card.title, description: card.description, supportingText: card.supportingText, media: mediaDTO(card.media, origin), overlay: card.overlay, meshTone: card.meshTone, action: actionDTO(card.action) })),
      },
      offers: (homepage.offersSection?.cards ?? []).map((card) => ({ id: card.id ?? card.variant, variant: card.variant, badge: card.badge, title: card.title, description: card.description, image: mediaDTO(card.image, origin), overlay: card.overlay, icon: card.icon, action: actionDTO(card.action) })),
      courtsSection: { titleLineOne: homepage.courtsSection?.titleLineOne ?? '', titleLineTwo: homepage.courtsSection?.titleLineTwo ?? '', background: mediaDTO(homepage.courtsSection?.backgroundMedia, origin, 'hero'), backgroundAlt: homepage.courtsSection?.backgroundAlt ?? '' },
      pricingSection: { eyebrow: homepage.pricingSection.eyebrow ?? '', title: homepage.pricingSection.title ?? '', defaultTab: homepage.pricingSection.defaultTab, rentTabLabel: homepage.pricingSection.rentTabLabel ?? '', trainingTabLabel: homepage.pricingSection.trainingTabLabel ?? '', membershipsTabLabel: homepage.pricingSection.membershipsTabLabel ?? '' },
      methodistBanner: { title: homepage.methodistBanner.title ?? '', description: homepage.methodistBanner.description ?? '', decorativeMedia: mediaDTO(homepage.methodistBanner.decorativeMedia, origin), meshTone: homepage.methodistBanner.meshTone ?? 'lavender', action: actionDTO(homepage.methodistBanner.action) },
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
      rentalRates: entities['rental-rates'].map((item) => ({ id: String(item.id), title: String(item.title), eyebrow: item.eyebrow as string | null, timeLabel: item.timeLabel as string | null, description: String(item.description), price: item.price as number | null, priceLabel: item.priceLabel as string | null, priceSuffix: item.priceSuffix as string | null, badge: item.badge as string | null, badgeTone: item.badgeTone as string | null, cardVariant: item.cardVariant as 'rate' | 'trial' | 'standards', meshTone: item.meshTone as string | null, includedItems: Array.isArray(item.includedItems) ? item.includedItems.map((entry) => String((entry as { text: unknown }).text)) : [], action: actionDTO(item.action) })),
      trainingPrograms: entities['training-programs'].map((item) => ({ id: String(item.id), slug: String(item.slug), title: String(item.title), badge: String(item.badge), description: String(item.description), image: requiredMedia(item.image, origin), overlay: String(item.overlay), icon: item.icon as 'User' | 'Users' | 'Baby', priceFrom: Number(item.priceFrom), action: actionDTO(item.action) })),
      memberships: entities.memberships.map((item) => ({ id: String(item.id), title: String(item.title), badge: item.badge as string | null, badgeTone: item.badgeTone as string | null, description: String(item.description), cardVariant: item.cardVariant as 'gift' | 'package' | 'featured-package' | 'resident', meshTone: item.meshTone as string | null, price: item.price as number | null, oldPrice: item.oldPrice as number | null, priceLabel: item.priceLabel as string | null, benefits: Array.isArray(item.benefits) ? item.benefits.map((entry) => String((entry as { text: unknown }).text)) : [], giftAmountLimits: item.giftAmountLimits as HomepageDTO['entities']['memberships'][number]['giftAmountLimits'], action: actionDTO(item.action) })),
      gallery: entities['gallery-items'].map((item) => ({ id: String(item.id), title: String(item.title), media: requiredMedia(item.media, origin), caption: item.caption as string | null })),
      reviews: entities.reviews.map((item) => ({ id: String(item.id), authorName: String(item.authorName), authorMeta: String(item.authorMeta), avatar: mediaDTO(item.avatar, origin, 'thumbnail'), rating: Number(item.rating), text: String(item.text) })),
      faqs: entities.faqs.map((item) => ({ id: String(item.id), question: String(item.question), answer: String(item.answer) })),
    },
  }

  return parseHomepageDTO(dto)
}
