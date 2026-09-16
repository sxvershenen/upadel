import type { CollectionConfig } from 'payload'

import { authenticated, publishedAndActiveOrAuthenticated } from '../fields/access'
import { clearHiddenHomepageOrder, createHomepageOrderField } from '../fields/homepagePlacement'
import { imageOnlyFilter } from '../fields/media'
import { seedKeyField } from '../fields/seedKey'
import { validateHTTPSURL } from '../fields/url'

export const Partners: CollectionConfig = {
  slug: 'partners',
  labels: { singular: 'Партнёр', plural: 'Партнёры' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedAndActiveOrAuthenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'showOnHomepage', 'homepageOrder', '_status'],
    group: 'Клуб',
    useAsTitle: 'name',
  },
  fields: [
    seedKeyField,
    { name: 'name', type: 'text', label: 'Название', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Логотип' },
    { name: 'websiteURL', type: 'text', label: 'Сайт', validate: validateHTTPSURL },
    { name: 'isActive', type: 'checkbox', label: 'Активен', defaultValue: true, admin: { position: 'sidebar' } },
    {
      name: 'showOnHomepage',
      type: 'checkbox',
      label: 'Показывать на главной',
      defaultValue: false,
      admin: { description: 'Marquee главной поддерживает до двенадцати партнёров.', position: 'sidebar' },
    },
    createHomepageOrderField(12),
  ],
  hooks: { beforeValidate: [clearHiddenHomepageOrder] },
  versions: { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 50 },
}
