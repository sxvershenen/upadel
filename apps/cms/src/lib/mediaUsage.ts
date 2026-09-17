import type { CollectionSlug, Payload, PayloadRequest } from 'payload'

export type MediaUsage = {
  href: string
  location: string
  mediaID: string
  state: 'draft-only' | 'live' | 'version'
}

type RegistryEntry = {
  entityLabel: string
  fields: Array<{ label: string; path: string }>
  slug: CollectionSlug
  titleField: string
}

const registry: RegistryEntry[] = [
  { slug: 'pages', entityLabel: 'Страница', titleField: 'title', fields: [{ path: 'seo.socialImage', label: 'SEO → изображение для соцсетей' }] },
  { slug: 'article-categories', entityLabel: 'Категория статей', titleField: 'title', fields: [{ path: 'seo.socialImage', label: 'SEO → изображение для соцсетей' }] },
  { slug: 'articles', entityLabel: 'Статья', titleField: 'title', fields: [{ path: 'previewImage', label: 'изображение карточки' }, { path: 'seo.socialImage', label: 'SEO → изображение для соцсетей' }] },
  { slug: 'coaches', entityLabel: 'Тренер', titleField: 'name', fields: [{ path: 'photo', label: 'фотография' }, { path: 'seo.socialImage', label: 'SEO → изображение для соцсетей' }] },
  { slug: 'courts', entityLabel: 'Корт', titleField: 'title', fields: [{ path: 'seo.socialImage', label: 'SEO → изображение для соцсетей' }] },
  { slug: 'tournaments', entityLabel: 'Турнир', titleField: 'title', fields: [{ path: 'image', label: 'изображение карточки' }, { path: 'seo.socialImage', label: 'SEO → изображение для соцсетей' }] },
  { slug: 'training-programs', entityLabel: 'Программа тренировок', titleField: 'title', fields: [{ path: 'image', label: 'изображение карточки' }, { path: 'seo.socialImage', label: 'SEO → изображение для соцсетей' }] },
  { slug: 'gallery-items', entityLabel: 'Галерея', titleField: 'title', fields: [{ path: 'media', label: 'изображение' }] },
  { slug: 'reviews', entityLabel: 'Отзыв', titleField: 'authorName', fields: [{ path: 'avatar', label: 'аватар' }] },
  { slug: 'partners', entityLabel: 'Партнёр', titleField: 'name', fields: [{ path: 'logo', label: 'логотип' }] },
]

function valuesAtPath(value: unknown, path: string): unknown[] {
  let values: unknown[] = [value]
  for (const segment of path.split('.')) {
    values = values.flatMap((entry) => {
      if (Array.isArray(entry)) return entry.flatMap((item) => item && typeof item === 'object' ? [(item as Record<string, unknown>)[segment]] : [])
      return entry && typeof entry === 'object' ? [(entry as Record<string, unknown>)[segment]] : []
    })
  }
  return values.flatMap((entry) => Array.isArray(entry) ? entry : [entry])
}

function relationID(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) return String((value as { id: unknown }).id)
  return null
}

function addUsage(
  target: Map<string, MediaUsage>,
  input: Omit<MediaUsage, 'state'>,
  state: MediaUsage['state'],
) {
  const key = `${input.mediaID}:${input.href}:${input.location}`
  const existing = target.get(key)
  if (!existing || state === 'live') target.set(key, { ...input, state })
}

function scanCollectionDocs(
  target: Map<string, MediaUsage>,
  entry: RegistryEntry,
  docs: Array<Record<string, unknown>>,
  state: MediaUsage['state'],
) {
  for (const doc of docs) {
    const title = String(doc[entry.titleField] ?? 'Без названия')
    for (const field of entry.fields) {
      for (const value of valuesAtPath(doc, field.path)) {
        const mediaID = relationID(value)
        if (!mediaID) continue
        addUsage(target, {
          mediaID,
          href: `/admin/collections/${entry.slug}/${String(doc.id)}`,
          location: `${entry.entityLabel} → ${title} → ${field.label}`,
        }, state)
      }
    }
  }
}

