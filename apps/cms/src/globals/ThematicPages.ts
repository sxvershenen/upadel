import type { Field, GlobalConfig } from 'payload'

import { authenticated } from '../fields/access'
import { createActionField } from '../fields/action'
import { pageHeroFields } from '../fields/pageHero'
import { padelCourtZakazContentTabs } from '../fields/padelCourtZakaz'
import { imageOnlyFilter } from '../fields/media'
import { seoField } from '../fields/seo'
import { requirePublishedGlobal } from '../hooks/requirePublishedGlobal'

export type ThematicPageKind = 'prices' | 'training' | 'gift' | 'courts' | 'gallery' | 'about' | 'contacts' | 'policy' | 'oferta'
export type CodeDefinedPageKind = 'padel-court-zakaz'
export type ThematicPageSlug = `${ThematicPageKind | CodeDefinedPageKind}-page`

type ContentTab = { label: string; fields: Field[] }

function createThematicPage(args: {
  slug: ThematicPageSlug
  label: string
  kind: ThematicPageKind | CodeDefinedPageKind
  fields?: Field[]
  contentTabs?: ContentTab[]
  hidden?: boolean
  dbName?: string
}): GlobalConfig {
  const commonContentFields: Field[] = [
    { name: 'eyebrow', type: 'text', label: 'Надзаголовок', required: true },
    { name: 'title', type: 'text', label: 'Заголовок', required: true },
    { name: 'intro', type: 'textarea', label: 'Вводный текст', required: true },
  ]
  const contentTabs = args.contentTabs
    ? args.contentTabs.map((tab, index) => index === 0 ? { ...tab, fields: [...commonContentFields, ...tab.fields] } : tab)
    : [{ label: 'Содержание', fields: [...commonContentFields, ...(args.fields ?? [])] }]

  return {
    slug: args.slug,
    ...(args.dbName ? { dbName: args.dbName } : {}),
    label: args.label,
    access: { read: () => true, readVersions: authenticated, update: authenticated },
    admin: {
      group: 'Страницы',
      hidden: args.hidden,
      livePreview: {
        url: () => {
          if (!process.env.PUBLIC_WEB_URL || !process.env.PREVIEW_SECRET) return undefined
          const url = new URL('/preview/page', process.env.PUBLIC_WEB_URL)
          url.searchParams.set('type', args.kind)
          url.searchParams.set('secret', process.env.PREVIEW_SECRET)
          return url.toString()
        },
      },
    },
    fields: [
      { name: 'seedVersion', type: 'text', admin: { hidden: true }, access: { read: () => false } },
      {
        type: 'tabs',
        tabs: [
          ...contentTabs,
          { label: 'Шапка страницы', fields: pageHeroFields },
          { label: 'SEO', fields: [seoField] },
        ],
      },
    ],
    hooks: { beforeRead: [requirePublishedGlobal] },
    versions: { drafts: { autosave: true, schedulePublish: true }, max: 50 },
  }
}

export const PricesPage = createThematicPage({
  slug: 'prices-page', label: 'Цены', kind: 'prices', fields: [
    { name: 'rentTabLabel', type: 'text', label: 'Вкладка аренды', required: true },
    { name: 'trainingTabLabel', type: 'text', label: 'Вкладка тренировок', required: true },
    { name: 'membershipsTabLabel', type: 'text', label: 'Вкладка абонементов', required: true },
    {
      name: 'rules', type: 'array', label: 'Правила и условия', minRows: 1, maxRows: 6,
      fields: [
        { name: 'title', type: 'text', label: 'Заголовок', required: true },
        { name: 'content', type: 'richText', label: 'Текст', required: true },
      ],
    },
  ],
})

export const TrainingPage = createThematicPage({
  slug: 'training-page', label: 'Тренировки', kind: 'training', fields: [
    { name: 'infographicEyebrow', type: 'text', label: 'Надзаголовок инфографики' },
    { name: 'infographicTitle', type: 'text', label: 'Заголовок инфографики' },
    { name: 'infographicCopy', type: 'textarea', label: 'Вводный текст инфографики' },
    { name: 'programsTitle', type: 'text', label: 'Заголовок программ' },
    {
      name: 'blocks', type: 'array', label: 'Поясняющие блоки', minRows: 1, maxRows: 6,
      fields: [
        { name: 'title', type: 'text', label: 'Заголовок', required: true },
        { name: 'body', type: 'textarea', label: 'Описание', required: true },
        { name: 'icon', type: 'select', label: 'Иконка', required: true, options: [
          { label: 'Программа', value: 'Target' }, { label: 'Расписание', value: 'Calendar' },
          { label: 'Прогресс', value: 'TrendingUp' }, { label: 'Команда', value: 'Users' },
        ] },
      ],
    },
    { name: 'article', type: 'richText', label: 'SEO-статья о тренировках' },
    createActionField('action', 'Основное действие'),
  ],
})

