import type { GlobalConfig } from 'payload'

import { authenticated } from '../fields/access'
import { clubFields, communityFields, heroFields, servicesFields } from '../fields/homepageContent'
import { homepageSectionsField } from '../fields/homepageSections'
import { seoField } from '../fields/seo'
import { requirePublishedGlobal } from '../hooks/requirePublishedGlobal'

function getLivePreviewURL(): string | undefined {
  const publicWebURL = process.env.PUBLIC_WEB_URL
  const previewSecret = process.env.PREVIEW_SECRET
  if (!publicWebURL || !previewSecret) return undefined

  const url = new URL('/preview/homepage', publicWebURL)
  url.searchParams.set('secret', previewSecret)
  return url.toString()
}

export const HomePage: GlobalConfig = {
  slug: 'homepage',
  label: 'Главная',
  access: {
    read: () => true,
    readVersions: authenticated,
    update: authenticated,
  },
  admin: {
    group: 'Страницы',
    livePreview: {
      url: getLivePreviewURL,
    },
  },
  fields: [
    {
      name: 'seedVersion',
      type: 'text',
      admin: { hidden: true },
      access: { read: ({ req }) => Boolean(req.user) },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Структура',
          admin: {
            description:
              'Здесь задаются только порядок и видимость code-defined секций. Карточки тренеров и турниров выбираются флагом и порядком в коллекциях; блог использует три уникальные позиции и newest-published fallback.',
          },
          fields: [homepageSectionsField],
        },
        {
          label: 'Первый экран',
          fields: heroFields,
        },
        {
          label: 'Клуб',
          fields: clubFields,
        },
        {
          label: 'Услуги',
          fields: servicesFields,
        },
        {
          label: 'Сообщество',
          fields: communityFields,
        },
        {
          label: 'SEO',
          fields: [seoField],
        },
      ],
    },
  ],
  hooks: {
    beforeRead: [requirePublishedGlobal],
  },
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
      validate: true,
    },
    max: 50,
  },
}
