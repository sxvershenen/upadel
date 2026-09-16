import type { CollectionConfig } from 'payload'

import { seedKeyField } from '../fields/seedKey'
import { preventDeleteReferencedMedia } from '../hooks/preventDeleteReferencedMedia'
import { optimizeMediaUploadBeforeOperation } from '../uploads/mediaOptimization'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Медиафайл',
    plural: 'Медиа',
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    components: {
      views: {
        list: {
          Component: '/components/admin/MediaList#MediaListView',
        },
      },
    },
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
    description: 'Изображения: до 25 МиБ. MP4/WebM: до 100 МиБ. Видео хранится как загружено — заранее подготовьте его для веба; транскодирование и object storage отложены.',
    group: 'Контент',
  },
  fields: [
    {
      name: 'usage',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/MediaUsageField#MediaUsageField',
        },
      },
    },
    seedKeyField,
    {
      name: 'alt',
      type: 'text',
      label: 'Альтернативный текст',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
      label: 'Подпись',
    },
    {
      name: 'credit',
      type: 'text',
      label: 'Автор / источник',
      access: { read: ({ req }) => Boolean(req.user) },
    },
    {
      name: 'usageRights',
      type: 'textarea',
      label: 'Права и ограничения использования',
      access: { read: ({ req }) => Boolean(req.user) },
      admin: {
        description: 'Зафиксируйте лицензию, согласие или внутренний источник файла.',
      },
    },
    {
      name: 'sourceURL',
      type: 'text',
      label: 'Исходный URL',
      access: { read: ({ req }) => Boolean(req.user) },
      admin: { readOnly: true },
    },
  ],
  upload: {
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 480,
        height: 480,
        position: 'centre',
        withoutEnlargement: true,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'card',
        width: 1200,
        withoutEnlargement: true,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'hero',
        width: 1920,
        withoutEnlargement: true,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
    ],
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
  },
  hooks: {
    beforeOperation: [optimizeMediaUploadBeforeOperation],
    beforeDelete: [preventDeleteReferencedMedia],
  },
}