export const GiftPage = createThematicPage({
  slug: 'gift-page', label: 'Подарочный сертификат', kind: 'gift', contentTabs: [
    {
      label: 'Контент', fields: [
        { name: 'offerEyebrow', type: 'text', label: 'Надзаголовок предложения', required: true },
        { name: 'offerTitle', type: 'text', label: 'Заголовок предложения', required: true },
        { name: 'offerCopy', type: 'textarea', label: 'Описание предложения', required: true },
        { name: 'formatsTitle', type: 'text', label: 'Заголовок форматов', required: true },
        { name: 'formatsCopy', type: 'textarea', label: 'Описание форматов', required: true },
        { name: 'termsTitle', type: 'text', label: 'Заголовок условий', required: true },
        { name: 'termsCopy', type: 'textarea', label: 'Описание условий', required: true },
        {
          name: 'benefits', type: 'array', label: 'Варианты и преимущества', minRows: 3, maxRows: 4, required: true,
          fields: [
            { name: 'badge', type: 'text', label: 'Метка', required: true },
            { name: 'title', type: 'text', label: 'Заголовок', required: true },
            { name: 'body', type: 'textarea', label: 'Описание', required: true },
            { name: 'icon', type: 'select', label: 'Иконка', required: true, options: [
              { label: 'Подарок', value: 'Gift' }, { label: 'Проверено', value: 'BadgeCheck' },
              { label: 'Дата', value: 'CalendarCheck' }, { label: 'Впечатление', value: 'Sparkles' },
            ] },
          ],
        },
        { name: 'stepsEyebrow', type: 'text', label: 'Надзаголовок шагов', required: true },
        { name: 'stepsTitle', type: 'text', label: 'Заголовок шагов', required: true },
        {
          name: 'steps', type: 'array', label: 'Как подарить', minRows: 3, maxRows: 4, required: true,
          fields: [
            { name: 'title', type: 'text', label: 'Заголовок', required: true },
            { name: 'body', type: 'textarea', label: 'Описание', required: true },
          ],
        },
        { name: 'article', type: 'richText', label: 'SEO-статья', required: true },
        { name: 'faqTitle', type: 'text', label: 'Заголовок вопросов', required: true },
        {
          name: 'faq', type: 'array', label: 'Частые вопросы', minRows: 2, maxRows: 8, required: true,
          fields: [
            { name: 'question', type: 'text', label: 'Вопрос', required: true },
            { name: 'answer', type: 'textarea', label: 'Ответ', required: true },
          ],
        },
        createActionField('action', 'Основное действие'),
      ],
    },
    {
      label: 'Форматы и условия', fields: [
        {
          name: 'formats', type: 'array', label: 'Форматы сертификата', minRows: 2, maxRows: 2, required: true,
          fields: [
            { name: 'formatId', type: 'select', label: 'Идентификатор', required: true, options: [{ label: 'Бокс', value: 'box' }, { label: 'Электронный PDF', value: 'digital' }] },
            { name: 'badge', type: 'text', label: 'Метка', required: true },
            { name: 'title', type: 'text', label: 'Заголовок', required: true },
            { name: 'image', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Изображение', required: true },
            {
              name: 'features', type: 'array', label: 'Преимущества', minRows: 1, maxRows: 6, required: true,
              fields: [{ name: 'text', type: 'text', label: 'Текст', required: true }],
            },
            { name: 'buttonText', type: 'text', label: 'Текст кнопки', required: true },
            { name: 'buttonSelectedText', type: 'text', label: 'Текст выбранной кнопки', required: true },
          ],
        },
        {
          name: 'terms', type: 'array', label: 'Условия и правила', minRows: 1, maxRows: 8, required: true,
          fields: [
            { name: 'title', type: 'text', label: 'Заголовок', required: true },
            { name: 'text', type: 'textarea', label: 'Текст', required: true },
            { name: 'icon', type: 'select', label: 'Иконка', required: true, options: [
              { label: 'Срок', value: 'CalendarCheck' }, { label: 'Баланс', value: 'ShieldCheck' },
              { label: 'Услуги', value: 'Layers' }, { label: 'Экипировка', value: 'PackageCheck' },
              { label: 'На предъявителя', value: 'Users' }, { label: 'Бронь', value: 'ClipboardCheck' },
            ] },
          ],
        },
      ],
    },
    {
      label: 'Форма заказа', fields: [
        {
          name: 'form', type: 'group', label: 'Тексты формы', fields: [
            { name: 'sectionTitle', type: 'text', label: 'Заголовок секции', required: true },
            { name: 'sectionCopy', type: 'textarea', label: 'Описание секции', required: true },
            { name: 'channelLabel', type: 'text', label: 'Подпись каналов', required: true },
            { name: 'telegramLabel', type: 'text', label: 'Кнопка Telegram', required: true },
            { name: 'phoneLabel', type: 'text', label: 'Кнопка телефона', required: true },
            { name: 'vkLabel', type: 'text', label: 'Кнопка VK', required: true },
            { name: 'formatLabel', type: 'text', label: 'Поле формата', required: true },
            { name: 'purposeLabel', type: 'text', label: 'Поле направления', required: true },
            { name: 'namePlaceholder', type: 'text', label: 'Имя', required: true },
            { name: 'contactPhonePlaceholder', type: 'text', label: 'Телефон', required: true },
            { name: 'contactTelegramPlaceholder', type: 'text', label: 'Telegram', required: true },
            { name: 'contactVKPlaceholder', type: 'text', label: 'VK', required: true },
            { name: 'recipientPlaceholder', type: 'text', label: 'Получатель', required: true },
            { name: 'commentPlaceholder', type: 'text', label: 'Комментарий', required: true },
            { name: 'consentLabel', type: 'text', label: 'Согласие', required: true },
            { name: 'policyLabel', type: 'text', label: 'Политика', required: true },
            { name: 'submitLabel', type: 'text', label: 'Отправка', required: true },
            { name: 'successTitle', type: 'text', label: 'Успех: заголовок', required: true },
            { name: 'successText', type: 'textarea', label: 'Успех: текст', required: true },
            { name: 'resubmitLabel', type: 'text', label: 'Повторная заявка', required: true },
          ],
        },
      ],
    },
  ],
})

export const CourtsPage = createThematicPage({
  slug: 'courts-page', label: 'Корты', kind: 'courts', fields: [
    { name: 'infographicTitle', type: 'text', label: 'Заголовок инфографики', required: true },
    { name: 'infographicCopy', type: 'textarea', label: 'Пояснение инфографики', required: true },
    {
      name: 'metrics', type: 'array', label: 'Ключевые показатели', minRows: 3, maxRows: 6,
      fields: [
        { name: 'value', type: 'text', label: 'Значение', required: true },
        { name: 'label', type: 'text', label: 'Подпись', required: true },
        { name: 'icon', type: 'select', label: 'Иконка', required: true, options: [
          { label: 'Корты', value: 'Layers3' }, { label: 'Высота', value: 'PanelTop' },
          { label: 'Свет', value: 'Lightbulb' }, { label: 'Климат', value: 'Thermometer' },
        ] },
      ],
    },
  ],
})

export const PadelCourtZakazPage = createThematicPage({
  slug: 'padel-court-zakaz-page',
  label: 'Падел-корты JUBO под ключ',
  kind: 'padel-court-zakaz',
  dbName: 'padel_court_page',
  contentTabs: padelCourtZakazContentTabs,
})

export const GalleryPage = createThematicPage({ slug: 'gallery-page', label: 'Галерея', kind: 'gallery' })

export const AboutPage = createThematicPage({
  slug: 'about-page', label: 'О клубе', kind: 'about', fields: [
    { name: 'story', type: 'richText', label: 'История клуба', required: true },
    {
      name: 'stats', type: 'array', label: 'Факты о клубе', minRows: 2, maxRows: 6,
      fields: [
        { name: 'value', type: 'text', label: 'Значение', required: true },
        { name: 'label', type: 'text', label: 'Подпись', required: true },
      ],
    },
  ],
})

export const ContactsPage = createThematicPage({
  slug: 'contacts-page', label: 'Контакты', kind: 'contacts', hidden: true, fields: [
    { name: 'directionsTitle', type: 'text', label: 'Заголовок маршрута', required: true },
    { name: 'directionsText', type: 'textarea', label: 'Как добраться', required: true },
    {
      name: 'arrivalNotes', type: 'array', label: 'Подсказки перед приездом', maxRows: 6,
      fields: [
        { name: 'title', type: 'text', label: 'Заголовок', required: true },
        { name: 'text', type: 'textarea', label: 'Описание', required: true },
        { name: 'icon', type: 'select', label: 'Иконка', required: true, options: [
          { label: 'Автомобиль', value: 'Car' }, { label: 'Метро', value: 'Train' },
          { label: 'Время', value: 'Clock' }, { label: 'Адрес', value: 'MapPin' },
        ] },
      ],
    },
  ],
})

function createLegalPage(kind: 'policy' | 'oferta', label: string): GlobalConfig {
  return createThematicPage({
    slug: `${kind}-page`, label, kind, fields: [
      { name: 'notice', type: 'textarea', label: 'Предупреждение', required: true, admin: { description: 'Показывается над документом, пока текст не согласован.' } },
      { name: 'content', type: 'richText', label: 'Текст документа', required: true },
      { name: 'approved', type: 'checkbox', label: 'Текст согласован юристом', defaultValue: false, admin: { position: 'sidebar' } },
    ],
  })
}

export const PolicyPage = createLegalPage('policy', 'Политика конфиденциальности')
export const OfertaPage = createLegalPage('oferta', 'Публичная оферта')
