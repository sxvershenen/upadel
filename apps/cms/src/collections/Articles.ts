import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '../fields/access'
import { imageOnlyFilter } from '../fields/media'
import { seoField } from '../fields/seo'
import { seedKeyField } from '../fields/seedKey'
import { slugField } from '../fields/slug'
import { setPublishedAt } from '../hooks/setPublishedAt'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: 'Статья',
    plural: 'Статьи',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedOrAuthenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'category', 'homePosition', 'publishedAt', '_status'],
    group: 'Контент',
    useAsTitle: 'title',
  },
  defaultSort: '-publishedAt',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Статья',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Заголовок',
              required: true,
            },
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'article-categories',
              label: 'Категория',
              required: true,
              admin: {
                allowCreate: true,
                allowEdit: true,
              },
            },
            {
              name: 'excerpt',
              type: 'textarea',
              label: 'Краткое описание',
              maxLength: 320,
              required: true,
            },
            {
              name: 'content',
              type: 'richText',
              label: 'Текст статьи',
              required: true,
            },
            {
              name: 'previewImage',
              type: 'upload',
              relationTo: 'media',
              filterOptions: imageOnlyFilter,
              label: 'Изображение карточки',
              required: true,
              admin: {
                description: 'Единственный источник preview image для карточек статьи, включая главную.',
              },
            },
            {
              name: 'readingTimeMinutes',
              type: 'number',
              label: 'Время чтения, минут',
              min: 1,
              required: true,
              admin: {
                step: 1,
              },
              validate: (value: unknown) =>
                typeof value === 'number' && Number.isInteger(value) && value >= 1
                  ? true
                  : 'Укажите целое количество минут, не меньше одной.',
            },
          ],
        },
        {
          label: 'SEO',
          fields: [seoField],
        },
      ],
    },
    slugField,
    seedKeyField,
    {
      name: 'homePosition',
      type: 'select',
      label: 'Позиция на главной',
      unique: true,
      options: [
        { label: '1 — первая карточка', value: '1' },
        { label: '2 — вторая карточка', value: '2' },
        { label: '3 — третья карточка', value: '3' },
      ],
      admin: {
        description:
          'Необязательно. Позиция уникальна и резервируется даже черновиком; незакреплённые места заполняются новейшими опубликованными статьями.',
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Дата публикации',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'popularityScore',
      type: 'number',
      label: 'Сигнал популярности',
      defaultValue: 0,
      min: 0,
      access: {
        create: () => false,
        update: () => false,
      },
      admin: {
        description: 'Служебное поле для будущей серверной агрегации аналитики; публичные и редакторские записи запрещены.',
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [setPublishedAt],
  },
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
