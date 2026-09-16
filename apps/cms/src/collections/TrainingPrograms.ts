import type { CollectionConfig } from 'payload'

import { authenticated, publishedAndActiveOrAuthenticated } from '../fields/access'
import { createActionField } from '../fields/action'
import { clearHiddenHomepageOrder, createHomepageOrderField } from '../fields/homepagePlacement'
import { imageOnlyFilter } from '../fields/media'
import { imageOverlayOptions } from '../fields/presentation'
import { seoField } from '../fields/seo'
import { seedKeyField } from '../fields/seedKey'
import { slugField } from '../fields/slug'

export const TrainingPrograms: CollectionConfig = {
  slug: 'training-programs',
  labels: { singular: 'Программа тренировок', plural: 'Программы тренировок' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedAndActiveOrAuthenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'priceFrom', 'isActive', 'showOnHomepage', 'homepageOrder', '_status'],
    group: 'Услуги',
    useAsTitle: 'title',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Программа',
          fields: [
            { name: 'title', type: 'text', label: 'Название', required: true },
            { name: 'badge', type: 'text', label: 'Бейдж', required: true },
            { name: 'description', type: 'textarea', label: 'Описание', required: true },
            { name: 'image', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Изображение', required: true },
            {
              name: 'overlay',
              type: 'select',
              label: 'Тон изображения',
              options: [...imageOverlayOptions],
              required: true,
            },
            {
              name: 'icon',
              type: 'select',
              label: 'Иконка',
              required: true,
              options: [
                { label: 'Один игрок', value: 'User' },
                { label: 'Группа', value: 'Users' },
                { label: 'Дети', value: 'Baby' },
              ],
            },
            { name: 'priceFrom', type: 'number', label: 'Цена от, ₽', min: 0, required: true },
            createActionField('action', 'Действие'),
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    slugField,
    seedKeyField,
    { name: 'isActive', type: 'checkbox', label: 'Активна', defaultValue: true, admin: { position: 'sidebar' } },
    {
      name: 'showOnHomepage',
      type: 'checkbox',
      label: 'Показывать на главной',
      defaultValue: false,
      admin: { description: 'Не более пяти программ.', position: 'sidebar' },
    },
    createHomepageOrderField(5),
  ],
  hooks: { beforeValidate: [clearHiddenHomepageOrder] },
  versions: { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 50 },
}