export function articleBodyMediaIDs(value: unknown): string[] {
  const ids = new Set<string>()
  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const record = node as { children?: unknown[]; relationTo?: string; root?: unknown; type?: string; value?: unknown }
    if (record.type === 'upload' && record.relationTo === 'media') {
      const id = relationID(record.value)
      if (id) ids.add(id)
    }
    if (record.root) visit(record.root)
    for (const child of record.children ?? []) visit(child)
  }
  visit(value)
  return [...ids]
}

function scanArticleBodies(
  target: Map<string, MediaUsage>,
  docs: Array<Record<string, unknown>>,
  state: MediaUsage['state'],
  version = false,
) {
  for (const doc of docs) {
    const title = String(doc.title ?? 'Без названия')
    for (const mediaID of articleBodyMediaIDs(doc.content)) {
      addUsage(target, {
        mediaID,
        href: `/admin/collections/articles/${String(doc.id)}`,
        location: `Статья → ${title} → текст статьи${version ? ' (сохранённая версия)' : ''}`,
      }, state)
    }
  }
}

function scanHomepage(target: Map<string, MediaUsage>, doc: Record<string, unknown>, state: MediaUsage['state']) {
  const refs = [
    ['seo.socialImage', 'Главная → SEO → изображение для соцсетей'],
    ['hero.desktopMedia', 'Главная → Первый экран → фон desktop'],
    ['hero.mobileMedia', 'Главная → Первый экран → фон mobile'],
    ['hero.desktopVideoPoster', 'Главная → Первый экран → poster desktop'],
    ['hero.mobileVideoPoster', 'Главная → Первый экран → poster mobile'],
    ['courtsSection.backgroundMedia', 'Главная → Клуб → Корты → фоновое изображение'],
    ['methodistBanner.decorativeMedia', 'Главная → Услуги → Баннер методиста → декоративное изображение'],
  ] as const
  for (const [path, location] of refs) {
    for (const value of valuesAtPath(doc, path)) {
      const mediaID = relationID(value)
      if (mediaID) addUsage(target, { mediaID, href: '/admin/globals/homepage', location }, state)
    }
  }
  for (const [path, label] of [['benefitsSection.cards', 'Преимущества'], ['offersSection.cards', 'Предложения']] as const) {
    for (const card of valuesAtPath(doc, path)) {
      if (!card || typeof card !== 'object') continue
      const row = card as Record<string, unknown>
      const value = path.startsWith('benefits') ? row.media : row.image
      const mediaID = relationID(value)
      if (mediaID) addUsage(target, { mediaID, href: '/admin/globals/homepage', location: `Главная → Клуб → ${label} → ${String(row.title ?? 'Карточка')}` }, state)
    }
  }
}

function scanSiteSettings(target: Map<string, MediaUsage>, doc: Record<string, unknown>, state: MediaUsage['state']) {
  for (const [path, location] of [
    ['brandLogo', 'Настройки сайта → Бренд → логотип'],
    ['footerImage', 'Настройки сайта → Футер → фотография клуба'],
    ['contactConfirmation.avatar', 'Настройки сайта → Подтверждения и формы → аватар клуба'],
  ] as const) {
    for (const value of valuesAtPath(doc, path)) {
      const mediaID = relationID(value)
      if (mediaID) addUsage(target, { mediaID, href: '/admin/globals/site-settings', location }, state)
    }
  }
  for (const item of valuesAtPath(doc, 'desktopNavigation')) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const mediaID = relationID(row.icon)
    if (mediaID) addUsage(target, {
      mediaID,
      href: '/admin/globals/site-settings',
      location: `Настройки сайта → Навигация → ${String(row.label ?? 'Пункт')} → иконка`,
    }, state)
    for (const child of Array.isArray(row.children) ? row.children : []) {
      if (!child || typeof child !== 'object') continue
      const childRow = child as Record<string, unknown>
      const childMediaID = relationID(childRow.icon)
      if (childMediaID) addUsage(target, {
        mediaID: childMediaID,
        href: '/admin/globals/site-settings',
        location: `Настройки сайта → Навигация → ${String(row.label ?? 'Пункт')} → ${String(childRow.label ?? 'Подпункт')} → иконка`,
      }, state)
    }
  }
}

