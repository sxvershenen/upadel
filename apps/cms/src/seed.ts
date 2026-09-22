import { createHash } from 'node:crypto'
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload, type CollectionSlug, type Payload } from 'payload'
import { defaultHeroTint } from '@unlim/content-contract'

import config from './payload.config'
import { mergeRequiredNavigation, navigationChanged, normalizeDesktopNavigation, priceNavigationChildren, requiredPageLinks } from './content/requiredNavigation'
import { padelCourtZakazSeed } from './content/padelCourtZakazSeed'
import { tournamentDefaultContent } from './globals/TournamentDefaults'

const seedVersion = 'prototype-v2'
const dirname = path.dirname(fileURLToPath(import.meta.url))
const webPublicDir = path.resolve(dirname, '../../web/public')
const mediaDir = path.resolve(dirname, '../media')
const seedMediaDir = path.resolve(dirname, '../seed-media')

const stats = {
  created: 0,
  mediaReused: 0,
  mediaRehydrated: 0,
  skipped: 0,
  globalsPublished: 0,
}

const px = (id: number, width: number, height: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${width}&h=${height}`

const images = {
  hero: px(38090725, 1920, 1400),
  benefitsChill: px(26626726, 1400, 1100),
  benefitsShower: px(34079998, 1200, 1400),
  offerTournament: px(38028147, 1600, 900),
  offerEvent: px(34079544, 1600, 900),
  courtsBg: px(35248404, 2200, 1400),
  trainingIndividual: px(38347564, 1200, 1500),
  trainingGroup: px(35248404, 1200, 1500),
  trainingKids: px(8224496, 1200, 1500),
  coaches: [
    px(35248259, 900, 1100),
    px(35248253, 900, 1100),
    px(38690521, 900, 1100),
    px(35248266, 900, 1100),
    px(38575893, 900, 1100),
    px(35248269, 900, 1100),
  ],
  tournamentParty: px(9654729, 1000, 1300),
  gallery: [
    px(34079995, 900, 900),
    px(34079997, 900, 900),
    px(34080002, 900, 900),
    px(34079410, 900, 900),
    px(34079544, 900, 900),
    px(34080009, 900, 900),
    px(34079996, 900, 900),
    px(34080007, 900, 900),
    px(37978999, 900, 900),
    px(31519042, 900, 900),
  ],
  blog: [px(4920425, 1000, 750), px(3926934, 1000, 750), px(5310723, 1000, 750)],
  footerClub: px(33095509, 1200, 1400),
  reviewAvatars: [
    px(34079544, 200, 200),
    px(34079995, 200, 200),
    px(34080009, 200, 200),
    px(34079996, 200, 200),
    px(34080007, 200, 200),
    px(37978999, 200, 200),
  ],
}

const localMedia = {
  autoSpa: 'images/benefits/auto-spa.webp',
  bookingPhone: 'booking-phone.webp',
  foodDrinks: 'images/benefits/food-drinks.webp',
  methodistCompass: 'methodist-compass.webp',
  padelBall: 'padel-ball.webp',
  padelRacket: 'padel-racket.webp',
  parkingSign: 'parking-sign.webp',
  varlionEquipment: 'images/benefits/varlion-equipment.webp',
  articleTechniqueReady: 'images/articles/technique-ready.webp',
  articleTechniqueGlass: 'images/articles/technique-glass.webp',
  articleTechniqueOverhead: 'images/articles/technique-overhead.webp',
  articleTechniquePreview: 'images/articles/technique-preview.webp',
  articleTechniqueCoverV2: 'images/articles/technique-cover-v2.webp',
  articleVarlionShapes: 'images/articles/varlion-shapes.webp',
  articleVarlionSummum: 'images/articles/varlion-summum.webp',
  articleVarlionBalance: 'images/articles/varlion-balance.webp',
  articleVarlionPreview: 'images/articles/varlion-preview.webp',
  articleVarlionCover: 'images/articles/varlion-cover.webp',
  articleBeginnerCourt: 'images/articles/beginner-court.webp',
  articleBeginnerKit: 'images/articles/beginner-kit.webp',
  articleBeginnerDrill: 'images/articles/beginner-drill.webp',
  articleBeginnerKitV2: 'images/articles/beginner-kit-v2.webp',
  articleBeginnerPreview: 'images/articles/beginner-preview.webp',
  articleBeginnerCoverV2: 'images/articles/beginner-cover-v2.webp',
  articlePadelTennisSplit: 'images/articles/padel-tennis-split.webp',
  articleJuboGlass: 'images/articles/jubo-glass.webp',
  articlePadelTennisTactics: 'images/articles/padel-tennis-tactics.webp',
  articlePadelTennisPreview: 'images/articles/padel-tennis-preview.webp',
  articlePadelTennisCoverV2: 'images/articles/tennis-cover-v2.webp',
  articleLevelsMatch: 'images/articles/levels-match.webp',
  articleLevelsCoach: 'images/articles/levels-coach.webp',
  articleLevelsScale: 'images/articles/levels-scale.webp',
  articleLevelsCoachV2: 'images/articles/levels-coach-v2.webp',
  articleLevelsPreview: 'images/articles/levels-preview.webp',
  articleLevelsCover: 'images/articles/levels-cover.webp',
  giftBox: 'images/gift/box.jpg',
  giftCard: 'images/gift/card.jpg',
} as const
const pageHeroKinds = ['blog', 'coaches', 'tournaments', 'prices', 'training', 'courts', 'gallery', 'about'] as const
type SeededRecord = { id: number | string; [key: string]: unknown }

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 24)
}

function assertGlobalCanBeSeeded(
  globalSlug: string,
  doc: { _status?: unknown; createdAt?: unknown; seedVersion?: unknown; updatedAt?: unknown },
) {
  const marker = doc.seedVersion
  if (typeof marker === 'string' && marker.startsWith('prototype-v')) return
  if (doc._status === 'published' || doc.createdAt || doc.updatedAt) {
    throw new Error(`Cannot seed global ${globalSlug}: it contains unmarked saved content.`)
  }
}

function richText(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

type ArticleInline = string | { text: string; url: string }
type ArticleBlock =
  | { type: 'heading'; text: string; tag?: 'h2' | 'h3' | 'h4' }
  | { type: 'paragraph'; text?: string; children?: ArticleInline[] }
  | { type: 'list'; items: string[] }
  | { type: 'image'; media: number | string; alt: string; caption?: string }

function richTextArticle(blocks: ArticleBlock[]) {
  const inlineNodes = (children: ArticleInline[] = []): Array<Record<string, unknown>> => children.flatMap((child): Array<Record<string, unknown>> => {
    if (typeof child === 'string') return [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: child, version: 1 }]
    return [{
      type: 'link',
      fields: { linkType: 'custom', newTab: true, url: child.url },
      children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: child.text, version: 1 }],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    }]
  })

  return {
    root: {
      type: 'root',
      children: blocks.map((block) => {
        if (block.type === 'image') return {
          type: 'upload', relationTo: 'media', value: block.media,
          fields: { alt: block.alt, caption: block.caption ?? '' },
          version: 1,
        }
        if (block.type === 'list') return {
          type: 'list', listType: 'bullet', tag: 'ul', start: 1,
          children: block.items.map((item) => ({
            type: 'listitem', children: inlineNodes([item]), direction: 'ltr', format: '', indent: 0, version: 1,
          })),
          direction: 'ltr', format: '', indent: 0, version: 1,
        }
        const children = block.type === 'paragraph'
          ? inlineNodes(block.children ?? [block.text ?? ''])
          : inlineNodes([block.text])
        return {
          type: block.type,
          ...(block.type === 'heading' ? { tag: block.tag ?? 'h2' } : {}),
          children,
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        }
      }),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

function parseEditorialMarkdown(markdown: string, mediaByCaption: Record<string, SeededRecord>): ArticleBlock[] {
  const blocks: ArticleBlock[] = []
  let paragraphLines: string[] = []
  let listItems: string[] = []
  let lastImage: Extract<ArticleBlock, { type: 'image' }> | null = null

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return
    blocks.push({ type: 'paragraph', text: paragraphLines.join(' ').trim() })
    paragraphLines = []
  }
  const flushList = () => {
    if (listItems.length === 0) return
    blocks.push({ type: 'list', items: [...listItems] })
    listItems = []
  }

  for (const rawLine of markdown.replaceAll('\r\n', '\n').split('\n')) {
    const line = rawLine.trim()
    if (!line) {
      flushParagraph()
      flushList()
      lastImage = null
      continue
    }
    if (line.startsWith('# ')) {
      flushParagraph()
      flushList()
      lastImage = null
      continue
    }
    if (line.startsWith('## ')) {
      flushParagraph()
      flushList()
      lastImage = null
      blocks.push({ type: 'heading', text: line.slice(3).trim() })
      continue
    }
    const photoMatch = line.match(/^\[Фото:\s*(.+)\]$/)
    if (photoMatch) {
      flushParagraph()
      flushList()
      const caption = photoMatch[1].trim()
      const media = mediaByCaption[caption]
      if (!media) throw new Error(`Missing editorial media mapping for caption: ${caption}`)
      const image: Extract<ArticleBlock, { type: 'image' }> = {
        type: 'image',
        media: media.id,
        alt: caption,
      }
      blocks.push(image)
      lastImage = image
      continue
    }
    const figureCaptionMatch = line.match(/^\*(.+)\*$/)
    if (figureCaptionMatch && lastImage) {
      lastImage.caption = figureCaptionMatch[1].trim()
      lastImage = null
      continue
    }
    if (line.startsWith('- ')) {
      flushParagraph()
      listItems.push(line.slice(2).trim())
      continue
    }
    flushList()
    lastImage = null
    paragraphLines.push(line)
  }

  flushParagraph()
  flushList()
  return blocks
}

async function findBySeedKey(payload: Payload, collection: CollectionSlug, seedKey: string): Promise<SeededRecord | undefined> {
  const result = (await payload.find({
    collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    showHiddenFields: true,
    where: { seedKey: { equals: seedKey } },
  } as never)) as unknown as { docs: SeededRecord[] }
  return result.docs[0]
}

async function storedMediaFilesExist(media: Record<string, unknown>) {
  const sizes = media.sizes && typeof media.sizes === 'object' ? media.sizes as Record<string, unknown> : {}
  const filenames = [
    media.filename,
    ...Object.values(sizes).map((size) => size && typeof size === 'object' ? (size as Record<string, unknown>).filename : undefined),
  ].filter((filename): filename is string => typeof filename === 'string' && filename.length > 0)
  if (filenames.length === 0) return false

  try {
    await Promise.all(filenames.map((filename) => stat(path.join(mediaDir, filename))))
    return true
  } catch {
    return false
  }
}

async function ensureSeeded(
  payload: Payload,
  collection: CollectionSlug,
  seedKey: string,
  data: Record<string, unknown>,
): Promise<SeededRecord> {
  const existing = await findBySeedKey(payload, collection, seedKey)
  if (existing) {
    stats.skipped += 1
    return existing
  }

  if (typeof data.slug === 'string') {
    const collision = (await payload.find({
      collection,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: data.slug } },
    } as never)) as { docs: Array<{ id: number | string }> }
    if (collision.docs[0]) {
      throw new Error(`Cannot seed ${collection}/${data.slug}: that slug belongs to an unmarked record.`)
    }
  }

  const created = (await payload.create({
    collection,
    data: { ...data, seedKey, _status: 'published' },
    draft: false,
    depth: 0,
    overrideAccess: true,
  } as never)) as { id: number | string }
  stats.created += 1
  return created
}

async function migrateSeededArticle(
  payload: Payload,
  previousSeedKey: string,
  nextSeedKey: string,
  data: Record<string, unknown>,
): Promise<SeededRecord> {
  const current = await findBySeedKey(payload, 'articles', nextSeedKey)
  if (current) {
    stats.skipped += 1
    return current
  }

  const previous = await findBySeedKey(payload, 'articles', previousSeedKey)
  if (!previous) return ensureSeeded(payload, 'articles', nextSeedKey, data)

  const migrated = await payload.update({
    collection: 'articles',
    id: previous.id,
    data: { ...data, seedKey: nextSeedKey, _status: 'published' },
    draft: false,
    depth: 0,
    overrideAccess: true,
  } as never) as unknown as SeededRecord
  stats.skipped += 1
  return migrated
}

async function fillMissingSeededFields(
  payload: Payload,
  collection: CollectionSlug,
  id: number | string,
  fields: Record<string, unknown>,
) {
  const doc = await payload.findByID({ collection, id, depth: 0, overrideAccess: true, showHiddenFields: true } as never) as unknown as Record<string, unknown>
  const missing = Object.fromEntries(Object.entries(fields).filter(([key]) => doc[key] == null || Array.isArray(doc[key]) && doc[key].length === 0))
  if (Object.keys(missing).length > 0) await payload.update({ collection, id, data: missing, draft: false, depth: 0, overrideAccess: true } as never)
}

async function migrateSeededField(
  payload: Payload,
  collection: CollectionSlug,
  id: number | string,
  field: string,
  legacyValue: unknown,
  nextValue: unknown,
) {
  const doc = await payload.findByID({ collection, id, depth: 0, overrideAccess: true, showHiddenFields: true } as never) as unknown as Record<string, unknown>
  const matchesLegacy = typeof legacyValue === 'object'
    ? JSON.stringify(doc[field]) === JSON.stringify(legacyValue)
    : doc[field] === legacyValue
  if (typeof doc.seedKey === 'string' && doc.seedKey.startsWith('prototype:') && matchesLegacy) {
    await payload.update({ collection, id, data: { [field]: nextValue }, draft: false, depth: 0, overrideAccess: true } as never)
  }
}

async function initializeSeededGalleryPlacement(payload: Payload, id: number | string, fields: Record<string, unknown>) {
  const doc = await payload.findByID({ collection: 'gallery-items', id, depth: 0, overrideAccess: true, showHiddenFields: true } as never) as unknown as Record<string, unknown>
  if (typeof doc.seedKey === 'string' && doc.seedKey.startsWith('prototype:gallery:') && doc.galleryPageOrder == null) {
    await payload.update({ collection: 'gallery-items', id, data: fields, draft: false, depth: 0, overrideAccess: true } as never)
  }
}

async function migrateSeededMembershipAction(payload: Payload, id: number | string, nextAction: Record<string, unknown>) {
  const doc = await payload.findByID({ collection: 'memberships', id, depth: 0, overrideAccess: true, showHiddenFields: true } as never) as unknown as Record<string, any>
  const action = doc.action ?? {}
  const legacyGift = action.mode === 'internal-link' && action.href === '#memberships' && action.label === 'Подарить онлайн'
    || action.mode === 'lead-form' && action.href === '#memberships' && action.leadType === 'gift'
  const legacyEmpty = action.mode === 'none' && !action.href && !action.label && !action.leadType
  if (typeof doc.seedKey === 'string' && doc.seedKey.startsWith('prototype:membership:') && (legacyGift || legacyEmpty)) {
    await payload.update({ collection: 'memberships', id, data: { action: nextAction }, draft: false, depth: 0, overrideAccess: true } as never)
  }
}

async function createMedia(
  payload: Payload,
  source: string,
  file: { data: Buffer; mimetype: string; name: string },
  alt: string,
  credit: string,
  usageRights: string,
): Promise<SeededRecord> {
  const seedKey = `prototype-media:${hash(source)}`
  const existing = await findBySeedKey(payload, 'media', seedKey)
  if (existing) {
    if (await storedMediaFilesExist(existing)) {
      stats.skipped += 1
      return existing
    }

    const restored = await payload.update({
      collection: 'media',
      id: existing.id,
      data: {},
      file: { ...file, size: file.data.byteLength },
      depth: 0,
      overrideAccess: true,
    } as never) as unknown as SeededRecord
    stats.mediaRehydrated += 1
    return restored
  }

  const sameSource = (await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { sourceURL: { equals: source } },
  })) as unknown as { docs: SeededRecord[] }
  if (sameSource.docs[0]) {
    stats.mediaReused += 1
    return sameSource.docs[0]
  }

  const created = await payload.create({
    collection: 'media',
    data: { alt, credit, seedKey, sourceURL: source, usageRights },
    file: { ...file, size: file.data.byteLength },
    depth: 0,
    overrideAccess: true,
  }) as unknown as SeededRecord
  stats.created += 1
  return created
}

async function ensureRemoteMedia(payload: Payload, sourceURL: string, alt: string): Promise<SeededRecord> {
  const seedKey = `prototype-media:${hash(sourceURL)}`
  const isPexelsSource = sourceURL.startsWith('https://images.pexels.com/')
  const existing = await findBySeedKey(payload, 'media', seedKey)
  if (existing && await storedMediaFilesExist(existing)) {
    stats.skipped += 1
    return existing
  }

  const useBundledPexelsMedia = async (): Promise<SeededRecord | null> => {
    let source: URL
    try { source = new URL(sourceURL) } catch { return null }
    if (source.hostname !== 'images.pexels.com') return null

    const filename = `pexels-${hash(sourceURL)}.webp`
    const filePath = path.join(seedMediaDir, filename)
    try { await stat(filePath) } catch { return null }
    return createMedia(
      payload,
      sourceURL,
      { data: await readFile(filePath), mimetype: 'image/webp', name: filename },
      alt,
      'Bundled project media downloaded from the approved prototype Pexels source.',
      'Pexels source URL retained for attribution and provenance; the deployed seed uses the versioned local asset.',
    )
  }

  const bundledPexelsMedia = await useBundledPexelsMedia()
  if (bundledPexelsMedia) return bundledPexelsMedia
  if (isPexelsSource) {
    throw new Error(`Bundled Pexels seed media is missing for ${sourceURL}. Add the matching file to apps/cms/seed-media/pexels.`)
  }

  const useLocalFallback = async (): Promise<SeededRecord | null> => {
    const prefix = hash(sourceURL)
    let names: string[] = []
    try {
      names = (await readdir(mediaDir)).filter((name) => name.startsWith(`remote-${prefix}`) || name.startsWith(`pexels-${prefix}`))
    } catch {
      // A fresh deployment may not have a local Payload upload directory yet.
    }
    const name = names.find((candidate) => !/-\d+x\d+\./.test(candidate)) ?? names[0] ?? 'page-heroes/courts.webp'
    const filePath = names.length > 0 ? path.join(mediaDir, name) : path.join(webPublicDir, name)
    try { await stat(filePath) } catch { return null }
    const mimetype = name.endsWith('.webm') ? 'video/webm' : name.endsWith('.mp4') ? 'video/mp4' : name.endsWith('.png') ? 'image/png' : 'image/webp'
    return createMedia(payload, sourceURL, { data: await readFile(filePath), mimetype, name: `fallback-${hash(sourceURL)}.${name.split('.').pop()}` }, alt, 'Local project media restored for the approved prototype content.', 'Project-owned demo asset. Verify attribution and production usage rights before launch.')
  }

  const localMedia = await useLocalFallback()
  if (localMedia) return localMedia

  let response: Response
  try {
    response = await fetch(sourceURL, { signal: AbortSignal.timeout(45_000) })
  } catch (error) {
    const fallback = await useLocalFallback()
    if (fallback) return fallback
    throw new Error(`Failed to download demo media ${sourceURL}: ${error instanceof Error ? error.message : String(error)}`)
  }
  if (!response.ok) {
    const fallback = await useLocalFallback()
    if (fallback) return fallback
    throw new Error(`Failed to download demo media ${sourceURL}: HTTP ${response.status}`)
  }

  const mimetype = response.headers.get('content-type')?.split(';')[0] ?? ''
  if (!mimetype.startsWith('image/') && mimetype !== 'video/mp4' && mimetype !== 'video/webm') throw new Error(`Demo media ${sourceURL} returned unexpected type ${mimetype || 'unknown'}.`)
  const data = Buffer.from(await response.arrayBuffer())
  if (data.byteLength === 0) throw new Error(`Demo media ${sourceURL} returned an empty file.`)

  return createMedia(
    payload,
    sourceURL,
    { data, mimetype, name: `remote-${hash(sourceURL)}.${mimetype === 'image/png' ? 'png' : mimetype === 'video/webm' ? 'webm' : mimetype === 'video/mp4' ? 'mp4' : 'jpg'}` },
    alt,
    'Remote source from the approved prototype content.',
    'Demo asset. Verify attribution and production usage rights before launch.',
  )
}

async function ensureLocalMedia(payload: Payload, filename: string, alt: string): Promise<SeededRecord> {
  const source = `apps/web/public/${filename}`
  const seedKey = `prototype-media:${hash(source)}`
  const existing = await findBySeedKey(payload, 'media', seedKey)
  if (existing && await storedMediaFilesExist(existing)) {
    stats.skipped += 1
    return existing
  }

  const data = await readFile(path.join(webPublicDir, filename))
  const mimetype = filename.endsWith('.webp') ? 'image/webp' : 'image/png'

  if (filename.endsWith('.webp')) {
    const legacySource = `apps/web/public/${filename.slice(0, -'.webp'.length)}.png`
    const legacy = await findBySeedKey(payload, 'media', `prototype-media:${hash(legacySource)}`)
    if (legacy) {
      const migrated = await payload.update({
        collection: 'media',
        id: legacy.id,
        data: { seedKey, sourceURL: source },
        file: { data, mimetype, name: filename, size: data.byteLength },
        depth: 0,
        overrideAccess: true,
      } as never) as unknown as SeededRecord
      stats.mediaRehydrated += 1
      return migrated
    }
  }

  return createMedia(
    payload,
    source,
    { data, mimetype, name: filename },
    alt,
    'Decorative asset from the approved local prototype snapshot.',
    'Project-owned demo asset; confirm final production ownership record before launch.',
  )
}

async function seed() {
    const payload = await getPayload({ config })

  try {
    const remoteEntries = new Map<string, string>([
      [images.hero, 'Игрок в падел выполняет удар на панорамном корте'],
      [images.benefitsChill, 'Лаунж-зона падел-клуба'],
      [images.benefitsShower, 'Премиальные раздевалки и душевые клуба'],
      [images.offerTournament, 'Падел-турнир в клубе'],
      [images.offerEvent, 'Клубное мероприятие'],
      [images.courtsBg, 'Панорамные корты Unlim Riga Padel'],
      [images.trainingIndividual, 'Индивидуальная тренировка по паделу'],
      [images.trainingGroup, 'Групповая тренировка по паделу'],
      [images.trainingKids, 'Детская тренировка по паделу'],
      [images.tournamentParty, 'Клубный турнир Americano'],
      [images.footerClub, 'Клуб Unlim Riga Padel'],
      ...images.coaches.map((source, index) => [source, `Тренер Unlim Riga Padel ${index + 1}`] as const),
      ...images.gallery.map((source, index) => [source, `Жизнь клуба Unlim Riga Padel ${index + 1}`] as const),
      ...images.blog.map((source, index) => [source, `Статья блога Unlim Riga Padel ${index + 1}`] as const),
      ...images.reviewAvatars.map((source, index) => [source, `Автор отзыва ${index + 1}`] as const),
      [padelCourtZakazSeed.heroImage.source, padelCourtZakazSeed.heroImage.alt],
      [padelCourtZakazSeed.heroVideo.source, padelCourtZakazSeed.heroVideo.alt],
      [padelCourtZakazSeed.technology.background.source, padelCourtZakazSeed.technology.background.alt],
      ...padelCourtZakazSeed.gallery.items.map(({ source, alt }) => [source, alt] as const),
      ...padelCourtZakazSeed.models.items.map(({ image }) => [image.source, image.alt] as const),
    ])

    const remoteMedia = new Map<string, { id: number | string }>()
    for (const [source, alt] of remoteEntries) {
      remoteMedia.set(source, await ensureRemoteMedia(payload, source, alt))
    }

    const decorativeMedia = {
      autoSpa: await ensureLocalMedia(payload, localMedia.autoSpa, 'Li Auto L9 в авто-спа комплексе клуба'),
      bookingPhone: await ensureLocalMedia(payload, localMedia.bookingPhone, 'Экран мобильного бронирования'),
      foodDrinks: await ensureLocalMedia(payload, localMedia.foodDrinks, 'Коктейль и салат в лаунж-зоне клуба'),
      methodistCompass: await ensureLocalMedia(payload, localMedia.methodistCompass, 'Декоративный компас'),
      padelBall: await ensureLocalMedia(payload, localMedia.padelBall, 'Мяч для падела'),
      padelRacket: await ensureLocalMedia(payload, localMedia.padelRacket, 'Ракетка для падела'),
      parkingSign: await ensureLocalMedia(payload, localMedia.parkingSign, 'Знак парковки'),
      varlionEquipment: await ensureLocalMedia(payload, localMedia.varlionEquipment, 'Игрок с ракеткой Varlion в падел-клубе'),
    }
    const articleMedia = {
      techniqueReady: await ensureLocalMedia(payload, localMedia.articleTechniqueReady, 'Игрок в падел в стойке готовности перед ударом'),
      techniqueGlass: await ensureLocalMedia(payload, localMedia.articleTechniqueGlass, 'Игрок выполняет удар после отскока мяча от стекла'),
      techniqueOverhead: await ensureLocalMedia(payload, localMedia.articleTechniqueOverhead, 'Игрок выполняет удар над головой в паделе'),
      techniquePreview: await ensureLocalMedia(payload, localMedia.articleTechniquePreview, 'Игрок выходит на позицию на панорамном падельном корте'),
      techniqueCoverV2: await ensureLocalMedia(payload, localMedia.articleTechniqueCoverV2, 'Игрок занимает защитную позицию рядом со стеклом'),
      varlionShapes: await ensureLocalMedia(payload, localMedia.articleVarlionShapes, 'Три формы ракеток Varlion: круглая, каплевидная и ромбовидная'),
      varlionSummum: await ensureLocalMedia(payload, localMedia.articleVarlionSummum, 'Детали конструкции ракетки Varlion с длинной ручкой и диффузором'),
      varlionBalance: await ensureLocalMedia(payload, localMedia.articleVarlionBalance, 'Схема распределения баланса ракетки для падела'),
      varlionPreview: await ensureLocalMedia(payload, localMedia.articleVarlionPreview, 'Ракетка Varlion на падельном корте рядом с мячами'),
      varlionCover: await ensureLocalMedia(payload, localMedia.articleVarlionCover, 'Ракетка Varlion на подиуме у панорамного корта'),
      beginnerCourt: await ensureLocalMedia(payload, localMedia.articleBeginnerCourt, 'Новички на первой тренировке по паделу с тренером'),
      beginnerKit: await ensureLocalMedia(payload, localMedia.articleBeginnerKit, 'Базовый комплект экипировки для первой игры в падел'),
      beginnerDrill: await ensureLocalMedia(payload, localMedia.articleBeginnerDrill, 'Тренер показывает новичку базовый удар в паделе'),
      beginnerKitV2: await ensureLocalMedia(payload, localMedia.articleBeginnerKitV2, 'Практичный комплект экипировки для первой игры в падел'),
      beginnerPreview: await ensureLocalMedia(payload, localMedia.articleBeginnerPreview, 'Пара новичков заходит на первый падельный корт'),
      beginnerCoverV2: await ensureLocalMedia(payload, localMedia.articleBeginnerCoverV2, 'Новичок готовится выполнить первую подачу в паделе'),
      padelTennisSplit: await ensureLocalMedia(payload, localMedia.articlePadelTennisSplit, 'Сравнение площадки для падела и теннисного корта'),
      juboGlass: await ensureLocalMedia(payload, localMedia.articleJuboGlass, 'Панорамный корт JUBO Padel со стеклянными стенами'),
      padelTennisTactics: await ensureLocalMedia(payload, localMedia.articlePadelTennisTactics, 'Схема движения игроков в паделе и большом теннисе'),
      padelTennisPreview: await ensureLocalMedia(payload, localMedia.articlePadelTennisPreview, 'Панорамный падельный и открытый теннисный корты'),
      padelTennisCoverV2: await ensureLocalMedia(payload, localMedia.articlePadelTennisCoverV2, 'Стеклянный угол падельного корта рядом с открытым теннисным кортом'),
      levelsMatch: await ensureLocalMedia(payload, localMedia.articleLevelsMatch, 'Парная игра в падел на любительском уровне'),
      levelsCoach: await ensureLocalMedia(payload, localMedia.articleLevelsCoach, 'Тренер и игрок обсуждают уровень игры в падел'),
      levelsScale: await ensureLocalMedia(payload, localMedia.articleLevelsScale, 'Абстрактная шкала прогресса уровня игрока в паделе'),
      levelsCoachV2: await ensureLocalMedia(payload, localMedia.articleLevelsCoachV2, 'Тренер объясняет игроку тактическую поправку после розыгрыша'),
      levelsPreview: await ensureLocalMedia(payload, localMedia.articleLevelsPreview, 'Игроки обсуждают следующий розыгрыш у сетки'),
      levelsCover: await ensureLocalMedia(payload, localMedia.articleLevelsCover, 'Игрок наблюдает за розыгрышем на панорамном падельном корте'),
    }
    const giftMedia = {
      box: await ensureLocalMedia(payload, localMedia.giftBox, 'Подарочный бокс UNLIM PADEL'),
      card: await ensureLocalMedia(payload, localMedia.giftCard, 'Электронный сертификат UNLIM PADEL'),
    }
    const pageHeroMedia: Record<string, { id: number | string }> = {}
    for (const kind of pageHeroKinds) pageHeroMedia[kind] = await ensureLocalMedia(payload, `page-heroes/${kind}.webp`, `Фон страницы ${kind}`)
    const heroMediaFor = (slug: string) => slug === 'gift-page' ? giftMedia.card : pageHeroMedia[slug.replace('-page', '')] ?? pageHeroMedia.about

    const mediaID = (source: string) => {
      const media = remoteMedia.get(source)
      if (!media) throw new Error(`Media was not prepared for ${source}`)
      return media.id
    }

    const padelCourtZakazMedia = {
      heroImage: mediaID(padelCourtZakazSeed.heroImage.source),
      heroVideo: mediaID(padelCourtZakazSeed.heroVideo.source),
      technologyBackground: mediaID(padelCourtZakazSeed.technology.background.source),
      gallery: padelCourtZakazSeed.gallery.items.map(({ source }) => mediaID(source)),
      models: padelCourtZakazSeed.models.items.map(({ image }) => mediaID(image.source)),
      turnkey: await Promise.all(padelCourtZakazSeed.turnkey.steps.map(({ image, title }) => ensureLocalMedia(payload, image, title))),
    }

    const coachData = [
      {
        slug: 'artem', name: 'Артём Волков', photo: mediaID(images.coaches[0]), specialization: 'Индивидуальная техника и подача',
        bio: 'Экс-игрок сборной по большому теннису, 7 лет в паделе. Ставит удар с нуля и разбирает видео матчей.',
        level: 'Новички · Продолжающие', experience: '9 лет опыта', languages: 'RU · EN', rating: 4.9, reviewsCount: 128,
        certificates: [{ title: 'FIP Level 2' }, { title: 'WPT Coach' }], priceFrom: 4900,
      },
      {
        slug: 'mila', name: 'Мила Соснова', photo: mediaID(images.coaches[1]), specialization: 'Групповые тренировки, тактика пары',
        bio: 'Ведёт групповые сборы для среднего уровня, делает упор на позиционную игру у сетки.',
        level: 'Средний · Турнирный', experience: '6 лет опыта', languages: 'RU · LV', rating: 4.8, reviewsCount: 94,
        certificates: [{ title: 'FIP Level 1' }], priceFrom: 4500,
      },
      {
        slug: 'denis', name: 'Денис Крамер', photo: mediaID(images.coaches[2]), specialization: 'Турнирная подготовка',
        bio: 'Готовит игроков к лигам и турнирам клуба: разбор соперников, физика, психология матча.',
        level: 'Продолжающие · Турнирный', experience: '11 лет опыта', languages: 'RU · EN · DE', rating: 5, reviewsCount: 156,
        certificates: [{ title: 'FIP Level 3' }, { title: 'WPT Coach' }, { title: 'Sport Psychology' }], priceFrom: 5900,
      },
      {
        slug: 'vera', name: 'Вера Ким', photo: mediaID(images.coaches[3]), specialization: 'Детские группы 5–12 лет',
        bio: 'Строит тренировки через игру: держит внимание детей и мягко прививает технику безопасно.',
        level: 'Дети от 5 лет', experience: '5 лет опыта', languages: 'RU', rating: 4.9, reviewsCount: 71,
        certificates: [{ title: 'FIP Kids' }, { title: 'Первая помощь' }], priceFrom: 3900,
      },
      {
        slug: 'oleg', name: 'Олег Прист', photo: mediaID(images.coaches[4]), specialization: 'Физика и работа ног',
        bio: 'Бывший фитнес-тренер сборной, добавляет функциональные блоки к каждой тренировке.',
        level: 'Любой уровень', experience: '8 лет опыта', languages: 'RU · EN', rating: 4.7, reviewsCount: 63,
        certificates: [{ title: 'FIP Level 2' }], priceFrom: 4700,
      },
      {
        slug: 'nadya', name: 'Надя Ершова', photo: mediaID(images.coaches[5]), specialization: 'Женские группы и старт с нуля',
        bio: 'Мягкий вход в падел для тех, кто никогда не держал ракетку. Комфортный темп и поддержка.',
        level: 'Новички', experience: '4 года опыта', languages: 'RU', rating: 4.9, reviewsCount: 88,
        certificates: [{ title: 'FIP Level 1' }], priceFrom: 3900,
      },
    ]
    const coaches = [] as Array<{ id: number | string }>
    const coachFacets = [
      { levels: ['beginner', 'intermediate'], focusAreas: ['technique'], languageCodes: ['RU', 'EN'] },
      { levels: ['medium', 'tournament'], focusAreas: ['groups', 'pair-tactics'], languageCodes: ['RU', 'LV'] },
      { levels: ['intermediate', 'tournament'], focusAreas: ['tournament-prep'], languageCodes: ['RU', 'EN', 'DE'] },
      { levels: ['kids'], focusAreas: ['kids'], languageCodes: ['RU'] },
      { levels: ['all'], focusAreas: ['fitness'], languageCodes: ['RU', 'EN'] },
      { levels: ['beginner'], focusAreas: ['beginner-start', 'women'], languageCodes: ['RU'] },
    ]
    for (const [index, coach] of coachData.entries()) {
      const seededCoach = await ensureSeeded(payload, 'coaches', `prototype:coach:${coach.slug}`, {
        ...coach,
        ...coachFacets[index],
        action: { label: 'Выбрать тренера', mode: 'booking' },
        isActive: true,
        showOnHomepage: true,
        homepageOrder: index + 1,
      })
      await fillMissingSeededFields(payload, 'coaches', seededCoach.id, coachFacets[index])
      coaches.push(seededCoach)
    }

    const categorySpecs = [
      ['guide', 'Гид новичка'],
      ['technique', 'Техника'],
      ['recovery', 'Восстановление'],
    ] as const
    const categories = new Map<string, { id: number | string }>()
    for (const [slug, title] of categorySpecs) {
      categories.set(slug, await ensureSeeded(payload, 'article-categories', `prototype:article-category:${slug}`, {
        slug, title, seo: { robots: 'index-follow' },
      }))
    }

    const legacyArticleSlugs = ['first-visit', 'technique', 'nutrition', 'first-racket', 'serve-rules', 'padel-vs-tennis', 'americano-prep', 'warmup', 'booking-guide'] as const
    for (const slug of legacyArticleSlugs) {
      const legacy = await findBySeedKey(payload, 'articles', `prototype:article:${slug}`)
      if (!legacy) continue
      await payload.delete({ collection: 'articles', id: legacy.id, overrideAccess: true } as never)
      stats.skipped += 1
    }

    const articleAuthor = (): ArticleBlock => ({
      type: 'paragraph',
      children: ['Автор статьи: ', { text: 'Константин Кузнецов', url: 'https://t.me/sovershenen' }],
    })
    const sourceArticle = async (filename: string, mediaByCaption: Record<string, SeededRecord>) => richTextArticle([
      ...parseEditorialMarkdown(await readFile(path.join(dirname, 'content/editorial-articles', filename), 'utf8'), mediaByCaption),
      articleAuthor(),
    ])
    const sourceEditorialContent = {
      'padel-udary-tehnika-ot-stekla': await sourceArticle('05-udary-v-padele-tehnika.md', {
        'Игрок выходит на позицию на панорамном падельном корте': articleMedia.techniquePreview,
        'Игрок в падел в стойке готовности перед ударом': articleMedia.techniqueReady,
        'Игрок выполняет удар после отскока мяча от стекла': articleMedia.techniqueGlass,
        'Игрок выполняет удар над головой в паделе': articleMedia.techniqueOverhead,
      }),
      'kak-vybrat-raketku-dlya-padela': await sourceArticle('04-kak-vybrat-raketku-dlya-padela.md', {
        'Ракетка Varlion на падельном корте рядом с мячами': articleMedia.varlionPreview,
        'Три формы ракеток Varlion: круглая, каплевидная и ромбовидная': articleMedia.varlionShapes,
        'Схема распределения баланса ракетки для падела': articleMedia.varlionBalance,
        'Детали конструкции ракетки Varlion с длинной ручкой и диффузором': articleMedia.varlionSummum,
      }),
      'padel-dlya-nachinayushchikh-s-nulya': await sourceArticle('03-padel-dlya-nachinayushchih.md', {
        'Пара новичков заходит на первый падельный корт': articleMedia.beginnerPreview,
        'Практичный комплект экипировки для первой игры в падел': articleMedia.beginnerKitV2,
        'Новички на первой тренировке по паделу с тренером': articleMedia.beginnerCourt,
        'Тренер показывает новичку базовый удар в паделе': articleMedia.beginnerDrill,
      }),
      'padel-i-bolshoy-tennis-otlichiya': await sourceArticle('02-padel-i-bolshoy-tennis-otlichie.md', {
        'Панорамный падельный и открытый теннисный корты': articleMedia.padelTennisPreview,
        'Сравнение площадки для падела и теннисного корта': articleMedia.padelTennisSplit,
        'Панорамный корт JUBO Padel со стеклянными стенами': articleMedia.juboGlass,
        'Схема движения игроков в паделе и большом теннисе': articleMedia.padelTennisTactics,
      }),
      'urovni-v-padela-kak-opredelit-svoy': await sourceArticle('01-padel-urovni-kak-opredelit-svoy-uroven-igry.md', {
        'Игроки обсуждают следующий розыгрыш у сетки': articleMedia.levelsPreview,
        'Абстрактная шкала прогресса уровня игрока в паделе': articleMedia.levelsScale,
        'Парная игра в падел на любительском уровне': articleMedia.levelsMatch,
        'Тренер объясняет игроку тактическую поправку после розыгрыша': articleMedia.levelsCoachV2,
      }),
    }
    const editorialArticles = [
      {
        seedKey: 'editorial:article:padel-strikes-v5',
        slug: 'padel-udary-tehnika-ot-stekla',
        title: 'Удары в паделе: техника, виды и удар от стекла',
        excerpt: 'Разбираю базовые удары в паделе, работу ног и понятную механику удара после отскока мяча от стекла.',
        category: 'technique',
        readingTimeMinutes: 8,
        previewImage: articleMedia.techniqueCoverV2.id,
        seo: {
          title: 'Удары в паделе: техника, виды и удар от стекла',
          description: 'Какие бывают удары в паделе, как подготовиться к контакту и научиться спокойно играть после стекла.',
          robots: 'index-follow',
        },
        content: richTextArticle([
          { type: 'paragraph', text: 'Я долго считал, что в паделе решает сила. Потом понял обратное: хороший удар начинается с ног, ранней подготовки и спокойного контакта с мячом. Когда тело успевает занять позицию, ракетка делает работу почти сама, а розыгрыш перестаёт быть лотереей.' },
          { type: 'heading', text: 'Какие удары нужны в первую очередь' },
          { type: 'paragraph', text: 'На старте не нужно собирать энциклопедию из двадцати названий. Я бы поставил в такой порядок:' },
          { type: 'list', items: ['форхенд и бэкхенд с комфортной высотой контакта;', 'подача снизу и надёжный приём;', 'воллей у сетки без замаха через плечо;', 'свеча, чтобы вернуть себе время и позицию;', 'бандеха, вибора и смэш — когда база уже держится.'] },
          { type: 'image', media: articleMedia.techniqueReady.id, alt: 'Игрок в падел в стойке готовности перед ударом', caption: 'Любой удар начинается с устойчивой стойки и готовой ракетки.' },
          { type: 'heading', text: 'Механика удара: сначала ноги, потом рука' },
          { type: 'paragraph', text: 'Перед контактом я разворачиваю корпус боком, делаю короткий приставной шаг и держу ракетку перед собой. Рука не убегает далеко назад: чем короче замах, тем проще поймать высоту и направление. В момент удара вес переходит вперёд, а завершение остаётся компактным. Это особенно важно у сетки, где времени мало.' },
          { type: 'paragraph', text: 'Отдельно слежу за расстоянием до мяча. Если он забрался под корпус, приходится спасать кистью. Если улетел далеко, появляется большой замах и теряется контроль. Лучше остановиться на полшага раньше и встретить мяч перед собой.' },
          { type: 'heading', text: 'Удар от стекла: не бейте раньше времени' },
          { type: 'paragraph', text: 'Главная ошибка новичка — броситься к мячу до отскока от стены. Я сначала разворачиваюсь, смотрю на траекторию и даю мячу пройти мимо корпуса. После стекла он замедляется и поднимается: этого короткого окна хватает, чтобы спокойно подставить ракетку.' },
          { type: 'image', media: articleMedia.techniqueGlass.id, alt: 'Игрок выполняет удар после отскока мяча от стекла', caption: 'После стекла важнее время и положение корпуса, чем резкость замаха.' },
          { type: 'list', items: ['развернитесь боком и не стойте лицом к стеклу;', 'не теряйте мяч из поля зрения в момент отскока;', 'встречайте его перед собой, а не за спиной;', 'направляйте мяч глубоко и высоко, если нужно вернуться в розыгрыш.'] },
          { type: 'paragraph', text: 'Когда отскок стал понятным, добавляйте скорость постепенно. Сначала цель — вернуть мяч в корт десять раз подряд. Потом — менять направление. Сила появится сама, когда перестанете догонять мяч руками.' },
          { type: 'image', media: articleMedia.techniqueOverhead.id, alt: 'Игрок выполняет удар над головой в паделе', caption: 'Удар над головой работает только вместе с правильной позицией ног.' },
          { type: 'paragraph', text: 'Для тренировки я беру короткие серии по пять минут: форхенд, бэкхенд, игра от стекла и одна игровая задача. Такой формат лучше бесконечных сильных ударов без цели: прогресс видно сразу, а техника не рассыпается от усталости.' },
          articleAuthor(),
        ]),
      },
      {
        seedKey: 'editorial:article:varlion-racket-choice-v5',
        slug: 'kak-vybrat-raketku-dlya-padela',
        title: 'Как выбрать ракетку для падела: баланс, форма и жёсткость',
        excerpt: 'Объясняю, как форма, баланс и жёсткость ракетки меняют ощущения в игре, и разбираю технологии Varlion без маркетинговой шелухи.',
        category: 'guide',
        readingTimeMinutes: 9,
        previewImage: articleMedia.varlionCover.id,
        seo: {
          title: 'Как выбрать ракетку для падела: баланс, форма и жёсткость',
          description: 'Круглая, каплевидная или ромбовидная ракетка Varlion: что выбрать новичку, как читать баланс и зачем нужны технологии Summum и Prisma.',
          robots: 'index-follow',
        },
        content: richTextArticle([
          { type: 'paragraph', children: ['Я не люблю совет выбирать ракетку по цвету или цене. У Varlion одна и та же логика работает стабильнее: сначала понять свою игру, потом посмотреть на форму, баланс и жёсткость, а уже после разбираться с технологиями. Официальный ', { text: 'гид Varlion по выбору ракетки', url: 'https://varlion.com/en/complete-guide-to-choosing-padel-racket/' }, ' как раз раскладывает выбор по этим базовым параметрам.'] },
          { type: 'heading', text: 'Форма: где будет центр комфортного удара' },
          { type: 'paragraph', text: 'Круглая форма обычно даёт большой и понятный sweet spot ближе к центру. Я бы смотрел на неё новичку или игроку, который ценит контроль и часто отбивает сложные мячи после стекла. Каплевидная форма даёт компромисс между контролем и мощностью. Ромбовидная смещает рабочую зону выше и раскрывается у игрока, который уже стабильно попадает в мяч и хочет больше веса в атаке.' },
          { type: 'image', media: articleMedia.varlionShapes.id, alt: 'Три формы ракеток Varlion: круглая, каплевидная и ромбовидная', caption: 'Форма помогает заранее понять, где будет комфортнее всего встречать мяч.' },
          { type: 'heading', text: 'Баланс: что чувствует кисть в конце матча' },
          { type: 'paragraph', text: 'Низкий баланс ближе к ручке даёт больше манёвренности и проще прощает опоздания. Средний баланс ощущается универсально. Высокий баланс переносит массу к голове и добавляет мощности, но требует точнее работать ногами и не зажимать предплечье. Если после игры устаёт локоть, я сначала проверяю не вес как цифру, а баланс и качество контакта.' },
          { type: 'image', media: articleMedia.varlionBalance.id, alt: 'Схема распределения баланса ракетки для падела', caption: 'Чем выше точка баланса, тем сильнее ощущается вес головы ракетки.' },
          { type: 'heading', text: 'Жёсткость и технологии Varlion' },
          { type: 'paragraph', children: ['Мягкий сердечник помогает получить более лёгкий выход мяча и приятное ощущение на спокойной скорости. Жёсткий даёт точный отклик и больше контроля при активном замахе, но требует чистого попадания. В актуальных линейках Varlion рядом с этим выбором встречаются ', { text: 'Summum', url: 'https://varlion.com/en/technologies-summum/' }, ', ', { text: 'Prisma', url: 'https://varlion.com/en/technologies/' }, ', Wings Diffuser, ErgoSlice и Ergoholes. Это не замена технике, а настройка поведения ракетки: аэродинамика, контакт с мячом, рабочая площадь и ощущение в руке.'] },
          { type: 'image', media: articleMedia.varlionSummum.id, alt: 'Детали конструкции ракетки Varlion с длинной ручкой и диффузором', caption: 'Summum у Varlion объединяет длинную ручку, увеличенную рабочую поверхность и диффузор Wings.' },
          { type: 'paragraph', text: 'Мой практический порядок такой: новичку — круглая форма и комфортная мягкость, продолжающему — капля и средний баланс, атакующему игроку — ромб и более жёсткий отклик. Но примеряйте ракетку в руке и тестируйте её на корте: паспорт модели не расскажет, как она поведёт себя именно в вашем замахе.' },
          articleAuthor(),
        ]),
      },
      {
        seedKey: 'editorial:article:padel-for-beginners-v5',
        slug: 'padel-dlya-nachinayushchikh-s-nulya',
        title: 'Падел для начинающих: как начать играть с нуля',
        excerpt: 'Понятный маршрут для первого визита: что взять, как проходит тренировка и что делать, чтобы не перегореть после первой игры.',
        category: 'guide',
        readingTimeMinutes: 7,
        previewImage: articleMedia.beginnerCoverV2.id,
        seo: {
          title: 'Падел для начинающих: как начать играть с нуля',
          description: 'Падел с нуля: экипировка, первая тренировка, ракетка для начинающих и план первых занятий без лишнего стресса.',
          robots: 'index-follow',
        },
        content: richTextArticle([
          { type: 'paragraph', text: 'Если вы ни разу не держали ракетку, это нормальная точка старта. Я сам видел, как люди приходят на корт с ощущением, что их сейчас будут оценивать. Через десять минут они уже смеются над первыми промахами и понимают: падел хорош тем, что в него можно войти через игру, а не через идеальную физическую форму.' },
          { type: 'heading', text: 'Что взять на первую тренировку' },
          { type: 'paragraph', text: 'Нужны удобная спортивная одежда, чистые кроссовки с устойчивой подошвой и вода. Ракетку и мячи обычно можно взять в клубе, поэтому покупать дорогую модель до первого занятия не стоит. Если хочется своей, выбирайте лёгкую и управляемую ракетку с большим центром попадания, а не самую мощную.' },
          { type: 'image', media: articleMedia.beginnerKit.id, alt: 'Базовый комплект экипировки для первой игры в падел', caption: 'На первую игру достаточно удобной формы, воды и подходящей обуви.' },
          { type: 'heading', text: 'Как проходит первый час' },
          { type: 'paragraph', text: 'Хорошая вводная тренировка начинается с движения, хвата и простой подачи снизу. Затем тренер показывает форхенд, бэкхенд и короткие игровые задания. Стекло не нужно осваивать сразу: сначала важно научиться оценивать скорость мяча и возвращать его в корт. В конце обычно играют короткими розыгрышами, чтобы правила закрепились не в теории, а в руках.' },
          { type: 'image', media: articleMedia.beginnerCourt.id, alt: 'Новички на первой тренировке по паделу с тренером', caption: 'Первые упражнения лучше выполнять в спокойном темпе и сразу с понятной задачей.' },
          { type: 'heading', text: 'План первых четырёх занятий' },
          { type: 'list', items: ['первое занятие — хват, стойка, подача и базовый форхенд;', 'второе — бэкхенд, приём и перемещение вдвоём;', 'третье — стекло, свеча и выход к сетке;', 'четвёртое — полноценные розыгрыши с одной тактической задачей.'] },
          { type: 'paragraph', text: 'Между занятиями полезнее один спокойный матч, чем попытка за вечер выучить все удары из видео. В паделе быстро растёт тот, кто понимает, зачем двигается, а не тот, кто сильнее всех замахивается.' },
          { type: 'image', media: articleMedia.beginnerDrill.id, alt: 'Тренер показывает новичку базовый удар в паделе', caption: 'Тренер помогает почувствовать момент контакта, а не просто повторить движение.' },
          { type: 'heading', text: 'Типичные ошибки новичка' },
          { type: 'paragraph', text: 'Не бегите за каждым мячом в одиночку, не стойте всё время у задней стены и не пытайтесь выиграть каждый розыгрыш одним ударом. Сначала держите позицию рядом с партнёром, говорите вслух и возвращайте мяч с запасом по высоте. Уверенность приходит именно из этих простых повторений.' },
          articleAuthor(),
        ]),
      },
      {
        seedKey: 'editorial:article:padel-vs-tennis-v5',
        slug: 'padel-i-bolshoy-tennis-otlichiya',
        title: 'Падел и большой теннис: отличие правил, корта и техники',
        excerpt: 'Сравниваю падел и большой теннис по корту, подаче, стенам, движению и ощущениям для игрока, который переходит из одного спорта в другой.',
        category: 'guide',
        readingTimeMinutes: 8,
        previewImage: articleMedia.padelTennisCoverV2.id,
        seo: {
          title: 'Падел и большой теннис: отличие правил, корта и техники',
          description: 'Отличие падела от тенниса: правила, размеры и устройство корта, подача, стекло и техника розыгрыша.',
          robots: 'index-follow',
        },
        content: richTextArticle([
          { type: 'paragraph', text: 'Я пришёл в падел после большого тенниса и сначала пытался играть по-старому: уходил далеко назад, замахивался широко и искал победу в скорости. Это работает ровно до первого мяча от стекла. Падел похож на теннис по счёту и сетке, но логика розыгрыша у него другая.' },
          { type: 'heading', text: 'Главное отличие — корт становится частью игры' },
          { type: 'paragraph', text: 'Падельный корт меньше и закрыт стеклом с металлической сеткой. После отскока от пола мяч может продолжить движение через стену, а игрок возвращает его уже с новой траекторией. В большом теннисе задняя линия заканчивает площадку: мяч после неё не возвращается в розыгрыш.' },
          { type: 'image', media: articleMedia.padelTennisSplit.id, alt: 'Сравнение площадки для падела и теннисного корта', caption: 'В паделе стены не фон, а полноценный элемент тактики.' },
          { type: 'heading', text: 'Правила и подача' },
          { type: 'list', items: ['в падел играют парами на компактном корте, в теннисе возможен одиночный формат;', 'счёт и логика геймов похожи, но в паделе подача выполняется снизу после отскока мяча;', 'подача направляется по диагонали и не должна попадать в сетку или стекло на стороне подающего;', 'мяч в паделе может быть возвращён после отскока от стекла, если он сначала коснулся пола.'] },
          { type: 'image', media: articleMedia.juboGlass.id, alt: 'Панорамный корт JUBO Padel со стеклянными стенами', caption: 'Панорамная конструкция JUBO хорошо показывает, как стекло расширяет пространство розыгрыша.' },
          { type: 'heading', text: 'Техника переезжает не целиком' },
          { type: 'paragraph', text: 'Из тенниса отлично переходят чувство мяча, координация и понимание счёта. Но замах в паделе компактнее, а позиция пары важнее индивидуального удара. У сетки нужно двигаться синхронно, после подачи не оставлять партнёра одного и заранее договариваться, кто забирает мяч по центру.' },
          { type: 'image', media: articleMedia.padelTennisTactics.id, alt: 'Схема движения игроков в паделе и большом теннисе', caption: 'В паделе пара двигается как единый блок и постоянно закрывает центр.' },
          { type: 'paragraph', text: 'Теннисисту я советую начать с контроля силы и отдельной тренировки стекла. Новичку без теннисного опыта, наоборот, проще: он не успевает закрепить привычку всё решать одним мощным ударом. В обоих случаях выигрывает тот, кто раньше читает траекторию и лучше держит позицию.' },
          articleAuthor(),
        ]),
      },
      {
        seedKey: 'editorial:article:padel-levels-v5',
        slug: 'urovni-v-padela-kak-opredelit-svoy',
        title: 'Падел уровни: как определить свой уровень игры',
        excerpt: 'Разбираю, как не завышать уровень по ощущениям, чем отличаются PadelApp и Lunda и какие признаки действительно видны на корте.',
        category: 'technique',
        readingTimeMinutes: 9,
        previewImage: articleMedia.levelsCover.id,
        seo: {
          title: 'Падел уровни: как определить свой уровень игры',
          description: 'Уровни игры в паделе: шкала Lunda 1.0–7.0, уровень PadelApp, признаки техники, стабильности и тактики.',
          robots: 'index-follow',
        },
        content: richTextArticle([
          { type: 'paragraph', children: ['Уровень в паделе — это не ощущение после удачного матча. Я смотрю на то, что игрок повторяет под давлением: как принимает подачу, что делает со стеклом, умеет ли держать позицию и насколько часто ошибается без причины. Для ориентира удобно сравнивать описание своей игры с ', { text: 'шкалой Lunda', url: 'https://lundapadel.app/rating/' }, ', а результаты не смешивать механически с рейтингом ', { text: 'PadelApp', url: 'https://www.padelapp.com.ar/ranking/como-funciona' }, '.'] },
          { type: 'heading', text: 'Что показывает PadelApp' },
          { type: 'paragraph', text: 'У PadelApp есть отдельные очки сезона и уровень PadelApp. Очки приходят из турниров и подтверждённых свободных игр, а сам уровень описан как независимая Elo-оценка, которая меняется после валидированных результатов. Поэтому место в таблице и реальная игровая категория — не одно и то же. Для честной самооценки важнее смотреть на серию матчей, а не на один красивый финал.' },
          { type: 'heading', text: 'Шкала Lunda от первого занятия до 7.0' },
          { type: 'paragraph', text: 'Lunda использует одну шкалу от 1.0 до 7.0 и девять ступеней. Рейтинг считается по результатам и может подтверждаться тренером:' },
          { type: 'list', items: ['1.0–1.49 — абсолютный новичок: осваивает правила и стены;', '1.5–1.99 — новичок: понимает счёт, но нестабилен по направлению;', '2.0–2.49 — развивающийся игрок: начинает выходить к сетке;', '2.5–2.99 — любитель: держит около 60% ударов и использует свечу;', '3.0–3.49 — средний любитель: стабилен с задней линии и наращивает тактику;', '3.5–3.99 — опытный любитель: уверенно играет у сетки и знает бандеху;', '4.0–4.74 — продвинутый: контролирует глубину, направление и вращение;', '4.75–5.49 — полупрофессионал: играет сильные локальные турниры;', '5.5–7.0 — профессионал: полный арсенал и игра на уровне FIP или Premier Padel.'] },
          { type: 'image', media: articleMedia.levelsScale.id, alt: 'Абстрактная шкала прогресса уровня игрока в паделе', caption: 'Шкала полезна как общий ориентир, но важнее повторяемые навыки в реальной игре.' },
          { type: 'heading', text: 'Как определить свой уровень без самообмана' },
          { type: 'paragraph', text: 'Запишите три последних матча и ответьте на пять вопросов: сколько подач вы принимаете в корт, можете ли вернуть мяч после стекла, как часто ошибаетесь в простой ситуации, двигаетесь ли вместе с партнёром и умеете ли закончить розыгрыш у сетки. Если между двумя уровнями, я выбираю нижний. Так честнее для подбора игры и понятнее для прогресса.' },
          { type: 'image', media: articleMedia.levelsMatch.id, alt: 'Парная игра в падел на любительском уровне', caption: 'Рейтинг имеет смысл только тогда, когда соперники действительно близки по уровню.' },
          { type: 'paragraph', text: 'Самый точный способ — сыграть несколько рейтинговых матчей и попросить тренера подтвердить наблюдения. В Lunda расчётный рейтинг и тренерская верификация дополняют друг друга. В PadelApp клуб валидирует результаты, поэтому не стоит записывать себе очки за матч, который никто не подтвердил.' },
          { type: 'image', media: articleMedia.levelsCoach.id, alt: 'Тренер и игрок обсуждают уровень игры в падел', caption: 'Хорошая оценка объясняет не только число, но и следующий конкретный шаг.' },
          articleAuthor(),
        ]),
      },
    ] as const
    const rewrittenContent: Record<string, ReturnType<typeof richTextArticle>> = {
      'padel-udary-tehnika-ot-stekla': richTextArticle([
        { type: 'paragraph', text: 'Удар в паделе начинается задолго до контакта с мячом. Игрок успевает прочитать высоту, скорость и направление, занять позицию, подобрать расстояние и только потом выбирает плоскость ракетки. Поэтому внешне простой обмен ударами часто выигрывает тот, кто раньше подготовился, а не тот, кто сильнее размахнулся.' },
        { type: 'paragraph', text: 'В базовой технике удобно разделять четыре задачи: удержать равновесие, встретить мяч перед корпусом, отправить его с запасом по высоте и после удара вернуться в позицию пары. Если один элемент выпадает, рука начинает компенсировать всё сразу: появляется зажатая кисть, поздний контакт и непредсказуемая длина. На корте это выглядит как череда случайных промахов, хотя причина обычно одна — игрок начинает движение слишком поздно.' },
        { type: 'heading', text: 'Почему сила не заменяет подготовку' },
        { type: 'paragraph', text: 'Форхенд и бэкхенд в паделе строятся на короткой подготовке. Корпус разворачивается боком, свободная рука помогает оценить расстояние, а ракетка остаётся перед собой. Замах не должен уходить далеко за спину: чем ближе соперники и чем быстрее мяч, тем меньше времени на исправление. Рабочая последовательность простая — шаг, разворот, контакт перед собой, спокойное завершение.' },
        { type: 'image', media: articleMedia.techniqueReady.id, alt: 'Игрок в падел в стойке готовности перед ударом', caption: 'Стойка и ранняя подготовка создают время для точного контакта.' },
        { type: 'heading', text: 'Базовые удары и их настоящая задача' },
        { type: 'paragraph', text: 'Удары в паделе нельзя оценивать только по скорости. Каждый отвечает за определённый участок розыгрыша:' },
        { type: 'list', items: ['форхенд и бэкхенд — безопасно вернуть мяч глубоко и сохранить равновесие;', 'подача — начать розыгрыш так, чтобы после неё успеть занять сетку;', 'приём — не просто попасть в корт, а не отдать соперникам лёгкий первый воллей;', 'свеча — вернуть себе время, вытеснить пару от сетки и перестроить эпизод;', 'воллей — укоротить подготовку и направить мяч туда, где сопернику неудобно;', 'смэш, бандеха и вибора — завершить или продолжить атаку после высокого мяча.'] },
        { type: 'paragraph', text: 'У каждого удара есть две скорости: та, которую ощущает игрок, и та, которую получает соперник. Сильный замах с плохим контактом часто даёт лёгкий мяч по центру. Контролируемый удар с хорошей высотой и глубиной заставляет защищаться и приносит больше пользы паре.' },
        { type: 'heading', text: 'Удар от стекла: сначала траектория, потом движение' },
        { type: 'paragraph', text: 'Работа после стекла — главный переход от теннисной логики к падельной. Не стоит бросаться к мячу сразу после отскока от пола. Сначала нужно развернуться боком, пропустить мяч мимо корпуса и увидеть, куда он пойдёт после стены. После контакта со стеклом траектория становится понятнее, скорость снижается, а у игрока появляется короткое окно для спокойного ответа.' },
        { type: 'image', media: articleMedia.techniqueGlass.id, alt: 'Игрок выполняет удар после отскока мяча от стекла', caption: 'После стекла важнее выдержка и положение корпуса, чем резкость замаха.' },
        { type: 'list', items: ['не стойте лицом к задней стене — разворачивайтесь и сохраняйте обзор мяча;', 'держите ракетку перед корпусом и не опускайте её к коленям;', 'встречайте мяч после отскока перед собой, а не за спиной;', 'если позиция потеряна, играйте выше и глубже, а не пытайтесь сразу ускорить мяч.'] },
        { type: 'paragraph', text: 'Один из полезных игровых инсайтов, который часто повторяют сильные любители: мощный мяч соперника не обязательно отвечать мощно. Иногда правильнее дать ему уйти к стеклу, использовать отскок и вернуть высокий глубокий мяч. Такой ответ не выглядит эффектно, зато возвращает время и помогает паре снова встать рядом.' },
        { type: 'heading', text: 'Бандеха и вибора: контроль против давления' },
        { type: 'paragraph', text: 'Бандеха — прежде всего контроль. Её задача — сохранить сетку, отправить мяч с понятным вращением и не открыть сопернику прямую атаку. Вибора агрессивнее: боковое вращение и более активная работа предплечья могут прижать мяч к боковому стеклу или усложнить следующий отскок. Но обе техники начинаются одинаково — с правильной позиции под высоким мячом, работы ног и контакта перед плечом.' },
        { type: 'image', media: articleMedia.techniqueOverhead.id, alt: 'Игрок выполняет удар над головой в паделе', caption: 'Удар над головой должен помогать паре удерживать сетку, а не просто показывать силу.' },
        { type: 'heading', text: 'Как тренировать технику без хаоса' },
        { type: 'paragraph', text: 'Рабочая сессия на 45 минут может выглядеть так: десять минут — форхенд и бэкхенд в диагонали; десять — приём и подача; десять — четыре мяча после стекла без ускорения; десять — бандеха с одной целью по направлению; пять — короткий розыгрыш с условием не бить на силу. Такой порядок сначала закрепляет контакт, затем добавляет решение и только потом скорость.' },
        { type: 'paragraph', text: 'Прогресс стоит оценивать не по одному красивому мячу. Лучше считать серию: сколько раз подряд удалось вернуть мяч после стекла, сколько подач вошло в нужную зону, удаётся ли после удара остаться рядом с партнёром. Когда эти показатели растут, техника становится игровой, а не тренировочной декорацией.' },
        { type: 'heading', text: 'Куда направлять мяч' },
        { type: 'paragraph', text: 'Направление выбирают не в последний момент кистью, а ещё во время подготовки. Если соперник стоит у сетки, глубокий мяч в угол заставляет его отойти и даёт паре время. Если один игрок уже смещён в сторону, безопаснее играть через центр и не открывать линию. В любительской игре центр особенно ценен: он сокращает количество вариантов для ответа и заставляет соперников договариваться.' },
        { type: 'paragraph', text: 'После стекла полезно сначала вернуть мяч в понятную зону, а не искать идеальную точку у боковой сетки. Контроль глубины создаёт следующий удар, а не обязательно выигрывает текущий. Чем выше уровень, тем чаще разница между хорошим и плохим решением проявляется через два удара: один игрок сохранил позицию, другой вынужден спасать неудобный мяч.' },
        { type: 'heading', text: 'Короткий чек-лист перед контактом' },
        { type: 'list', items: ['успел ли корпус повернуться к мячу;', 'осталась ли ракетка перед телом;', 'вижу ли я мяч после стекла до самого контакта;', 'понимает ли партнёр, куда направлен ответ;', 'готов ли следующий шаг, а не только текущий удар.'] },
        articleAuthor(),
      ]),
      'kak-vybrat-raketku-dlya-padela': richTextArticle([
        { type: 'paragraph', text: 'Выбор ракетки для падела начинается не с цвета и не с обещания максимальной мощности. Сначала нужно понять, где сейчас находится игрок: учится ли он держать мяч в корте, уже уверенно играет у сетки или строит розыгрыш вокруг атаки. Форма, баланс, вес и жёсткость влияют не по отдельности, а как одна система. Именно поэтому одинаково дорогие модели могут ощущаться совершенно по-разному.' },
        { type: 'paragraph', children: ['В официальном ', { text: 'руководстве Varlion по выбору ракетки', url: 'https://varlion.com/en/complete-guide-to-choosing-padel-racket/' }, ' форма связана с положением sweet spot, баланс — с распределением веса, а жёсткость — с тем, как поверхность реагирует на контакт. Это хороший порядок чтения характеристик: сначала геометрия, потом ощущение в руке, затем материалы и технологии.'] },
        { type: 'heading', text: 'Форма: круг, капля или ромб' },
        { type: 'paragraph', text: 'Круглая форма обычно даёт большой рабочий центр ближе к середине. Она понятна новичку, помогает защищаться и прощает контакт не строго по центру. Каплевидная форма занимает промежуточное положение: в ней больше потенциала для атаки, но сохраняется удобный контроль. Ромбовидная смещает рабочую зону выше и требует более точной подготовки — зато при правильном контакте помогает добавить веса верхнему удару.' },
        { type: 'image', media: articleMedia.varlionShapes.id, alt: 'Три формы ракеток Varlion: круглая, каплевидная и ромбовидная', caption: 'Форма меняет не только внешний вид, но и место, где ракетка охотнее отвечает на мяч.' },
        { type: 'paragraph', text: 'В обсуждениях игроков на Reddit регулярно повторяется практичная мысль: первые десятки матчей не стоит превращать в охоту за идеальными характеристиками. Новичок часто не чувствует тонких различий между моделями, зато быстро замечает слишком тяжёлую голову, неудобную рукоятку или маленький центр попадания. Поэтому тест в руке и несколько тренировок важнее длинного списка обзоров.' },
        { type: 'heading', text: 'Баланс и вес: не путайте мощность с нагрузкой' },
        { type: 'paragraph', text: 'Низкий баланс переносит ощущение веса ближе к руке. Ракеткой проще подготовиться к быстрому мячу, защищаться у стекла и менять направление. Средний баланс даёт универсальное ощущение. Высокий баланс помогает атакующему удару, но увеличивает требования к технике и предплечью. Вес сам по себе не равен мощности: тяжёлая голова может лишь замедлить подготовку и заставить игрока опаздывать.' },
        { type: 'image', media: articleMedia.varlionBalance.id, alt: 'Схема распределения баланса ракетки для падела', caption: 'Чем выше точка баланса, тем сильнее ощущается вес головы при замахе.' },
        { type: 'paragraph', text: 'Для первого собственного инвентаря обычно разумнее смотреть на управляемую модель с комфортной рукояткой и умеренным балансом. Игроку с теннисным или сквошевым прошлым иногда подходит более жёсткая и требовательная ракетка, но это не правило. Перенос навыков помогает читать мяч, однако падельная защита и игра после стекла всё равно требуют адаптации.' },
        { type: 'heading', text: 'Жёсткость и выход мяча' },
        { type: 'paragraph', text: 'Мягкий сердечник легче отдаёт энергию на спокойном замахе и помогает не терять длину, когда контакт неидеален. Жёсткий отклик точнее передаёт активное движение и лучше подходит игроку, который стабильно встречает мяч, но может наказывать за поздний контакт. Обозначения soft, medium и hard у разных производителей не являются единой измерительной шкалой, поэтому полагаться только на слово в карточке товара рискованно.' },
        { type: 'heading', text: 'Что дают технологии Varlion' },
        { type: 'paragraph', children: ['У Varlion отдельные технологии описывают конкретные элементы конструкции. ', { text: 'Summum', url: 'https://varlion.com/en/technologies-summum/' }, ' объединяет удлинённую ручку, увеличенную рабочую поверхность и диффузор Wings. ', { text: 'Prisma', url: 'https://varlion.com/en/technologies/' }, ' связана с формой рамы и аэродинамикой, а ErgoSlice и Ergoholes влияют на контакт с мячом и движение воздуха. Handlesafety отвечает за конструкцию безопасного крепления шнура. Всё это может изменить ощущения, но не заменяет работу ног и точку контакта.'] },
        { type: 'image', media: articleMedia.varlionSummum.id, alt: 'Детали конструкции ракетки Varlion с длинной ручкой и диффузором', caption: 'Технологии Varlion полезно читать как описание поведения ракетки, а не как обещание мгновенного уровня.' },
        { type: 'heading', text: 'Практический алгоритм выбора' },
        { type: 'list', items: ['определите, чего не хватает чаще: контроля, скорости подготовки или мощности;', 'сравните две формы с близким весом, чтобы не смешивать несколько переменных;', 'проверьте, не тянет ли голова ракетки руку вниз при воллее и игре от стекла;', 'поиграйте серией минимум из нескольких тренировок, а не одним пробным ударом;', 'оставьте запас для роста, но не покупайте модель, которая уже сейчас мешает попадать.'] },
        { type: 'paragraph', text: 'Я как игрок стараюсь оценивать ракетку после обычного матча, а не после пяти удачных смэшей. Если к концу игры сохраняются свободная кисть, ранняя подготовка и понятный контакт, модель подходит. Если приходится всё время компенсировать её головой, весом или жёсткостью, никакая надпись на раме не сделает её удобнее.' },
        { type: 'heading', text: 'Почему тест важнее таблицы характеристик' },
        { type: 'paragraph', text: 'Цифра веса не показывает, как распределена масса по длине ракетки, а слово control не объясняет, насколько быстро поверхность отдаёт мяч. Две модели одного веса могут по-разному вести себя на воллее, после стекла и в верхнем ударе. Поэтому тестировать стоит не только смэш: десять минут защиты, несколько приёмов подачи и серия спокойных выходов к сетке быстрее раскрывают характер модели.' },
        { type: 'paragraph', text: 'Есть и бытовой критерий, о котором часто забывают: как ракетка ведёт себя на третий сет. Если рука начинает зажиматься, подготовка запаздывает, а игрок компенсирует это силой, модель не подходит текущей технике. В обсуждениях игроков часто советуют не менять ракетку после каждого плохого матча и дать себе хотя бы несколько недель на адаптацию. Это разумно, если нет боли и явного дискомфорта.' },
        { type: 'paragraph', text: 'Для игрока, который только начинает, лучший выбор обычно не тот, что обещает самый мощный удар, а тот, с которым проще повторять правильное движение. Потом, когда появляется стабильная защита, работа у сетки и собственный рисунок игры, переход на более специализированную Varlion-модель становится осмысленным: уже понятно, какую задачу должна решать технология.' },
        articleAuthor(),
      ]),
      'padel-dlya-nachinayushchikh-s-nulya': richTextArticle([
        { type: 'paragraph', text: 'Падел для начинающих удобен тем, что первые результаты появляются быстро: уже на первом занятии можно разыграть несколько мячей, понять счёт и почувствовать, как стекло возвращает игру. Но быстрый вход не означает, что технику можно оставить на самотёк. Неправильный хват, постоянная игра только рукой и привычка стоять в одиночку закрепляются так же быстро, как и хорошие движения.' },
        { type: 'paragraph', text: 'Оптимальный старт — тренировка с понятной структурой и затем спокойная игра с партнёрами близкого уровня. Для первой недели не нужны дорогая экипировка и попытка выучить все названия ударов. Важнее научиться готовить ракетку, двигаться короткими шагами, говорить с партнёром и возвращать мяч с запасом по высоте.' },
        { type: 'heading', text: 'Что нужно взять на первую тренировку' },
        { type: 'paragraph', text: 'Достаточно спортивной одежды, чистой обуви с устойчивой подошвой и воды. Ракетку и мячи обычно можно взять в клубе. Своя ракетка для начинающих появляется позже, когда станет понятно, что именно требуется: больше манёвренности, мягче выход мяча или устойчивее рукоятка. Покупка дорогой атакующей модели до первого занятия чаще добавляет тревогу, чем помогает играть.' },
        { type: 'image', media: articleMedia.beginnerKitV2.id, alt: 'Практичный комплект экипировки для первой игры в падел', caption: 'Для старта нужны удобная обувь, вода и ракетка, которую легко контролировать.' },
        { type: 'heading', text: 'Как должна выглядеть первая тренировка' },
        { type: 'paragraph', text: 'Первые десять минут уходят на разминку, безопасное перемещение и хват. Затем тренер показывает подачу снизу, базовый форхенд и бэкхенд, а после даёт простые задания на направление. Стекло лучше вводить постепенно: сначала игрок учится видеть отскок, потом отступать, пропускать мяч и только после этого отвечать. Так мозг не путает стену с препятствием и быстрее строит правильную траекторию.' },
        { type: 'image', media: articleMedia.beginnerCourt.id, alt: 'Новички на первой тренировке по паделу с тренером', caption: 'Понятная задача на каждую серию полезнее свободной игры без обратной связи.' },
        { type: 'heading', text: 'Первые четыре занятия: от контакта к розыгрышу' },
        { type: 'list', items: ['занятие 1 — стойка, хват, подача и контакт перед собой;', 'занятие 2 — форхенд, бэкхенд, остановка и короткое перемещение;', 'занятие 3 — приём подачи, выход к сетке и первый простой воллей;', 'занятие 4 — стекло, свеча и розыгрыш с партнёром по одной задаче.'] },
        { type: 'paragraph', text: 'Между тренировками полезно сыграть один матч без цели выиграть любой ценой. В этот момент закрепляется то, что на занятии было движением по команде. Хорошая задача для новичка — после каждого удара возвращаться в позицию и вслух называть мяч партнёру. Простая коммуникация заметно снижает хаос.' },
        { type: 'image', media: articleMedia.beginnerDrill.id, alt: 'Тренер показывает новичку базовый удар в паделе', caption: 'Тренер помогает почувствовать момент контакта, а не копировать форму движения.' },
        { type: 'heading', text: 'Ошибки, которые тормозят прогресс' },
        { type: 'paragraph', text: 'Первая ошибка — всё время играть из глубины и бояться сетки. Вторая — закрывать половину корта в одиночку и оставлять партнёра без пространства. Третья — пытаться ускорять каждый мяч. В паделе нормальный розыгрыш часто строится из трёх спокойных действий: вернуть, занять позицию, дождаться короткого мяча.' },
        { type: 'paragraph', text: 'Игроки на Reddit часто советуют не судить себя по первым десяти матчам и не менять ракетку после каждого неудачного вечера. В начале нестабильность объясняется не ценой инвентаря, а координацией и чтением отскока. Несколько занятий с тренером помогают убрать плохой хват раньше, чем он станет автоматическим.' },
        { type: 'heading', text: 'Как понять, что стало лучше' },
        { type: 'paragraph', text: 'Отмечайте не только победы. Полезные признаки прогресса — подача чаще входит в корт, мяч после стекла перестаёт пугать, удаётся выполнить серию из пяти спокойных возвратов, а партнёр понимает ваши перемещения без постоянных подсказок. Когда эти вещи становятся стабильными, можно добавлять свечу, бандеху и более сложные игровые форматы.' },
        { type: 'heading', text: 'Как выбирать партнёров на старте' },
        { type: 'paragraph', text: 'Слишком сильный соперник может дать полезный урок, но не всегда даёт много игровых повторений. Новичку важно чаще попадать в ситуации, где мяч можно прочитать, подготовиться и выбрать направление. Матч с игроками близкого уровня не обязан быть медленным: он просто оставляет обеим парам время на решение, а не превращается в череду случайных спасений.' },
        { type: 'paragraph', text: 'Хороший формат первых игр — короткие сеты или ротации с одной задачей. Например, в первом матче считать только возвращённые после стекла мячи, во втором — выход к сетке после подачи, в третьем — коммуникацию в центре. Такой подход снижает страх ошибки и показывает, что развитие состоит из маленьких повторяемых действий.' },
        { type: 'heading', text: 'Когда пора заниматься регулярно' },
        { type: 'paragraph', text: 'Если после нескольких визитов игрок уже понимает счёт, но каждый матч выглядит по-разному, пора закрепить базу с тренером. Регулярность важнее редких длинных тренировок: один час в неделю с понятной целью и одна спокойная игра между занятиями обычно дают больше, чем спонтанный марафон раз в месяц. Тренер нужен не для того, чтобы исправлять каждый промах, а чтобы вовремя заметить повторяющуюся причину.' },
        { type: 'paragraph', text: 'Не стоит ждать, пока появится идеальная форма. Удобная обувь, умеренный темп, короткий замах и уважение к собственному восстановлению уже создают безопасную основу. Падел с нуля не требует быть спортсменом заранее: он требует готовности повторять простые вещи достаточно долго, чтобы они стали привычкой.' },
        { type: 'heading', text: 'Как дозировать нагрузку' },
        { type: 'paragraph', text: 'После первой игры мышцы и внимание устают сильнее, чем кажется. Новичку не нужно сразу играть два часа на максимальном темпе: качество движений быстро падает, а техника начинает компенсироваться плечом и кистью. Лучше закончить серию, пока удаётся сохранять стойку и контроль, затем восстановиться и вернуться на корт через день или два. Такой ритм помогает связать падел с удовольствием, а не с обязательством терпеть усталость.' },
        { type: 'paragraph', text: 'Если появилась боль, а не обычная мышечная усталость, нагрузку стоит остановить и обсудить с тренером или врачом. Падел динамичный, но безопасный старт строится на подходящей обуви, короткой разминке и постепенном увеличении темпа. Это особенно важно для тех, кто давно не занимался спортом или приходит после другой нагрузки.' },
        articleAuthor(),
      ]),
      'padel-i-bolshoy-tennis-otlichiya': richTextArticle([
        { type: 'paragraph', text: 'Падел и большой теннис родственные игры, но одинаковая разметка счёта не делает их одной техникой. В теннисе пространство заканчивается за задней линией, а в паделе стены продолжают розыгрыш. В теннисе одиночный игрок может закрывать корт сам, в паделе пара постоянно принимает решения вместе. Поэтому переход между видами спорта даёт преимущество в координации, но требует перестроить привычки.' },
        { type: 'paragraph', text: 'Самая частая ошибка теннисиста — сохранить длинный замах, уйти далеко назад и пытаться решать эпизод скоростью. Самая частая ошибка новичка без тенниса — стоять и ждать мяч, не понимая, что после подачи позиция пары должна двигаться вперёд. В обоих случаях первые тренировки должны объяснить геометрию корта, а не только технику удара.' },
        { type: 'heading', text: 'Корт: открытое поле против пространства со стенами' },
        { type: 'paragraph', text: 'Падельная площадка компактнее теннисной и окружена стеклом с металлической сеткой. После отскока от пола мяч может коснуться задней или боковой стены и остаться в игре. Игроку нужно читать не одну траекторию, а последовательность пол — стекло — ответ. В большом теннисе стен нет, поэтому высота и глубина удара оцениваются иначе, а мяч за линией сразу завершает розыгрыш.' },
        { type: 'image', media: articleMedia.padelTennisSplit.id, alt: 'Сравнение площадки для падела и теннисного корта', caption: 'В паделе граница корта не заканчивает розыгрыш — она меняет его траекторию.' },
        { type: 'heading', text: 'Правила и подача' },
        { type: 'paragraph', text: 'В стандартном паделе играют парами, а счёт в геймах и сетах знаком теннисистам. Главное различие — подача выполняется снизу после отскока мяча и направляется по диагонали. В паделе нельзя подавать сверху с большой скоростью, зато после подачи важно быстро занять сетку вместе с партнёром. В теннисе подача сама может быть оружием, а позиция после неё зависит от выбранной тактики и формата.' },
        { type: 'list', items: ['мяч должен сначала коснуться пола на стороне подающего;', 'подающий отправляет его диагонально в квадрат соперника;', 'стекло и сетка имеют разные последствия: мяч может продолжить розыгрыш после стекла, но не после сетки;', 'в паре нужно заранее договариваться, кто закрывает центр и кто берёт мяч по линии.'] },
        { type: 'image', media: articleMedia.juboGlass.id, alt: 'Панорамный корт JUBO Padel со стеклянными стенами', caption: 'Панорамная система JUBO хорошо показывает, почему обзор и чтение стекла становятся частью техники.' },
        { type: 'heading', text: 'Что переносится из большого тенниса' },
        { type: 'paragraph', text: 'Переносятся чувство мяча, координация, понимание счёта и способность читать подготовку соперника. Не стоит переносить без изменений длинный замах, привычку всё время играть по одному месту и желание любой ценой бить плоско. В паделе ракетка чаще находится перед корпусом, контакт короче, а ценность мяча измеряется не скоростью, а тем, как он заставляет соперника двигаться.' },
        { type: 'image', media: articleMedia.padelTennisTactics.id, alt: 'Схема движения игроков в паделе и большом теннисе', caption: 'В парном паделе движение пары важнее попытки одного игрока закрыть весь корт.' },
        { type: 'heading', text: 'Как перейти без лишнего разочарования' },
        { type: 'paragraph', text: 'Первые занятия стоит провести на трёх темах: короткая подготовка, игра после стекла и синхронное движение. Теннисисту полезно сознательно замедлять замах и не уходить в глубину после каждой подачи. Новичку полезно сразу учиться говорить с партнёром, возвращаться в линию и оставлять запас по высоте. Через несколько матчей разница между видами спорта становится не препятствием, а дополнительным набором решений.' },
        { type: 'paragraph', text: 'Интересный вывод из обсуждений игроков: сильный теннисный бэкграунд иногда мешает в первые недели, потому что привычка к открытому корту заставляет бить по мячу раньше и жёстче. После адаптации этот же опыт становится преимуществом — легче понимать вращение, ритм и момент для перехода в атаку.' },
        { type: 'heading', text: 'Стекло меняет не только защиту' },
        { type: 'paragraph', text: 'В теннисе после глубокого мяча часто нужно отступить и сыграть до следующего отскока. В паделе можно позволить мячу пройти к задней стене, а затем использовать его скорость против соперника. Это требует другого чувства дистанции: игрок не бежит к точке, а заранее выбирает место, где мяч окажется после контакта со стеклом. На первых тренировках полезно разбирать этот эпизод без счёта и без попытки выиграть.' },
        { type: 'paragraph', text: 'Боковая стена добавляет ещё одну задачу. Мяч может уйти в угол, изменить направление и вернуться в тело игрока. Поэтому ракетку держат выше, корпус разворачивают раньше, а ответ часто направляют не туда, где хочется красиво попасть, а туда, где есть запас пространства. Такой контроль постепенно превращает стекло из источника паники в дополнительный инструмент.' },
        { type: 'heading', text: 'Тактика пары важнее одиночного героизма' },
        { type: 'paragraph', text: 'Обе пары должны двигаться компактно: после успешной подачи подниматься вместе, после свечи отходить вместе, а в центре заранее распределять ответственность. Если один игрок остаётся у сетки, а другой проваливается назад, появляется коридор для соперника. В большом теннисе индивидуальная скорость иногда спасает такой эпизод, в паделе цена несинхронности выше.' },
        { type: 'paragraph', text: 'Чтобы привыкнуть, можно сыграть несколько геймов с ограничением: не атаковать первым ударом, обязательно вернуть один мяч после стекла и вслух называть центр. Ограничения делают разницу между видами спорта заметной и помогают перенести теннисные навыки без старых автоматизмов.' },
        { type: 'paragraph', text: 'Полезно также отдельно потренировать первые два удара розыгрыша. После теннисной подачи игрок часто ожидает, что сам факт сильного ввода даст преимущество. В паделе важнее сразу увидеть ответ, выйти на нужную высоту и синхронно закрыть сетку. Если подача слабее, но пара заняла правильную позицию, розыгрыш всё равно может начаться в её пользу.' },
        { type: 'paragraph', text: 'При переходе не стоит копировать чужой темп. На маленьком корте паузы между решениями короче, а стекло возвращает мяч неожиданно. Начните с более мягкой скорости и постепенно добавляйте давление, когда научитесь сохранять равновесие после контакта. Так теннисный опыт станет фундаментом, а не набором привычек, которые приходится каждый раз отменять.' },
        articleAuthor(),
      ]),
      'urovni-v-padela-kak-opredelit-svoy': richTextArticle([
        { type: 'paragraph', text: 'Уровень в паделе нужен не для красивой цифры в профиле. Он помогает подобрать партнёров, сделать матч равным и понять, над чем работать дальше. Один удачный вечер не превращает игрока в продвинутого, так же как несколько плохих розыгрышей не отменяют накопленный навык. Оценивать стоит повторяемую игру под давлением: подачу, приём, стекло, позицию и решения в паре.' },
        { type: 'paragraph', children: ['В России сейчас полезно различать две системы. ', { text: 'Padelapp.club', url: 'https://padelapp.club/' }, ' на открытой странице описывает матчи на рейтинг, историю рейтинга, подбор партнёров по уровню, турниры, live-результаты и рейтинги, но не публикует универсальную шкалу диапазонов вроде 1.0–7.0. ', { text: 'Lunda', url: 'https://lundapadel.app/rating/' }, ' публикует именно такую шкалу и описания девяти ступеней. Поэтому число из одной системы нельзя механически переносить в другую.'] },
        { type: 'heading', text: 'Что смотреть в своей игре' },
        { type: 'paragraph', text: 'Первый показатель — процент простых мячей, которые остаются в корте без спасения кистью. Второй — способность прочитать стекло и вернуть мяч с контролем. Третий — позиция пары: после подачи вы успеваете занять сетку, после свечи отступаете вместе, а в центре не возникает немая борьба за один мяч. Четвёртый — качество решения: игрок понимает, когда вернуть глубоко, когда сыграть по ногам и когда не ускорять.' },
        { type: 'image', media: articleMedia.levelsScale.id, alt: 'Абстрактная шкала прогресса уровня игрока в паделе', caption: 'Шкала полезна как ориентир, но уровень подтверждается повторяемыми действиями на корте.' },
        { type: 'heading', text: 'Lunda: девять ступеней от 1.0 до 7.0' },
        { type: 'paragraph', text: 'В Lunda рейтинг строится на результатах игр и может подтверждаться или корректироваться сертифицированным тренером. Важна не только победа, но и уровень соперников, качество техники и тактика. На шкале есть девять рабочих диапазонов:' },
        { type: 'list', items: ['1.0–1.49 — абсолютный новичок: правила и стены ещё непривычны, движения хаотичны;', '1.5–1.99 — новичок: хват закрепляется, примерно половина ударов достигает цели;', '2.0–2.49 — развивающийся игрок: появляются базовые удары и выход к сетке;', '2.5–2.99 — любитель: свеча становится рабочей, около 60% ударов под контролем;', '3.0–3.49 — средний любитель: стабильная задняя линия и растущий тактический набор;', '3.5–3.99 — опытный любитель: уверенная сетка, бандеха и понимание игры в паре;', '4.0–4.74 — продвинутый игрок: глубина, направление, вращение и полный атакующий набор;', '4.75–5.49 — полупрофессионал: быстрые реакции и сильные локальные турниры;', '5.5–7.0 — профессионал: полный арсенал, высокий темп и уровень FIP или Premier Padel.'] },
        { type: 'image', media: articleMedia.levelsMatch.id, alt: 'Парная игра в падел на любительском уровне', caption: 'Рейтинг полезен тогда, когда помогает находить соперников для равного матча.' },
        { type: 'heading', text: 'Padelapp.club: рейтинг как часть игровой экосистемы' },
        { type: 'paragraph', text: 'У Padelapp.club акцент сделан на практическом использовании рейтинга: игроки могут находить партнёров по уровню, создавать открытые матчи, участвовать в рейтинговых играх и видеть историю. Для самооценки это означает простой принцип: не угадывать цифру по одному матчу, а накопить историю игр и смотреть, против кого и в каком формате получаются стабильные результаты. Если клуб использует собственные категории турниров, их нужно уточнять у организатора.' },
        { type: 'heading', text: 'Как поставить себе честный стартовый уровень' },
        { type: 'paragraph', text: 'Сыграйте несколько матчей с разными партнёрами, отдельно отметьте приём подачи, игру после стекла и движение у сетки. Если игрок находится между двумя описаниями Lunda, разумнее взять нижнее. Это не занижение, а рабочая точка: равные матчи дают больше полезных розыгрышей, а рост становится заметен в истории. В обсуждениях на Reddit опытные игроки также советуют не завышать себя по прошлому теннисному или фитнес-опыту — падельная позиция и чтение стен требуют отдельной практики.' },
        { type: 'image', media: articleMedia.levelsCoachV2.id, alt: 'Тренер объясняет игроку тактическую поправку после розыгрыша', caption: 'Хорошая оценка заканчивается не только числом, но и следующим конкретным навыком.' },
        { type: 'paragraph', text: 'Тренерская оценка особенно полезна, когда цифра расходится с ощущением. Тренер видит повторяемость, момент контакта и выбор позиции, которые трудно заметить самому. После такой проверки у игрока должен появиться не абстрактный ярлык, а план: стабилизировать приём, научиться играть от стекла, синхронизироваться с партнёром или добавить один надёжный атакующий удар.' },
        { type: 'heading', text: 'Не путайте рейтинг и игровую форму' },
        { type: 'paragraph', text: 'Рейтинг отражает историю, а матч показывает сегодняшний день. После перерыва игрок может временно двигаться хуже, а после серии тренировок — играть заметно увереннее, чем подсказывает старое число. Это нормально. Полезнее смотреть на тренд нескольких игр, чем пытаться каждый вечер доказать себе новый уровень.' },
        { type: 'paragraph', text: 'Есть и обратная ловушка: победа над более слабой парой иногда создаёт ощущение большого прогресса, хотя игрок почти не сталкивался с неудобными мячами. Настоящий тест — как он принимает давление, выдерживает длинный розыгрыш, играет после стекла и принимает решение, когда привычный удар не работает. Именно эти эпизоды стоит обсуждать с тренером.' },
        { type: 'heading', text: 'Мини-тест перед выбором уровня' },
        { type: 'list', items: ['10 подач: сколько вошло в нужную зону и сколько сразу отдало атаку;', '10 приёмов: сколько удалось вернуть без высокого подарочного мяча;', '10 мячей после стекла: умеете ли сохранить направление и глубину;', '5 розыгрышей у сетки: двигаетесь ли вместе с партнёром;', '3 концовки: что происходит с техникой при счёте 30:30 и выше.'] },
        { type: 'paragraph', text: 'Такой тест не заменяет рейтинг, но помогает говорить о нём конкретно. Вместо фразы игрок 3.5 можно сказать: стабильная задняя линия, свеча работает, стекло читается через раз, у сетки позиция пока распадается. Это описание полезнее для тренера и партнёров, потому что сразу показывает следующий шаг.' },
        { type: 'paragraph', text: 'Важно фиксировать условия, в которых проходил тест: покрытие, формат игры, уровень соперников и длительность паузы. Игрок, который уверенно выглядит в дружеском матче на знакомом корте, может пока теряться в открытой игре с быстрым темпом. Это не противоречие, а нормальная разница между комфортной и соревновательной средой.' },
        { type: 'paragraph', text: 'Уровень также меняется неравномерно. Сначала быстро растёт способность удерживать мяч, затем прогресс замедляется, потому что требуется больше тактики и устойчивости под давлением. На этом этапе полезнее не искать новый ярлык, а выбрать одну измеримую задачу на месяц: приём, игру после стекла, синхронное движение или качество удара над головой.' },
        articleAuthor(),
      ]),
    }

    for (const [index, article] of editorialArticles.entries()) {
      const previousSeedKey = article.seedKey.replace(/-v5$/, '-v4')
      await migrateSeededArticle(payload, previousSeedKey, article.seedKey, {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        category: categories.get(article.category)?.id,
        previewImage: article.previewImage,
        readingTimeMinutes: article.readingTimeMinutes,
        publishedAt: new Date(Date.UTC(2026, 8, 18, 12, index)).toISOString(),
        content: sourceEditorialContent[article.slug] ?? rewrittenContent[article.slug] ?? article.content,
        seo: article.seo,
      })
    }

    const currentTournamentDefaults = await payload.findGlobal({ slug: 'tournament-defaults', draft: true, depth: 0, overrideAccess: true, showHiddenFields: true } as never) as unknown as Record<string, unknown>
    if (currentTournamentDefaults.seedVersion === seedVersion) stats.skipped += 1
    else {
      assertGlobalCanBeSeeded('tournament-defaults', currentTournamentDefaults)
      await payload.updateGlobal({ slug: 'tournament-defaults', draft: false, overrideAccess: true, data: { ...tournamentDefaultContent, seedVersion, _status: 'published' } as never })
      stats.globalsPublished += 1
    }

    const americanoPlayers = ['Максим Воронов', 'Анна Кузнецова', 'Денис Соколов', 'Екатерина Морозова', 'Артём Лебедев', 'Полина Новикова', 'Михаил Белов', 'София Павлова', 'Роман Орлов', 'Дарья Смирнова', 'Кирилл Фёдоров', 'Елена Попова']
    const americanoParticipants = americanoPlayers.map((name) => ({ name, level: '2.0', status: 'confirmed' }))
    const americanoStandings = [
      ['Максим Воронов', 142, '+38', 'Золотой кубок'], ['Екатерина Морозова', 136, '+26', 'Серебряный призёр'],
      ['Артём Лебедев', 131, '+18', 'Бронзовый призёр'], ['Анна Кузнецова', 125, '+12', null],
      ['Михаил Белов', 119, '+4', null], ['Полина Новикова', 114, '-2', null], ['Денис Соколов', 108, '-14', null],
      ['София Павлова', 102, '-22', null], ['Роман Орлов', 98, '-28', null], ['Дарья Смирнова', 94, '-32', null],
    ].map(([name, points, difference, award]) => ({ name, matches: 7, points, difference, award }))
    const pairs = [
      ['М. Воронов', 'А. Кузнецов'], ['Д. Соколов', 'И. Васильев'], ['А. Лебедев', 'К. Фёдоров'],
      ['Р. Орлов', 'С. Медведев'], ['М. Белов', 'П. Новиков'], ['Е. Морозов', 'О. Ильин'],
    ]
    const pairParticipants = pairs.map(([name, partnerName]) => ({ name, partnerName, level: '4.0', status: 'confirmed' }))
    const pairStandings = pairs.slice(0, 5).map(([name, partnerName], index) => ({
      name, partnerName, matches: 5, points: 15 - index * 3, difference: ['+24', '+16', '+8', '-4', '-18'][index], award: ['Чемпионы', 'Финалисты', '3-е место'][index] ?? null,
    }))
    const tournaments = [
      {
        slug: 'americano', title: 'Game Party / Americano', lifecycle: 'active', startsAt: '2026-09-20T16:30:00.000Z', endsAt: '2026-09-20T19:30:00.000Z',
        levelFrom: '2.0', levelTo: '2.0', format: 'americano', participantMode: 'players', totalSlots: 16, participants: americanoParticipants, standings: americanoStandings,
        entryFee: '2 500 ₽ / участник', description: 'Самый душевный формат для знакомства с игроками клуба. Музыкальный сет, питьевая вода и динамичные матчи.',
        prizeLabel: 'Стоимость за участника', prize: '2 500 ₽', visualStyle: 'image', image: mediaID(images.tournamentParty),
        prizes: [
          { title: 'Победитель Americano', reward: 'Золотой кубок + 15 000 ₽', description: 'Кубок клуба, памятная медаль и сертификат Bullpadel.' },
          { title: 'Серебряный призёр', reward: 'Серебряная медаль + 10 000 ₽', description: 'Клубный мерч и комплект турнирных мячей Bullpadel Gold.' },
          { title: 'Бронзовый призёр', reward: 'Бронзовая медаль + 5 000 ₽', description: 'Сертификат в клубное кафе и памятный сувенир турнира.' },
        ],
        imageOverlay: 'overlay-dark', icon: 'PartyPopper', regulation: richText('Регистрация закрывается за 2 часа до начала. Формат — Americano со сменой напарников каждый сет. На матч приезжайте за 15 минут до старта.'),
      },
      {
        slug: 'open-league', title: 'Unlim Riga Masters Cup', lifecycle: 'finished', startsAt: '2026-03-14T08:00:00.000Z', endsAt: '2026-03-14T14:00:00.000Z',
        levelFrom: '4.0', levelTo: '4.0', format: 'groups-knockout', participantMode: 'pairs', totalSlots: 8, participants: pairParticipants, standings: pairStandings,
        entryFee: 'Взнос: 4 500 ₽ / пара', description: 'Рейтинговый кубок для опытных пар с розыгрышем клубных призов, кубков и медалей от наших партнеров Bullpadel.',
        prizeLabel: 'Призовой фонд', prize: '80 000 ₽', prizes: [
          { title: 'Чемпионы турнира', reward: 'Кубок чемпионов + 50 000 ₽', description: 'Главный кубок соревнований, золотые медали и ценные призы.' },
          { title: 'Финалисты кубка', reward: 'Серебряные медали + 25 000 ₽', description: 'Серебряные медали и сертификаты на тренировки в клубе.' },
          { title: 'Призёры кубка', reward: 'Бронзовые медали + 15 000 ₽', description: 'Бронзовые медали турнира и фирменные аксессуары.' },
        ], visualStyle: 'mesh', meshStyle: 'deep-blue', icon: 'Trophy', regulation: richText('Участники играют групповой этап, затем проходят в олимпийскую сетку. Пара должна быть на месте за 30 минут до начала. Победитель определяется по сумме выигранных геймов.'),
      },
      {
        slug: 'junior-cup', title: "Women's Morning Cup", lifecycle: 'finished', startsAt: '2026-03-15T07:30:00.000Z', endsAt: '2026-03-15T12:30:00.000Z',
        levelFrom: '2.0', levelTo: '2.0', format: 'round-robin-playoff', participantMode: 'pairs', totalSlots: 8, participants: [], standings: [],
        entryFee: 'Взнос: 3 500 ₽ / пара', description: 'Элегантный женский турнир в непринужденной атмосфере: игристое безалкогольное, подарки от бьюти-партнеров и памятные фото.',
        prizeLabel: 'Призовой фонд', prize: '50 000 ₽', prizes: [], visualStyle: 'mesh', meshStyle: 'lavender', icon: 'Medal', regulation: richText('Формат Round Robin с финальным плей-офф. Все пары проходят общий групповой этап. Регистрация подтверждается после внесения взноса.'),
      },
    ]
    for (const [index, tournament] of tournaments.entries()) {
      const facets = [
        { action: { label: 'Записаться', mode: 'booking' } },
        { action: { label: 'Турнир завершён', mode: 'none' } },
        { action: { label: 'Турнир завершён', mode: 'none' } },
      ][index]
      const seededTournament = await ensureSeeded(payload, 'tournaments', `prototype:tournament:${tournament.slug}`, {
        ...tournament,
        ...facets,
        showOnHomepage: true,
        homepageOrder: index + 1,
        useClubCoordinatorContacts: true,
        useDefaultChecklist: true,
        useDefaultPerks: true,
        useDefaultMatchday: true,
        useDefaultFaq: true,
        seo: { robots: 'index-follow' },
      })
      await fillMissingSeededFields(payload, 'tournaments', seededTournament.id, {
        ...tournament,
        ...facets,
        useClubCoordinatorContacts: true,
        useDefaultChecklist: true,
        useDefaultPerks: true,
        useDefaultMatchday: true,
        useDefaultFaq: true,
      })
      await fillMissingSeededFields(payload, 'tournaments', seededTournament.id, { regulation: tournament.regulation })
      await migrateSeededField(payload, 'tournaments', seededTournament.id, 'action', { label: null, mode: 'none', href: null }, facets.action)
      if (index > 0) await migrateSeededField(payload, 'tournaments', seededTournament.id, 'lifecycle', 'upcoming', 'finished')
      if (index === 0) {
        const doc = await payload.findByID({ collection: 'tournaments', id: seededTournament.id, depth: 0, overrideAccess: true, showHiddenFields: true } as never) as unknown as Record<string, unknown>
        if (typeof doc.description === 'string' && doc.description.includes('фруктовый')) {
          await payload.update({ collection: 'tournaments', id: seededTournament.id, data: { description: tournament.description, _status: 'published' }, draft: false, depth: 0, overrideAccess: true } as never)
        }
      }
    }

    const courts = [
      {
        slug: 'panoramic', title: 'Корты JUBO Super Panoramic', eyebrow: 'JUBO Padel · Super Panoramic', cardVariant: 'panoramic',
        description: 'В клубе установлены корты JUBO Padel Super Panoramic — технологичная панорамная система для открытой видимости игры. 12 мм закалённого стекла без массивных угловых рам и стоек — стабильная игра от стен на любой скорости мяча. Проектируем и монтируем корты JUBO под ключ по России.',
      },
      {
        slug: 'metrics', title: 'Характеристики кортов', cardVariant: 'metrics',
        metrics: [
          { value: '11.5 м', label: 'Высота потолка', icon: 'PanelTop' },
          { value: '+21°C', label: 'Температура в зале', icon: 'Lightbulb' },
          { value: '350 Lux', label: 'Flicker-free свет', icon: 'Activity' },
          { value: '3', label: 'Панорамных корта', icon: 'Layers3' },
        ],
      },
      {
        slug: 'damping', title: 'Чистый отскок. Меньше вибраций', eyebrow: 'Демпферная система', cardVariant: 'damping',
        description: 'Неопреновые демпферы между стеклом и металлом гасят удары конструкции — мяч ведёт себя предсказуемо.',
      },
      {
        slug: 'surface', title: 'Профессиональное покрытие PRO TURF 240', eyebrow: 'PRO TURF 240', cardVariant: 'surface',
        description: 'Профессиональное покрытие PRO TURF 240 с оптимальным сцеплением и предсказуемым отскоком мяча.',
      },
    ]
    for (const [index, court] of courts.entries()) {
      const seededCourt = await ensureSeeded(payload, 'courts', `prototype:court:${court.slug}`, {
        ...court, isActive: true, showOnHomepage: true, homepageOrder: index + 1, seo: { robots: 'index-follow' },
      })
      if (court.slug === 'panoramic') {
        await migrateSeededField(payload, 'courts', seededCourt.id, 'title', 'Панорамное остекление', court.title)
        await migrateSeededField(payload, 'courts', seededCourt.id, 'eyebrow', 'Jubo Super Panoramic', court.eyebrow)
        await migrateSeededField(payload, 'courts', seededCourt.id, 'description', '12 мм закалённого стекла без массивных угловых рам и стоек — стабильная игра от стен на любой скорости мяча.', court.description)
      }
      if (court.slug === 'surface') {
        await migrateSeededField(payload, 'courts', seededCourt.id, 'title', 'Официальное покрытие World Padel Tour', court.title)
        await migrateSeededField(payload, 'courts', seededCourt.id, 'eyebrow', 'Mondo XN', court.eyebrow)
        await migrateSeededField(payload, 'courts', seededCourt.id, 'description', 'Моноволоконное покрытие с оптимальным сцеплением — то же, что используется на турнирах тура.', court.description)
      }
    }

    const rentalRates = [
      {
        key: 'day', title: 'Утро и поздний вечер', eyebrow: 'Выгодные часы', timeLabel: '07:00–09:00 / 21:00–23:00',
        description: 'Спокойные часы для самостоятельной игры, отработки техники и матчей вне основного времени клуба.',
        price: 3500, priceLabel: 'стоимость', priceSuffix: '/ час', badge: 'Выгодно', badgeTone: 'lime', cardVariant: 'rate',
      },
      {
        key: 'prime', title: 'Прайм-тайм', eyebrow: 'Основное время', timeLabel: '09:00–21:00',
        description: 'Основное время клуба для игр с друзьями, регулярных матчей и самой насыщенной клубной атмосферы.',
        price: 5000, priceLabel: 'стоимость', priceSuffix: '/ час', badge: 'Популярно', badgeTone: 'sunset', cardVariant: 'rate',
      },
      {
        key: 'trial', title: 'Пробная тренировка за 1 990 ₽', eyebrow: 'Специальное предложение',
        description: '60 минут индивидуального внимания тренера + корт + профессиональная ракетка включены.',
        price: 1990, priceLabel: 'стоимость', cardVariant: 'trial', meshTone: 'deep-blue',
        action: { label: 'Записаться на пробную', mode: 'trial-booking' },
      },
      {
        key: 'standards', title: 'Стандарты Unlim Riga', eyebrow: 'Премиальный сервис', timeLabel: 'Включено в стоимость аренды',
        description: 'Никаких скрытых доплат. Каждый визит в клуб организован по стандарту премиального спортивного курорта.',
        cardVariant: 'standards', meshTone: 'dark',
        includedItems: [
          { text: 'Ракетки и мячи без ограничений' }, { text: 'Полотенца и артезианская вода' },
          { text: 'Комфортные раздевалки и душ' }, { text: 'Лаунж-пространство с кофе' }, { text: 'Фотозона с пьедесталом' },
        ],
        action: { label: 'Забронировать корт сейчас', mode: 'booking' },
      },
    ]
    for (const [index, rate] of rentalRates.entries()) {
      const { key, ...data } = rate
      const seededRate = await ensureSeeded(payload, 'rental-rates', `prototype:rental-rate:${key}`, {
        ...data, isActive: true, showOnHomepage: true, homepageOrder: index + 1,
      })
      if (key === 'day') {
        await migrateSeededField(payload, 'rental-rates', seededRate.id, 'title', 'Будни', data.title)
        await migrateSeededField(payload, 'rental-rates', seededRate.id, 'eyebrow', 'Дневные часы', data.eyebrow)
        await migrateSeededField(payload, 'rental-rates', seededRate.id, 'timeLabel', '08:00–17:00', data.timeLabel)
        await migrateSeededField(payload, 'rental-rates', seededRate.id, 'description', 'Идеальное время для спокойной тренировки, отработки подачи и игры в светлое время суток без лишней суеты.', data.description)
      }
      if (key === 'prime') {
        await migrateSeededField(payload, 'rental-rates', seededRate.id, 'title', 'Вечер и выходные', data.title)
        await migrateSeededField(payload, 'rental-rates', seededRate.id, 'eyebrow', 'Прайм-тайм', data.eyebrow)
        await migrateSeededField(payload, 'rental-rates', seededRate.id, 'timeLabel', '17:00–23:00, Сб–Вс целый день', data.timeLabel)
        await migrateSeededField(payload, 'rental-rates', seededRate.id, 'description', 'Самая клубная атмосфера, музыка, открытый лаунж-бар и динамичные матчи с резидентами клуба.', data.description)
        await migrateSeededField(payload, 'rental-rates', seededRate.id, 'price', 5500, data.price)
      }
    }

    const trainingPrograms = [
      {
        slug: 'individual', title: 'Индивидуальная', badge: '1 на 1', image: mediaID(images.trainingIndividual), overlay: 'overlay-blue', icon: 'User', priceFrom: 4900,
        description: 'Персональная программа под ваш уровень: техника, тактика и разбор ошибок один на один с тренером.',
      },
      {
        slug: 'group', title: 'Групповая', badge: 'До 4-х', image: mediaID(images.trainingGroup), overlay: 'overlay-lime', icon: 'Users', priceFrom: 2900,
        description: 'Динамичные сборы с игроками похожего уровня — тактика в паре и живая соревновательная атмосфера.',
      },
      {
        slug: 'kids', title: 'Детская', badge: 'От 5 лет', image: mediaID(images.trainingKids), overlay: 'overlay-violet', icon: 'Baby', priceFrom: 2500,
        description: 'Игровой формат обучения: базовая техника, координация и первые матчи в компании сверстников.',
      },
    ]
    for (const [index, program] of trainingPrograms.entries()) {
      await ensureSeeded(payload, 'training-programs', `prototype:training:${program.slug}`, {
        ...program, action: { mode: 'booking' }, isActive: true, showOnHomepage: true, homepageOrder: index + 1,
        seo: { robots: 'index-follow' },
      })
    }

    const membershipBenefits = (validityDays: number) => [
      { text: 'Любой открытый корт' },
      { text: `Срок действия — ${validityDays} дней` },
      { text: 'Перенос игр без сгорания' },
      { text: 'Заморозка до 14 дней' },
      { text: 'Доп. бонусы в системе лояльности' },
    ]
    const memberships = [
      { key: 'rental-hours-s', title: '8 часов', badge: 'S', badgeTone: 'muted', description: 'Только для аренды корта', cardVariant: 'package', priceLabel: '5%', benefits: membershipBenefits(20) },
      { key: 'rental-hours-m', title: '12 часов', badge: 'M', badgeTone: 'muted', description: 'Только для аренды корта', cardVariant: 'package', priceLabel: '7%', benefits: membershipBenefits(30) },
      { key: 'rental-hours-l', title: '16 часов', badge: 'L', badgeTone: 'lime-soft', description: 'Только для аренды корта', cardVariant: 'featured-package', priceLabel: '10%', benefits: membershipBenefits(40) },
      { key: 'rental-hours-xl', title: '24 часа', badge: 'XL', badgeTone: 'gold', description: 'Только для аренды корта', cardVariant: 'resident', meshTone: 'dark', priceLabel: '12%', benefits: membershipBenefits(60) },
    ]
    for (const legacyKey of ['gift', 's', 'm', 'resident']) {
      const legacy = await findBySeedKey(payload, 'memberships', `prototype:membership:${legacyKey}`)
      if (legacy && (legacy.isActive !== false || legacy.showOnHomepage !== false || legacy.homepageOrder != null)) {
        await payload.update({ collection: 'memberships', id: legacy.id, data: { isActive: false, showOnHomepage: false, homepageOrder: null, _status: 'published' }, draft: false, depth: 0, overrideAccess: true } as never)
      }
    }
    for (const [index, membership] of memberships.entries()) {
      const { key, ...data } = membership
      const action = { href: null, label: key === 'gift' ? 'Оформить сертификат' : 'Оставить заявку', mode: 'lead-form', leadType: key === 'gift' ? 'gift' : 'membership' }
      const seededMembership = await ensureSeeded(payload, 'memberships', `prototype:membership:${key}`, {
        ...data, action, isActive: true, showOnHomepage: true, homepageOrder: index + 1,
      })
      const legacyTitle = { 'rental-hours-s': '[S] 8 часов', 'rental-hours-m': '[M] 12 часов', 'rental-hours-l': '[L] 16 часов', 'rental-hours-xl': '[XL] 24 часа' }[key]
      if (legacyTitle) await migrateSeededField(payload, 'memberships', seededMembership.id, 'title', legacyTitle, data.title)
      await migrateSeededField(payload, 'memberships', seededMembership.id, 'badge', null, data.badge)
      await migrateSeededField(payload, 'memberships', seededMembership.id, 'badge', `[${data.badge}]`, data.badge)
      await migrateSeededField(payload, 'memberships', seededMembership.id, 'badgeTone', null, data.badgeTone)
      await migrateSeededMembershipAction(payload, seededMembership.id, action)
    }

    for (const [index, source] of images.gallery.entries()) {
      const seededGallery = await ensureSeeded(payload, 'gallery-items', `prototype:gallery:${index + 1}`, {
        title: `Жизнь клуба ${index + 1}`,
        media: mediaID(source),
        isActive: true,
        showOnHomepage: true,
        homepageOrder: index + 1,
      })
      const placements = { galleryPageOrder: index + 1, showOnCourtsPage: true, courtsPageOrder: index + 1, showOnAboutPage: index < 6, ...(index < 6 ? { aboutPageOrder: index + 1 } : {}) }
      await initializeSeededGalleryPlacement(payload, seededGallery.id, placements)
    }

    const reviews = [
      ['Ирина Ковалёва', 'Резидент клуба · Средний уровень', 5, 'Хожу в Unlim почти год — лучшие корты в городе по свету и покрытию. Тренеры реально разбирают технику, а не просто перекидывают мячи.'],
      ['Дмитрий Раков', 'Абонемент M · Продолжающий', 5, 'Записался на пробную тренировку случайно, теперь играю трижды в неделю. Отдельный респект за лаунж-зону и кофе после игры.'],
      ['Анна Светлова', 'Групповые тренировки · Новичок', 4, 'Пришла без опыта, было страшно. Надя за месяц поставила базовую технику так, что уже не стыдно выходить с друзьями.'],
      ['Павел Иноземцев', 'Резидент клуба · Турнирный уровень', 5, 'Играю в лиге второй сезон подряд. Организация турниров на уровне: расписание, судейство, призы — всё чётко.'],
      ['Ксения Морозова', 'Детская группа · Родитель', 5, 'Сын занимается у Веры с 6 лет, ждёт тренировки как праздник. Спокойная атмосфера, тренер умеет держать группу детей.'],
      ['Игорь Ланской', 'Аренда корта · Средний уровень', 4, 'Бронирую вечерние слоты по пятницам — всегда чисто, есть свежие мячи и полотенца. Парковка рядом со входом решает.'],
    ] as const
    for (const [index, [authorName, authorMeta, rating, text]] of reviews.entries()) {
      await ensureSeeded(payload, 'reviews', `prototype:review:${index + 1}`, {
        authorName, authorMeta, rating, text, avatar: mediaID(images.reviewAvatars[index]), source: 'club',
        isActive: true, showOnHomepage: true, homepageOrder: index + 1,
      })
    }

    const faqs = [
      ['Нужен ли опыт для первого визита?', 'Нет. Пробная тренировка рассчитана на новичков: тренер объясняет базовые правила, хватку и безопасность на корте перед первой игрой.'],
      ['Нужна ли своя экипировка?', 'Нет, ракетка и мячи включены в стоимость аренды и тренировок. Достаточно прийти в удобной спортивной обуви без чёрной подошвы.'],
      ['Можно ли арендовать ракетку отдельно?', 'Да, на ресепшене есть парк ракеток разного баланса — от лёгких для новичков до турнирных моделей Varlion.'],
      ['Как отменить или перенести бронирование?', 'Отмена или перенос бронирования возможны не позднее чем за 12 часов до начала занятия.'],
      ['С какого возраста дети могут заниматься?', 'Детские группы работают с 5 лет. Тренер оценивает уровень на первом занятии и подбирает подходящую группу.'],
      ['Можно ли выбрать конкретного тренера?', 'Да, при бронировании тренировки можно указать тренера. Если он занят, методист поможет подобрать замену со схожей специализацией.'],
      ['Есть ли парковка у клуба?', 'Да, бесплатная парковка на 40 машиномест прямо у входа, дополнительно — стойки для велосипедов.'],
      ['Как попасть на турниры клуба?', 'Регистрация открывается за 2–3 недели до старта в разделе «Турниры» и в клубном чате. Количество пар ограничено.'],
    ] as const
    for (const [index, [question, answer]] of faqs.entries()) {
      const seededFaq = await ensureSeeded(payload, 'faqs', `prototype:faq:${index + 1}`, {
        question, answer, isActive: true, showOnHomepage: true, homepageOrder: index + 1,
      })
      if (index === 3) await migrateSeededField(payload, 'faqs', seededFaq.id, 'answer', 'Бесплатная отмена возможна за 6 часов до начала слота через личный кабинет или по телефону клуба. Позже — списывается 50% стоимости.', answer)
    }

    for (const [index, name] of ['Varlion', 'Head Padel', 'Wilson', 'Babolat', 'Mondo', 'Jubo', 'Adidas Padel', 'Nox'].entries()) {
      await ensureSeeded(payload, 'partners', `prototype:partner:${name.toLowerCase().replaceAll(' ', '-')}`, {
        name, isActive: true, showOnHomepage: true, homepageOrder: index + 1,
      })
    }

    const catalogGlobals = [
      {
        slug: 'blog-page' as const,
        eyebrow: 'Медиа',
        title: 'Блог и статьи',
        intro: 'Практические материалы о паделе, тренировках, экипировке и восстановлении от команды клуба.',
        seoTitle: 'Блог о паделе — UNLIM RIGA PADEL',
        seoDescription: 'Статьи о паделе, тренировках, экипировке и подготовке к турнирам от команды UNLIM RIGA PADEL.',
      },
      {
        slug: 'coaches-page' as const,
        eyebrow: 'Команда',
        title: 'Тренеры',
        intro: 'Выберите тренера по уровню, направлению подготовки и языку — от первого занятия до турниров.',
        seoTitle: 'Тренеры по падел теннису в Москве — Unlim Riga Padel',
        seoDescription: 'Тренеры по падел-теннису в UNLIM RIGA PADEL: занятия для новичков, продолжающих и детей, подбор программы и тренировки на Новой Риге.',
      },
      {
        slug: 'tournaments-page' as const,
        eyebrow: 'Соревнования',
        title: 'Турниры и лиги',
        intro: 'Клубные игры, рейтинговые кубки и открытые турниры для разных уровней подготовки.',
        seoTitle: 'Турниры по паделу — UNLIM RIGA PADEL',
        seoDescription: 'Турниры и лиги по паделу в Москве и на Новой Риге для новичков, продолжающих и игроков турнирного уровня.',
      },
    ]
    for (const page of catalogGlobals) {
      const current = await payload.findGlobal({ slug: page.slug, draft: true, depth: 0, overrideAccess: true, showHiddenFields: true })
      if (current.seedVersion === seedVersion) {
        stats.skipped += 1
        if (current.heroGrayscale == null) {
          await payload.updateGlobal({ slug: page.slug, draft: false, overrideAccess: true, data: { heroImage: heroMediaFor(page.slug)?.id, heroGrayscale: true } as never })
          stats.globalsPublished += 1
        } else if (current.heroImage == null) {
          await payload.updateGlobal({ slug: page.slug, draft: false, overrideAccess: true, data: { heroImage: heroMediaFor(page.slug)?.id } as never })
          stats.globalsPublished += 1
        }
      } else {
        assertGlobalCanBeSeeded(page.slug, current)
        await payload.updateGlobal({ slug: page.slug, draft: false, overrideAccess: true, data: {
          seedVersion, _status: 'published', eyebrow: page.eyebrow, title: page.title, intro: page.intro,
          heroImage: heroMediaFor(page.slug)?.id, heroGrayscale: true,
          seo: { title: page.seoTitle, description: page.seoDescription ?? page.intro, robots: 'index-follow' },
        } as never })
        stats.globalsPublished += 1
      }
    }

    const giftFormatsSeed = [
      {
        formatId: 'box', badge: 'Физический бокс', title: 'Подарочный бокс', image: giftMedia.box.id,
        features: [
          { text: 'Премиальный матовый кейс и тиснёная пластиковая карта' },
          { text: 'Брендовая лента и дизайнерская открытка с пожеланием' },
          { text: 'Самовывоз на ресепшн клуба или доставка курьером по Москве' },
          { text: 'Идеально подходит для личного торжественного вручения' },
        ],
        buttonText: 'Выбрать бокс', buttonSelectedText: 'Выбран бокс',
      },
      {
        formatId: 'digital', badge: 'Электронный PDF', title: 'Электронный сертификат', image: giftMedia.card.id,
        features: [
          { text: 'Согласование и отправка менеджером в Telegram или на Email' },
          { text: 'Персональный QR-код и номер для мгновенной активации' },
          { text: 'Стильный клубный PDF-сертификат UNLIM PADEL' },
          { text: 'Удобный вариант, если получатель находится в другом городе' },
        ],
        buttonText: 'Выбрать PDF', buttonSelectedText: 'Выбран PDF',
      },
    ]
    const giftTermsSeed = [
      { title: 'Срок действия 365 дней', text: 'Сертификат действует целый год с момента оформления для свободного выбора удобного времени.', icon: 'CalendarCheck' },
      { title: 'Несгораемый баланс', text: 'Остаток средств не сгорает после игры, а сохраняется на личном счёте для следующих визитов.', icon: 'ShieldCheck' },
      { title: 'Любые услуги клуба', text: 'Номинал можно потратить на аренду кортов, персональные или групповые занятия и участие в турнирах.', icon: 'Layers' },
      { title: 'Экипировка Varlion включена', text: 'Профессиональные ракетки Varlion и турнирные мячи бесплатно предоставляются на каждую игру.', icon: 'PackageCheck' },
      { title: 'На предъявителя', text: 'Сертификат можно свободно передавать друзьям, коллегам или членам семьи без переоформления.', icon: 'Users' },
      { title: 'Предварительное бронирование', text: 'Дата и время корта или тренера согласуются заранее с администратором клуба под ваше расписание.', icon: 'ClipboardCheck' },
    ]
    const giftFormSeed = {
      sectionTitle: 'Оформить подарочный сертификат',
      sectionCopy: 'Оставьте контакты — менеджер клуба свяжется с вами в течение 5 минут для согласования деталей, проведения оплаты и отправки сертификата.',
      channelLabel: 'Связаться в', telegramLabel: 'Telegram', phoneLabel: 'Телефон', vkLabel: 'ВКонтакте',
      formatLabel: 'Формат сертификата', purposeLabel: 'Направление или номинал', namePlaceholder: 'Ваше имя',
      contactPhonePlaceholder: '+7 (___) ___-__-__', contactTelegramPlaceholder: 'Telegram @username', contactVKPlaceholder: 'Профиль VK (vk.com/id)',
      recipientPlaceholder: 'Кому подарок (для именного сертификата)', commentPlaceholder: 'Пожелание или комментарий к заказу...',
      consentLabel: 'Согласие на обработку персональных данных (текст требует юридического согласования)', policyLabel: 'политика конфиденциальности',
      submitLabel: 'Получить сертификат', successTitle: 'Заявка успешно отправлена!',
      successText: 'Менеджер клуба свяжется с вами в течение 5 минут для согласования и проведения оплаты.', resubmitLabel: 'Оформить ещё один сертификат',
    }

    const thematicGlobals = [
      {
        slug: 'prices-page' as const, data: {
          eyebrow: 'Тарифы', title: 'Цены и абонементы', intro: 'Выберите формат игры: разовая аренда корта или абонемент на нужное количество часов.',
          rentTabLabel: 'Аренда', trainingTabLabel: 'Тренировки', membershipsTabLabel: 'Абонементы',
          rules: [
            { title: 'Бронирование', content: richText('Стоимость фиксируется при бронировании. Инвентарь и базовый клубный сервис включены согласно выбранному тарифу.') },
            { title: 'Отмена и перенос', content: richText('Отмена или перенос бронирования возможны не позднее чем за 12 часов до начала занятия.') },
          ],
          seo: { title: 'Цены на падел корт — Москва, Красногорск, Новая Рига', description: 'Цены на падел в Москве, Красногорске и на Новой Риге: аренда панорамного корта в обычные и выгодные часы, а также клубные абонементы.', robots: 'index-follow' },
        },
      },
      {
        slug: 'training-page' as const, data: {
          eyebrow: 'Обучение', title: 'Тренировки по паделу', intro: 'Программы для первого знакомства с паделом, регулярного прогресса и подготовки к турнирам.',
          infographicEyebrow: 'Методика UNLIM',
          infographicTitle: 'Понятный путь от первого удара до уверенной игры',
          programsEyebrow: 'Программы',
          programsTitle: 'Форматы тренировок',
          blocks: [
            { title: 'Программа под ваш уровень', body: 'Тренер оценивает технику и формирует понятный план развития.', icon: 'Target' },
            { title: 'Удобное расписание', body: 'Индивидуальные и групповые занятия доступны в разные часы клуба.', icon: 'Calendar' },
            { title: 'Измеримый прогресс', body: 'Работаем над техникой, тактикой пары и уверенностью в игре.', icon: 'TrendingUp' },
          ],
          coachesEyebrow: 'Команда наставников', coachesTitle: 'Тренеры клуба', coachesDesktopActionLabel: 'Все', coachesMobileActionLabel: 'Все тренеры',
          knowledgeEyebrow: 'База знаний', knowledgeTitle: 'Перед первой тренировкой',
          firstVisitTitle: 'Что нужно для первого визита', firstVisitCopy: 'Подготовьтесь без лишних покупок — основное уже есть в клубе.',
          firstVisitItems: [
            { title: 'Ракетка и мячи', body: 'Премиальные испанские ракетки Varlion и мячи включены в каждый визит — приносить свои не обязательно.', icon: 'Dumbbell' },
            { title: 'Обувь для корта', body: 'Возьмите сменные чистые кроссовки с нескользящей подошвой для падела или тенниса.', icon: 'Footprints' },
            { title: 'Раздевалки и душ', body: 'Шкафчики, полотенца, душевые и фены доступны каждому игроку без доплат.', icon: 'ShowerHead' },
            { title: 'Время прибытия', body: 'Приезжайте за 10–15 минут до занятия, чтобы спокойно переодеться и выйти на корт вовремя.', icon: 'Timer' },
          ],
          faqTitle: 'Частые вопросы', faqCopy: 'Коротко о формате занятий, прогрессе и первом визите.',
          faq: [
            { question: 'Как проходят тренировки по паделу?', answer: 'Занятие строится вокруг практики: разминки, базовых ударов, игровых ситуаций и короткого разбора с тренером.' },
            { question: 'Как выбрать формат занятий?', answer: 'Индивидуальный формат даёт больше повторений, групповой — больше игровых ситуаций. Если сомневаетесь, начните с пробного занятия.' },
            { question: 'Когда будет заметен прогресс?', answer: 'Темп зависит от исходного уровня и регулярности. Тренер корректирует программу по мере развития техники, перемещения и тактики.' },
            { question: 'Нужна ли своя экипировка?', answer: 'Нет. Для первого визита достаточно спортивной формы и чистой сменной обуви; ракетки и мячи предоставит клуб.' },
          ],
          action: { label: 'Подобрать тренировку', mode: 'trial-booking' },
          seo: { title: 'Падел тренировки в Москве — групповые, индивидуальные и для детей', description: 'Падел-тренировки в Москве и Красногорске: индивидуальные и групповые занятия, детские секции от 5 лет, пробная тренировка и подготовка к турнирам.', robots: 'index-follow' },
        },
      },
      {
        slug: 'gift-page' as const, data: {
          eyebrow: 'Подарочный сертификат', title: 'Подарочный сертификат на падел в Москве', intro: 'Подарите динамичную игру и эмоции в UNLIM RIGA PADEL: аренда кортов Jubo, тренировки с тренером и ракетки Varlion.',
          offerEyebrow: 'Подарок-впечатление', offerTitle: 'На что можно потратить сертификат', offerCopy: 'Получатель сам выбирает формат: игра с друзьями, урок с тренером или тест-драйв ракеток Varlion.',
          formatsTitle: 'Форматы вручения', formatsCopy: 'Премиальный бокс для личного вручения или электронный PDF с доставкой в мессенджер.',
          termsTitle: 'Условия и правила', termsCopy: 'Понятные правила действия сертификата без скрытых условий.',
          benefits: [
            { badge: 'Корты Jubo', title: 'Аренда кортов', body: '3 панорамных корта Jubo Super Panoramic с профессиональным покрытием PRO TURF 240 и климат-контролем.', icon: 'Gift' },
            { badge: 'PRO-тренеры', title: 'Занятия с тренером', body: 'Персональные и сплит-тренировки с тренерами категорий PRO и Master для любого уровня.', icon: 'BadgeCheck' },
            { badge: 'Varlion Tech', title: 'Тест-драйв ракеток', body: 'Премиальные ракетки испанского бренда Varlion и мячи уже включены в каждый визит.', icon: 'CalendarCheck' },
            { badge: 'Матчи 2х2', title: 'Игра для четверых', body: 'Классический парный матч с друзьями или коллегами: азартная динамичная игра с первого розыгрыша.', icon: 'Sparkles' },
          ],
          formats: giftFormatsSeed,
          terms: giftTermsSeed,
          steps: [
            { title: 'Оставьте заявку', body: 'Сообщите администратору, для кого и к какому поводу нужен сертификат.' },
            { title: 'Выберите наполнение', body: 'Согласуйте доступный номинал или формат использования и уточните действующие условия.' },
            { title: 'Получите сертификат', body: 'Администратор подтвердит оформление и расскажет, как передать подарок получателю.' },
            { title: 'Запланируйте визит', body: 'Получатель свяжется с клубом и выберет подходящее время из доступного расписания.' },
          ],
          stepsEyebrow: 'Как это работает', stepsTitle: 'От идеи до подарка',
          article: richTextArticle([
            { type: 'heading', text: 'Подарочный сертификат в падел-клуб' },
            { type: 'paragraph', text: 'Падел подходит для совместного активного отдыха и первого знакомства с ракеточным спортом. Сертификат оставляет получателю возможность согласовать подходящий формат: игру на корте, тренировку или другой доступный клубный сценарий.' },
            { type: 'heading', text: 'Кому подойдёт такой подарок' },
            { type: 'paragraph', text: 'Сертификат можно подарить человеку без игрового опыта, любителю активного отдыха или игроку, который уже регулярно выходит на корт. Формат визита подбирается отдельно, поэтому подарок не требует заранее знать уровень подготовки или расписание получателя.' },
            { type: 'heading', text: 'Как использовать сертификат' },
            { type: 'paragraph', text: 'Перед визитом получатель связывается с клубом, сообщает данные сертификата и выбирает доступное время. Конкретный формат, срок действия, состав услуг и возможные доплаты фиксируются при оформлении и подтверждаются администратором.' },
            { type: 'heading', text: 'Почему падел запоминается' },
            { type: 'paragraph', text: 'Подарок становится поводом попробовать новую игру, провести время вместе и получить живые впечатления. Начать можно в комфортном темпе, а после первого визита — выбрать самостоятельные игры или регулярные занятия.' },
          ]),
          faqTitle: 'Частые вопросы', faq: [
            { question: 'Можно ли подарить сертификат новичку?', answer: 'Да. При записи администратор поможет выбрать доступный формат для первого знакомства с паделом.' },
            { question: 'На что можно использовать сертификат?', answer: 'Доступные варианты, включая аренду корта и занятия, согласуются при оформлении. Точный состав услуг фиксируется в условиях конкретного сертификата.' },
            { question: 'Нужно ли сразу выбирать дату?', answer: 'Обычно дату можно согласовать позже из доступного расписания. Актуальные правила администратор подтвердит до оплаты.' },
            { question: 'Как узнать срок действия и условия?', answer: 'Срок, номинал, порядок активации и возможные ограничения указываются при оформлении сертификата.' },
          ],
          form: giftFormSeed,
          action: { label: 'Оформить сертификат', mode: 'lead-form', leadType: 'gift' },
          seo: { title: 'Подарочный сертификат на падел в Москве — тренировки и аренда корта | UNLIM', description: 'Подарочный сертификат на падел в Москве: аренда панорамного корта, тренировка с тренером, электронный PDF или подарочный бокс.', socialImage: giftMedia.card.id, robots: 'index-follow' },
        },
      },
      {
        slug: 'courts-page' as const, data: {
          eyebrow: 'Инфраструктура', title: 'Панорамные корты', intro: 'Турнирная геометрия, профессиональное покрытие и контролируемый климат для стабильной игры круглый год.',
          infographicTitle: 'Корт в цифрах', infographicCopy: 'Параметры площадки и зала, которые напрямую влияют на качество игры.',
          metrics: [
            { value: '3', label: 'панорамных корта', icon: 'Layers3' }, { value: '11.5 м', label: 'высота потолка', icon: 'PanelTop' },
            { value: '350 Lux', label: 'flicker-free свет', icon: 'Lightbulb' }, { value: '+21°C', label: 'климат круглый год', icon: 'Thermometer' },
          ], seo: { title: 'Корты — UNLIM RIGA PADEL', description: 'Три панорамных корта Jubo и профессиональное покрытие PRO TURF 240.', robots: 'index-follow' },
        },
      },
      { slug: 'gallery-page' as const, data: { eyebrow: 'Сообщество', title: 'Галерея клуба', intro: 'Тренировки, турниры и повседневная жизнь UNLIM RIGA PADEL.', seo: { title: 'Галерея — UNLIM RIGA PADEL', description: 'Фотографии клуба, тренировок и турниров.', robots: 'index-follow' } } },
      {
        slug: 'about-page' as const, data: {
          eyebrow: 'О клубе', title: 'Пространство для игры и сообщества', intro: 'Мы объединили профессиональные корты, сильную тренерскую команду и атмосферу современного спортивного клуба.',
          story: richText('UNLIM RIGA PADEL создан для игроков разного уровня — от первой тренировки до клубных лиг. Пространство спроектировано вокруг качества игры, восстановления и общения.'),
          stats: [{ value: '2023', label: 'год открытия' }, { value: '3', label: 'панорамных корта' }, { value: '9', label: 'тренеров' }, { value: '2 100+', label: 'игроков клуба' }],
          seo: { title: 'О клубе — UNLIM RIGA PADEL', description: 'История, команда и инфраструктура клуба.', robots: 'index-follow' },
        },
      },
      {
        slug: 'contacts-page' as const, data: {
          eyebrow: 'Связаться', title: 'Контакты и маршрут', intro: 'Адрес, режим работы и способы связи с клубом.', directionsTitle: 'Как добраться',
          directionsText: 'Постройте маршрут по ссылке в карточке адреса. Перед первым визитом рекомендуем приехать за 15 минут.',
          arrivalNotes: [
            { title: 'На автомобиле', text: 'У входа доступна бесплатная парковка клуба.', icon: 'Car' },
            { title: 'Общественным транспортом', text: 'Ориентир — ближайшая станция и время пешком указаны в контактах.', icon: 'Train' },
            { title: 'Перед тренировкой', text: 'Приезжайте заранее для переодевания и знакомства с клубом.', icon: 'Clock' },
          ], seo: { title: 'Контакты — UNLIM RIGA PADEL', description: 'Адрес, телефон, карта и режим работы клуба.', robots: 'index-follow' },
        },
      },
      {
        slug: 'policy-page' as const, data: {
          eyebrow: 'Документы', title: 'Политика конфиденциальности', intro: 'Черновик страницы юридического документа.', approved: false,
          notice: 'Текст не согласован юристом и не предназначен для публикации как действующий документ.', content: richText('Здесь будет размещена утверждённая политика конфиденциальности.'),
          seo: { title: 'Политика конфиденциальности — UNLIM RIGA PADEL', description: 'Страница ожидает юридического согласования.', robots: 'noindex-nofollow' },
        },
      },
      {
        slug: 'oferta-page' as const, data: {
          eyebrow: 'Документы', title: 'Публичная оферта', intro: 'Черновик страницы юридического документа.', approved: false,
          notice: 'Текст не согласован юристом и не предназначен для публикации как действующий документ.', content: richText('Здесь будет размещён утверждённый текст публичной оферты.'),
          seo: { title: 'Публичная оферта — UNLIM RIGA PADEL', description: 'Страница ожидает юридического согласования.', robots: 'noindex-nofollow' },
        },
      },
    ]
    for (const page of thematicGlobals) {
      const draftCurrent = await payload.findGlobal({ slug: page.slug, draft: true, depth: 0, overrideAccess: true, showHiddenFields: true } as never) as unknown as Record<string, any> & { heroGrayscale?: boolean; heroImage?: unknown; seedVersion?: string }
      const current = draftCurrent.seedVersion === seedVersion
        ? await payload.findGlobal({ slug: page.slug, draft: false, depth: 0, overrideAccess: true, showHiddenFields: true } as never) as unknown as typeof draftCurrent
        : draftCurrent
      if (current.seedVersion === seedVersion) stats.skipped += 1
      else {
        assertGlobalCanBeSeeded(page.slug, current)
        await payload.updateGlobal({ slug: page.slug, draft: false, overrideAccess: true, data: { ...page.data, heroImage: heroMediaFor(page.slug)?.id, heroGrayscale: true, seedVersion, _status: 'published' } as never })
        stats.globalsPublished += 1
      }
      if (current.seedVersion === seedVersion && page.slug === 'training-page') {
        const additions = Object.fromEntries(['infographicEyebrow', 'infographicTitle', 'programsEyebrow', 'programsTitle', 'coachesEyebrow', 'coachesTitle', 'coachesDesktopActionLabel', 'coachesMobileActionLabel', 'knowledgeEyebrow', 'knowledgeTitle', 'firstVisitTitle', 'firstVisitCopy', 'firstVisitItems', 'faqTitle', 'faqCopy', 'faq'].filter((key) => current[key] == null || Array.isArray(current[key]) && current[key].length === 0).map((key) => [key, (page.data as Record<string, unknown>)[key]]))
        if (Object.keys(additions).length > 0) {
          await payload.updateGlobal({ slug: page.slug, draft: false, overrideAccess: true, data: { ...additions, _status: 'published' } as never })
          stats.globalsPublished += 1
        }
      }
      if (current.seedVersion === seedVersion && page.slug === 'prices-page') {
        const cancellationCopy = 'Отмена или перенос бронирования возможны не позднее чем за 12 часов до начала занятия.'
        const legacyCancellation = richText('Условия отмены и переноса уточняйте у администратора клуба до подтверждения бронирования.')
        const additions: Record<string, unknown> = {}
        if (current.intro === 'Выберите формат игры и тренировок: аренда корта, занятия с тренером или клубный абонемент.') {
          additions.intro = 'Выберите формат игры: разовая аренда корта или абонемент на нужное количество часов.'
        }
        if (current.seo?.description === 'Цены на падел в Москве, Красногорске и на Новой Риге: аренда панорамного корта, тренировки с тренером, пробное занятие и абонементы.') {
          additions.seo = { ...current.seo, description: 'Цены на падел в Москве, Красногорске и на Новой Риге: аренда панорамного корта в обычные и выгодные часы, а также клубные абонементы.' }
        }
        const rules = (current.rules ?? []).map((rule: Record<string, unknown>) => rule.title === 'Отмена и перенос' && JSON.stringify(rule.content) === JSON.stringify(legacyCancellation) ? { ...rule, content: richText(cancellationCopy) } : rule)
        if (JSON.stringify(rules) !== JSON.stringify(current.rules ?? [])) additions.rules = rules
        if (Object.keys(additions).length > 0) {
          await payload.updateGlobal({ slug: page.slug, draft: false, overrideAccess: true, data: { ...additions, _status: 'published' } as never })
          stats.globalsPublished += 1
        }
      }
      if (current.seedVersion === seedVersion && page.slug === 'gift-page') {
        const giftData = page.data as Record<string, unknown>
        const seededBenefits = Array.isArray(current.benefits) && current.benefits[0] && typeof current.benefits[0] === 'object'
          ? current.benefits[0] as Record<string, unknown>
          : null
        const additions = Object.fromEntries(['offerEyebrow', 'offerTitle', 'offerCopy', 'formatsTitle', 'formatsCopy', 'termsTitle', 'termsCopy', 'stepsEyebrow', 'stepsTitle', 'faqTitle', 'formats', 'terms', 'form'].filter((key) => current[key] == null || Array.isArray(current[key]) && current[key].length === 0).map((key) => [key, giftData[key]]))
        if (!current.form || typeof current.form !== 'object' || !current.form.sectionTitle) additions.form = giftData.form
        if (seededBenefits && (seededBenefits.badge == null || seededBenefits.title !== 'Аренда кортов')) additions.benefits = giftData.benefits
        const migratedBenefits = Array.isArray(current.benefits) ? current.benefits.map((benefit: Record<string, unknown>) => benefit.body === '4 панорамных корта Jubo Super Panoramic с профессиональным покрытием Mondo и климат-контролем.'
          ? { ...benefit, body: '3 панорамных корта Jubo Super Panoramic с профессиональным покрытием PRO TURF 240 и климат-контролем.' }
          : benefit) : []
        if (JSON.stringify(migratedBenefits) !== JSON.stringify(current.benefits ?? [])) additions.benefits = migratedBenefits
        if (current.title === 'Подарить падел') {
          additions.title = giftData.title
          additions.intro = giftData.intro
        }
        if (String(current.heroImage ?? '') !== String(giftMedia.card.id)) additions.heroImage = giftMedia.card.id
        const currentSEO = current.seo && typeof current.seo === 'object' ? current.seo : {}
        const nextSEO = { ...currentSEO } as Record<string, unknown>
        if (!nextSEO.title) nextSEO.title = (giftData.seo as Record<string, unknown>).title
        if (!nextSEO.description || nextSEO.description === 'Подарочный сертификат на падел в Москве: электронный PDF за 2 минуты или премиальный бокс, аренда панорамного корта Jubo и тренировка с тренером.') nextSEO.description = (giftData.seo as Record<string, unknown>).description
        if (!nextSEO.socialImage) nextSEO.socialImage = giftMedia.card.id
        if (JSON.stringify(nextSEO) !== JSON.stringify(currentSEO)) additions.seo = nextSEO
        if (Object.keys(additions).length > 0) {
          await payload.updateGlobal({ slug: page.slug, draft: false, overrideAccess: true, data: { ...additions, _status: 'published' } as never })
          stats.globalsPublished += 1
        }
      }
      if (current.seedVersion === seedVersion && current.heroGrayscale == null) {
        await payload.updateGlobal({ slug: page.slug, draft: false, overrideAccess: true, data: { heroImage: heroMediaFor(page.slug)?.id, heroGrayscale: true } as never })
        stats.globalsPublished += 1
      } else if (current.seedVersion === seedVersion && current.heroImage == null) {
        await payload.updateGlobal({ slug: page.slug, draft: false, overrideAccess: true, data: { heroImage: heroMediaFor(page.slug)?.id } as never })
        stats.globalsPublished += 1
      }
    }

    const padelCourtZakazPage = {
      seedVersion,
      _status: 'published',
      eyebrow: padelCourtZakazSeed.eyebrow,
      title: padelCourtZakazSeed.title,
      intro: padelCourtZakazSeed.intro,
      heroImage: padelCourtZakazMedia.heroImage,
      heroGrayscale: false,
      heroVideo: padelCourtZakazMedia.heroVideo,
      heroPrimaryLabel: padelCourtZakazSeed.heroPrimaryLabel,
      heroSecondaryLabel: padelCourtZakazSeed.heroSecondaryLabel,
      heroMetrics: padelCourtZakazSeed.heroMetrics,
      distributor: padelCourtZakazSeed.distributor,
      turnkey: {
        title: padelCourtZakazSeed.turnkey.title,
        intro: padelCourtZakazSeed.turnkey.intro,
        steps: padelCourtZakazSeed.turnkey.steps.map((step, index) => ({ ...step, image: padelCourtZakazMedia.turnkey[index].id })),
      },
      price: padelCourtZakazSeed.price,
      technology: {
        title: padelCourtZakazSeed.technology.title,
        text: padelCourtZakazSeed.technology.text,
        background: padelCourtZakazMedia.technologyBackground,
        items: padelCourtZakazSeed.technology.items,
      },
      gallery: {
        title: padelCourtZakazSeed.gallery.title,
        text: padelCourtZakazSeed.gallery.text,
        creditLabel: padelCourtZakazSeed.gallery.creditLabel,
        items: padelCourtZakazSeed.gallery.items.map((item, index) => ({ caption: item.caption, media: padelCourtZakazMedia.gallery[index] })),
      },
      models: {
        title: padelCourtZakazSeed.models.title,
        text: padelCourtZakazSeed.models.text,
        badge: padelCourtZakazSeed.models.badge,
        items: padelCourtZakazSeed.models.items.map((model, index) => ({
          ...model,
          image: padelCourtZakazMedia.models[index],
          highlights: model.highlights.map((text) => ({ text })),
        })),
      },
      cta: {
        ...padelCourtZakazSeed.cta,
        guarantees: padelCourtZakazSeed.cta.guarantees.map((text) => ({ text })),
      },
      seo: { ...padelCourtZakazSeed.seo, socialImage: padelCourtZakazMedia.heroImage },
    }
    const draftPadelCourtZakaz = await payload.findGlobal({ slug: 'padel-court-zakaz-page', draft: true, depth: 0, overrideAccess: true, showHiddenFields: true } as never) as unknown as Record<string, any>
    const currentPadelCourtZakaz = draftPadelCourtZakaz.seedVersion === seedVersion
      ? await payload.findGlobal({ slug: 'padel-court-zakaz-page', draft: false, depth: 0, overrideAccess: true, showHiddenFields: true } as never) as unknown as typeof draftPadelCourtZakaz
      : draftPadelCourtZakaz
    if (currentPadelCourtZakaz.seedVersion === seedVersion) {
      stats.skipped += 1
      if (!currentPadelCourtZakaz.seo?.socialImage) {
        await payload.updateGlobal({ slug: 'padel-court-zakaz-page', draft: false, overrideAccess: true, data: { seo: { ...currentPadelCourtZakaz.seo, socialImage: padelCourtZakazMedia.heroImage }, _status: 'published' } as never } as never)
        stats.globalsPublished += 1
      }
    } else {
      assertGlobalCanBeSeeded('padel-court-zakaz-page', currentPadelCourtZakaz)
      await payload.updateGlobal({ slug: 'padel-court-zakaz-page', draft: false, overrideAccess: true, data: padelCourtZakazPage as never } as never)
      stats.globalsPublished += 1
    }

    const draftCurrentHome = await payload.findGlobal({ slug: 'homepage', draft: true, depth: 0, overrideAccess: true, showHiddenFields: true })
    const currentHome = draftCurrentHome.seedVersion === seedVersion
      ? await payload.findGlobal({ slug: 'homepage', draft: false, depth: 0, overrideAccess: true, showHiddenFields: true })
      : draftCurrentHome
    if (currentHome.seedVersion === seedVersion) {
      const homepageUpdates: Record<string, unknown> = {}
      const currentCards = Array.isArray(currentHome.benefitsSection?.cards) ? currentHome.benefitsSection.cards : []
      const migratedCards = currentCards.map((card: Record<string, any>) => {
        if (card.variant === 'shower' && card.title === 'Тропический душ') {
          return { ...card, eyebrow: 'Сервис на территории', title: 'Авто-спа комплекс', description: 'Оставьте автомобиль на детейлинг, мойку и уборку, пока играете — вернётесь к чистому и ухоженному авто.', media: decorativeMedia.autoSpa.id, overlay: 'overlay-dark', action: { label: 'Узнать больше', mode: 'external-link', href: 'https://unlimriga.ru' } }
        }
        if (card.variant === 'lockers' && card.title === 'Раздевалки премиум') {
          return { ...card, eyebrow: 'Технологичный инвентарь', title: 'Ракетки Varlion', description: 'Профессиональные модели Varlion, включая Bourne Cube Elbowcare, — подберём ракетку под ваш стиль и уровень игры.', media: decorativeMedia.varlionEquipment.id, overlay: 'overlay-blue', action: { label: 'Подробнее', mode: 'external-link', href: 'https://varlion.su' } }
        }
        if (card.variant === 'lockers' && card.title === 'Ракетки Varlion' && (card.action?.href !== 'https://varlion.su' || card.action?.mode !== 'external-link')) {
          return { ...card, action: { label: 'Подробнее', mode: 'external-link', href: 'https://varlion.su' } }
        }
        if (card.variant === 'shower' && card.title === 'Авто-спа комплекс' && card.action?.href === 'http://unlimriga.ru') {
          return { ...card, action: { ...card.action, href: 'https://unlimriga.ru' } }
        }
        if (card.variant === 'chill' && card.title === 'Чилл-зона & кофейня') {
          return { ...card, eyebrow: 'После игры', title: 'Еда и напитки', description: 'Закажите еду и напитки прямо на территории клуба — от лёгкого перекуса до коктейля.', media: decorativeMedia.foodDrinks.id, overlay: 'overlay-sunset' }
        }
        if (card.variant === 'coaches-metric' && card.title === 'Опытные тренеры' && card.action?.href === '#coaches') {
          return { ...card, action: { ...card.action, href: '/coaches' } }
        }
        return card
      })
      const benefitsChanged = migratedCards.some((card, index) => card !== currentCards[index])
      if (benefitsChanged) homepageUpdates.benefitsSection = { ...currentHome.benefitsSection, cards: migratedCards }
      const currentHero = currentHome.hero && typeof currentHome.hero === 'object' ? currentHome.hero as Record<string, any> : {}
      const migratedHero = { ...currentHero }
      if (!migratedHero.tint) migratedHero.tint = defaultHeroTint
      if (!migratedHero.seoHeading) migratedHero.seoHeading = 'Премиальный крытый падел-клуб'
      if (migratedHero.description === 'Премиальный крытый падел-клуб с испанскими панорамными кортами Jubo Super Panoramic, профессиональным покрытием Mondo Super XN и клубным лаунжем.' || migratedHero.description === 'Премиальный крытый падел-клуб с испанскими панорамными кортами Jubo Super Panoramic, профессиональным покрытием Mondo Super XN и клубным лаунжем.') {
        migratedHero.description = 'с испанскими панорамными кортами Jubo Super Panoramic, профессиональным покрытием PRO TURF 240 и клубным лаунжем.'
      }
      migratedHero.stats = Array.isArray(migratedHero.stats) ? migratedHero.stats.map((stat: Record<string, unknown>) => stat.label === 'Jubo Super Panoramic' && (stat.value === '2 корта' || stat.value === '4 корта') ? { ...stat, value: '3 корта' } : stat) : migratedHero.stats
      if (JSON.stringify(migratedHero) !== JSON.stringify(currentHero)) homepageUpdates.hero = migratedHero
      if (Object.keys(homepageUpdates).length > 0) {
        await payload.updateGlobal({ slug: 'homepage', draft: false, overrideAccess: true, data: { ...homepageUpdates, _status: 'published' } as never })
        stats.globalsPublished += 1
      } else {
        stats.skipped += 1
      }
    } else {
      assertGlobalCanBeSeeded('homepage', currentHome)
      await payload.updateGlobal({
        slug: 'homepage',
        draft: false,
        overrideAccess: true,
        data: {
          seedVersion,
          _status: 'published',
          sections: [
            { section: 'hero', visible: true }, { section: 'benefits', visible: true }, { section: 'offers', visible: true },
            { section: 'courts', visible: true }, { section: 'pricing', visible: true }, { section: 'coaches', visible: true },
            { section: 'methodist-banner', visible: true }, { section: 'tournaments', visible: true }, { section: 'gallery', visible: true },
            { section: 'blog', visible: true }, { section: 'reviews-faq', visible: true },
          ],
          hero: {
            titleLine: 'Первая тренировка', titleConnector: 'за', titleAccent: '1 990 ₽',
            seoHeading: 'Премиальный крытый падел-клуб',
            description: 'с испанскими панорамными кортами Jubo Super Panoramic, профессиональным покрытием PRO TURF 240 и клубным лаунжем.',
            desktopMedia: mediaID(images.hero),
            tint: defaultHeroTint,
            primaryAction: { label: 'Забронировать', mode: 'booking' },
            secondaryAction: { label: 'Пробное занятие', mode: 'trial-booking' },
            socialProof: { ratingLabel: '4.9 · 500+ игроков', caption: 'Рейтинг клуба на Новой Риге', coaches: coaches.slice(0, 3).map(({ id }) => id) },
            stats: [
              { value: '3 корта', label: 'Jubo Super Panoramic' }, { value: '11.5 м', label: 'Высота до балок' },
              { value: '+21°C', label: 'Климат-контроль круглый год' }, { value: '30 сек', label: 'Мгновенное бронирование' },
            ],
          },
          benefitsSection: {
            eyebrow: 'Преимущества клуба', title: 'Всё для игры и отдыха',
            cards: [
              { variant: 'parking', eyebrow: '50 мест у клуба', title: 'Бесплатная парковка', description: 'Охрана 24/7, шлагбаум и зарядки для электрокаров.', media: decorativeMedia.parkingSign.id, meshTone: 'lime', action: { mode: 'none' } },
              { variant: 'lockers', eyebrow: 'Технологичный инвентарь', title: 'Ракетки Varlion', description: 'Профессиональные модели Varlion, включая Bourne Cube Elbowcare, — подберём ракетку под ваш стиль и уровень игры.', media: decorativeMedia.varlionEquipment.id, overlay: 'overlay-blue', action: { label: 'Подробнее', mode: 'external-link', href: 'https://varlion.su' } },
              { variant: 'shower', eyebrow: 'Сервис на территории', title: 'Авто-спа комплекс', description: 'Оставьте автомобиль на детейлинг, мойку и уборку, пока играете — вернётесь к чистому и ухоженному авто.', media: decorativeMedia.autoSpa.id, overlay: 'overlay-dark', action: { label: 'Узнать больше', mode: 'external-link', href: 'https://unlimriga.ru' } },
              { variant: 'chill', eyebrow: 'После игры', title: 'Еда и напитки', description: 'Закажите еду и напитки прямо на территории клуба — от лёгкого перекуса до коктейля.', media: decorativeMedia.foodDrinks.id, overlay: 'overlay-sunset', action: { mode: 'none' } },
              { variant: 'online-booking', eyebrow: 'Digital сервис', title: 'Онлайн-бронь за 30 сек', description: 'Прямо с телефона — без звонков и ожидания подтверждения.', media: decorativeMedia.bookingPhone.id, meshTone: 'sky', action: { mode: 'booking' } },
              { variant: 'coaches-metric', eyebrow: 'FIP & WPT сертификаты', title: 'Опытные тренеры', description: 'Мастера спорта, призеры всероссийских турниров и методисты с авторскими программами прокачки техники.', media: decorativeMedia.padelRacket.id, meshTone: 'sunset', action: { mode: 'internal-link', href: '/coaches' } },
              { variant: 'kids-wide', eyebrow: 'Unlim Kids Academy', title: 'Секции для детей с 5 лет', description: 'Бережная постановка правильной биомеханики, развитие координации, подвижности и командного духа в мини-группах до 4 человек.', supportingText: 'Облегченные детские ракетки Bullpadel', media: decorativeMedia.padelBall.id, meshTone: 'sky', action: { mode: 'internal-link', href: '#training' } },
            ],
          },
          offersSection: {
            cards: [
              { variant: 'tournament-venue', badge: 'Турниры', title: 'Площадка для турниров', description: 'Профессиональные корты, инфраструктура и команда с опытом проведения соревнований любого масштаба.', image: mediaID(images.offerTournament), overlay: 'overlay-blue', icon: 'Trophy', action: { mode: 'lead-form', leadType: 'consultation', label: 'Обсудить турнир' } },
              { variant: 'event', badge: 'Мероприятия', title: 'Ваше мероприятие', description: 'Арендуйте площадку для корпоратива, закрытой тренировки, турнира, дня рождения или спортивной встречи — подберём формат и время под вашу задачу.', image: mediaID(images.offerEvent), overlay: 'overlay-violet', icon: 'PartyPopper', action: { mode: 'lead-form', leadType: 'consultation', label: 'Обсудить мероприятие' } },
            ],
          },
          courtsSection: { titleLineOne: 'Инженерный подход', titleLineTwo: 'к каждой детали корта', backgroundMedia: mediaID(images.courtsBg), backgroundAlt: 'Панорамные корты Unlim Riga Padel' },
          pricingSection: { eyebrow: 'Тарифы', title: 'Цены и абонементы', defaultTab: 'rent', rentTabLabel: 'Аренда', trainingTabLabel: 'Тренировки', membershipsTabLabel: 'Абонементы' },
          methodistBanner: {
            title: 'Не знаете, с чего начать или какого тренера выбрать?',
            description: 'Наш старший методист подберёт программу и напарников по вашему спортивному бэкграунду — бесплатная консультация занимает 10 минут.',
            decorativeMedia: decorativeMedia.methodistCompass.id, meshTone: 'lavender', action: { label: 'Получить консультацию', mode: 'phone' },
          },
          coachesSection: { eyebrow: 'Команда', title: 'Тренеры' },
          tournamentsSection: { eyebrow: 'Соревнования', title: 'Турниры и лиги' },
          gallerySection: { eyebrow: 'Сообщество', title: 'Жизнь клуба', action: { label: 'Смотреть больше', mode: 'internal-link', href: '/gallery' } },
          blogSection: { eyebrow: 'Медиа', title: 'Блог и статьи', action: { label: 'Ещё →', mode: 'internal-link', href: '/blog' } },
          reviewsSection: {
            reviewsEyebrow: 'Отзывы', reviewsTitle: 'Что говорят игроки', faqEyebrow: 'Вопросы', faqTitle: 'Частые вопросы',
            externalRatingLabel: '4.8 на Яндекс Картах', externalReviewsLabel: '312 отзывов о клубе', externalReviewsURL: 'https://yandex.ru/maps',
          },
          seo: {
            title: 'Падел-клуб — аренда корта, поиграть в Москве — Unlim Riga',
            description: 'Падел-клуб UNLIM RIGA PADEL на Новой Риге: аренда крытых панорамных кортов, игры с друзьями, тренировки для взрослых и детей, турниры и абонементы.',
            robots: 'index-follow',
          },
        } as never,
      })
      stats.globalsPublished += 1
    }

    const footerNavigation = [
      { label: 'Цены', href: '/prices', column: '1' }, { label: 'Тренировки', href: '/training', column: '1' }, { label: 'Тренеры', href: '/coaches', column: '1' },
      { label: 'Турниры', href: '/tournaments', column: '2' }, { label: 'Статьи', href: '/blog', column: '2' }, { label: 'Подарить', href: '/gift', column: '2' }, { label: 'О нас', href: '/about', column: '2' },
    ] as const
    const legalLinks = [
      { label: 'Политика конфиденциальности', href: '/policy' },
      { label: 'Публичная оферта', href: '/oferta' },
    ] as const
    const contactConfirmation = {
      dialogTitle: 'Связаться с клубом', cancelLabel: 'Отмена', continueLabel: 'Продолжить', formTitle: 'Оставить заявку', submitLabel: 'Отправить',
      successTitle: 'Заявка отправлена', successText: 'Администратор клуба свяжется с вами.',
      consentLabel: 'Согласие на обработку персональных данных (текст требует юридического согласования)', policyHref: '/policy',
      phoneEnabled: true, emailEnabled: true, telegramEnabled: true, vkEnabled: true,
    }
    const draftSettings = await payload.findGlobal({ slug: 'site-settings', draft: true, depth: 0, overrideAccess: true, showHiddenFields: true })
    const currentSettings = draftSettings.seedVersion === seedVersion
      ? await payload.findGlobal({ slug: 'site-settings', draft: false, depth: 0, overrideAccess: true, showHiddenFields: true })
      : draftSettings
    if (currentSettings.seedVersion === seedVersion) {
      stats.skipped += 1
      const desktopNavigation = currentSettings.desktopNavigation ?? []
      const mobileMenuNavigation = currentSettings.mobileMenuNavigation ?? []
      const footerNavigationValue = currentSettings.footerNavigation ?? []
      const normalizedDesktopNavigation = normalizeDesktopNavigation(desktopNavigation)
      const normalizedMobileMenuNavigation = mergeRequiredNavigation(mobileMenuNavigation, requiredPageLinks)
      const normalizedFooterNavigation = mergeRequiredNavigation(footerNavigationValue, footerNavigation)
      const mobileNavigation = (currentSettings.mobileNavigation ?? []).map((item) => item.label === 'Главная' ? { ...item, href: '/' } : item.label === 'Тренировки' ? { ...item, href: '/training' } : item.label === 'Цены' ? { ...item, href: '/prices' } : item)
      if (navigationChanged(desktopNavigation, normalizedDesktopNavigation) || navigationChanged(mobileMenuNavigation, normalizedMobileMenuNavigation) || navigationChanged(footerNavigationValue, normalizedFooterNavigation) || navigationChanged(currentSettings.mobileNavigation ?? [], mobileNavigation)) {
        await payload.updateGlobal({ slug: 'site-settings', draft: false, overrideAccess: true, data: { desktopNavigation: normalizedDesktopNavigation, mobileNavigation, mobileMenuNavigation: normalizedMobileMenuNavigation, footerNavigation: normalizedFooterNavigation, _status: 'published' } as never })
        stats.globalsPublished += 1
      }
      const legacyLegalLinks = currentSettings.legalLinks ?? []
      if (legacyLegalLinks.length === 3 && legacyLegalLinks.every((item) => item.href === '#')) {
        await payload.updateGlobal({ slug: 'site-settings', draft: false, overrideAccess: true, data: { legalLinks: [...legalLinks], _status: 'published' } })
        stats.globalsPublished += 1
      }
      if (!currentSettings.contactConfirmation?.dialogTitle) {
        await payload.updateGlobal({ slug: 'site-settings', draft: false, overrideAccess: true, data: { contactConfirmation, _status: 'published' } })
        stats.globalsPublished += 1
      }
      if (currentSettings.brandLogoMode == null) {
        await payload.updateGlobal({ slug: 'site-settings', draft: false, overrideAccess: true, data: { brandLogoMode: 'prefix', _status: 'published' } as never })
        stats.globalsPublished += 1
      }
      const contactUpdates: Record<string, unknown> = {}
      if (currentSettings.phoneDisplay === '+7 999 000-00-00') contactUpdates.phoneDisplay = '+7 985 835-00-55'
      if (currentSettings.phoneValue === '+79990000000') contactUpdates.phoneValue = '+79858350055'
      if (currentSettings.openingHours === 'Ежедневно 07:00–00:00') contactUpdates.openingHours = 'Ежедневно 07:00–23:00'
      if (currentSettings.parking === '40 бесплатных мест у входа' || currentSettings.parking === '40 бесплатных мест у входа') contactUpdates.parking = '50 бесплатных мест у входа'
      if (Object.keys(contactUpdates).length > 0) {
        await payload.updateGlobal({ slug: 'site-settings', draft: false, overrideAccess: true, data: { ...contactUpdates, _status: 'published' } as never })
        stats.globalsPublished += 1
      }
      const migratedFooterStats = (currentSettings.footerStats ?? []).map((stat: Record<string, unknown>) => stat.label === 'Панорамных корта' && stat.value === '4' ? { ...stat, value: '3' } : stat)
      const migratedSocialLinks = (currentSettings.socialLinks ?? [])
        .filter((link: Record<string, unknown>) => link.url !== 'https://t.me' && link.url !== '#')
        .map((link: Record<string, unknown>) => link.provider === 'vk' && link.url === 'https://vk.com' ? { ...link, url: 'https://vk.ru/unlimpadel' } : link)
      if (!migratedSocialLinks.some((link: Record<string, unknown>) => link.provider === 'vk')) migratedSocialLinks.push({ provider: 'vk', label: 'VK', url: 'https://vk.ru/unlimpadel' })
      if (JSON.stringify(migratedFooterStats) !== JSON.stringify(currentSettings.footerStats ?? []) || JSON.stringify(migratedSocialLinks) !== JSON.stringify(currentSettings.socialLinks ?? [])) {
        await payload.updateGlobal({ slug: 'site-settings', draft: false, overrideAccess: true, data: { footerStats: migratedFooterStats, socialLinks: migratedSocialLinks, _status: 'published' } as never })
        stats.globalsPublished += 1
      }
    } else {
      assertGlobalCanBeSeeded('site-settings', currentSettings)
      await payload.updateGlobal({
        slug: 'site-settings',
        draft: false,
        overrideAccess: true,
        data: {
          seedVersion,
          _status: 'published',
          brandName: 'UNLIM RIGA PADEL', brandLogoMode: 'prefix', headerSubtitle: 'Новорижское шоссе 3к1',
          desktopNavigation: requiredPageLinks.filter(({ href }) => href !== '/training' && href !== '/coaches').map((item) => item.href === '/prices' ? { ...item, children: priceNavigationChildren.map((child) => ({ ...child })) } : item),
          mobileNavigation: [
            { label: 'Главная', href: '/', icon: 'Home' }, { label: 'Тренировки', href: '/training', icon: 'Dumbbell' }, { label: 'Цены', href: '/prices', icon: 'Tag' },
          ],
          mobileMenuNavigation: [...requiredPageLinks],
          mobileActions: { playLabel: 'Играть', menuLabel: 'Меню', menuTitle: 'Меню', quickActionsTitle: 'Быстрые действия', bookCourtLabel: 'Забронировать корт', callLabel: 'Позвонить в клуб', directionsLabel: 'Проложить маршрут' },
          address: 'Новорижское шоссе, 3к1', directionsURL: 'https://yandex.ru/maps/?text=Новорижское%20шоссе%203к1',
          addressLabel: 'Адрес', transitLabel: 'Ближайшее метро', parkingLabel: 'Парковка', openingHoursLabel: 'Режим работы', phoneFieldLabel: 'Телефон', emailFieldLabel: 'Email',
          phoneDisplay: '+7 985 835-00-55', phoneValue: '+79858350055', email: 'hello@unlimriga.club', transit: 'Мякинино · 12 мин пешком',
          parking: '50 бесплатных мест у входа', openingHours: 'Ежедневно 07:00–23:00', map: { latitude: 55.8, longitude: 37.15, zoom: 14 },
          footerImage: mediaID(images.footerClub),
          footerAbout: 'Unlim Riga Padel — клуб для тех, кто хочет играть на кортах уровня мировых турниров рядом с домом. Мы строили пространство вокруг трёх вещей: качества покрытия, работы тренеров и атмосферы, в которую хочется возвращаться. Здесь одинаково комфортно и новичку на первой тренировке, и резиденту клуба перед финалом лиги.',
          footerStats: [
            { value: '2023', label: 'Год открытия' }, { value: '3', label: 'Панорамных корта' },
            { value: '9', label: 'Тренеров в штате' }, { value: '2 100+', label: 'Игроков в клубе' },
          ],
          legalEntity: 'ООО «Анлим Спорт» · ИНН 5024178932 · ОГРН 1235000078451',
          footerNavigation: [...footerNavigation],
          socialLinks: [{ provider: 'vk', label: 'VK', url: 'https://vk.ru/unlimpadel' }],
          legalLinks: [...legalLinks],
          copyright: '© 2026 Unlim Riga Padel. Все права защищены.',
          cookieNotice: { text: 'Используем cookies, чтобы бронирование и подбор тренировок работали быстрее.', acceptLabel: 'Хорошо' },
          contactConfirmation,
          booking: { mode: 'disabled', buttonLabel: 'Забронировать' },
        } as never,
      })
      stats.globalsPublished += 1
    }

    payload.logger.info({ stats }, 'Prototype seed completed')
  } finally {
    await payload.destroy()
  }
}

await seed()
