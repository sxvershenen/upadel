import type { ArrayField, CollectionConfig, Field } from 'payload'

import { authenticated, publishedOrAuthenticated } from '../fields/access'
import { createActionField } from '../fields/action'
import { clearHiddenHomepageOrder, createHomepageOrderField } from '../fields/homepagePlacement'
import { imageOnlyFilter } from '../fields/media'
import { imageOverlayOptions, meshToneOptions } from '../fields/presentation'
import { seoField } from '../fields/seo'
import { seedKeyField } from '../fields/seedKey'
import { slugField } from '../fields/slug'
import { validateHTTPSURL } from '../fields/url'
import { tournamentFormatOptions, tournamentLevelOptions, validateTournamentEnd, validateTournamentLevelTo } from '../tournaments/model'

const participantFields: Field[] = [
  { name: 'name', type: 'text', label: 'Игрок / первый игрок пары', required: true },
  { name: 'partnerName', type: 'text', label: 'Второй игрок пары', admin: { description: 'Оставьте пустым для индивидуального формата.' } },
  { name: 'level', type: 'select', label: 'Уровень', options: tournamentLevelOptions },
  { name: 'status', type: 'select', label: 'Статус', defaultValue: 'confirmed', required: true, options: [
    { label: 'Подтверждён', value: 'confirmed' }, { label: 'Лист ожидания', value: 'waitlist' },
  ] },
]

const perksField: ArrayField = {
  name: 'perks', type: 'array', label: 'Свой список включённых услуг',
  fields: [
    { name: 'icon', type: 'select', label: 'Иконка', required: true, options: [
      { label: 'Искры', value: 'Sparkles' }, { label: 'Вода', value: 'Droplets' },
      { label: 'Душ', value: 'ShowerHead' }, { label: 'Камера', value: 'Camera' },
    ] },
    { name: 'title', type: 'text', label: 'Название', required: true },
    { name: 'description', type: 'textarea', label: 'Описание', required: true },
  ],
}

