import { ContentUnavailableError } from './projectionCache'
import { homepageDTOversion, parsePadelCourtZakazPageDTO, type PadelCourtZakazPageDTO } from '@unlim/content-contract'
import type { Payload } from 'payload'

import { mediaDTO, pageHeroDTO, requiredMedia, seoDTO, siteDTO } from './normalize'

type Row = Record<string, any>

function stringValue(value: unknown): string {
  return String(value ?? '')
}

export async function createPadelCourtZakazProjection(payload: Payload, options: { origin: string; preview: boolean }): Promise<PadelCourtZakazPageDTO> {
  const { origin, preview } = options
  const [page, site, partners] = await Promise.all([
    payload.findGlobal({ slug: 'padel-court-zakaz-page', draft: preview, depth: 2, overrideAccess: true, showHiddenFields: false } as never) as unknown as Promise<Row>,
    payload.findGlobal({ slug: 'site-settings', draft: preview, depth: 2, overrideAccess: true, showHiddenFields: false }) as unknown as Promise<Row>,
    payload.find({ collection: 'partners', depth: 1, draft: preview, pagination: false, overrideAccess: true, sort: 'homepageOrder', where: preview ? undefined : { and: [{ _status: { equals: 'published' } }, { isActive: { equals: true } }] } } as never) as unknown as Promise<{ docs: Row[] }>,
  ])

  if (!preview && (page._status !== 'published' || site._status !== 'published')) throw new ContentUnavailableError()

  const hero = pageHeroDTO(page, 'padel-court-zakaz', origin)
  const dto = {
    version: homepageDTOversion,
    preview,
    generatedAt: new Date().toISOString(),
    kind: 'padel-court-zakaz' as const,
    page: {
      eyebrow: stringValue(page.eyebrow),
      title: stringValue(page.title),
      intro: stringValue(page.intro),
      hero,
      seo: seoDTO(page.seo, origin),
    },
    site: siteDTO(site as never, origin, partners.docs),
    heroVideo: mediaDTO(page.heroVideo, origin, 'original'),
    hero: {
      primaryLabel: stringValue(page.heroPrimaryLabel),
      secondaryLabel: stringValue(page.heroSecondaryLabel),
      metrics: (page.heroMetrics ?? []).map((item: Row) => ({ title: stringValue(item.title), caption: stringValue(item.caption) })),
    },
    distributor: {
      title: stringValue(page.distributor?.title),
      text: stringValue(page.distributor?.text),
      advantages: (page.distributor?.advantages ?? []).map((item: Row) => ({ index: stringValue(item.index), title: stringValue(item.title), text: stringValue(item.text) })),
    },
    turnkey: {
      title: stringValue(page.turnkey?.title),
      intro: stringValue(page.turnkey?.intro),
      steps: (page.turnkey?.steps ?? []).map((item: Row) => ({
        number: stringValue(item.number),
        title: stringValue(item.title),
        text: stringValue(item.text),
        image: requiredMedia(item.image, origin),
        icon: item.icon,
        overlay: item.overlay,
      })),
    },
    price: {
      title: stringValue(page.price?.title),
      text: stringValue(page.price?.text),
      actionLabel: stringValue(page.price?.actionLabel),
      factors: (page.price?.factors ?? []).map((item: Row) => ({ label: stringValue(item.label), detail: stringValue(item.detail) })),
    },
    technology: {
      title: stringValue(page.technology?.title),
      text: stringValue(page.technology?.text),
      background: requiredMedia(page.technology?.background, origin, 'hero'),
      items: (page.technology?.items ?? []).map((item: Row) => ({ title: stringValue(item.title), tag: stringValue(item.tag), text: stringValue(item.text), icon: item.icon })),
    },
    gallery: {
      title: stringValue(page.gallery?.title),
      text: stringValue(page.gallery?.text),
      creditLabel: stringValue(page.gallery?.creditLabel),
      items: (page.gallery?.items ?? []).map((item: Row) => ({ media: requiredMedia(item.media, origin, 'original'), caption: stringValue(item.caption) })),
    },
    models: {
      title: stringValue(page.models?.title),
      text: stringValue(page.models?.text),
      badge: stringValue(page.models?.badge),
      items: (page.models?.items ?? []).map((item: Row) => ({
        id: stringValue(item.id),
        name: stringValue(item.name),
        eyebrow: stringValue(item.eyebrow),
        title: stringValue(item.title),
        tagline: stringValue(item.tagline),
        description: stringValue(item.description),
        image: requiredMedia(item.image, origin),
        specs: (item.specs ?? []).map((spec: Row) => ({ label: stringValue(spec.label), value: stringValue(spec.value) })),
        highlights: (item.highlights ?? []).map((highlight: Row) => stringValue(highlight.text)),
      })),
    },
    cta: {
      title: stringValue(page.cta?.title),
      text: stringValue(page.cta?.text),
      guarantees: (page.cta?.guarantees ?? []).map((item: Row) => stringValue(item.text)),
      contacts: {
        telegramLabel: stringValue(page.cta?.contacts?.telegramLabel),
        telegramURL: stringValue(page.cta?.contacts?.telegramURL),
        vkLabel: stringValue(page.cta?.contacts?.vkLabel),
        vkURL: stringValue(page.cta?.contacts?.vkURL),
        phoneLabel: stringValue(page.cta?.contacts?.phoneLabel),
      },
      form: Object.fromEntries([
        'title', 'channelLabel', 'nameLabel', 'namePlaceholder', 'phoneLabel', 'phonePlaceholder', 'telegramLabel', 'telegramPlaceholder',
        'vkLabel', 'vkPlaceholder', 'modelLabel', 'modelOptionPrefix', 'consultationOptionLabel', 'courtCountLabel', 'courtCountOneLabel',
        'courtCountTwoThreeLabel', 'courtCountFourSixLabel', 'courtCountSevenPlusLabel', 'cityLabel', 'cityPlaceholder', 'commentLabel',
        'commentPlaceholder', 'consentLabel', 'policyLabel', 'submitLabel', 'successTitle', 'successText', 'resubmitLabel', 'nameError', 'contactError',
        'consentError', 'submitError', 'connectionError',
      ].map((field) => [field, stringValue(page.cta?.form?.[field])])),
    },
  }

  return parsePadelCourtZakazPageDTO(dto)
}
