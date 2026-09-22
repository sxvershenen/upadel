import { catalogPageSize, parseCatalogQuery, catalogQueryParams, type CatalogQuery, homepageDTOversion, type ArticleCatalogItem, type CatalogDTO, type CatalogPageHeader, type CoachCatalogItem, type DetailDTO, type PageSEO, type TournamentCardDTO, type TournamentCatalogItem } from '@unlim/content-contract'
import type { Payload } from 'payload'

import type { Article, Coach, SiteSetting, Tournament, TournamentDefault } from '../payload-types'
import { formatTournamentLevel, formatTournamentSchedule, resolveTournamentFormatLabel } from '../tournaments/model'
import { articleContentHTML } from './articleContent'
import { ContentUnavailableError } from './projectionCache'
import { actionDTO, mediaDTO, pageHeroDTO, requiredMedia, seoDTO, siteDTO } from './normalize'

export type CatalogKind = 'blog' | 'coaches' | 'tournaments'
const pageSlugs = { blog: 'blog-page', coaches: 'coaches-page', tournaments: 'tournaments-page' } as const
const collectionSlugs = { blog: 'articles', coaches: 'coaches', tournaments: 'tournaments' } as const

function categoryDTO(value: unknown): { slug: string; title: string } {
  return value && typeof value === 'object' && 'title' in value && 'slug' in value
    ? { slug: String(value.slug), title: String(value.title) }
    : { slug: '', title: '' }
}

function articleItem(article: Article, origin: string): ArticleCatalogItem {
  return { id: String(article.id), slug: article.slug, image: requiredMedia(article.previewImage, origin), category: categoryDTO(article.category), readingTimeMinutes: article.readingTimeMinutes, title: article.title, excerpt: article.excerpt, publishedAt: article.publishedAt ?? article.createdAt, updatedAt: article.updatedAt, popularityScore: article.popularityScore ?? 0 }
}

function coachItem(coach: Coach, origin: string): CoachCatalogItem {
  return { id: String(coach.id), slug: coach.slug, name: coach.name, photo: requiredMedia(coach.photo, origin), specialization: coach.specialization, bio: coach.bio, level: coach.level, experience: coach.experience, languages: coach.languages, rating: coach.rating, reviewsCount: coach.reviewsCount, certificates: (coach.certificates ?? []).map(({ title }) => title), priceFrom: coach.priceFrom, action: actionDTO(coach.action), levels: coach.levels ?? [], focusAreas: coach.focusAreas ?? [], languageCodes: coach.languageCodes ?? [] }
}

export function tournamentCard(item: Tournament, origin: string): TournamentCardDTO {
  const levelFrom = Number(item.levelFrom)
  const levelTo = Number(item.levelTo)
  return {
    id: String(item.id), slug: item.slug, visualStyle: item.visualStyle, image: mediaDTO(item.image, origin), imageOverlay: item.imageOverlay,
    meshStyle: item.meshStyle, levelFrom, levelTo, levelLabel: formatTournamentLevel(levelFrom, levelTo), icon: item.icon, title: item.title,
    startsAt: item.startsAt, endsAt: item.endsAt, scheduleLabel: formatTournamentSchedule(item.startsAt, item.endsAt), format: item.format,
    formatLabel: resolveTournamentFormatLabel(item.format, item.customFormat), entryFee: item.entryFee, description: item.description,
    prizeLabel: item.prizeLabel, prize: item.prize,
  }
}

type TournamentContext = { defaults: TournamentDefault; site: SiteSetting }

function withIDs<T extends Record<string, unknown>>(rows: T[] | null | undefined): Array<T & { id: string }> {
  return (rows ?? []).map((row, index) => ({ ...row, id: typeof row.id === 'string' ? row.id : String(index + 1) }))
}

