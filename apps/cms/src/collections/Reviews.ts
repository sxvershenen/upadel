import type { CollectionConfig } from 'payload'

import { authenticated, publishedAndActiveOrAuthenticated } from '../fields/access'
import { clearHiddenHomepageOrder, createHomepageOrderField } from '../fields/homepagePlacement'
import { imageOnlyFilter } from '../fields/media'
import { seedKeyField } from '../fields/seedKey'
import { validateHTTPSURL } from '../fields/url'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Отзыв', plural: 'Отзывы' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedAndActiveOrAuthenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['authorName', 'rating', 'source', 'showOnHomepage', 'homepageOrder', '_status'],
    group: 'Сообщество',
    useAsTitle: 'authorName',
  },
  fields: [
    seedKeyField,
    { name: 'authorName', type: 'text', label: 'Имя автора', required: true },
    { name: 'authorMeta', type: 'text', label: 'Подпись автора', required: true },
    { name: 'avatar', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Аватар' },
    { name: 'rating', type: 'number', label: 'Оценка', min: 1, max: 5, required: true },
    { name: 'text', type: 'textarea', label: 'Текст', required: true },
    {
      name: 'source',
      type: 'select',
      label: 'Источник',
      defaultValue: 'club',
      required: true,
      options: [
        { label: 'Клуб', value: 'club' },
        { label: 'Яндекс Карты', value: 'yandex' },
        { label: 'Другой подтверждённый источник', value: 'other' },
      ],
    },
    { name: 'sourceURL', type: 'text', label: 'Ссылка на источник', validate: validateHTTPSURL },
    { name: 'isActive', type: 'checkbox', label: 'Активен', defaultValue: true, admin: { position: 'sidebar' } },
    {
      name: 'showOnHomepage',
      type: 'checkbox',
      label: 'Показывать на главной',
      defaultValue: false,
      admin: { description: 'Текущий вертикальный marquee поддерживает до восьми отзывов.', position: 'sidebar' },
    },
    createHomepageOrderField(8),
  ],
  hooks: { beforeValidate: [clearHiddenHomepageOrder] },
  versions: { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 50 },
}
