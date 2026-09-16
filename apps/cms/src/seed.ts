import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload, type CollectionSlug, type Payload } from 'payload'

import config from './payload.config'
import { mergeRequiredNavigation, navigationChanged, normalizeDesktopNavigation, priceNavigationChildren, requiredPageLinks } from './content/requiredNavigation'

const seedVersion = 'prototype-v2'
const dirname = path.dirname(fileURLToPath(import.meta.url))
const webPublicDir = path.resolve(dirname, '../../web/public')

const stats = {
  created: 0,
  mediaReused: 0,
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
  autoSpa: 'images/benefits/auto-spa.png',
  bookingPhone: 'booking-phone.png',
  foodDrinks: 'images/benefits/food-drinks.png',
  methodistCompass: 'methodist-compass.png',
  padelBall: 'padel-ball.png',
  padelRacket: 'padel-racket.png',
  parkingSign: 'parking-sign.png',
  varlionEquipment: 'images/benefits/varlion-equipment.png',
} as const
const pageHeroKinds = ['blog', 'coaches', 'tournaments', 'prices', 'training', 'courts', 'gallery', 'about'] as const

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

function richTextArticle(blocks: Array<{ type: 'heading' | 'paragraph'; text: string }>) {
  return {
    root: {
      type: 'root',
      children: blocks.map((block) => ({
        type: block.type,
        ...(block.type === 'heading' ? { tag: 'h2' } : {}),
        children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: block.text, version: 1 }],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

async function findBySeedKey(payload: Payload, collection: CollectionSlug, seedKey: string) {
  const result = (await payload.find({
    collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    showHiddenFields: true,
    where: { seedKey: { equals: seedKey } },
  } as never)) as { docs: Array<{ id: number | string }> }
  return result.docs[0]
}

async function ensureSeeded(
  payload: Payload,
  collection: CollectionSlug,
  seedKey: string,
  data: Record<string, unknown>,
) {
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
) {
  const seedKey = `prototype-media:${hash(source)}`
  const existing = await findBySeedKey(payload, 'media', seedKey)
  if (existing) {
    stats.skipped += 1
    return existing
  }

  const sameSource = (await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { sourceURL: { equals: source } },
  })) as { docs: Array<{ id: number | string }> }
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
  })
  stats.created += 1
  return created
}

async function ensureRemoteMedia(payload: Payload, sourceURL: string, alt: string) {
  const seedKey = `prototype-media:${hash(sourceURL)}`
  const existing = await findBySeedKey(payload, 'media', seedKey)
  if (existing) {
    stats.skipped += 1
    return existing
  }

  let response: Response
  try {
    response = await fetch(sourceURL, { signal: AbortSignal.timeout(45_000) })
  } catch (error) {
    throw new Error(`Failed to download demo media ${sourceURL}: ${error instanceof Error ? error.message : String(error)}`)
  }
  if (!response.ok) throw new Error(`Failed to download demo media ${sourceURL}: HTTP ${response.status}`)

  const mimetype = response.headers.get('content-type')?.split(';')[0] ?? ''
  if (!mimetype.startsWith('image/')) throw new Error(`Demo media ${sourceURL} returned unexpected type ${mimetype || 'unknown'}.`)
  const data = Buffer.from(await response.arrayBuffer())
  if (data.byteLength === 0) throw new Error(`Demo media ${sourceURL} returned an empty file.`)

  return createMedia(
    payload,
    sourceURL,
    { data, mimetype, name: `pexels-${hash(sourceURL)}.${mimetype === 'image/png' ? 'png' : 'jpg'}` },
    alt,
    'Pexels demo source from the prototype; author attribution is not available in the snapshot.',
    'Demo asset. Verify attribution and production usage rights before launch.',
  )
}