function scanPadelCourtZakazPage(target: Map<string, MediaUsage>, doc: Record<string, unknown>, state: MediaUsage['state']) {
  for (const [path, location] of [
    ['seo.socialImage', 'Падел-корты JUBO → SEO → изображение для соцсетей'],
    ['heroImage', 'Падел-корты JUBO → Шапка страницы → poster'],
    ['heroVideo', 'Падел-корты JUBO → Шапка страницы → видео'],
    ['technology.background', 'Падел-корты JUBO → Технологии → фон'],
    ['turnkey.steps.image', 'Падел-корты JUBO → Строительство под ключ → изображение этапа'],
    ['gallery.items.media', 'Падел-корты JUBO → Галерея → изображение'],
    ['models.items.image', 'Падел-корты JUBO → Модельный ряд → изображение модели'],
  ] as const) {
    for (const value of valuesAtPath(doc, path)) {
      const mediaID = relationID(value)
      if (mediaID) addUsage(target, { mediaID, href: '/admin/globals/padel-court-zakaz-page', location }, state)
    }
  }
}

function scanCatalogPage(target: Map<string, MediaUsage>, doc: Record<string, unknown>, state: MediaUsage['state'], label: string, slug: string) {
  for (const [path, fieldLabel] of [['seo.socialImage', 'SEO → изображение для соцсетей'], ['heroImage', 'Шапка страницы → фоновое изображение']] as const) {
    for (const value of valuesAtPath(doc, path)) {
      const mediaID = relationID(value)
      if (mediaID) addUsage(target, { mediaID, href: `/admin/globals/${slug}`, location: `${label} → ${fieldLabel}` }, state)
    }
  }
}

async function findReferencingDocs(payload: Payload, entry: RegistryEntry, ids: string[], draft: boolean, req?: PayloadRequest) {
  const conditions = entry.fields.map(({ path }) => ({ [path]: { in: ids } }))
  const result = await payload.find({
    collection: entry.slug,
    depth: 0,
    draft,
    pagination: false,
    overrideAccess: true,
    req,
    where: draft ? { or: conditions } : { and: [{ _status: { equals: 'published' } }, { or: conditions }] },
  } as never) as unknown as { docs: Array<Record<string, unknown>> }
  return result.docs
}

