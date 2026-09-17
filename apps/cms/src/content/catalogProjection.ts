import { homepageDTOversion, type ArticleCatalogItem, type CatalogDTO, type CatalogPageHeader, type CoachCatalogItem, type DetailDTO, type TournamentCatalogItem } from '@unlim/content-contract'
import type { Payload } from 'payload'

import type { Article, Coach, Tournament } from '../payload-types'
import { articleContentHTML } from './articleContent'
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
  return { id: String(article.id), slug: article.slug, image: requiredMedia(article.previewImage, origin), category: categoryDTO(article.category), readingTimeMinutes: article.readingTimeMinutes, title: article.title, excerpt: article.excerpt, publishedAt: article.publishedAt ?? article.createdAt, popularityScore: article.popularityScore ?? 0 }
}

function coachItem(coach: Coach, origin: string): CoachCatalogItem {
  return { id: String(coach.id), slug: coach.slug, name: coach.name, photo: requiredMedia(coach.photo, origin), specialization: coach.specialization, bio: coach.bio, level: coach.level, experience: coach.experience, languages: coach.languages, rating: coach.rating, reviewsCount: coach.reviewsCount, certificates: (coach.certificates ?? []).map(({ title }) => title), priceFrom: coach.priceFrom, action: actionDTO(coach.action), levels: coach.levels ?? [], focusAreas: coach.focusAreas ?? [], languageCodes: coach.languageCodes ?? [] }
}

function tournamentItem(item: Tournament, origin: string): TournamentCatalogItem {
  return { id: String(item.id), slug: item.slug, visualStyle: item.visualStyle, image: mediaDTO(item.image, origin), imageOverlay: item.imageOverlay, meshStyle: item.meshStyle, category: item.category, icon: item.icon, title: item.title, scheduleLabel: item.scheduleLabel, format: item.format, entryFee: item.entryFee, description: item.description, prizeLabel: item.prizeLabel, prize: item.prize, action: actionDTO(item.action), lifecycle: item.lifecycle, categoryKey: item.categoryKey, formatKey: item.formatKey, regulationHTML: richContentHTML(item.regulation ?? {}) }
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

async function baseData(payload: Payload, kind: CatalogKind, origin: string, preview: boolean) {
  const [page, site, partners] = await Promise.all([
    payload.findGlobal({ slug: pageSlugs[kind], draft: preview, depth: 2, overrideAccess: true }),
    payload.findGlobal({ slug: 'site-settings', draft: preview, depth: 2, overrideAccess: true }),
    payload.find({ collection: 'partners', depth: 1, draft: preview, pagination: false, overrideAccess: true, sort: 'homepageOrder', where: preview ? undefined : { and: [{ _status: { equals: 'published' } }, { isActive: { equals: true } }] } }),
  ])
  if (!preview && (page._status !== 'published' || site._status !== 'published')) throw new Error('Published catalog globals are unavailable.')
  const hero = pageHeroDTO(page, kind, origin)
  const seo = seoDTO(page.seo, origin)
  const header: CatalogPageHeader = { eyebrow: page.eyebrow, title: page.title, intro: page.intro, hero, seo: { ...seo, socialImage: seo.socialImage ?? hero.media } }
  return { header, site: siteDTO(site, origin, partners.docs as unknown as Array<Record<string, unknown>>) }
}

export async function createCatalogProjection(payload: Payload, options: { kind: CatalogKind; origin: string; preview: boolean }): Promise<CatalogDTO> {
  const { kind, origin, preview } = options
  const { header, site } = await baseData(payload, kind, origin, preview)
  const where = preview ? undefined : kind === 'coaches' ? { and: [{ _status: { equals: 'published' } }, { isActive: { equals: true } }] } : { _status: { equals: 'published' } }
  const result = await payload.find({ collection: collectionSlugs[kind], depth: 2, draft: preview, limit: 100, overrideAccess: true, pagination: false, sort: kind === 'blog' ? '-publishedAt' : kind === 'coaches' ? 'name' : 'homepageOrder', where } as never) as unknown as { docs: Array<Article | Coach | Tournament> }
  const base = { version: homepageDTOversion, preview, generatedAt: new Date().toISOString(), page: header, site }
  if (kind === 'blog') {
    const categories = await payload.find({ collection: 'article-categories', depth: 0, draft: preview, pagination: false, overrideAccess: true, sort: 'title', where: preview ? undefined : { _status: { equals: 'published' } } })
    return { ...base, kind, items: (result.docs as Article[]).map((item) => articleItem(item, origin)), categories: categories.docs.map(({ slug, title }) => ({ slug, title })) }
  }
  if (kind === 'coaches') return { ...base, kind, items: (result.docs as Coach[]).map((item) => coachItem(item, origin)) }
  return { ...base, kind, items: (result.docs as Tournament[]).map((item) => tournamentItem(item, origin)) }
}

export async function createDetailProjection(payload: Payload, options: { kind: CatalogKind; origin: string; preview: boolean; slug: string }): Promise<DetailDTO | null> {
  const { kind, origin, preview, slug } = options
  const { header, site } = await baseData(payload, kind, origin, preview)
  const where = { and: [{ slug: { equals: slug } }, ...(!preview ? [{ _status: { equals: 'published' } }] : []), ...(kind === 'coaches' && !preview ? [{ isActive: { equals: true } }] : [])] }
  const result = await payload.find({ collection: collectionSlugs[kind], depth: 2, draft: preview, limit: 1, overrideAccess: true, where } as never) as unknown as { docs: Array<Article | Coach | Tournament> }
  const item = result.docs[0]
  if (!item) return null
  const relatedResult = await payload.find({ collection: collectionSlugs[kind], depth: 2, draft: false, limit: 3, overrideAccess: true, where: { and: [{ id: { not_equals: item.id } }, { _status: { equals: 'published' } }, ...(kind === 'coaches' ? [{ isActive: { equals: true } }] : [])] } } as never) as unknown as { docs: Array<Article | Coach | Tournament> }
  const base = { version: homepageDTOversion, preview, generatedAt: new Date().toISOString(), page: header, site }
  if (kind === 'blog') { const article = item as Article; return { ...base, kind, item: { ...articleItem(article, origin), contentHTML: await articleContentHTML(article.content, { origin, payload }), seo: seoDTO(article.seo, origin) }, related: (relatedResult.docs as Article[]).map((entry) => articleItem(entry, origin)) } }
  if (kind === 'coaches') { const coach = item as Coach; return { ...base, kind, item: { ...coachItem(coach, origin), seo: seoDTO(coach.seo, origin) }, related: (relatedResult.docs as Coach[]).map((entry) => coachItem(entry, origin)) } }
  const tournament = item as Tournament
  return { ...base, kind, item: { ...tournamentItem(tournament, origin), seo: seoDTO(tournament.seo, origin) }, related: (relatedResult.docs as Tournament[]).map((entry) => tournamentItem(entry, origin)) }
}
