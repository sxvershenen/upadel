import type { ArrayField } from 'payload'

export const homepageSectionOptions = [
  { label: 'Первый экран', value: 'hero' },
  { label: 'Преимущества', value: 'benefits' },
  { label: 'Предложения', value: 'offers' },
  { label: 'Корты', value: 'courts' },
  { label: 'Цены и абонементы', value: 'pricing' },
  { label: 'Тренеры', value: 'coaches' },
  { label: 'Тренировка с робопушкой', value: 'methodist-banner' },
  { label: 'Турниры и лиги', value: 'tournaments' },
  { label: 'Галерея', value: 'gallery' },
  { label: 'Блог и статьи', value: 'blog' },
  { label: 'Отзывы и вопросы', value: 'reviews-faq' },
] as const

export type HomepageSectionKey = (typeof homepageSectionOptions)[number]['value']

export function homepageSectionRowTitle(data: { section?: unknown; visible?: unknown } | null | undefined, rowNumber?: number): string {
  const selected = homepageSectionOptions.find((option) => option.value === data?.section)
  const title = selected?.label ?? `Секция ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`
  return `${title}${data?.visible === false ? ' · скрыта' : ''}`
}

const sectionKeys = homepageSectionOptions.map(({ value }) => value)
const sectionKeySet = new Set<string>(sectionKeys)

export const defaultHomepageSections = sectionKeys.map((section) => ({
  section,
  visible: true,
}))

type HomepageSectionRow = {
  section?: null | string
}

function isHomepageSectionRow(value: unknown): value is HomepageSectionRow {
  return typeof value === 'object' && value !== null
}

export function validateHomepageSections(value: null | undefined | unknown[]): string | true {
  if (!Array.isArray(value)) return 'Список секций обязателен.'

  const selected = value
    .filter(isHomepageSectionRow)
    .map(({ section }) => section)
    .filter((section): section is string => Boolean(section))
  const duplicate = selected.find((section, index) => selected.indexOf(section) !== index)
  if (duplicate) return 'Каждая секция может присутствовать на главной только один раз.'

  const unknown = selected.find((section) => !sectionKeySet.has(section))
  if (unknown) return `Неизвестный ключ секции: ${unknown}.`

  const missing = sectionKeys.filter((section) => !selected.includes(section))
  if (missing.length > 0) return 'Сохраните каждую кодовую секцию один раз; скрывайте её переключателем.'

  return true
}

export const homepageSectionsField: ArrayField = {
  name: 'sections',
  type: 'array',
  label: 'Порядок секций',
  labels: { singular: 'Секция главной', plural: 'Секции главной' },
  defaultValue: defaultHomepageSections,
  minRows: homepageSectionOptions.length,
  maxRows: homepageSectionOptions.length,
  required: true,
  admin: {
    components: {
      RowLabel: '/components/admin/DefaultCollapsedAccordion#HomepageSectionRowLabel',
    },
    description:
      'Перетаскивайте секции и меняйте видимость. В свёрнутой строке видно название секции и её статус. Разметка остаётся в коде; карточки тренеров, турниров и статей разрешаются из их коллекций.',
  },
  fields: [
    {
      name: 'section',
      type: 'select',
      label: 'Секция',
      options: [...homepageSectionOptions],
      required: true,
    },
    {
      name: 'visible',
      type: 'checkbox',
      label: 'Показывать',
      defaultValue: true,
    },
  ],
  validate: validateHomepageSections,
}