async function ensureLocalMedia(payload: Payload, filename: string, alt: string) {
  const source = `apps/web/public/${filename}`
  const seedKey = `prototype-media:${hash(source)}`
  const existing = await findBySeedKey(payload, 'media', seedKey)
  if (existing) {
    stats.skipped += 1
    return existing
  }

  const data = await readFile(path.join(webPublicDir, filename))
  const mimetype = filename.endsWith('.webp') ? 'image/webp' : 'image/png'
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
    const pageHeroMedia: Record<string, { id: number | string }> = {}
    for (const kind of pageHeroKinds) pageHeroMedia[kind] = await ensureLocalMedia(payload, `page-heroes/${kind}.webp`, `Фон страницы ${kind}`)
    const heroMediaFor = (slug: string) => pageHeroMedia[slug.replace('-page', '')] ?? pageHeroMedia.about

    const mediaID = (source: string) => {
      const media = remoteMedia.get(source)
      if (!media) throw new Error(`Media was not prepared for ${source}`)
      return media.id
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

    const articles = [
      ['first-visit', 'Что взять с собой на первую тренировку по паделу', 'Экипировка, обувь и мелочи, которые упростят первый визит в клуб — от ракетки до бутылки воды.', 'guide', images.blog[0], 6, '1'],
      ['technique', 'Три упражнения для уверенного удара от стекла', 'Разбираем базовую механику отскока от панорамного стекла и даём тренировочный план на неделю.', 'technique', images.blog[1], 8, '2'],
      ['nutrition', 'Как питаться в дни интенсивных тренировок', 'Простые принципы питания и сна, которые ускоряют восстановление между матчами и сборами.', 'recovery', images.blog[2], 5, '3'],
      ['first-racket', 'Как выбрать первую ракетку', 'Форма, баланс и жёсткость — что важно новичку.', 'guide', images.blog[0], 5, null],
      ['serve-rules', 'Разбор правил подачи', 'Частые ошибки судейства на любительском уровне.', 'technique', images.blog[1], 5, null],
      ['padel-vs-tennis', 'Падел vs большой теннис', 'Что переносится, а чему учиться заново.', 'guide', images.blog[0], 5, null],
      ['americano-prep', 'Как подготовиться к Americano', 'Тактика для смешанных пар и ротаций.', 'technique', images.blog[1], 5, null],
      ['warmup', 'Разминка на 10 минут перед игрой', 'Снижаем риск травм плеча и голеностопа.', 'recovery', images.blog[2], 5, null],
      ['booking-guide', 'Гид по бронированию корта', 'Как ловить лучшие слоты на вечер и выходные.', 'guide', images.blog[0], 5, null],
    ] as const
    for (const [index, [slug, title, excerpt, category, previewImage, readingTimeMinutes, homePosition]] of articles.entries()) {
      await ensureSeeded(payload, 'articles', `prototype:article:${slug}`, {
        slug,
        title,
        excerpt,
        category: categories.get(category)?.id,
        previewImage: mediaID(previewImage),
        readingTimeMinutes,
        homePosition,
        publishedAt: new Date(Date.UTC(2026, 0, index + 1, 9)).toISOString(),
        content: richText(excerpt),
        seo: { robots: 'index-follow' },
      })
    }

    const tournaments = [
      {
        slug: 'americano', title: 'Game Party / Americano', category: 'Клубная пятница', lifecycle: 'active',
        scheduleLabel: 'Каждую пятницу · 19:30–22:30', format: 'Americano (смена напарников каждый сет)',
        entryFee: '2 500 ₽ / участник', description: 'Самый душевный формат для знакомства с игроками клуба. Музыкальный сет, напитки, фруктовый бар и динамичные матчи.',
        prizeLabel: 'Стоимость за участника', prize: '2 500 ₽', visualStyle: 'image', image: mediaID(images.tournamentParty),
        imageOverlay: 'overlay-dark', icon: 'PartyPopper', regulation: richText('Регистрация закрывается за 2 часа до начала. Формат — Americano со сменой напарников каждый сет. На матч приезжайте за 15 минут до старта.'),
      },
      {
        slug: 'open-league', title: 'Unlim Riga Masters Cup', category: 'Мужская Лига (B/C)', lifecycle: 'finished',
        scheduleLabel: 'Суббота, 14 марта · 11:00–17:00', format: 'Групповой этап + Олимпийская сетка',
        entryFee: 'Взнос: 4 500 ₽ / пара', description: 'Рейтинговый кубок для опытных пар с розыгрышем клубных призов, кубков и медалей от наших партнеров Bullpadel.',
        prizeLabel: 'Призовой фонд', prize: '80 000 ₽', visualStyle: 'mesh', meshStyle: 'deep-blue', icon: 'Trophy', regulation: richText('Участники играют групповой этап, затем проходят в олимпийскую сетку. Пара должна быть на месте за 30 минут до начала. Победитель определяется по сумме выигранных геймов.'),
      },
      {
        slug: 'junior-cup', title: "Women's Morning Cup", category: 'Женский Турнир (Open)', lifecycle: 'finished',
        scheduleLabel: 'Воскресенье, 15 марта · 10:30–15:30', format: 'Round Robin + Финальный плей-офф',
        entryFee: 'Взнос: 3 500 ₽ / пара', description: 'Элегантный женский турнир в непринужденной атмосфере: игристое безалкогольное, подарки от бьюти-партнеров и памятные фото.',
        prizeLabel: 'Призовой фонд', prize: '50 000 ₽', visualStyle: 'mesh', meshStyle: 'lavender', icon: 'Medal', regulation: richText('Формат Round Robin с финальным плей-офф. Все пары проходят общий групповой этап. Регистрация подтверждается после внесения взноса.'),
      },
    ]
    for (const [index, tournament] of tournaments.entries()) {
      const facets = [
        { categoryKey: 'club-game', formatKey: 'americano', action: { label: 'Записаться', mode: 'booking' } },
        { categoryKey: 'mens-league', formatKey: 'groups-knockout', action: { label: 'Турнир завершён', mode: 'none' } },
        { categoryKey: 'womens-open', formatKey: 'round-robin-playoff', action: { label: 'Турнир завершён', mode: 'none' } },
      ][index]
      const seededTournament = await ensureSeeded(payload, 'tournaments', `prototype:tournament:${tournament.slug}`, {
        ...tournament,
        ...facets,
        showOnHomepage: true,
        homepageOrder: index + 1,
        seo: { robots: 'index-follow' },
      })
      await fillMissingSeededFields(payload, 'tournaments', seededTournament.id, facets)
      await fillMissingSeededFields(payload, 'tournaments', seededTournament.id, { regulation: tournament.regulation })
      await migrateSeededField(payload, 'tournaments', seededTournament.id, 'action', { label: null, mode: 'none', href: null }, facets.action)
      if (index > 0) await migrateSeededField(payload, 'tournaments', seededTournament.id, 'lifecycle', 'upcoming', 'finished')
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
          { value: '2', label: 'Панорамных корта', icon: 'Layers3' },
        ],
      },
      {
        slug: 'damping', title: 'Чистый отскок. Меньше вибраций', eyebrow: 'Демпферная система', cardVariant: 'damping',
        description: 'Неопреновые демпферы между стеклом и металлом гасят удары конструкции — мяч ведёт себя предсказуемо.',
      },
      {
        slug: 'surface', title: 'Официальное покрытие World Padel Tour', eyebrow: 'Mondo XN', cardVariant: 'surface',
        description: 'Моноволоконное покрытие с оптимальным сцеплением — то же, что используется на турнирах тура.',
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
    }

    const rentalRates = [
      {
        key: 'day', title: 'Будни', eyebrow: 'Дневные часы', timeLabel: '08:00–17:00',
        description: 'Идеальное время для спокойной тренировки, отработки подачи и игры в светлое время суток без лишней суеты.',
        price: 3500, priceLabel: 'стоимость', priceSuffix: '/ час', badge: 'Выгодно', badgeTone: 'lime', cardVariant: 'rate',
      },
      {
        key: 'prime', title: 'Вечер и выходные', eyebrow: 'Прайм-тайм', timeLabel: '17:00–23:00, Сб–Вс целый день',
        description: 'Самая клубная атмосфера, музыка, открытый лаунж-бар и динамичные матчи с резидентами клуба.',
        price: 5500, priceLabel: 'стоимость', priceSuffix: '/ час', badge: 'Популярно', badgeTone: 'sunset', cardVariant: 'rate',
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
      await ensureSeeded(payload, 'rental-rates', `prototype:rental-rate:${key}`, {
        ...data, isActive: true, showOnHomepage: true, homepageOrder: index + 1,
      })
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

    const memberships = [
      {
        key: 'gift', title: 'Подарочный сертификат', description: 'Можно использовать для оплаты аренды корта или тренировок.',
        cardVariant: 'gift', meshTone: 'lavender', giftAmountLimits: { minimum: 1000, maximum: 100000 },
        action: { label: 'Подарить онлайн', mode: 'internal-link', href: '#memberships' },
      },
      {
        key: 's', title: 'Карта на 5 игр', badge: 'Пакет S', badgeTone: 'muted', description: 'Удобный старт для регулярной игры',
        cardVariant: 'package', price: 7900, priceLabel: '1 580 ₽ за одну игру',
        benefits: [{ text: 'Любой открытый корт' }, { text: 'Перенос игр без сгорания' }, { text: 'Срок действия — 60 дней' }, { text: 'Бесплатные мячи и полотенца' }],
      },
      {
        key: 'm', title: 'Карта на 10 игр', badge: 'Пакет M', badgeTone: 'lime-soft', description: 'Оптимально для активных игроков',
        cardVariant: 'featured-package', price: 11900, priceLabel: '1 190 ₽ за одну игру',
        benefits: [{ text: 'Приоритетная бронь корта за 14 дней' }, { text: 'Бесплатные ракетки Varlion Maxima' }, { text: '1 гостевой визит в подарок' }, { text: 'Срок действия — 90 дней' }, { text: 'Заморозка до 14 дней' }],
      },
      {
        key: 'resident', title: 'Резидент клуба', badge: 'VIP Статус', badgeTone: 'gold', description: 'Полный безлимит и персональный сервис',
        cardVariant: 'resident', meshTone: 'dark', price: 40900, priceLabel: 'в месяц / полный доступ',
        benefits: [{ text: 'Скидка 5% на бар и магазин' }, { text: 'Безлимит на все корты клуба' }, { text: 'Именной шкафчик в раздевалке' }, { text: 'Групповые тренировки включены' }, { text: 'Участие во всех турнирах Americano' }],
      },
    ]
    for (const [index, membership] of memberships.entries()) {
      const { key, ...data } = membership
      const action = { href: null, label: key === 'gift' ? 'Оформить сертификат' : 'Оставить заявку', mode: 'lead-form', leadType: key === 'gift' ? 'gift' : 'membership' }
      const seededMembership = await ensureSeeded(payload, 'memberships', `prototype:membership:${key}`, {
        ...data, action, isActive: true, showOnHomepage: true, homepageOrder: index + 1,
      })
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
      ['Как отменить или перенести бронирование?', 'Бесплатная отмена возможна за 6 часов до начала слота через личный кабинет или по телефону клуба. Позже — списывается 50% стоимости.'],
      ['С какого возраста дети могут заниматься?', 'Детские группы работают с 5 лет. Тренер оценивает уровень на первом занятии и подбирает подходящую группу.'],
      ['Можно ли выбрать конкретного тренера?', 'Да, при бронировании тренировки можно указать тренера. Если он занят, методист поможет подобрать замену со схожей специализацией.'],
      ['Есть ли парковка у клуба?', 'Да, бесплатная парковка на 40 машиномест прямо у входа, дополнительно — стойки для велосипедов.'],
      ['Как попасть на турниры клуба?', 'Регистрация открывается за 2–3 недели до старта в разделе «Турниры» и в клубном чате. Количество пар ограничено.'],
    ] as const
    for (const [index, [question, answer]] of faqs.entries()) {
      await ensureSeeded(payload, 'faqs', `prototype:faq:${index + 1}`, {
        question, answer, isActive: true, showOnHomepage: true, homepageOrder: index + 1,
      })
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
      },
      {
        slug: 'coaches-page' as const,
        eyebrow: 'Команда',
        title: 'Тренеры',
        intro: 'Выберите тренера по уровню, направлению подготовки и языку — от первого занятия до турниров.',
        seoTitle: 'Тренеры по паделу — UNLIM RIGA PADEL',
      },
      {
        slug: 'tournaments-page' as const,
        eyebrow: 'Соревнования',
        title: 'Турниры и лиги',
        intro: 'Клубные игры, рейтинговые кубки и открытые турниры для разных уровней подготовки.',
        seoTitle: 'Турниры по паделу — UNLIM RIGA PADEL',
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
          seo: { title: page.seoTitle, description: page.intro, robots: 'index-follow' },
        } as never })
        stats.globalsPublished += 1
      }
    }

    const thematicGlobals = [
      {
        slug: 'prices-page' as const, data: {
          eyebrow: 'Тарифы', title: 'Цены и абонементы', intro: 'Выберите формат игры и тренировок: аренда корта, занятия с тренером или клубный абонемент.',
          rentTabLabel: 'Аренда', trainingTabLabel: 'Тренировки', membershipsTabLabel: 'Абонементы',
          rules: [
            { title: 'Бронирование', content: richText('Стоимость фиксируется при бронировании. Инвентарь и базовый клубный сервис включены согласно выбранному тарифу.') },
            { title: 'Отмена и перенос', content: richText('Условия отмены и переноса уточняйте у администратора клуба до подтверждения бронирования.') },
          ],
          seo: { title: 'Цены на падел — UNLIM RIGA PADEL', description: 'Аренда кортов, тренировки и клубные абонементы.', robots: 'index-follow' },
        },
      },
      {
        slug: 'training-page' as const, data: {
          eyebrow: 'Обучение', title: 'Тренировки по паделу', intro: 'Программы для первого знакомства с паделом, регулярного прогресса и подготовки к турнирам.',
          infographicEyebrow: 'Методика UNLIM',
          infographicTitle: 'Понятный путь от первого удара до уверенной игры',
          infographicCopy: 'Подбираем формат занятий под цель, темп и текущий уровень — без перегруза и случайных упражнений.',
          programsTitle: 'Форматы тренировок',
          blocks: [
            { title: 'Программа под ваш уровень', body: 'Тренер оценивает технику и формирует понятный план развития.', icon: 'Target' },
            { title: 'Удобное расписание', body: 'Индивидуальные и групповые занятия доступны в разные часы клуба.', icon: 'Calendar' },
            { title: 'Измеримый прогресс', body: 'Работаем над техникой, тактикой пары и уверенностью в игре.', icon: 'TrendingUp' },
          ],
          article: richTextArticle([
            { type: 'heading', text: 'Как проходят тренировки по паделу' },
            { type: 'paragraph', text: 'Занятие строится вокруг практики на корте: разминки, работы с базовыми ударами, игровых ситуаций и короткого разбора. Содержание тренировки зависит от опыта игрока, выбранного формата и цели — познакомиться с игрой, заниматься регулярно или подготовиться к соревнованию.' },
            { type: 'heading', text: 'Как выбрать формат занятий' },
            { type: 'paragraph', text: 'Индивидуальная тренировка позволяет сосредоточиться на персональных задачах и получить больше повторений. Групповой формат добавляет игровые ситуации с разными партнёрами, а детские занятия учитывают возраст, координацию и комфортный темп обучения. Если формат пока не очевиден, начать можно с пробного занятия и обсудить дальнейший план с тренером.' },
            { type: 'heading', text: 'Что развивает системная практика' },
            { type: 'paragraph', text: 'Регулярные занятия помогают последовательно развивать контроль мяча, перемещение, выбор позиции и взаимодействие в паре. Прогресс зависит от исходного уровня, частоты тренировок и самостоятельной игровой практики, поэтому программа остаётся гибкой и корректируется по мере развития навыков.' },
            { type: 'heading', text: 'Что подготовить к первому занятию' },
            { type: 'paragraph', text: 'Для старта нужна удобная спортивная форма и обувь, подходящая для корта. Условия предоставления инвентаря, доступное время и состав занятия лучше подтвердить у администратора при записи.' },
          ]),
          action: { label: 'Подобрать тренировку', mode: 'trial-booking' },
          seo: { title: 'Тренировки по паделу — UNLIM RIGA PADEL', description: 'Индивидуальные, групповые и детские тренировки по паделу.', robots: 'index-follow' },
        },
      },
      {
        slug: 'gift-page' as const, data: {
          eyebrow: 'Подарочный сертификат', title: 'Подарить падел', intro: 'Сертификат на игру и занятия в клубе — подарок, который превращается в новый опыт на корте.',
          offerEyebrow: 'Подарок-впечатление', offerTitle: 'Подарите время для игры', offerCopy: 'Сертификат можно подобрать под разные форматы клуба. Детали и доступность администратор подтвердит перед оформлением.',
          benefits: [
            { title: 'Аренда корта', body: 'Сертификат можно направить на самостоятельную игру; условия бронирования администратор подтвердит при активации.', icon: 'Gift' },
            { title: 'Тренировки и занятия', body: 'Подойдёт для знакомства с паделом или продолжения занятий в доступном формате.', icon: 'BadgeCheck' },
            { title: 'Удобный выбор времени', body: 'Получатель согласует дату и формат визита с клубом с учётом актуального расписания.', icon: 'CalendarCheck' },
            { title: 'Эмоции вместо вещи', body: 'Подарок объединяет движение, игру и время с друзьями или близкими.', icon: 'Sparkles' },
          ],
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
          action: { label: 'Оформить сертификат', mode: 'lead-form', leadType: 'gift' },
          seo: { title: 'Подарочный сертификат на падел — UNLIM RIGA PADEL', description: 'Подарочный сертификат на аренду корта и тренировки по паделу. Условия и доступные форматы подтверждает администратор клуба.', robots: 'index-follow' },
        },
      },
      {
        slug: 'courts-page' as const, data: {
          eyebrow: 'Инфраструктура', title: 'Панорамные корты', intro: 'Турнирная геометрия, профессиональное покрытие и контролируемый климат для стабильной игры круглый год.',
          infographicTitle: 'Корт в цифрах', infographicCopy: 'Параметры площадки и зала, которые напрямую влияют на качество игры.',
          metrics: [
            { value: '4', label: 'панорамных корта', icon: 'Layers3' }, { value: '11.5 м', label: 'высота потолка', icon: 'PanelTop' },
            { value: '350 Lux', label: 'flicker-free свет', icon: 'Lightbulb' }, { value: '+21°C', label: 'климат круглый год', icon: 'Thermometer' },
          ], seo: { title: 'Корты — UNLIM RIGA PADEL', description: 'Панорамные корты Jubo и профессиональное покрытие Mondo.', robots: 'index-follow' },
        },
      },
      { slug: 'gallery-page' as const, data: { eyebrow: 'Сообщество', title: 'Галерея клуба', intro: 'Тренировки, турниры и повседневная жизнь UNLIM RIGA PADEL.', seo: { title: 'Галерея — UNLIM RIGA PADEL', description: 'Фотографии клуба, тренировок и турниров.', robots: 'index-follow' } } },
      {
        slug: 'about-page' as const, data: {
          eyebrow: 'О клубе', title: 'Пространство для игры и сообщества', intro: 'Мы объединили профессиональные корты, сильную тренерскую команду и атмосферу современного спортивного клуба.',
          story: richText('UNLIM RIGA PADEL создан для игроков разного уровня — от первой тренировки до клубных лиг. Пространство спроектировано вокруг качества игры, восстановления и общения.'),
          stats: [{ value: '2023', label: 'год открытия' }, { value: '4', label: 'панорамных корта' }, { value: '9', label: 'тренеров' }, { value: '2 100+', label: 'игроков клуба' }],
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
        const additions = Object.fromEntries(['infographicEyebrow', 'infographicTitle', 'infographicCopy', 'programsTitle', 'article'].filter((key) => current[key] == null).map((key) => [key, (page.data as Record<string, unknown>)[key]]))
        if (Object.keys(additions).length > 0) {
          await payload.updateGlobal({ slug: page.slug, draft: false, overrideAccess: true, data: { ...additions, _status: 'published' } as never })
          stats.globalsPublished += 1
        }
      }
      if (current.seedVersion === seedVersion && page.slug === 'gift-page') {
        const additions = Object.fromEntries(['offerEyebrow', 'offerTitle', 'offerCopy', 'stepsEyebrow', 'stepsTitle', 'faqTitle'].filter((key) => current[key] == null).map((key) => [key, (page.data as Record<string, unknown>)[key]]))
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

    const draftCurrentHome = await payload.findGlobal({ slug: 'homepage', draft: true, depth: 0, overrideAccess: true, showHiddenFields: true })
    const currentHome = draftCurrentHome.seedVersion === seedVersion
      ? await payload.findGlobal({ slug: 'homepage', draft: false, depth: 0, overrideAccess: true, showHiddenFields: true })
      : draftCurrentHome
    if (currentHome.seedVersion === seedVersion) {
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
      if (benefitsChanged) {
        await payload.updateGlobal({ slug: 'homepage', draft: false, overrideAccess: true, data: { benefitsSection: { ...currentHome.benefitsSection, cards: migratedCards }, _status: 'published' } as never })
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
            description: 'Премиальный крытый падел-клуб с испанскими панорамными кортами Jubo Super Panoramic, профессиональным покрытием Mondo Super XN и клубным лаунжем.',
            desktopMedia: mediaID(images.hero),
            primaryAction: { label: 'Забронировать', mode: 'booking' },
            secondaryAction: { label: 'Пробное занятие', mode: 'trial-booking' },
            socialProof: { ratingLabel: '4.9 · 500+ игроков', caption: 'Рейтинг клуба на Новой Риге', coaches: coaches.slice(0, 3).map(({ id }) => id) },
            stats: [
              { value: '2 корта', label: 'Jubo Super Panoramic' }, { value: '11.5 м', label: 'Высота до балок' },
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
              { variant: 'tournament-venue', badge: 'Турниры', title: 'Площадка для турниров', description: 'Профессиональные корты, инфраструктура и команда с опытом проведения соревнований любого масштаба.', image: mediaID(images.offerTournament), overlay: 'overlay-blue', icon: 'Trophy', action: { mode: 'none' } },
              { variant: 'event', badge: 'Мероприятия', title: 'Ваше мероприятие', description: 'Арендуйте площадку для корпоратива, закрытой тренировки, турнира, дня рождения или спортивной встречи — подберём формат и время под вашу задачу.', image: mediaID(images.offerEvent), overlay: 'overlay-violet', icon: 'PartyPopper', action: { mode: 'none' } },
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
            title: 'UNLIM RIGA PADEL — премиальный падел-клуб',
            description: 'UNLIM RIGA PADEL — премиальный падел-клуб: панорамные корты, тренеры, турниры и абонементы.',
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
          phoneDisplay: '+7 999 000-00-00', phoneValue: '+79990000000', email: 'hello@unlimriga.club', transit: 'Мякинино · 12 мин пешком',
          parking: '40 бесплатных мест у входа', openingHours: 'Ежедневно 07:00–00:00', map: { latitude: 55.8, longitude: 37.15, zoom: 14 },
          footerImage: mediaID(images.footerClub),
          footerAbout: 'Unlim Riga Padel — клуб для тех, кто хочет играть на кортах уровня мировых турниров рядом с домом. Мы строили пространство вокруг трёх вещей: качества покрытия, работы тренеров и атмосферы, в которую хочется возвращаться. Здесь одинаково комфортно и новичку на первой тренировке, и резиденту клуба перед финалом лиги.',
          footerStats: [
            { value: '2023', label: 'Год открытия' }, { value: '4', label: 'Панорамных корта' },
            { value: '9', label: 'Тренеров в штате' }, { value: '2 100+', label: 'Игроков в клубе' },
          ],
          legalEntity: 'ООО «Анлим Спорт» · ИНН 5024178932 · ОГРН 1235000078451',
          footerNavigation: [...footerNavigation],
          socialLinks: [
            { provider: 'telegram', label: 'Telegram', url: 'https://t.me' },
            { provider: 'video', label: 'Видео клуба', url: '#' },
            { provider: 'vk', label: 'VK', url: 'https://vk.com' },
            { provider: 'instagram', label: 'Instagram', url: '#' },
          ],
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