function tournamentItem(item: Tournament, origin: string, context: TournamentContext): TournamentCatalogItem {
  const inherited = context.defaults
  const siteTelegram = context.site.socialLinks?.find(({ provider }) => provider === 'telegram')
  const coordinator = item.useClubCoordinatorContacts !== false
    ? { telegramLabel: siteTelegram?.label ?? 'Telegram', telegramURL: siteTelegram?.url, phoneDisplay: context.site.phoneDisplay, phoneValue: context.site.phoneValue }
    : item.coordinator ?? {}
  return {
    ...tournamentCard(item, origin),
    action: actionDTO(item.action), lifecycle: item.lifecycle, participantMode: item.participantMode, totalSlots: item.totalSlots,
    participants: withIDs(item.participants).map(({ id, name, partnerName, level, status }) => ({ id, name, partnerName, level, status })),
    standings: withIDs(item.standings).map(({ id, name, partnerName, matches, points, difference, award }, index) => ({ id, rank: index + 1, name, partnerName, matches, points, difference, award })),
    prizes: withIDs(item.prizes).map(({ id, title, reward, description }, index) => ({ id, place: index + 1, title, reward, description })),
    checklist: withIDs(item.useDefaultChecklist === false ? item.checklist : inherited.checklist).map(({ id, text }) => ({ id, text })),
    perks: withIDs(item.useDefaultPerks === false ? item.perks : inherited.perks).map(({ id, icon, title, description }) => ({ id, icon, title, description })),
    matchday: withIDs(item.useDefaultMatchday === false ? item.matchday : inherited.matchday).map(({ id, timing, title, description }) => ({ id, timing, title, description })),
    faqs: withIDs(item.useDefaultFaq === false ? item.faqs : inherited.faqs).map(({ id, question, answer }) => ({ id, question, answer })),
    coordinator,
    regulationHTML: richContentHTML(item.regulation ?? {}),
  }
}

function truncateSEO(value: string, maxLength = 160): string {
  if (value.length <= maxLength) return value
  const shortened = value.slice(0, maxLength - 1)
  const boundary = shortened.lastIndexOf(' ')
  return `${shortened.slice(0, boundary > 110 ? boundary : maxLength - 1).replace(/[.,;:!?\s]+$/u, '')}…`
}

export function tournamentSEO(item: Tournament, origin: string): PageSEO {
  const explicit = seoDTO(item.seo, origin)
  const level = formatTournamentLevel(item.levelFrom, item.levelTo)
  const format = resolveTournamentFormatLabel(item.format, item.customFormat)
  const value = item.prize?.trim() ? `${item.prizeLabel}: ${item.prize}` : `Взнос: ${item.entryFee}`
  return {
    ...explicit,
    title: explicit.title?.trim() || `${item.title} — падел турнир Москва`,
    description: explicit.description?.trim() || truncateSEO(`${item.title} — падел-турнир в Москве. Формат: ${format}; уровень ${level}; ${value}.`),
  }
}

const escapeHTML = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')

function safeHref(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (value.startsWith('/') || value.startsWith('#')) return value
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? value : null } catch { return null }
}

export function richContentHTML(value: { root?: unknown }): string {
  const render = (node: unknown): string => {
    if (!node || typeof node !== 'object') return ''
    const record = node as { children?: unknown[]; fields?: { newTab?: boolean; url?: string }; format?: number; listType?: string; tag?: string; text?: string; type?: string; url?: string }
    if (record.type === 'text') {
      let text = escapeHTML(record.text ?? '')
      const format = typeof record.format === 'number' ? record.format : 0
      if (format & 16) text = `<code>${text}</code>`
      if (format & 8) text = `<u>${text}</u>`
      if (format & 4) text = `<s>${text}</s>`
      if (format & 2) text = `<em>${text}</em>`
      if (format & 1) text = `<strong>${text}</strong>`
      return text
    }
    const children = (record.children ?? []).map(render).join('')
    if (record.type === 'paragraph') return `<p>${children}</p>`
    if (record.type === 'heading') { const tag = record.tag === 'h3' ? 'h3' : 'h2'; return `<${tag}>${children}</${tag}>` }
    if (record.type === 'list') { const tag = record.listType === 'number' ? 'ol' : 'ul'; return `<${tag}>${children}</${tag}>` }
    if (record.type === 'listitem') return `<li>${children}</li>`
    if (record.type === 'link' || record.type === 'autolink') { const href = safeHref(record.fields?.url ?? record.url); return href ? `<a href="${escapeHTML(href)}"${record.fields?.newTab ? ' target="_blank" rel="noreferrer"' : ''}>${children}</a>` : children }
    if (record.type === 'linebreak') return '<br>'
    return children
  }
  return render(value?.root)
}