export async function getMediaUsage(payload: Payload, mediaIDs: Array<number | string>, req?: PayloadRequest): Promise<MediaUsage[]> {
  const ids = [...new Set(mediaIDs.map(String))]
  if (ids.length === 0) return []
  const usage = new Map<string, MediaUsage>()

  const collectionTasks = registry.flatMap((entry) => [
    () => findReferencingDocs(payload, entry, ids, false, req).then((docs) => scanCollectionDocs(usage, entry, docs, 'live')),
    () => findReferencingDocs(payload, entry, ids, true, req).then((docs) => scanCollectionDocs(usage, entry, docs, 'draft-only')),
  ])
  if (req) {
    for (const task of collectionTasks) await task()
  } else {
    await Promise.all(collectionTasks.map((task) => task()))
  }

  const articleBodyTasks = [
    () => payload.find({ collection: 'articles', depth: 0, draft: false, pagination: false, overrideAccess: true, req, where: { _status: { equals: 'published' } } } as never),
    () => payload.find({ collection: 'articles', depth: 0, draft: true, pagination: false, overrideAccess: true, req } as never),
  ] as const
  const articleBodyResults = req
    ? [await articleBodyTasks[0](), await articleBodyTasks[1]()]
    : await Promise.all(articleBodyTasks.map((task) => task()))
  scanArticleBodies(usage, articleBodyResults[0].docs as unknown as Array<Record<string, unknown>>, 'live')
  scanArticleBodies(usage, articleBodyResults[1].docs as unknown as Array<Record<string, unknown>>, 'draft-only')

  const versions = await payload.findVersions({
    collection: 'articles',
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })
  scanArticleBodies(usage, versions.docs.map((entry) => {
    const version = entry.version as unknown as Record<string, unknown>
    return { ...version, id: entry.parent ?? version.id }
  }), 'version', true)

  const globalTasks = [
    () => payload.findGlobal({ slug: 'homepage', depth: 0, draft: false, overrideAccess: true, req }),
    () => payload.findGlobal({ slug: 'homepage', depth: 0, draft: true, overrideAccess: true, req }),
    () => payload.findGlobal({ slug: 'site-settings', depth: 0, draft: false, overrideAccess: true, req }),
    () => payload.findGlobal({ slug: 'site-settings', depth: 0, draft: true, overrideAccess: true, req }),
    () => payload.findGlobal({ slug: 'padel-court-zakaz-page', depth: 0, draft: false, overrideAccess: true, req } as never),
    () => payload.findGlobal({ slug: 'padel-court-zakaz-page', depth: 0, draft: true, overrideAccess: true, req } as never),
  ] as const
  const globalResults: Array<Record<string, unknown>> = []
  if (req) {
    for (const task of globalTasks) globalResults.push(await task() as unknown as Record<string, unknown>)
  } else {
    globalResults.push(...await Promise.all(globalTasks.map((task) => task())) as unknown as Array<Record<string, unknown>>)
  }
  const [publishedHome, draftHome, publishedSite, draftSite, publishedPadel, draftPadel] = globalResults
  if (publishedHome._status === 'published') scanHomepage(usage, publishedHome as unknown as Record<string, unknown>, 'live')
  scanHomepage(usage, draftHome as unknown as Record<string, unknown>, 'draft-only')
  if (publishedSite._status === 'published') scanSiteSettings(usage, publishedSite as unknown as Record<string, unknown>, 'live')
  scanSiteSettings(usage, draftSite as unknown as Record<string, unknown>, 'draft-only')
  if (publishedPadel._status === 'published') scanPadelCourtZakazPage(usage, publishedPadel as unknown as Record<string, unknown>, 'live')
  scanPadelCourtZakazPage(usage, draftPadel as unknown as Record<string, unknown>, 'draft-only')

  for (const [slug, label] of [
    ['blog-page', 'Блог'], ['coaches-page', 'Страница тренеров'], ['tournaments-page', 'Страница турниров'],
    ['prices-page', 'Цены'], ['training-page', 'Тренировки'], ['gift-page', 'Подарочный сертификат'], ['courts-page', 'Корты'], ['gallery-page', 'Галерея'],
    ['about-page', 'О клубе'], ['contacts-page', 'Контакты'], ['policy-page', 'Политика конфиденциальности'], ['oferta-page', 'Публичная оферта'],
  ] as const) {
    const [published, draft] = req
      ? [await payload.findGlobal({ slug, depth: 0, draft: false, overrideAccess: true, req }), await payload.findGlobal({ slug, depth: 0, draft: true, overrideAccess: true, req })]
      : await Promise.all([payload.findGlobal({ slug, depth: 0, draft: false, overrideAccess: true }), payload.findGlobal({ slug, depth: 0, draft: true, overrideAccess: true })])
    if (published._status === 'published') scanCatalogPage(usage, published as unknown as Record<string, unknown>, 'live', label, slug)
    scanCatalogPage(usage, draft as unknown as Record<string, unknown>, 'draft-only', label, slug)
  }

  return [...usage.values()].filter(({ mediaID }) => ids.includes(mediaID)).sort((a, b) => a.location.localeCompare(b.location, 'ru'))
}
