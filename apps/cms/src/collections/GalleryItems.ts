import type { CollectionConfig } from 'payload'

import { authenticated, publishedAndActiveOrAuthenticated } from '../fields/access'
import { clearHiddenHomepageOrder, createHomepageOrderField } from '../fields/homepagePlacement'
import { imageOnlyFilter } from '../fields/media'
import { seedKeyField } from '../fields/seedKey'

const clearPagePlacementOrders = ({ data, originalDoc }: { data?: Record<string, unknown>; originalDoc?: Record<string, unknown> }) => {
  if (!data) return data
  const showOnCourtsPage = data.showOnCourtsPage ?? originalDoc?.showOnCourtsPage
  const showOnAboutPage = data.showOnAboutPage ?? originalDoc?.showOnAboutPage
  if (showOnCourtsPage !== true) data.courtsPageOrder = null
  if (showOnAboutPage !== true) data.aboutPageOrder = null
  return data
}

export const GalleryItems: CollectionConfig = {
  slug: 'gallery-items',
  labels: { singular: 'Фото галереи', plural: 'Галерея' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedAndActiveOrAuthenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  admin: {
    components: {
      views: {
        list: {
          Component: '/components/admin/GalleryGrid#GalleryListView',
        },
      },
    },
    defaultColumns: ['title', 'showOnHomepage', 'homepageOrder', '_status'],
    group: 'Сообщество',
    useAsTitle: 'title',
  },
  fields: [
    seedKeyField,
    { name: 'title', type: 'text', label: 'Название', required: true },
    { name: 'media', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Изображение', required: true },
    { name: 'caption', type: 'textarea', label: 'Подпись' },
    { name: 'isActive', type: 'checkbox', label: 'Активно', defaultValue: true, admin: { position: 'sidebar' } },
    {
      name: 'showOnHomepage',
      type: 'checkbox',
      label: 'Показывать на главной',
      defaultValue: false,
      admin: { description: 'На главной доступно до десяти элементов.', position: 'sidebar' },
    },
    createHomepageOrderField(10),
    {
      name: 'galleryPageOrder', type: 'number', label: 'Порядок в полной галерее', min: 1, max: 500, unique: true,
      admin: { description: 'Необязательно. Без значения новые элементы идут по дате создания, затем по ID.', position: 'sidebar' },
    },
    { name: 'showOnCourtsPage', type: 'checkbox', label: 'Показывать на странице кортов', defaultValue: false, admin: { position: 'sidebar' } },
    {
      name: 'courtsPageOrder', type: 'number', label: 'Порядок на странице кортов', min: 1, max: 50, unique: true,
      admin: { condition: (_, siblingData) => siblingData.showOnCourtsPage, position: 'sidebar' },
      validate: (value: unknown, options: unknown) => !(options as { siblingData?: { showOnCourtsPage?: boolean } }).siblingData?.showOnCourtsPage || typeof value === 'number' ? true : 'Укажите порядок на странице кортов.',
    },
    { name: 'showOnAboutPage', type: 'checkbox', label: 'Показывать на странице клуба', defaultValue: false, admin: { position: 'sidebar' } },
    {
      name: 'aboutPageOrder', type: 'number', label: 'Порядок на странице клуба', min: 1, max: 50, unique: true,
      admin: { condition: (_, siblingData) => siblingData.showOnAboutPage, position: 'sidebar' },
      validate: (value: unknown, options: unknown) => !(options as { siblingData?: { showOnAboutPage?: boolean } }).siblingData?.showOnAboutPage || typeof value === 'number' ? true : 'Укажите порядок на странице клуба.',
    },
  ],
  hooks: { beforeValidate: [clearHiddenHomepageOrder, clearPagePlacementOrders] },
  versions: { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 50 },
}
