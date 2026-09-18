import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '../fields/access'
import { createActionField } from '../fields/action'
import { clearHiddenHomepageOrder, createHomepageOrderField } from '../fields/homepagePlacement'
import { imageOnlyFilter } from '../fields/media'
import { imageOverlayOptions, meshToneOptions } from '../fields/presentation'
import { seoField } from '../fields/seo'
import { seedKeyField } from '../fields/seedKey'
import { slugField } from '../fields/slug'

export const Tournaments: CollectionConfig = {
  slug: 'tournaments',
  labels: {
    singular: 'Турнир',
    plural: 'Турниры',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedOrAuthenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'lifecycle', 'showOnHomepage', 'homepageOrder', '_status'],
    group: 'Клуб',
    useAsTitle: 'title',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Турнир',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Название',
              required: true,
            },
            {
              name: 'category',
              type: 'text',
              label: 'Legacy: категория',
              required: true,
              admin: { hidden: true },
            },
            {
              name: 'categoryKey', type: 'select', label: 'Legacy: категория — фильтр', required: true,
              options: [
                { label: 'Клубная игра', value: 'club-game' }, { label: 'Мужская лига', value: 'mens-league' },
                { label: 'Женский Open', value: 'womens-open' }, { label: 'Детский турнир', value: 'junior' },
                { label: 'Открытый турнир', value: 'open' },
              ],
              admin: { hidden: true },
            },
            {
              name: 'level',
              type: 'text',
              label: 'Уровень игроков',
              required: true,
              admin: { description: 'Шкала подготовки игрока от 1.0 до 7.0.' },
            },
            {
              name: 'levelKey', type: 'select', label: 'Уровень игроков — фильтр', required: true,
              options: [...['1.0', '2.0', '3.0', '4.0', '5.0', '6.0', '7.0'].map((value) => ({ label: value, value }))],
            },
            {
              name: 'lifecycle',
              type: 'select',
              label: 'Состояние турнира',
              defaultValue: 'upcoming',
              required: true,
              options: [
                { label: 'Предстоящий', value: 'upcoming' },
                { label: 'Идёт сейчас', value: 'active' },
                { label: 'Завершён', value: 'finished' },
                { label: 'Отменён', value: 'cancelled' },
              ],
              admin: {
                description: 'Не зависит от статуса черновик/опубликовано.',
              },
            },
            {
              name: 'scheduleLabel',
              type: 'text',
              label: 'Дата и время для карточки',
              required: true,
              admin: {
                description: 'Например: Каждую пятницу · 19:30–22:30.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'startsAt',
                  type: 'date',
                  label: 'Начало',
                  admin: {
                    date: { pickerAppearance: 'dayAndTime' },
                    width: '50%',
                  },
                },
                {
                  name: 'endsAt',
                  type: 'date',
                  label: 'Окончание',
                  admin: {
                    date: { pickerAppearance: 'dayAndTime' },
                    width: '50%',
                  },
                  validate: (value: unknown, options: unknown) => {
                    const siblingData = (options as { siblingData?: { startsAt?: unknown } }).siblingData
                    if (typeof value !== 'string' || typeof siblingData?.startsAt !== 'string') return true
                    return new Date(value).getTime() > new Date(siblingData.startsAt).getTime()
                      ? true
                      : 'Окончание должно быть позже начала.'
                  },
                },
              ],
            },
            {
              name: 'format',
              type: 'text',
              label: 'Формат',
              required: true,
            },
            {
              name: 'formatKey', type: 'select', label: 'Формат — фильтр', required: true,
              options: [
                { label: 'Americano', value: 'americano' }, { label: 'Группы + олимпийская сетка', value: 'groups-knockout' },
                { label: 'Round Robin + плей-офф', value: 'round-robin-playoff' }, { label: 'Другой', value: 'other' },
              ],
            },
            {
              name: 'entryFee',
              type: 'text',
              label: 'Вступительный взнос',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Описание',
              required: true,
            },
            {
              name: 'prizeLabel',
              type: 'text',
              label: 'Подпись итоговой суммы',
              required: true,
            },
            {
              name: 'prize',
              type: 'text',
              label: 'Итоговая сумма',
              required: true,
            },
            createActionField('action', 'Действие'),
          ],
        },
        {
          label: 'Карточка',
          fields: [
            {
              name: 'visualStyle',
              type: 'select',
              label: 'Стиль карточки',
              defaultValue: 'mesh',
              required: true,
              options: [
                { label: 'Изображение', value: 'image' },
                { label: 'Фирменный mesh-фон', value: 'mesh' },
              ],
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              filterOptions: imageOnlyFilter,
              label: 'Изображение',
              admin: {
                condition: (_, siblingData) => siblingData.visualStyle === 'image',
              },
              validate: (value: unknown, options: unknown) => {
                const siblingData = (options as { siblingData?: { visualStyle?: unknown } }).siblingData
                return siblingData?.visualStyle !== 'image' || value
                  ? true
                  : 'Для этого стиля выберите изображение.'
              },
            },
            {
              name: 'imageOverlay',
              type: 'select',
              label: 'Тон изображения',
              defaultValue: 'overlay-dark',
              options: [...imageOverlayOptions],
              admin: {
                condition: (_, siblingData) => siblingData.visualStyle === 'image',
              },
            },
            {
              name: 'meshStyle',
              type: 'select',
              label: 'Фирменный mesh-стиль',
              defaultValue: 'deep-blue',
              options: [...meshToneOptions],
              admin: {
                condition: (_, siblingData) => siblingData.visualStyle === 'mesh',
                description: 'Только стили, утверждённые в design system.',
              },
              validate: (value: unknown, options: unknown) => {
                const siblingData = (options as { siblingData?: { visualStyle?: unknown } }).siblingData
                return siblingData?.visualStyle !== 'mesh' || value
                  ? true
                  : 'Для этого стиля выберите mesh-фон.'
              },
            },
            {
              name: 'icon',
              type: 'select',
              label: 'Иконка',
              defaultValue: 'Trophy',
              required: true,
              options: [
                { label: 'Праздник', value: 'PartyPopper' },
                { label: 'Кубок', value: 'Trophy' },
                { label: 'Медаль', value: 'Medal' },
              ],
            },
          ],
        },
        {
          label: 'Регламент',
          fields: [
            { name: 'regulation', type: 'richText', label: 'Правила и регламент турнира', admin: { description: 'Показывается отдельным читаемым блоком на странице турнира.' } },
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
      name: 'showOnHomepage',
      type: 'checkbox',
      label: 'Показывать на главной',
      defaultValue: false,
      admin: {
        description: 'Главная читает эту же запись; отдельной копии карточки нет.',
        position: 'sidebar',
      },
    },
    createHomepageOrderField(3),
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
