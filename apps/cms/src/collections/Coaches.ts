import { coachLevelOptions, coachFocusOptions } from '@unlim/content-contract'
import type { CollectionConfig } from 'payload'

import { authenticated, publishedAndActiveOrAuthenticated } from '../fields/access'
import { createActionField } from '../fields/action'
import { clearHiddenHomepageOrder, createHomepageOrderField } from '../fields/homepagePlacement'
import { imageOnlyFilter } from '../fields/media'
import { seoField } from '../fields/seo'
import { seedKeyField } from '../fields/seedKey'
import { slugField } from '../fields/slug'

export const Coaches: CollectionConfig = {
  slug: 'coaches',
  labels: {
    singular: 'Тренер',
    plural: 'Тренеры',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedAndActiveOrAuthenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'isActive', 'showOnHomepage', 'homepageOrder', '_status'],
    group: 'Клуб',
    useAsTitle: 'name',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Профиль',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Имя',
              required: true,
            },
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              filterOptions: imageOnlyFilter,
              label: 'Фотография',
              required: true,
            },
            {
              name: 'specialization',
              type: 'text',
              label: 'Специализация',
              required: true,
            },
            {
              name: 'bio',
              type: 'textarea',
              label: 'Описание',
              required: true,
            },
            {
              name: 'level',
              type: 'text',
              label: 'Уровни игроков',
              required: true,
            },
            {
              name: 'experience',
              type: 'text',
              label: 'Опыт',
              required: true,
            },
            {
              name: 'languages',
              type: 'text',
              label: 'Языки',
              required: true,
              admin: {
                description: 'Краткая подпись для профиля, например: RU · EN.',
              },
            },
            {
              name: 'levels', type: 'select', hasMany: true, label: 'Уровни — фильтр', required: true,
              options: [...coachLevelOptions],
            },
            {
              name: 'focusAreas', type: 'select', hasMany: true, label: 'Направления — фильтр', required: true,
              options: [...coachFocusOptions],
            },
            {
              name: 'languageCodes', type: 'select', hasMany: true, label: 'Языки — фильтр', required: true,
              options: ['RU', 'EN', 'LV', 'DE'],
            },
            {
              name: 'certificates',
              type: 'array',
              label: 'Сертификаты',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Название',
                  required: true,
                },
              ],
            },
            {
              name: 'rating',
              type: 'number',
              label: 'Рейтинг',
              min: 0,
              max: 5,
              required: true,
            },
            {
              name: 'reviewsCount',
              type: 'number',
              label: 'Количество отзывов',
              min: 0,
              required: true,
              validate: (value: unknown) =>
                typeof value === 'number' && Number.isInteger(value) && value >= 0
                  ? true
                  : 'Укажите целое неотрицательное количество отзывов.',
            },
            {
              name: 'priceFrom',
              type: 'number',
              label: 'Цена тренировки от, ₽',
              min: 0,
              required: true,
            },
            {
              ...createActionField('action', 'Действие профиля'),
              defaultValue: { label: 'Выбрать тренера', mode: 'booking' },
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
      name: 'isActive',
      type: 'checkbox',
      label: 'Действующий тренер',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'showOnHomepage',
      type: 'checkbox',
      label: 'Показывать на главной',
      defaultValue: false,
      admin: {
        description: 'Главная читает эту же запись; отдельной копии карточки нет.',
        position: 'sidebar',
      },
    },
    createHomepageOrderField(8),
  ],
  hooks: {
    beforeValidate: [clearHiddenHomepageOrder],
  },
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
