import type { GroupField } from 'payload'

import { imageOnlyFilter } from './media'

export const seoField: GroupField = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Заголовок страницы',
      maxLength: 60,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание страницы',
      maxLength: 160,
    },
    {
      name: 'canonical',
      type: 'text',
      label: 'Canonical URL',
      admin: {
        description: 'Оставьте пустым, чтобы использовать основной публичный URL записи.',
      },
      validate: (value: unknown) => {
        if (!value) return true
        if (typeof value !== 'string') return 'Укажите корректный полный URL.'

        try {
          const url = new URL(value)
          return url.protocol === 'http:' || url.protocol === 'https:'
            ? true
            : 'Укажите полный URL с http:// или https://.'
        } catch {
          return 'Укажите корректный полный URL.'
        }
      },
    },
    {
      name: 'robots',
      type: 'select',
      label: 'Индексация',
      defaultValue: 'index-follow',
      required: true,
      options: [
        { label: 'Индексировать и переходить по ссылкам', value: 'index-follow' },
        { label: 'Не индексировать, переходить по ссылкам', value: 'noindex-follow' },
        { label: 'Не индексировать и не переходить по ссылкам', value: 'noindex-nofollow' },
      ],
    },
    {
      name: 'socialImage',
      type: 'upload',
      relationTo: 'media',
      filterOptions: imageOnlyFilter,
      label: 'Изображение для соцсетей',
      admin: {
        description: 'Не заменяет фотографию карточки или preview image самой сущности.',
      },
    },
  ],
}
