import type {
  BlogDetailDTO,
  CatalogDTO,
  CoachDetailDTO,
  GiftPageDTO,
  PadelCourtZakazPageDTO,
  TournamentDetailDTO,
} from '@unlim/content-contract'

export type StructuredDataNode = Record<string, unknown>

export function resolveCanonicalURL(origin: string, pathname: string, configured?: string | null): string {
  const url = configured?.trim() ? new URL(configured) : new URL(pathname, origin)
  url.hash = ''
  url.pathname = url.pathname === '/' ? '/' : `${url.pathname.replace(/\/+$/, '')}/`
  return url.toString()
}

export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c')
}

function breadcrumbs(origin: string, section: { name: string; path: string } | null, current: { name: string; url: string }): StructuredDataNode {
  const entries = [
    { name: 'Главная', item: resolveCanonicalURL(origin, '/') },
    ...(section ? [{ name: section.name, item: resolveCanonicalURL(origin, section.path) }] : []),
    { name: current.name, item: current.url },
  ]
  return {
    '@type': 'BreadcrumbList',
    itemListElement: entries.map((entry, index) => ({ '@type': 'ListItem', position: index + 1, ...entry })),
  }
}

export function detailStructuredData(
  dto: BlogDetailDTO | CoachDetailDTO | TournamentDetailDTO,
  origin: string,
  canonical: string,
): StructuredDataNode[] {
  if (dto.kind === 'blog') {
    return [
      {
        '@type': 'Article',
        '@id': `${canonical}#article`,
        headline: dto.item.title,
        description: dto.item.excerpt,
        image: dto.item.image.url,
        datePublished: dto.item.publishedAt,
        ...(dto.item.updatedAt ? { dateModified: dto.item.updatedAt } : {}),
        mainEntityOfPage: canonical,
        publisher: { '@id': `${origin.replace(/\/$/, '')}/#organization` },
      },
      breadcrumbs(origin, { name: 'Блог', path: '/blog/' }, { name: dto.item.title, url: canonical }),
    ]
  }

  if (dto.kind === 'coaches') {
    return [
      {
        '@type': 'Person',
        '@id': `${canonical}#coach`,
        name: dto.item.name,
        description: dto.item.bio,
        image: dto.item.photo.url,
        jobTitle: 'Тренер по паделу',
        url: canonical,
        ...(dto.item.languageCodes.length > 0 ? { knowsLanguage: dto.item.languageCodes } : {}),
        worksFor: { '@id': `${origin.replace(/\/$/, '')}/#organization` },
      },
      breadcrumbs(origin, { name: 'Тренеры', path: '/coaches/' }, { name: dto.item.name, url: canonical }),
    ]
  }

  const eventStatus = dto.item.lifecycle === 'cancelled'
    ? 'https://schema.org/EventCancelled'
    : 'https://schema.org/EventScheduled'
  return [
    {
      '@type': 'SportsEvent',
      '@id': `${canonical}#event`,
      name: dto.item.title,
      description: dto.item.description,
      startDate: dto.item.startsAt,
      endDate: dto.item.endsAt,
      eventStatus,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      url: canonical,
      ...(dto.item.image?.url ? { image: dto.item.image.url } : {}),
      location: { '@id': `${origin.replace(/\/$/, '')}/#club` },
      organizer: { '@id': `${origin.replace(/\/$/, '')}/#organization` },
    },
    breadcrumbs(origin, { name: 'Турниры', path: '/tournaments/' }, { name: dto.item.title, url: canonical }),
  ]
}

export function catalogStructuredData(dto: CatalogDTO, origin: string, canonical: string): StructuredDataNode[] {
  const sectionName = dto.kind === 'blog' ? 'Блог' : dto.kind === 'coaches' ? 'Тренеры' : 'Турниры'
  const pageName = `${dto.page.seo.title ?? dto.page.title}${dto.query.page > 1 ? ` — страница ${dto.query.page}` : ''}`
  return [
    {
      '@type': 'CollectionPage',
      '@id': `${canonical}#page`,
      name: pageName,
      description: dto.page.seo.description ?? dto.page.intro,
      url: canonical,
      isPartOf: { '@id': `${origin.replace(/\/$/, '')}/#website` },
    },
    breadcrumbs(origin, null, { name: dto.query.page > 1 ? `${sectionName} — страница ${dto.query.page}` : sectionName, url: canonical }),
  ]
}

export function giftStructuredData(dto: GiftPageDTO, origin: string, canonical: string): StructuredDataNode[] {
  return [
    {
      '@type': 'Product',
      '@id': `${canonical}#certificate`,
      name: dto.page.title,
      description: dto.page.intro,
      image: dto.page.seo.socialImage?.url ?? dto.page.hero.media.url,
      url: canonical,
      brand: { '@id': `${origin.replace(/\/$/, '')}/#organization` },
    },
    breadcrumbs(origin, null, { name: dto.page.title, url: canonical }),
    ...(dto.faq.length > 0 ? [{
      '@type': 'FAQPage',
      mainEntity: dto.faq.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    }] : []),
  ]
}

export function courtServiceStructuredData(dto: PadelCourtZakazPageDTO, origin: string, canonical: string): StructuredDataNode[] {
  return [
    {
      '@type': 'Service',
      '@id': `${canonical}#service`,
      name: dto.page.title,
      description: dto.page.intro,
      image: dto.page.seo.socialImage?.url ?? dto.page.hero.media.url,
      url: canonical,
      provider: { '@id': `${origin.replace(/\/$/, '')}/#organization` },
      areaServed: 'Россия',
    },
    breadcrumbs(origin, null, { name: dto.page.title, url: canonical }),
  ]
}
