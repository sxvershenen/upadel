import type { CollectionConfig } from 'payload'

import { authenticated, publishedAndActiveOrAuthenticated } from '../fields/access'
import { clearHiddenHomepageOrder, createHomepageOrderField } from '../fields/homepagePlacement'
import { seoField } from '../fields/seo'
import { seedKeyField } from '../fields/seedKey'
import { slugField } from '../fields/slug'

export const Courts: CollectionConfig = {
  slug: 'courts',
  labels: { singular: 'Корт', plural: 'Корты' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedAndActiveOrAuthenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'cardVariant', 'isActive', 'showOnHomepage', 'homepageOrder', '_status'],
    group: 'Клуб',
    useAsTitle: 'title',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Основное',
          fields: [
            { name: 'title', type: 'text', label: 'Название', required: true },
            { name: 'eyebrow', type: 'text', label: 'Надзаголовок' },
            {
              name: 'description',
              type: 'textarea',
              label: 'Описание',
              validate: (value: unknown, options: unknown) => {
                const variant = (options as { siblingData?: { cardVariant?: unknown } }).siblingData?.cardVariant
                return variant === 'metrics' || (typeof value === 'string' && value.length > 0)
                  ? true
                  : 'Для этого recipe заполните описание.'
              },
            },
            {
              name: 'cardVariant',
              type: 'select',
              label: 'Recipe карточки',
              required: true,
              options: [
                { label: 'JUBO Super Panoramic', value: 'panoramic' },
                { label: 'Сетка метрик', value: 'metrics' },
                { label: 'Демпферная система', value: 'damping' },
                { label: 'Покрытие', value: 'surface' },
              ],
              admin: { description: 'Только утверждённые recipes текущей design system.' },
            },
            {
              name: 'metrics',
              type: 'array',
              label: 'Метрики',
              maxRows: 4,
              admin: { condition: (_, siblingData) => siblingData.cardVariant === 'metrics' },
              fields: [
                { name: 'value', type: 'text', label: 'Значение', required: true },
                { name: 'label', type: 'text', label: 'Подпись', required: true },
                {
                  name: 'icon',
                  type: 'select',
                  label: 'Иконка',
                  required: true,
                  options: [
                    { label: 'Потолок', value: 'PanelTop' },
                    { label: 'Свет', value: 'Lightbulb' },
                    { label: 'Активность', value: 'Activity' },
                    { label: 'Корты', value: 'Layers3' },
                  ],
                },
              ],
              validate: (value: unknown, options: unknown) => {
                const variant = (options as { siblingData?: { cardVariant?: unknown } }).siblingData?.cardVariant
                return variant !== 'metrics' || (Array.isArray(value) && value.length === 4)
                  ? true
                  : 'Recipe метрик требует ровно четыре значения.'
              },
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    slugField,
    seedKeyField,
    { name: 'isActive', type: 'checkbox', label: 'Активен', defaultValue: true, admin: { position: 'sidebar' } },
    {
      name: 'showOnHomepage',
      type: 'checkbox',
      label: 'Показывать на главной',
      defaultValue: false,
      admin: { description: 'Главная использует эту же запись.', position: 'sidebar' },
    },
    createHomepageOrderField(4),
  ],
  hooks: { beforeValidate: [clearHiddenHomepageOrder] },
  versions: { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 50 },
}