async function baseData(payload: Payload, kind: CatalogKind, origin: string, preview: boolean, includeDefaults = true) {
  const [page, site, partners, tournamentDefaults] = await Promise.all([
    payload.findGlobal({ slug: pageSlugs[kind], draft: preview, depth: 2, overrideAccess: true }),
    payload.findGlobal({ slug: 'site-settings', draft: preview, depth: 2, overrideAccess: true }),
    payload.find({ collection: 'partners', depth: 1, draft: preview, pagination: false, overrideAccess: true, sort: 'homepageOrder', where: preview ? undefined : { and: [{ _status: { equals: 'published' } }, { isActive: { equals: true } }] } }),
    kind === 'tournaments' && includeDefaults ? payload.findGlobal({ slug: 'tournament-defaults', draft: preview, depth: 0, overrideAccess: true }) : Promise.resolve(null),
  ])
  if (!preview && (page._status !== 'published' || site._status !== 'published' || kind === 'tournaments' && includeDefaults && tournamentDefaults?._status !== 'published')) throw new ContentUnavailableError()
  const hero = pageHeroDTO(page, kind, origin)
  const seo = seoDTO(page.seo, origin)
  const header: CatalogPageHeader = { eyebrow: page.eyebrow, title: page.title, intro: page.intro, hero, seo: { ...seo, socialImage: seo.socialImage ?? hero.media } }
  return { header, rawSite: site as SiteSetting, site: siteDTO(site, origin, partners.docs as unknown as Array<Record<string, unknown>>), tournamentDefaults: tournamentDefaults as TournamentDefault | null }
}

/** Select only card fields: article bodies and tournament participant history stay on detail routes. */
const catalogSelect = {
  blog: { id: true, slug: true, title: true, excerpt: true, category: true, previewImage: true, readingTimeMinutes: true, popularityScore: true, publishedAt: true, createdAt: true, updatedAt: true },
  coaches: { id: true, slug: true, name: true, photo: true, specialization: true, bio: true, level: true, experience: true, languages: true, rating: true, reviewsCount: true, certificates: true, priceFrom: true, action: true, levels: true, focusAreas: true, languageCodes: true },
  tournaments: { id: true, slug: true, visualStyle: true, image: true, imageOverlay: true, meshStyle: true, levelFrom: true, levelTo: true, icon: true, title: true, startsAt: true, endsAt: true, format: true, customFormat: true, entryFee: true, description: true, prizeLabel: true, prize: true, action: true, lifecycle: true },
} as const

