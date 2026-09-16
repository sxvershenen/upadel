import type { CollectionSlug, Payload, PayloadRequest } from 'payload'

export type MediaUsage = {
  href: string
  location: string
  mediaID: string
  state: 'draft-only' | 'live'
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

  const globalTasks = [
    () => payload.findGlobal({ slug: 'homepage', depth: 0, draft: false, overrideAccess: true, req }),
    () => payload.findGlobal({ slug: 'homepage', depth: 0, draft: true, overrideAccess: true, req }),
    () => payload.findGlobal({ slug: 'site-settings', depth: 0, draft: false, overrideAccess: true, req }),
    () => payload.findGlobal({ slug: 'site-settings', depth: 0, draft: true, overrideAccess: true, req }),
  ] as const
  const globalResults = req
    ? [await globalTasks[0](), await globalTasks[1](), await globalTasks[2](), await globalTasks[3]()]
    : await Promise.all(globalTasks.map((task) => task()))
  const [publishedHome, draftHome, publishedSite, draftSite] = globalResults
  if (publishedHome._status === 'published') scanHomepage(usage, publishedHome as unknown as Record<string, unknown>, 'live')
  scanHomepage(usage, draftHome as unknown as Record<string, unknown>, 'draft-only')
  if (publishedSite._status === 'published') scanSiteSettings(usage, publishedSite as unknown as Record<string, unknown>, 'live')
  scanSiteSettings(usage, draftSite as unknown as Record<string, unknown>, 'draft-only')

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
