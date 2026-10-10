import type { ArrayField, CollectionConfig, Field } from 'payload'
import { randomUUID } from 'node:crypto'

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
  { name: 'name', type: 'text', label: 'Игрок / первый игрок пары' },
  { name: 'partnerName', type: 'text', label: 'Второй игрок пары', admin: { description: 'Оставьте пустым для индивидуального формата.' } },
  { name: 'level', type: 'select', label: 'Уровень', options: tournamentLevelOptions },
  { name: 'status', type: 'select', label: 'Статус', defaultValue: 'confirmed', options: [
    { label: 'Подтверждён', value: 'confirmed' }, { label: 'Лист ожидания', value: 'waitlist' },
  ] },
]

const perksField: ArrayField = {
  name: 'perks', type: 'array', label: 'Свой список включённых услуг',
  fields: [
    { name: 'icon', type: 'select', label: 'Иконка', options: [
      { label: 'Искры', value: 'Sparkles' }, { label: 'Вода', value: 'Droplets' },
      { label: 'Душ', value: 'ShowerHead' }, { label: 'Камера', value: 'Camera' },
    ] },
    { name: 'title', type: 'text', label: 'Название' },
    { name: 'description', type: 'textarea', label: 'Описание' },
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
            { name: 'title', type: 'text', label: 'Название' },
            { name: 'description', type: 'textarea', label: 'Описание' },
            { name: 'lifecycle', type: 'select', label: 'Состояние турнира', defaultValue: 'upcoming', options: [
              { label: 'Предстоящий', value: 'upcoming' }, { label: 'Идёт сейчас', value: 'active' },
              { label: 'Завершён', value: 'finished' }, { label: 'Отменён', value: 'cancelled' },
            ], admin: { description: 'Не зависит от статуса черновик/опубликовано.' } },
            { type: 'row', fields: [
              { name: 'startsAt', type: 'date', label: 'Начало', admin: { date: { pickerAppearance: 'dayAndTime' }, width: '50%' } },
              { name: 'endsAt', type: 'date', label: 'Окончание', validate: validateTournamentEnd, admin: { date: { pickerAppearance: 'dayAndTime' }, width: '50%' } },
            ] },
            { type: 'row', fields: [
              { name: 'levelFrom', type: 'select', label: 'Уровень от', options: tournamentLevelOptions, admin: { width: '50%' } },
              { name: 'levelTo', type: 'select', label: 'Уровень до', options: tournamentLevelOptions, validate: validateTournamentLevelTo, admin: { width: '50%' } },
            ] },
            { name: 'format', type: 'select', label: 'Формат', options: [...tournamentFormatOptions] },
            { name: 'customFormat', type: 'text', label: 'Название другого формата', admin: { condition: (_, siblingData) => siblingData.format === 'other' }, validate: (value: unknown, options: unknown) => {
              const format = (options as { siblingData?: { format?: unknown } }).siblingData?.format
              return !value || format !== 'other' || typeof value === 'string' && value.trim() ? true : 'Укажите название формата.'
            } },
            { name: 'participantMode', type: 'select', label: 'Единица участия', defaultValue: 'players', options: [
              { label: 'Отдельные игроки', value: 'players' }, { label: 'Фиксированные пары', value: 'pairs' },
            ] },
            { name: 'totalSlots', type: 'number', label: 'Всего мест / пар', defaultValue: 16, min: 1 },
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
            { name: 'visualStyle', type: 'select', label: 'Стиль карточки', defaultValue: 'mesh', options: [
              { label: 'Изображение', value: 'image' }, { label: 'Фирменный mesh-фон', value: 'mesh' },
            ] },
            { name: 'image', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Изображение', admin: { condition: (_, siblingData) => siblingData.visualStyle === 'image' } },
            { name: 'imageOverlay', type: 'select', label: 'Тон изображения', defaultValue: 'overlay-dark', options: [...imageOverlayOptions], admin: { condition: (_, siblingData) => siblingData.visualStyle === 'image' } },
            { name: 'meshStyle', type: 'select', label: 'Фирменный mesh-стиль', defaultValue: 'deep-blue', options: [...meshToneOptions], admin: { condition: (_, siblingData) => siblingData.visualStyle === 'mesh', description: 'Только стили, утверждённые в design system.' } },
            { name: 'icon', type: 'select', label: 'Иконка', defaultValue: 'Trophy', options: [
              { label: 'Праздник', value: 'PartyPopper' }, { label: 'Кубок', value: 'Trophy' }, { label: 'Медаль', value: 'Medal' },
            ] },
          ],
        },
        { label: 'Участники', fields: [{ name: 'participants', type: 'array', label: 'Список участников', admin: { description: 'Строки можно перетаскивать. Нумерация на сайте следует этому порядку.' }, fields: participantFields }] },
        {
          label: 'Итоги',
          fields: [{ name: 'standings', type: 'array', label: 'Итоговые места', admin: { description: 'Место определяется только порядком строк. Перетащите строку, чтобы изменить место; очки не сортируют список.' }, fields: [
            { name: 'name', type: 'text', label: 'Игрок / первый игрок пары' },
            { name: 'partnerName', type: 'text', label: 'Второй игрок пары' },
            { name: 'matches', type: 'number', label: 'Матчи', defaultValue: 0, min: 0 },
            { name: 'points', type: 'number', label: 'Очки', defaultValue: 0 },
            { name: 'difference', type: 'text', label: 'Разница', defaultValue: '0' },
            { name: 'award', type: 'text', label: 'Награда / подпись' },
          ] }],
        },
        {
          label: 'Призы и взносы',
          fields: [
            { name: 'entryFee', type: 'text', label: 'Стоимость участия', admin: { description: 'Единственная цена участия для карточки и страницы. Например: от 4 000 ₽ / участник.' } },
            { type: 'row', fields: [
              { name: 'prizeLabel', type: 'text', label: 'Подпись призового фонда', defaultValue: 'Призовой фонд', admin: { width: '50%', description: 'Только призы; стоимость участия задаётся отдельно.' } },
              { name: 'prize', type: 'text', label: 'Призовой фонд (не стоимость участия)', admin: { width: '50%' } },
            ] },
            { name: 'prizes', type: 'array', label: 'Распределение призов', admin: { description: 'Место определяется порядком строк.' }, fields: [
              { name: 'title', type: 'text', label: 'Название места / категории' },
              { name: 'reward', type: 'text', label: 'Награда' },
              { name: 'description', type: 'textarea', label: 'Описание' },
            ] },
          ],
        },
        {
          label: 'FAQ',
          fields: [
            { name: 'useDefaultFaq', type: 'checkbox', label: 'Использовать FAQ из шаблона турниров', defaultValue: true },
            { name: 'faqs', type: 'array', label: 'Свой FAQ', admin: { condition: (_, siblingData) => siblingData.useDefaultFaq === false }, fields: [
              { name: 'question', type: 'text', label: 'Вопрос' }, { name: 'answer', type: 'textarea', label: 'Ответ' },
            ] },
          ],
        },
        {
          label: 'Регламент и правила',
          fields: [
            { name: 'regulation', type: 'richText', label: 'Правила и регламент турнира', admin: { description: 'Показывается отдельным читаемым блоком на странице турнира.' } },
            { name: 'useDefaultChecklist', type: 'checkbox', label: 'Использовать шаблон «Перед выходом на корт»', defaultValue: true },
            { name: 'checklist', type: 'array', label: 'Свой список перед выходом на корт', admin: { condition: (_, siblingData) => siblingData.useDefaultChecklist === false }, fields: [{ name: 'text', type: 'text', label: 'Пункт' }] },
            { name: 'useDefaultPerks', type: 'checkbox', label: 'Использовать шаблон «Включено для каждого игрока»', defaultValue: true },
            { ...perksField, admin: { condition: (_, siblingData) => siblingData.useDefaultPerks === false } },
            { name: 'useDefaultMatchday', type: 'checkbox', label: 'Использовать шаблон игрового дня', defaultValue: true },
            { name: 'matchday', type: 'array', label: 'Свой игровой день', admin: { condition: (_, siblingData) => siblingData.useDefaultMatchday === false }, fields: [
              { name: 'timing', type: 'text', label: 'Время / этап' },
              { name: 'title', type: 'text', label: 'Название' },
              { name: 'description', type: 'textarea', label: 'Описание' },
            ] },
          ],
        },
        { label: 'SEO', fields: [{ ...seoField, admin: { description: 'Если заголовок или описание пусты, сайт автоматически соберёт их из названия, Москвы, формата, уровня и призов/взноса.' } }] },
      ],
    },
    { ...slugField, required: false, validate: (value: unknown) => !value ? true : typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || 'Используйте латиницу, цифры и дефисы.' },
    { name: 'cardLinkEnabled', type: 'checkbox', label: 'Разрешить переход с карточки', defaultValue: true, admin: { position: 'sidebar', description: 'Выключите для информационной карточки без перехода.' } },
    { name: 'cardURL', type: 'text', label: 'Своя ссылка карточки', validate: validateHTTPSURL, admin: { position: 'sidebar', condition: (_, data) => data.cardLinkEnabled !== false, description: 'HTTPS-ссылка, например на пост VK. Если пусто — открывается страница турнира.' } },
    seedKeyField,
    { name: 'showOnHomepage', type: 'checkbox', label: 'Показывать на главной', defaultValue: false, admin: { description: 'Главная читает эту же запись; отдельной копии карточки нет.', position: 'sidebar' } },
    createHomepageOrderField(3),
  ],
  hooks: { beforeValidate: [({ data, originalDoc }) => { if (data && !data.slug) data.slug = originalDoc?.slug || `tournament-${randomUUID()}`; return data }, clearHiddenHomepageOrder] },
  versions: { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 50 },
}
