import type { GlobalConfig } from 'payload'

import { authenticated } from '../fields/access'
import { pageHeroFields } from '../fields/pageHero'
import { seoField } from '../fields/seo'
import { requirePublishedGlobal } from '../hooks/requirePublishedGlobal'

type Args = { label: string; previewType: 'blog' | 'coaches' | 'tournaments'; slug: 'blog-page' | 'coaches-page' | 'tournaments-page' }

export function createCatalogPage({ label, previewType, slug }: Args): GlobalConfig {
  return {
    slug,
    label,
    access: { read: () => true, readVersions: authenticated, update: authenticated },
    admin: {
      group: 'Страницы',
      livePreview: {
        url: () => {
          if (!process.env.PUBLIC_WEB_URL || !process.env.PREVIEW_SECRET) return undefined
          const url = new URL('/preview/catalog', process.env.PUBLIC_WEB_URL)
          url.searchParams.set('type', previewType)
          url.searchParams.set('secret', process.env.PREVIEW_SECRET)
          return url.toString()
        },
      },
    },
    fields: [
      { name: 'seedVersion', type: 'text', admin: { hidden: true }, access: { read: () => false } },
      {
        type: 'tabs',
        tabs: [
          {
            label: 'Содержание',
            fields: [
              { name: 'eyebrow', type: 'text', label: 'Надзаголовок', required: true },
              { name: 'title', type: 'text', label: 'Заголовок', required: true },
              { name: 'intro', type: 'textarea', label: 'Вводный текст', required: true },
            ],
          },
          { label: 'Шапка страницы', fields: pageHeroFields },
          { label: 'SEO', fields: [seoField] },
        ],
      },
    ],
    hooks: { beforeRead: [requirePublishedGlobal] },
    versions: { drafts: { autosave: true, schedulePublish: true }, max: 50 },
  }
}
