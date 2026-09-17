import type { Field, Where } from 'payload'

import { imageOnlyFilter } from './media'
import { validateHTTPSURL } from './url'

const videoOnlyFilter: Where = {
  mimeType: { in: ['video/mp4', 'video/webm'] },
}

const overlayOptions = [
  { label: 'Синий', value: 'overlay-blue' },
  { label: 'Фиолетовый', value: 'overlay-violet' },
  { label: 'Изумрудный', value: 'overlay-emerald' },
  { label: 'Лайм', value: 'overlay-lime' },
  { label: 'Тёмный', value: 'overlay-dark' },
]

const iconOptions = [
  { label: 'Линейка', value: 'Ruler' },
  { label: 'Настройка', value: 'Settings2' },
  { label: 'Грузовик', value: 'Truck' },
  { label: 'Инструмент', value: 'Wrench' },
  { label: 'Проверка', value: 'ClipboardCheck' },
  { label: 'Слои', value: 'Layers3' },
  { label: 'Защита', value: 'ShieldCheck' },
  { label: 'Завод', value: 'Factory' },
  { label: 'Искра', value: 'Sparkles' },
  { label: 'Ветер', value: 'Wind' },
  { label: 'Галочка', value: 'CheckCircle2' },
]

const textField = (name: string, label: string, required = true): Field => ({
  name,
  type: 'text',
  label,
  required,
})

const textareaField = (name: string, label: string, required = true): Field => ({
  name,
  type: 'textarea',
  label,
  required,
})

const mediaField = (name: string, label: string, required = true): Field => ({
  name,
  type: 'upload',
  relationTo: 'media',
  filterOptions: imageOnlyFilter,
  label,
  required,
})

