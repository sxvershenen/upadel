import type { CollectionConfig } from 'payload'

import { authenticated, publishedAndActiveOrAuthenticated } from '../fields/access'
import { createActionField } from '../fields/action'
import { clearHiddenHomepageOrder, createHomepageOrderField } from '../fields/homepagePlacement'
import { badgeToneOptions, meshToneOptions } from '../fields/presentation'
import { seedKeyField } from '../fields/seedKey'

export const RentalRates: CollectionConfig = {
  slug: 'rental-rates',
  labels: { singular: 'Тариф аренды', plural: 'Тарифы аренды' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedAndActiveOrAuthenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'cardVariant', 'price', 'showOnHomepage', 'homepageOrder', '_status'],
    group: 'Услуги',
    useAsTitle: 'title',
  },
  fields: [
    seedKeyField,
    { name: 'title', type: 'text', label: 'Название', required: true },
    { name: 'eyebrow', type: 'text', label: 'Надзаголовок' },
    { name: 'timeLabel', type: 'text', label: 'Время или пояснение' },
    { name: 'description', type: 'textarea', label: 'Описание', required: true },
    { name: 'price', type: 'number', label: 'Цена, ₽', min: 0 },
    { name: 'priceLabel', type: 'text', label: 'Подпись цены' },
    { name: 'priceSuffix', type: 'text', label: 'Суффикс цены', defaultValue: '/ час' },
    { name: 'badge', type: 'text', label: 'Текст бейджа' },
    { name: 'badgeTone', type: 'select', label: 'Тон бейджа', options: [...badgeToneOptions] },
    {
      name: 'cardVariant',
      type: 'select',
      label: 'Recipe карточки',
      required: true,
      options: [
        { label: 'Обычный тариф', value: 'rate' },
        { label: 'Пробная тренировка', value: 'trial' },
        { label: 'Стандарты сервиса', value: 'standards' },
      ],
    },
    { name: 'meshTone', type: 'select', label: 'Mesh-тон', options: [...meshToneOptions] },
    {
      name: 'includedItems',
      type: 'array',
      label: 'Что включено',
      maxRows: 5,
      fields: [{ name: 'text', type: 'text', label: 'Пункт', required: true }],
    },
    createActionField('action', 'Действие'),
    { name: 'isActive', type: 'checkbox', label: 'Активен', defaultValue: true, admin: { position: 'sidebar' } },
    {
      name: 'showOnHomepage',
      type: 'checkbox',
      label: 'Показывать на главной',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    createHomepageOrderField(4),
  ],
  hooks: { beforeValidate: [clearHiddenHomepageOrder] },
  versions: { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 50 },
}