export async function createCatalogProjection(payload: Payload, options: { kind: CatalogKind; origin: string; preview: boolean; query?: CatalogQuery }): Promise<CatalogDTO | null> {
  const { kind, origin, preview } = options
  const query = parseCatalogQuery(kind, catalogQueryParams(options.query ?? { page: 1 }))
  const conditions: Record<string, unknown>[] = preview ? [] : [{ _status: { equals: 'published' } }]
  if (kind === 'coaches') {
    if (!preview) conditions.push({ isActive: { equals: true } })
    if (query.level) conditions.push({ levels: { in: [query.level] } })
    if (query.focus) conditions.push({ focusAreas: { in: [query.focus] } })
  } else if (kind === 'blog') {
    if (query.category) conditions.push({ 'category.slug': { equals: query.category } })
  } else {
    if (query.lifecycle) conditions.push({ lifecycle: { equals: query.lifecycle } })
    if (query.format) conditions.push({ format: { equals: query.format } })
    if (query.level) conditions.push({ levelFrom: { less_than_equal: query.level } }, { levelTo: { greater_than_equal: query.level } })
  }
  const sort = kind === 'blog' ? (query.sort === 'popular' ? ['-popularityScore', '-publishedAt', 'id'] : ['-publishedAt', 'id']) : kind === 'coaches' ? ['name', 'id'] : ['homepageOrder', 'id']
  const [baseDataResult, result, categories] = await Promise.all([
    baseData(payload, kind, origin, preview, false),
    payload.find({ collection: collectionSlugs[kind], depth: 1, draft: preview, page: query.page, limit: catalogPageSize, overrideAccess: true, sort, select: catalogSelect[kind], where: conditions.length ? { and: conditions } : undefined } as never) as unknown as Promise<{ docs: Array<Article | Coach | Tournament>; totalDocs: number; totalPages: number }>,
    kind === 'blog' ? payload.find({ collection: 'article-categories', depth: 0, draft: preview, pagination: false, overrideAccess: true, select: { slug: true, title: true }, sort: 'title', where: preview ? undefined : { _status: { equals: 'published' } } }) : Promise.resolve(null),
  ])
  const { header, site } = baseDataResult
  const totalPages = Math.max(1, result.totalPages)
  if (query.page > totalPages) return null
  const base = { version: homepageDTOversion, preview, generatedAt: new Date().toISOString(), page: header, site, query, pagination: { page: query.page, limit: catalogPageSize, totalDocs: result.totalDocs, totalPages } }
  if (kind === 'blog') return { ...base, kind, items: (result.docs as Article[]).map((item) => articleItem(item, origin)), categories: (categories?.docs ?? []).map(({ slug, title }) => ({ slug, title })) }
  if (kind === 'coaches') return { ...base, kind, items: (result.docs as Coach[]).map((item) => coachItem(item, origin)) }
  return { ...base, kind, items: (result.docs as Tournament[]).map((item) => ({ ...tournamentCard(item, origin), action: actionDTO(item.action), lifecycle: item.lifecycle })) }
}

export async function createDetailProjection(payload: Payload, options: { kind: CatalogKind; origin: string; preview: boolean; slug: string }): Promise<DetailDTO | null> {
  const { kind, origin, preview, slug } = options
  const { header, rawSite, site, tournamentDefaults } = await baseData(payload, kind, origin, preview)
  const where = { and: [{ slug: { equals: slug } }, ...(!preview ? [{ _status: { equals: 'published' } }] : []), ...(kind === 'coaches' && !preview ? [{ isActive: { equals: true } }] : [])] }
  const result = await payload.find({ collection: collectionSlugs[kind], depth: 2, draft: preview, limit: 1, overrideAccess: true, where } as never) as unknown as { docs: Array<Article | Coach | Tournament> }
  const item = result.docs[0]
  if (!item) return null
  const relatedResult = await payload.find({ collection: collectionSlugs[kind], depth: 2, draft: false, limit: 3, overrideAccess: true, where: { and: [{ id: { not_equals: item.id } }, { _status: { equals: 'published' } }, ...(kind === 'coaches' ? [{ isActive: { equals: true } }] : [])] } } as never) as unknown as { docs: Array<Article | Coach | Tournament> }
  const base = { version: homepageDTOversion, preview, generatedAt: new Date().toISOString(), page: header, site }
  if (kind === 'blog') { const article = item as Article; return { ...base, kind, item: { ...articleItem(article, origin), contentHTML: await articleContentHTML(article.content, { origin, payload }), seo: seoDTO(article.seo, origin) }, related: (relatedResult.docs as Article[]).map((entry) => articleItem(entry, origin)) } }
  if (kind === 'coaches') { const coach = item as Coach; return { ...base, kind, item: { ...coachItem(coach, origin), seo: seoDTO(coach.seo, origin) }, related: (relatedResult.docs as Coach[]).map((entry) => coachItem(entry, origin)) } }
  const tournament = item as Tournament
  if (!tournamentDefaults) throw new Error('Tournament defaults are unavailable.')
  const context = { defaults: tournamentDefaults, site: rawSite }
  return { ...base, kind, item: { ...tournamentItem(tournament, origin, context), seo: tournamentSEO(tournament, origin) }, related: (relatedResult.docs as Tournament[]).map((entry) => tournamentItem(entry, origin, context)) }
}