const padelCourtZakazFields: Field[] = [
  {
    name: 'heroVideo',
    type: 'upload',
    relationTo: 'media',
    filterOptions: videoOnlyFilter,
    label: 'Видео первого экрана',
    admin: { description: 'MP4 или WebM. Если поле пустое, используется текущий fallback-видеофон.' },
  },
  textField('heroPrimaryLabel', 'Текст основной кнопки'),
  textField('heroSecondaryLabel', 'Текст вторичной кнопки'),
  {
    name: 'heroMetrics',
    type: 'array',
    dbName: 'pcz_hero_metrics',
    label: 'Показатели первого экрана',
    minRows: 1,
    maxRows: 8,
    fields: [textField('title', 'Заголовок'), textField('caption', 'Подпись')],
  },
  {
    name: 'distributor',
    type: 'group',
    label: 'Поставщик и преимущества',
    fields: [
      textField('title', 'Заголовок'),
      textareaField('text', 'Описание'),
      {
        name: 'advantages',
        type: 'array',
        dbName: 'pcz_advantages',
        label: 'Преимущества',
        minRows: 1,
        maxRows: 8,
        fields: [textField('index', 'Номер'), textField('title', 'Заголовок'), textareaField('text', 'Описание')],
      },
    ],
  },
  {
    name: 'turnkey',
    type: 'group',
    label: 'Строительство под ключ',
    fields: [
      textField('title', 'Заголовок'),
      textareaField('intro', 'Вводный текст'),
      {
        name: 'steps',
        type: 'array',
        dbName: 'pcz_steps',
        label: 'Этапы',
        minRows: 1,
        maxRows: 8,
        fields: [
          textField('number', 'Номер'),
          textField('title', 'Заголовок'),
          textareaField('text', 'Описание'),
          mediaField('image', 'Изображение'),
          { name: 'icon', type: 'select', label: 'Иконка', required: true, enumName: 'padel_turnkey_icon', options: iconOptions },
          { name: 'overlay', type: 'select', label: 'Цветовой overlay', required: true, enumName: 'padel_turnkey_overlay', options: overlayOptions },
        ],
      },
    ],
  },
  {
    name: 'price',
    type: 'group',
    label: 'Стоимость проекта',
    fields: [
      textField('title', 'Заголовок'),
      textareaField('text', 'Описание'),
      textField('actionLabel', 'Текст кнопки'),
      {
        name: 'factors',
        type: 'array',
        dbName: 'pcz_factors',
        label: 'Факторы стоимости',
        minRows: 1,
        maxRows: 12,
        fields: [textField('label', 'Название'), textareaField('detail', 'Пояснение')],
      },
    ],
  },
  {
    name: 'technology',
    type: 'group',
    label: 'Технологии и стандарты',
    fields: [
      textField('title', 'Заголовок'),
      textareaField('text', 'Описание'),
      mediaField('background', 'Фоновое изображение'),
      {
        name: 'items',
        type: 'array',
        dbName: 'pcz_technology_items',
        label: 'Технологии',
        minRows: 1,
        maxRows: 12,
        fields: [
          textField('title', 'Заголовок'),
          textField('tag', 'Тег'),
          textareaField('text', 'Описание'),
          { name: 'icon', type: 'select', label: 'Иконка', required: true, enumName: 'padel_technology_icon', options: iconOptions },
        ],
      },
    ],
  },
  {
    name: 'gallery',
    type: 'group',
    label: 'Галерея реализаций',
    fields: [
      textField('title', 'Заголовок'),
      textareaField('text', 'Описание'),
      textField('creditLabel', 'Подпись источника'),
      {
        name: 'items',
        type: 'array',
        dbName: 'pcz_gallery_items',
        label: 'Изображения',
        minRows: 1,
        maxRows: 12,
        fields: [mediaField('media', 'Изображение'), textField('caption', 'Подпись')],
      },
    ],
  },
  {
    name: 'models',
    type: 'group',
    label: 'Модельный ряд',
    fields: [
      textField('title', 'Заголовок'),
      textareaField('text', 'Описание'),
      textField('badge', 'Плашка модели'),
      {
        name: 'items',
        type: 'array',
        dbName: 'pcz_model_items',
        label: 'Модели кортов',
        minRows: 1,
        maxRows: 12,
        fields: [
          textField('id', 'Системный идентификатор'),
          textField('name', 'Название'),
          textField('eyebrow', 'Надзаголовок'),
          textField('title', 'Заголовок'),
          textareaField('tagline', 'Краткое описание'),
          textareaField('description', 'Описание'),
          mediaField('image', 'Изображение'),
          {
            name: 'specs',
            type: 'array',
            dbName: 'pcz_specs',
            label: 'Технические характеристики',
            minRows: 1,
            maxRows: 10,
            fields: [textField('label', 'Параметр'), textareaField('value', 'Значение')],
          },
          {
            name: 'highlights',
            type: 'array',
            dbName: 'pcz_highlights',
            label: 'Преимущества',
            minRows: 1,
            maxRows: 8,
            fields: [textareaField('text', 'Текст')],
          },
        ],
      },
    ],
  },
  {
    name: 'cta',
    type: 'group',
    label: 'Заявка и контакты',
    fields: [
      textField('title', 'Заголовок'),
      textareaField('text', 'Описание'),
      {
        name: 'guarantees',
        type: 'array',
        dbName: 'pcz_guarantees',
        label: 'Гарантии и факты',
        minRows: 1,
        maxRows: 8,
        fields: [textareaField('text', 'Текст')],
      },
      {
        name: 'contacts',
        type: 'group',
        label: 'Прямые контакты',
        fields: [
          textField('telegramLabel', 'Кнопка Telegram'),
          { name: 'telegramURL', type: 'text', label: 'Ссылка Telegram', required: true, validate: validateHTTPSURL },
          textField('vkLabel', 'Кнопка ВКонтакте'),
          { name: 'vkURL', type: 'text', label: 'Ссылка ВКонтакте', required: true, validate: validateHTTPSURL },
          textField('phoneLabel', 'Кнопка телефона'),
        ],
      },
      {
        name: 'form',
        type: 'group',
        label: 'Тексты формы',
        fields: [
          textField('title', 'Заголовок формы'),
          textField('channelLabel', 'Подпись каналов связи'),
          textField('nameLabel', 'Подпись имени'),
          textField('namePlaceholder', 'Placeholder имени'),
          textField('phoneLabel', 'Подпись телефона'),
          textField('phonePlaceholder', 'Placeholder телефона'),
          textField('telegramLabel', 'Подпись Telegram'),
          textField('telegramPlaceholder', 'Placeholder Telegram'),
          textField('vkLabel', 'Подпись ВКонтакте'),
          textField('vkPlaceholder', 'Placeholder ВКонтакте'),
          textField('modelLabel', 'Подпись модели'),
          textField('modelOptionPrefix', 'Префикс модели'),
          textField('consultationOptionLabel', 'Опция «Помочь с выбором»'),
          textField('courtCountLabel', 'Подпись количества кортов'),
          textField('courtCountOneLabel', 'Опция: 1 корт'),
          textField('courtCountTwoThreeLabel', 'Опция: 2–3 корта'),
          textField('courtCountFourSixLabel', 'Опция: 4–6 кортов'),
          textField('courtCountSevenPlusLabel', 'Опция: 7+ кортов'),
          textField('cityLabel', 'Подпись города'),
          textField('cityPlaceholder', 'Placeholder города'),
          textField('commentLabel', 'Подпись комментария'),
          textField('commentPlaceholder', 'Placeholder комментария'),
          textField('consentLabel', 'Текст согласия'),
          textField('policyLabel', 'Ссылка на политику'),
          textField('submitLabel', 'Кнопка отправки'),
          textField('successTitle', 'Заголовок успеха'),
          textareaField('successText', 'Текст успеха'),
          textField('resubmitLabel', 'Кнопка новой заявки'),
          textField('nameError', 'Ошибка имени'),
          textField('contactError', 'Ошибка контакта'),
          textField('consentError', 'Ошибка согласия'),
          textField('submitError', 'Ошибка отправки'),
          textField('connectionError', 'Ошибка соединения'),
        ],
      },
    ],
  },
]

function field(name: string): Field {
  const result = padelCourtZakazFields.find((candidate) => 'name' in candidate && candidate.name === name)
  if (!result) throw new Error(`Unknown padel court page field: ${name}`)
  return result
}

export const padelCourtZakazContentTabs = [
  {
    label: 'Первый экран',
    fields: ['heroVideo', 'heroPrimaryLabel', 'heroSecondaryLabel', 'heroMetrics'].map(field),
  },
  { label: 'Дистрибьютор', fields: [field('distributor')] },
  { label: 'Строительство', fields: [field('turnkey')] },
  { label: 'Стоимость', fields: [field('price')] },
  { label: 'Технологии', fields: [field('technology')] },
  { label: 'Галерея', fields: [field('gallery')] },
  { label: 'Модельный ряд', fields: [field('models')] },
  { label: 'Заявка', fields: [field('cta')] },
] satisfies Array<{ label: string; fields: Field[] }>
