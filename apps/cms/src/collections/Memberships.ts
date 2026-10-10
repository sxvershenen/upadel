import type { CollectionConfig } from 'payload'

import { authenticated, publishedAndActiveOrAuthenticated } from '../fields/access'
import { createActionField } from '../fields/action'
import { clearHiddenHomepageOrder, createHomepageOrderField } from '../fields/homepagePlacement'
import { badgeToneOptions, meshToneOptions } from '../fields/presentation'
import { seedKeyField } from '../fields/seedKey'

export const Memberships: CollectionConfig = {
  slug: 'memberships',
  labels: { singular: 'Абонемент', plural: 'Абонементы' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedAndActiveOrAuthenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'isActive', 'cardVariant', 'priceLabel', 'showOnHomepage', 'homepageOrder', '_status'],
    description: 'Переключатель разделов на /prices показывается, если есть хотя бы один опубликованный активный абонемент. Если отключить последний или снять с публикации все активные записи, скроется весь переключатель — не только раздел «Абонементы». Чтобы вернуть его, включите и опубликуйте абонемент; записи и их данные сохраняются. На главной при отсутствии таких записей останутся «Аренда» и «Тренировки»; чтобы добавить абонемент, включите «Показывать на главной» и задайте допустимый порядок.',
    group: 'Услуги',
    useAsTitle: 'title',
  },
  fields: [
    seedKeyField,
    { name: 'title', type: 'text', label: 'Название', required: true },
    { name: 'badge', type: 'text', label: 'Бейдж' },
    { name: 'badgeTone', type: 'select', label: 'Тон бейджа', options: [...badgeToneOptions] },
    { name: 'description', type: 'textarea', label: 'Описание', required: true },
    {
      name: 'cardVariant',
      type: 'select',
      label: 'Recipe карточки',
      required: true,
      options: [
        { label: 'Подарочный сертификат', value: 'gift' },
        { label: 'Пакет игр', value: 'package' },
        { label: 'Популярный пакет', value: 'featured-package' },
        { label: 'Резидент клуба', value: 'resident' },
      ],
    },
    { name: 'meshTone', type: 'select', label: 'Mesh-тон', options: [...meshToneOptions] },
    { name: 'price', type: 'number', label: 'Цена, ₽', min: 0 },
    { name: 'oldPrice', type: 'number', label: 'Старая цена, ₽', min: 0 },
    { name: 'priceLabel', type: 'text', label: 'Подпись цены', defaultValue: 'Цена по запросу' },
    {
      name: 'benefits',
      type: 'array',
      label: 'Преимущества',
      maxRows: 5,
      fields: [{ name: 'text', type: 'text', label: 'Пункт', required: true }],
    },
    {
      name: 'giftAmountLimits',
      type: 'group',
      label: 'Допустимая сумма сертификата',
      admin: { condition: (_, siblingData) => siblingData.cardVariant === 'gift' },
      fields: [
        { name: 'minimum', type: 'number', label: 'Минимум, ₽', defaultValue: 1000, min: 0 },
        { name: 'maximum', type: 'number', label: 'Максимум, ₽', defaultValue: 100000, min: 0 },
      ],
    },
    createActionField('action', 'Действие'),
    { name: 'isActive', type: 'checkbox', label: 'Показывать тариф на сайте', defaultValue: true, admin: { position: 'sidebar', description: 'Для переключателя разделов на /prices нужен хотя бы один опубликованный активный абонемент. Отключение последнего скроет весь переключатель, но запись и её данные сохранятся. Для главной дополнительно нужны флаг «Показывать на главной» и допустимый порядок.' } },
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