export const Tournaments: CollectionConfig = {
  slug: 'tournaments',
  labels: { singular: 'Турнир', plural: 'Турниры' },
  access: { create: authenticated, delete: authenticated, read: publishedOrAuthenticated, readVersions: authenticated, update: authenticated },
  admin: { defaultColumns: ['title', 'startsAt', 'lifecycle', 'showOnHomepage', 'homepageOrder', '_status'], group: 'Клуб', useAsTitle: 'title' },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Основное',
          fields: [
            { name: 'title', type: 'text', label: 'Название', required: true },
            { name: 'description', type: 'textarea', label: 'Описание', required: true },
            { name: 'lifecycle', type: 'select', label: 'Состояние турнира', defaultValue: 'upcoming', required: true, options: [
              { label: 'Предстоящий', value: 'upcoming' }, { label: 'Идёт сейчас', value: 'active' },
              { label: 'Завершён', value: 'finished' }, { label: 'Отменён', value: 'cancelled' },
            ], admin: { description: 'Не зависит от статуса черновик/опубликовано.' } },
            { type: 'row', fields: [
              { name: 'startsAt', type: 'date', label: 'Начало', required: true, admin: { date: { pickerAppearance: 'dayAndTime' }, width: '50%' } },
              { name: 'endsAt', type: 'date', label: 'Окончание', required: true, validate: validateTournamentEnd, admin: { date: { pickerAppearance: 'dayAndTime' }, width: '50%' } },
            ] },
            { type: 'row', fields: [
              { name: 'levelFrom', type: 'select', label: 'Уровень от', required: true, options: tournamentLevelOptions, admin: { width: '50%' } },
              { name: 'levelTo', type: 'select', label: 'Уровень до', required: true, options: tournamentLevelOptions, validate: validateTournamentLevelTo, admin: { width: '50%' } },
            ] },
            { name: 'format', type: 'select', label: 'Формат', required: true, options: [...tournamentFormatOptions] },
            { name: 'customFormat', type: 'text', label: 'Название другого формата', admin: { condition: (_, siblingData) => siblingData.format === 'other' }, validate: (value: unknown, options: unknown) => {
              const format = (options as { siblingData?: { format?: unknown } }).siblingData?.format
              return format !== 'other' || typeof value === 'string' && value.trim() ? true : 'Укажите название формата.'
            } },
            { name: 'participantMode', type: 'select', label: 'Единица участия', defaultValue: 'players', required: true, options: [
              { label: 'Отдельные игроки', value: 'players' }, { label: 'Фиксированные пары', value: 'pairs' },
            ] },
            { name: 'totalSlots', type: 'number', label: 'Всего мест / пар', defaultValue: 16, min: 1, required: true },
            createActionField('action', 'Кнопка действия'),
            { name: 'useClubCoordinatorContacts', type: 'checkbox', label: 'Использовать контакты клуба для координатора', defaultValue: true },
            { name: 'coordinator', type: 'group', label: 'Контакты координатора', admin: { condition: (_, siblingData) => siblingData.useClubCoordinatorContacts === false }, fields: [
              { name: 'telegramLabel', type: 'text', label: 'Подпись Telegram', defaultValue: 'Telegram' },
              { name: 'telegramURL', type: 'text', label: 'Ссылка Telegram', validate: validateHTTPSURL },
              { name: 'phoneDisplay', type: 'text', label: 'Телефон' },
              { name: 'phoneValue', type: 'text', label: 'Телефон для ссылки', admin: { description: 'Например: +79990000000.' } },
            ] },
          ],
        },
        {
          label: 'Карточка',
          fields: [
            { name: 'visualStyle', type: 'select', label: 'Стиль карточки', defaultValue: 'mesh', required: true, options: [
              { label: 'Изображение', value: 'image' }, { label: 'Фирменный mesh-фон', value: 'mesh' },
            ] },
            { name: 'image', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Изображение', admin: { condition: (_, siblingData) => siblingData.visualStyle === 'image' }, validate: (value: unknown, options: unknown) => {
              const style = (options as { siblingData?: { visualStyle?: unknown } }).siblingData?.visualStyle
              return style !== 'image' || value ? true : 'Для этого стиля выберите изображение.'
            } },
            { name: 'imageOverlay', type: 'select', label: 'Тон изображения', defaultValue: 'overlay-dark', options: [...imageOverlayOptions], admin: { condition: (_, siblingData) => siblingData.visualStyle === 'image' } },
            { name: 'meshStyle', type: 'select', label: 'Фирменный mesh-стиль', defaultValue: 'deep-blue', options: [...meshToneOptions], admin: { condition: (_, siblingData) => siblingData.visualStyle === 'mesh', description: 'Только стили, утверждённые в design system.' }, validate: (value: unknown, options: unknown) => {
              const style = (options as { siblingData?: { visualStyle?: unknown } }).siblingData?.visualStyle
              return style !== 'mesh' || value ? true : 'Для этого стиля выберите mesh-фон.'
            } },
            { name: 'icon', type: 'select', label: 'Иконка', defaultValue: 'Trophy', required: true, options: [
              { label: 'Праздник', value: 'PartyPopper' }, { label: 'Кубок', value: 'Trophy' }, { label: 'Медаль', value: 'Medal' },
            ] },
          ],
        },
        { label: 'Участники', fields: [{ name: 'participants', type: 'array', label: 'Список участников', admin: { description: 'Строки можно перетаскивать. Нумерация на сайте следует этому порядку.' }, fields: participantFields }] },
        {
          label: 'Итоги',
          fields: [{ name: 'standings', type: 'array', label: 'Итоговые места', admin: { description: 'Место определяется только порядком строк. Перетащите строку, чтобы изменить место; очки не сортируют список.' }, fields: [
            { name: 'name', type: 'text', label: 'Игрок / первый игрок пары', required: true },
            { name: 'partnerName', type: 'text', label: 'Второй игрок пары' },
            { name: 'matches', type: 'number', label: 'Матчи', defaultValue: 0, min: 0, required: true },
            { name: 'points', type: 'number', label: 'Очки', defaultValue: 0, required: true },
            { name: 'difference', type: 'text', label: 'Разница', defaultValue: '0', required: true },
            { name: 'award', type: 'text', label: 'Награда / подпись' },
          ] }],
        },
        {
          label: 'Призы и взносы',
          fields: [
            { name: 'entryFee', type: 'text', label: 'Вступительный взнос', required: true },
            { type: 'row', fields: [
              { name: 'prizeLabel', type: 'text', label: 'Подпись суммы', defaultValue: 'Призовой фонд', required: true, admin: { width: '50%' } },
              { name: 'prize', type: 'text', label: 'Сумма / краткое значение', required: true, admin: { width: '50%' } },
            ] },
            { name: 'prizes', type: 'array', label: 'Распределение призов', admin: { description: 'Место определяется порядком строк.' }, fields: [
              { name: 'title', type: 'text', label: 'Название места / категории', required: true },
              { name: 'reward', type: 'text', label: 'Награда', required: true },
              { name: 'description', type: 'textarea', label: 'Описание', required: true },
            ] },
          ],
        },
        {
          label: 'FAQ',
          fields: [
            { name: 'useDefaultFaq', type: 'checkbox', label: 'Использовать FAQ из шаблона турниров', defaultValue: true },
            { name: 'faqs', type: 'array', label: 'Свой FAQ', admin: { condition: (_, siblingData) => siblingData.useDefaultFaq === false }, fields: [
              { name: 'question', type: 'text', label: 'Вопрос', required: true }, { name: 'answer', type: 'textarea', label: 'Ответ', required: true },
            ] },
          ],
        },
        {
          label: 'Регламент и правила',
          fields: [
            { name: 'regulation', type: 'richText', label: 'Правила и регламент турнира', admin: { description: 'Показывается отдельным читаемым блоком на странице турнира.' } },
            { name: 'useDefaultChecklist', type: 'checkbox', label: 'Использовать шаблон «Перед выходом на корт»', defaultValue: true },
            { name: 'checklist', type: 'array', label: 'Свой список перед выходом на корт', admin: { condition: (_, siblingData) => siblingData.useDefaultChecklist === false }, fields: [{ name: 'text', type: 'text', label: 'Пункт', required: true }] },
            { name: 'useDefaultPerks', type: 'checkbox', label: 'Использовать шаблон «Включено для каждого игрока»', defaultValue: true },
            { ...perksField, admin: { condition: (_, siblingData) => siblingData.useDefaultPerks === false } },
            { name: 'useDefaultMatchday', type: 'checkbox', label: 'Использовать шаблон игрового дня', defaultValue: true },
            { name: 'matchday', type: 'array', label: 'Свой игровой день', admin: { condition: (_, siblingData) => siblingData.useDefaultMatchday === false }, fields: [
              { name: 'timing', type: 'text', label: 'Время / этап', required: true },
              { name: 'title', type: 'text', label: 'Название', required: true },
              { name: 'description', type: 'textarea', label: 'Описание', required: true },
            ] },
          ],
        },
        { label: 'SEO', fields: [{ ...seoField, admin: { description: 'Если заголовок или описание пусты, сайт автоматически соберёт их из названия, Москвы, формата, уровня и призов/взноса.' } }] },
      ],
    },
    slugField,
    seedKeyField,
    { name: 'showOnHomepage', type: 'checkbox', label: 'Показывать на главной', defaultValue: false, admin: { description: 'Главная читает эту же запись; отдельной копии карточки нет.', position: 'sidebar' } },
    createHomepageOrderField(3),
  ],
  hooks: { beforeValidate: [clearHiddenHomepageOrder] },
  versions: { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 50 },
}
