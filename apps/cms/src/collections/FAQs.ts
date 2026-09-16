import type { CollectionConfig } from 'payload'

import { authenticated, publishedAndActiveOrAuthenticated } from '../fields/access'
import { clearHiddenHomepageOrder, createHomepageOrderField } from '../fields/homepagePlacement'
import { seedKeyField } from '../fields/seedKey'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'Вопрос и ответ', plural: 'Частые вопросы' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedAndActiveOrAuthenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['question', 'showOnHomepage', 'homepageOrder', '_status'],
    group: 'Сообщество',
    useAsTitle: 'question',
  },
  fields: [
    seedKeyField,
    { name: 'question', type: 'text', label: 'Вопрос', required: true },
    { name: 'answer', type: 'textarea', label: 'Ответ', required: true },
    { name: 'isActive', type: 'checkbox', label: 'Активен', defaultValue: true, admin: { position: 'sidebar' } },
    {
      name: 'showOnHomepage',
      type: 'checkbox',
      label: 'Показывать на главной',
      defaultValue: false,
      admin: { description: 'На главной доступно до десяти вопросов.', position: 'sidebar' },
    },
    createHomepageOrderField(10),
  ],
  hooks: { beforeValidate: [clearHiddenHomepageOrder] },
  versions: { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 50 },
}
