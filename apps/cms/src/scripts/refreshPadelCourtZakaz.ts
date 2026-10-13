import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload } from 'payload'
import config from '../payload.config'
import { padelCourtZakazSeed } from '../content/padelCourtZakazSeed'

const payload = await getPayload({ config })
const options = { depth: 0, overrideAccess: true, showHiddenFields: true }
const publicRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../web/public')
const legalEntity = 'ИП Баранова Татьяна Геннадьевна · ИНН 772803390700 · ОГРНИП 322774600668879 · E-mail: t.baranova@mail.ru'

async function media(seedKey: string, filename: string, alt: string, generated = false) {
  const matches = await payload.find({
    ...options,
    collection: 'media',
    limit: 1,
    where: { seedKey: { equals: seedKey } },
  })
  if (matches.docs[0]) return matches.docs[0].id

  const bytes = await readFile(path.join(publicRoot, filename))
  const fileName = path.basename(filename)
  const result = await payload.create({
    ...options,
    collection: 'media',
    data: {
      seedKey,
      alt,
      credit: generated ? 'Создано с помощью ИИ для UNLIM RIGA PADEL' : 'Изображение JUBO Padel предоставлено владельцем проекта',
      sourceURL: `apps/web/public/${filename}`,
      usageRights: generated
        ? 'Изображение создано по запросу владельца проекта с помощью генеративной модели.'
        : 'Файл предоставлен владельцем проекта для публикации на сайте UNLIM.',
    },
    file: { data: bytes, mimetype: 'image/webp', name: fileName, size: bytes.byteLength },
  })
  return result.id
}

try {
  const page = await payload.findGlobal({ ...options, slug: 'padel-court-zakaz-page', draft: false }) as Record<string, any>
  const settings = await payload.findGlobal({ ...options, slug: 'site-settings', draft: false }) as Record<string, any>
  const about = await payload.findGlobal({ ...options, slug: 'about-page', draft: false }) as Record<string, any>

  if (!page.models || !Array.isArray(page.models.items)) throw new Error('Published court models were not found; nothing was updated.')
  const uploadedModels = new Map<string, number | string>()
  for (const model of padelCourtZakazSeed.models.items) {
    uploadedModels.set(model.id, await media(
      `court-content:${model.id}:image-v1`,
      model.image.source,
      model.image.alt,
    ))
  }
  const currentById = new Map<string, Record<string, any>>(
    page.models.items.map((item: Record<string, any>) => [item.id, item] as const),
  )
  for (const model of padelCourtZakazSeed.models.items) {
    if (!currentById.has(model.id)) throw new Error(`Published page is missing model ${model.id}; nothing was updated.`)
  }
  const modelItems = padelCourtZakazSeed.models.items.map((model) => {
    const current = currentById.get(model.id)!
    const legacyVision = model.id === 'vision-pro' && current.title === 'Сверхжёсткая металлоконструкция для непрерывной игры'
    const legacyXtrem = model.id === 'infinity-xtrem' && current.title?.includes('260 км/ч')
    return {
      ...current,
      image: uploadedModels.get(model.id),
      specs: model.specs.map(({ label, value }) => ({ label, value })),
      ...(legacyVision || legacyXtrem ? {
        eyebrow: model.eyebrow,
        title: model.title,
        tagline: model.tagline,
        description: model.description,
        highlights: model.highlights.map((text) => ({ text })),
      } : {}),
    }
  })
  const technologyItems = (page.technology?.items ?? []).map((item: Record<string, any>) => {
    const legacyWind = item.icon === 'Wind' && /260 км\/ч|140 км\/ч/.test(`${item.title ?? ''} ${item.text ?? ''}`)
    const legacyCoating = item.icon === 'ShieldCheck' && item.title === 'Антикоррозия Magnelis® C4/C5'
    const source = padelCourtZakazSeed.technology.items.find((entry) => entry.icon === item.icon)
    return (legacyWind || legacyCoating) && source ? { ...item, ...source } : item
  })
  const distributorAdvantages = (page.distributor?.advantages ?? []).map((item: Record<string, any>, index: number) =>
    index === 1 && typeof item.text === 'string' && /Magnelis® C4\/?C5/.test(item.text)
      ? { ...item, ...padelCourtZakazSeed.distributor.advantages[1] }
      : item,
  )
  await payload.updateGlobal({
    ...options,
    slug: 'padel-court-zakaz-page',
    draft: false,
    data: {
      models: { ...page.models, items: modelItems },
      ...(page.technology ? { technology: { ...page.technology, items: technologyItems } } : {}),
      ...(page.distributor ? { distributor: { ...page.distributor, advantages: distributorAdvantages } } : {}),
      _status: 'published',
    },
  } as never)

  const footerImage = await media(
    'court-content:footer-super-panoramic-player:v2',
    'images/footer/super-panoramic-player-v2.webp',
    'Игрок с ракеткой на корте JUBO Super Panoramic',
    true,
  )
  const footerStats = (settings.footerStats ?? []).map((item: Record<string, any>) =>
    item.label === 'Год открытия' ? { ...item, value: '2026' } : item,
  )
  await payload.updateGlobal({
    ...options,
    slug: 'site-settings',
    draft: false,
    data: { footerImage, footerStats, legalEntity, email: 't.baranova@mail.ru', _status: 'published' },
  } as never)

  const aboutStats = (about.stats ?? []).map((item: Record<string, any>) =>
    item.label?.toLowerCase() === 'год открытия' ? { ...item, value: '2026' } : item,
  )
  if (aboutStats.length > 0) {
    await payload.updateGlobal({
      ...options,
      slug: 'about-page',
      draft: false,
      data: { stats: aboutStats, _status: 'published' },
    } as never)
  }

  payload.logger.info('Updated published court model images/specifications, footer photo/requisites, and club opening year.')
} finally {
  await payload.destroy()
}
