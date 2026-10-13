import type { Field } from 'payload'
import { defaultHeroTint, defaultHeroTitleFontSize, type HeroTintDeviceDTO } from '@unlim/content-contract'

import { createActionField } from './action'
import { imageOnlyFilter } from './media'
import { imageOverlayOptions, meshToneOptions } from './presentation'
import { validateUniqueRowsByKey } from './validators'

function pricingActionField() {
  const action = createActionField('action', 'Действие')
  return {
    ...action,
    fields: action.fields.map((field) => 'name' in field && field.name === 'mode' ? { ...field, dbName: 'hm_mem_act_mode' } : 'name' in field && field.name === 'leadType' ? { ...field, dbName: 'hm_mem_lead_type' } : field),
  }
}

function optionalActionField(name: string, label: string) {
  const action = createActionField(name, label)
  return { ...action, fields: action.fields.map((field) => ({ ...field, required: false })) }
}

function heroTintStop(name: string, label: string, defaultValue: HeroTintDeviceDTO['stop1']): Field {
  return {
    name,
    type: 'group',
    label,
    fields: [
      {
        type: 'row',
        fields: [
          { name: 'opacity', type: 'number', label: 'Opacity чёрного, %', min: 0, max: 100, defaultValue: defaultValue.opacity, admin: { width: '50%', step: 1 } },
          { name: 'position', type: 'number', label: 'Положение stop, %', min: 0, max: 200, defaultValue: defaultValue.position, admin: { width: '50%', step: 1 } },
        ],
      },
    ],
  }
}

function heroTintDevice(name: 'desktop' | 'mobile', label: string, defaultValue: HeroTintDeviceDTO): Field {
  return {
    name,
    type: 'group',
    label,
    fields: [
      {
        type: 'row',
        fields: [
          { name: 'centerX', type: 'number', label: 'Центр X, %', min: 0, max: 100, defaultValue: defaultValue.centerX, admin: { width: '50%', step: 1 } },
          { name: 'centerY', type: 'number', label: 'Центр Y, %', min: 0, max: 100, defaultValue: defaultValue.centerY, admin: { width: '50%', step: 1 } },
        ],
      },
      heroTintStop('stop1', 'Stop 1', defaultValue.stop1),
      heroTintStop('stop2', 'Stop 2', defaultValue.stop2),
      heroTintStop('stop3', 'Stop 3', defaultValue.stop3),
    ],
  }
}

const heroTintField: Field = {
  type: 'collapsible',
  label: 'Затемнение hero',
  admin: { description: 'Один чёрный radial-gradient: центр и три color stop с opacity и положением. Форма градиента фиксирована кодом.', initCollapsed: true },
  fields: [
    {
      name: 'tint',
      type: 'group',
      label: false,
      admin: { hideGutter: true },
      fields: [heroTintDevice('desktop', 'ПК', defaultHeroTint.desktop), heroTintDevice('mobile', 'Мобильный', defaultHeroTint.mobile)],
    },
  ],
}

const heroTitleFontSizeField: Field = {
  type: 'collapsible',
  label: 'Размер заголовка hero',
  admin: { description: 'Размер крупного заголовка hero. Значения задаются в px отдельно для мобильного и desktop.', initCollapsed: true },
  fields: [
    {
      name: 'titleFontSize',
      type: 'group',
      label: false,
      admin: { hideGutter: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'mobile', type: 'number', label: 'Мобильный, px', min: 24, max: 160, defaultValue: defaultHeroTitleFontSize.mobile, admin: { width: '50%', step: 1 } },
            { name: 'desktop', type: 'number', label: 'Desktop, px', min: 24, max: 160, defaultValue: defaultHeroTitleFontSize.desktop, admin: { width: '50%', step: 1 } },
          ],
        },
      ],
    },
  ],
}

function heroSlotField(name: string, label: string, device: 'desktop' | 'mobile', slotNumber: 1 | 2 | 3, defaults: { type: 'button'; icon: string; label: string; mode: string } | { type: 'info'; icon: string; title: string; caption: string }): Field {
  const action = createActionField('action', 'Кнопка')
  const actionFields: Field[] = action.fields.map((field) => {
    if (!('name' in field)) return field
    const { dbName: _legacyDBName, ...fieldWithoutDBName } = field as Field & { dbName?: string }
    const name = field.name === 'leadType' ? 'lead' : field.name
    const width = name === 'label' || name === 'mode' ? '50%' : undefined
    const shortName = `hero_${device === 'desktop' ? 'd' : 'm'}${slotNumber}_${name}`
    return {
      ...fieldWithoutDBName,
      name,
      ...(name === 'lead' ? {} : { dbName: shortName }),
      ...('type' in field && field.type === 'select' && field.name === 'mode' ? { enumName: 'hero_slot_action_mode' } : {}),
      ...('type' in field && field.type === 'select' && field.name === 'leadType' ? { enumName: 'hero_slot_lead_type' } : {}),
      admin: { ...field.admin, ...(width ? { width } : {}) },
    } as Field
  })
  return {
    name,
    type: 'group',
    label: false,
    admin: { hideGutter: true },
    fields: [
      {
        type: 'row',
        fields: [
          { name: 'enabled', type: 'checkbox', label: 'Показывать слот', defaultValue: true, admin: { width: '35%' } },
          { name: 'type', dbName: `hero_${device === 'desktop' ? 'd' : 'm'}${slotNumber}_type`, type: 'select', enumName: 'hero_slot_element', label: 'Элемент', required: true, defaultValue: defaults.type, options: [{ label: 'Кнопка', value: 'button' }, { label: 'Инфо-плашка', value: 'info' }], admin: { width: '65%', condition: (_, siblingData) => siblingData.enabled !== false } },
        ],
      },
      { name: 'icon', dbName: `hero_${device === 'desktop' ? 'd' : 'm'}${slotNumber}_icon`, type: 'select', enumName: 'hero_slot_icon', label: 'Иконка', required: true, defaultValue: defaults.icon, options: [{ label: 'Бронирование', value: 'CalendarCheck' }, { label: 'Календарь', value: 'CalendarDays' }, { label: 'Личный кабинет', value: 'UserRound' }, { label: 'Ссылка', value: 'ArrowUpRight' }, { label: 'Информация', value: 'Info' }, { label: 'Акцент', value: 'Sparkles' }], admin: { condition: (_, siblingData) => siblingData.enabled !== false, components: { Field: '/components/admin/HeroSlotIconField#HeroSlotIconField' } } },
      { name: 'action', type: 'group', label: false, admin: { hideGutter: true, width: '100%', condition: (_, siblingData) => siblingData.enabled !== false && siblingData.type === 'button' }, fields: [{ type: 'row', fields: actionFields }], defaultValue: defaults.type === 'button' ? { label: defaults.label, mode: defaults.mode } : undefined },
      { type: 'row', fields: [
        { name: 'title', type: 'text', label: 'Заголовок', admin: { width: '50%', condition: (_, siblingData) => siblingData.enabled !== false && siblingData.type === 'info' }, defaultValue: defaults.type === 'info' ? defaults.title : undefined },
        { name: 'caption', type: 'text', label: 'Подпись', admin: { width: '50%', condition: (_, siblingData) => siblingData.enabled !== false && siblingData.type === 'info' }, defaultValue: defaults.type === 'info' ? defaults.caption : undefined },
      ] },
    ],
  }
}

function heroSlotAccordion(name: string, label: string, device: 'desktop' | 'mobile', slotNumber: 1 | 2 | 3, defaults: Parameters<typeof heroSlotField>[4]): Field {
  return {
    type: 'collapsible',
    label,
    admin: { width: device === 'desktop' ? '33.333%' : '50%', initCollapsed: true },
    fields: [heroSlotField(name, label, device, slotNumber, defaults)],
  }
}

const heroSlotsField: Field = {
  type: 'collapsible',
  label: 'Кнопки и элементы',
  admin: { initCollapsed: true },
  fields: [{
    name: 'buttonsAndElements',
    type: 'group',
    label: false,
    admin: { hideGutter: true },
    fields: [
      {
        name: 'desktop', type: 'group', label: 'ПК',
        fields: [{ type: 'row', fields: [heroSlotAccordion('slot1', 'Слот 1', 'desktop', 1, { type: 'button', icon: 'CalendarCheck', label: 'Забронировать', mode: 'booking' }), heroSlotAccordion('slot2', 'Слот 2', 'desktop', 2, { type: 'button', icon: 'UserRound', label: 'Личный кабинет', mode: 'account' }), heroSlotAccordion('slot3', 'Слот 3', 'desktop', 3, { type: 'info', icon: 'CalendarDays', title: 'Открытие в ноябре', caption: 'Акция с 01.11 до 15.11' })] }],
      },
      {
        name: 'mobile', type: 'group', label: 'Мобильные',
        fields: [{ type: 'row', fields: [heroSlotAccordion('slot1', 'Слот 1', 'mobile', 1, { type: 'button', icon: 'CalendarCheck', label: 'Забронировать', mode: 'booking' }), heroSlotAccordion('slot2', 'Слот 2', 'mobile', 2, { type: 'info', icon: 'CalendarDays', title: 'Открытие в ноябре', caption: 'Акция с 01.11 до 15.11' })] }],
      },
    ],
  }],
}

const heroSocialProofField: Field = {
  type: 'collapsible',
  label: 'Социальное доказательство',
  admin: { initCollapsed: true },
  fields: [
    {
      name: 'socialProof',
      type: 'group',
      label: false,
      admin: { hideGutter: true },
      fields: [
        { name: 'ratingLabel', type: 'text', label: 'Рейтинг и аудитория', defaultValue: '4.9 · 500+ игроков' },
        { name: 'caption', type: 'text', label: 'Подпись', defaultValue: 'Рейтинг на Яндекс' },
        {
          name: 'coaches',
          type: 'relationship',
          relationTo: 'coaches',
          hasMany: true,
          maxRows: 3,
          label: 'Тренеры на аватарах',
          admin: { description: 'Используются фотографии существующих тренеров; медиа не копируется.' },
        },
      ],
    },
  ],
}

const heroStatsField: Field = {
  type: 'collapsible',
  label: 'Статистика',
  admin: { initCollapsed: true },
  fields: [
    {
      name: 'stats',
      type: 'array',
      label: false,
      maxRows: 4,
      defaultValue: [
        { value: '3 корта', label: 'Jubo Super Panoramic' },
        { value: '11.5 м', label: 'Высота до балок' },
        { value: '+21°C', label: 'Климат-контроль круглый год' },
        { value: '30 сек', label: 'Мгновенное бронирование' },
      ],
      fields: [
        { name: 'value', type: 'text', label: 'Значение', required: true },
        { name: 'label', type: 'text', label: 'Подпись', required: true },
      ],
    },
  ],
}

export const heroFields: Field[] = [
  {
    name: 'hero',
    type: 'group',
    label: 'Первый экран',
    fields: [
      {
        type: 'row',
        fields: [
          { name: 'titleLine', type: 'text', label: 'Первая строка', defaultValue: '2 часа', admin: { width: '50%' } },
          { name: 'titleConnector', type: 'text', label: 'Связка', defaultValue: 'по цене', admin: { width: '20%' } },
          { name: 'titleAccent', type: 'text', label: 'Акцент', defaultValue: 'одного', admin: { width: '30%' } },
        ],
      },
      {
        name: 'seoHeading',
        type: 'text',
        label: 'Главный заголовок для поисковых систем (SEO)',
        defaultValue: 'Премиальный крытый падел-клуб',
        required: true,
        admin: {
          description: 'Главный заголовок для поисковых систем (SEO). Обычно менять не нужно: он показывается под большим предложением и должен точно описывать клуб.',
        },
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Продолжение главного SEO-заголовка',
        defaultValue:
          'с испанскими панорамными кортами Jubo Super Panoramic, профессиональным покрытием PRO TURF 240 и клубным лаунжем.',
      },
      {
        name: 'desktopMedia',
        type: 'upload',
        relationTo: 'media',
        label: 'Фон desktop — изображение или видео',
        admin: { description: 'Для видео загрузите отдельный poster ниже; воспроизведение остаётся muted/loop в коде.' },
      },
      { name: 'desktopVideoPoster', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Poster desktop-видео' },
      {
        name: 'mobileMedia',
        type: 'upload',
        relationTo: 'media',
        label: 'Фон mobile — изображение или видео',
        admin: { description: 'Если пусто, используется desktop media.' },
      },
      { name: 'mobileVideoPoster', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Poster mobile-видео' },
      heroTintField,
      heroTitleFontSizeField,
      heroSlotsField,
      heroSocialProofField,
      { name: 'primaryAction', type: 'group', admin: { hidden: true }, fields: createActionField('legacyPrimary', 'Основная кнопка').fields },
      { name: 'secondaryAction', type: 'group', admin: { hidden: true }, fields: createActionField('legacySecondary', 'Вторая кнопка').fields },
      { name: 'openingNotice', type: 'group', admin: { hidden: true }, fields: [
        { name: 'title', type: 'text', label: 'Первая строка', defaultValue: 'Открытие в ноябре' },
        { name: 'caption', type: 'text', label: 'Вторая строка', defaultValue: 'Акция с 01.11 до 15.11' },
      ] },
      heroStatsField,
    ],
  },
]

export const clubFields: Field[] = [
  {
    name: 'benefitsSection',
    type: 'group',
    label: 'Преимущества',
    fields: [
      { name: 'eyebrow', type: 'text', label: 'Надзаголовок', defaultValue: 'Преимущества клуба' },
      { name: 'title', type: 'text', label: 'Заголовок', defaultValue: 'Всё для игры и отдыха' },
      {
        name: 'cards',
        type: 'array',
        label: 'Карточки',
        maxRows: 8,
        admin: { description: 'До восьми карточек: desktop-сетка и mobile swiper.' },
        validate: (value) => validateUniqueRowsByKey(value, 'variant', 'Каждый benefit recipe можно использовать один раз.'),
        fields: [
          {
            name: 'variant',
            type: 'select',
            label: 'Recipe',
            required: true,
            options: [
              { label: 'Парковка', value: 'parking' },
              { label: 'Инвентарь / фото-карточка', value: 'lockers' },
              { label: 'Душ', value: 'shower' },
              { label: 'Лаунж', value: 'chill' },
              { label: 'Онлайн-бронирование', value: 'online-booking' },
              { label: 'Тренеры — метрика', value: 'coaches-metric' },
              { label: 'Комьюнити клуба', value: 'community' },
              { label: 'Детская академия', value: 'kids-wide' },
            ],
          },
          { name: 'eyebrow', type: 'text', label: 'Надзаголовок' },
          { name: 'title', type: 'text', label: 'Заголовок', required: true },
          { name: 'description', type: 'textarea', label: 'Описание' },
          { name: 'supportingText', type: 'text', label: 'Дополнительная строка' },
          { name: 'media', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Изображение или декоративное медиа' },
          { name: 'overlay', type: 'select', label: 'Тон изображения', options: [...imageOverlayOptions] },
          { name: 'meshTone', type: 'select', label: 'Mesh-тон', options: [...meshToneOptions] },
          createActionField('action', 'Действие'),
        ],
      },
    ],
  },
  {
    name: 'offersSection',
    type: 'group',
    label: 'Предложения',
    fields: [
      {
        name: 'cards',
        type: 'array',
        label: 'Карточки',
        maxRows: 2,
        admin: { description: 'До двух карточек. Одна включённая карточка занимает всю ширину на ПК; если выключены обе, секция исчезает. Поля можно оставлять пустыми.' },
        fields: [
          { name: 'enabled', type: 'checkbox', label: 'Показывать карточку', defaultValue: true },
          {
            name: 'variant',
            type: 'select',
            label: 'Тип карточки',
            options: [
              { label: 'Турнирная площадка', value: 'tournament-venue' },
              { label: 'Мероприятие', value: 'event' },
            ],
          },
          { name: 'badge', type: 'text', label: 'Бейдж' },
          { name: 'title', type: 'text', label: 'Заголовок' },
          { name: 'description', type: 'textarea', label: 'Описание' },
          { name: 'image', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Изображение' },
          { name: 'meshTone', type: 'select', label: 'Тон цветного слоя поверх фотографии', defaultValue: 'deep-blue', options: meshToneOptions.filter(({ value }) => value === 'deep-blue' || value === 'indigo') },
          {
            name: 'icon',
            type: 'select',
            label: 'Иконка',
            options: [
              { label: 'Кубок', value: 'Trophy' },
              { label: 'Праздник', value: 'PartyPopper' },
            ],
          },
          optionalActionField('action', 'Действие'),
        ],
      },
    ],
  },
  {
    name: 'courtsSection',
    type: 'group',
    label: 'Корты',
    admin: { description: 'Карточки: опубликованные Courts с флагом главной и порядком 1–4.' },
    fields: [
      { name: 'titleLineOne', type: 'text', label: 'Первая строка заголовка', defaultValue: 'Инженерный подход' },
      { name: 'titleLineTwo', type: 'text', label: 'Вторая строка заголовка', defaultValue: 'к каждой детали корта' },
      { name: 'backgroundMedia', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Фоновое изображение' },
      { name: 'backgroundAlt', type: 'text', label: 'Alt фона', defaultValue: 'Панорамные корты Unlim Riga Padel' },
    ],
  },
]

export const servicesFields: Field[] = [
  {
    type: 'collapsible', label: 'Цены и абонементы', admin: { initCollapsed: true },
    fields: [{
      name: 'pricingSection', type: 'group', label: false, admin: { hideGutter: true, description: 'Здесь настраиваются предложение абонементов и стандарты клуба. Арендные тарифы редактируются в «Услуги и цены → Тарифы аренды»; тренировки и абонементы каталога выбираются из опубликованных активных записей с флагом главной.' },
      fields: [
        { type: 'collapsible', label: 'Заголовок и названия вкладок', admin: { initCollapsed: true }, fields: [{ type: 'row', fields: [
          { name: 'eyebrow', type: 'text', label: 'Надзаголовок', defaultValue: 'Тарифы' },
          { name: 'title', type: 'text', label: 'Заголовок', defaultValue: 'Цены и абонементы' },
          { name: 'defaultTab', type: 'select', label: 'Вкладка по умолчанию', defaultValue: 'rent', required: true, options: [{ label: 'Аренда', value: 'rent' }, { label: 'Тренировки', value: 'training' }, { label: 'Абонементы', value: 'memberships' }] },
          { name: 'rentTabLabel', type: 'text', label: 'Название вкладки аренды', defaultValue: 'Аренда' },
          { name: 'trainingTabLabel', type: 'text', label: 'Название вкладки тренировок', defaultValue: 'Тренировки' },
          { name: 'membershipsTabLabel', type: 'text', label: 'Название вкладки абонементов', defaultValue: 'Абонементы' },
        ] }] },
        { type: 'collapsible', label: 'Предложение абонементов', admin: { initCollapsed: true }, fields: [{ name: 'membershipOffer', type: 'group', label: false, admin: { hideGutter: true }, fields: [
          { name: 'enabled', type: 'checkbox', label: 'Показывать предложение', defaultValue: true },
          { name: 'showOnHomepage', type: 'checkbox', label: 'Показывать на главной', defaultValue: true },
          { name: 'title', type: 'text', label: 'Название', defaultValue: 'Абонементы' },
          { name: 'eyebrow', type: 'text', label: 'Надзаголовок', defaultValue: 'Для постоянных игроков' },
          { name: 'description', type: 'textarea', label: 'Описание', defaultValue: 'Скидки для постоянных игроков.' },
          { name: 'priceLabel', type: 'text', label: 'Подпись цены', defaultValue: 'Условия уточняйте у администратора' },
          { name: 'meshTone', type: 'select', dbName: 'hm_mem_mesh_tone', label: 'Тон карточки', defaultValue: 'dark', options: [...meshToneOptions] },
          pricingActionField(),
        ] }] },
        { type: 'collapsible', label: 'Стандарты клуба', admin: { initCollapsed: true }, fields: [{ name: 'rentalStandards', type: 'group', label: false, admin: { hideGutter: true }, fields: [
          { name: 'enabled', type: 'checkbox', label: 'Показывать блок', defaultValue: true },
          { name: 'showOnHomepage', type: 'checkbox', label: 'Показывать на главной', defaultValue: true },
          { name: 'title', type: 'text', label: 'Название', defaultValue: 'Стандарты Unlim Riga' },
          { name: 'eyebrow', type: 'text', label: 'Надзаголовок', defaultValue: 'Премиальный сервис' },
          { name: 'timeLabel', type: 'text', label: 'Подпись', defaultValue: 'Включено в стоимость аренды' },
          { name: 'description', type: 'textarea', label: 'Описание' },
          { name: 'meshTone', type: 'select', dbName: 'hm_std_mesh_tone', label: 'Тон карточки', defaultValue: 'dark', options: [...meshToneOptions] },
          { name: 'includedItems', type: 'array', dbName: 'hp_rental_standards_items', label: 'Что включено', maxRows: 8, fields: [{ name: 'text', type: 'text', label: 'Пункт', required: true }] },
        ] }] },
      ],
    }],
  },
  {
    type: 'collapsible', label: 'Тренировочная робопушка', admin: { initCollapsed: true },
    fields: [{ name: 'methodistBanner', type: 'group', label: false, admin: { hideGutter: true }, fields: [
      { type: 'collapsible', label: 'Текст и фотография', admin: { initCollapsed: true }, fields: [{ type: 'row', fields: [
      { name: 'eyebrow', type: 'text', label: 'Надзаголовок', defaultValue: 'Самостоятельная практика' },
      { name: 'icon', type: 'select', label: 'Иконка', defaultValue: 'Target', options: [{ label: 'Точность', value: 'Target' }, { label: 'Робот', value: 'Bot' }, { label: 'Энергия', value: 'Zap' }] },
      {
        name: 'title',
        type: 'text',
        label: 'Заголовок',
        defaultValue: 'Тренировочная робопушка',
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Описание',
        defaultValue:
          'Отрабатывайте удары и точность в своём темпе. Арендуйте робопушку для самостоятельной тренировки на падел-корте.',
      },
      { name: 'decorativeMedia', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Фотография тренировки' },
      ] }] },
      { type: 'collapsible', label: 'Цена и оформление', admin: { initCollapsed: true }, fields: [{ type: 'row', fields: [
      { name: 'price', type: 'number', label: 'Аренда робопушки, ₽ / час', min: 0, defaultValue: 1500 },
      { name: 'meshTone', type: 'select', label: 'Тон цветного слоя поверх фотографии', defaultValue: 'deep-blue', options: [...meshToneOptions], admin: { description: 'Глубокий синий — overlay-blue; остальные тона используют соответствующий цветной overlay из UI-kit.' } },
      { ...createActionField('action', 'Кнопка'), admin: { hidden: true }, defaultValue: { label: 'Получить консультацию', mode: 'phone' } },
      ] }] },
    ] }],
  },
]

export const communityFields: Field[] = [
  {
    name: 'coachesSection',
    type: 'group',
    label: 'Тренеры',
    fields: [
      { name: 'eyebrow', type: 'text', label: 'Надзаголовок', defaultValue: 'Команда' },
      { name: 'title', type: 'text', label: 'Заголовок', defaultValue: 'Тренеры' },
    ],
  },
  {
    name: 'tournamentsSection',
    type: 'group',
    label: 'Турниры',
    fields: [
      { name: 'eyebrow', type: 'text', label: 'Надзаголовок', defaultValue: 'Соревнования' },
      { name: 'title', type: 'text', label: 'Заголовок', defaultValue: 'Турниры и лиги' },
    ],
  },
  {
    name: 'gallerySection',
    type: 'group',
    label: 'Галерея',
    fields: [
      { name: 'eyebrow', type: 'text', label: 'Надзаголовок', defaultValue: 'Сообщество' },
      { name: 'title', type: 'text', label: 'Заголовок', defaultValue: 'Жизнь клуба' },
      { ...createActionField('action', 'Кнопка'), defaultValue: { label: 'Смотреть больше', mode: 'internal-link', href: '/gallery' } },
    ],
  },
  {
    name: 'blogSection',
    type: 'group',
    label: 'Блог',
    admin: {
      description:
        'Карточки: три уникальные позиции Articles; пустые места заполняются новейшими опубликованными.',
    },
    fields: [
      { name: 'eyebrow', type: 'text', label: 'Надзаголовок', defaultValue: 'Медиа' },
      { name: 'title', type: 'text', label: 'Заголовок', defaultValue: 'Блог и статьи' },
      { ...createActionField('action', 'Кнопка'), defaultValue: { label: 'Ещё →', mode: 'internal-link', href: '/blog' } },
    ],
  },
  {
    name: 'reviewsSection',
    type: 'group',
    label: 'Отзывы и вопросы',
    fields: [
      { name: 'reviewsEyebrow', type: 'text', label: 'Надзаголовок отзывов', defaultValue: 'Отзывы' },
      { name: 'reviewsTitle', type: 'text', label: 'Заголовок отзывов', defaultValue: 'Что говорят игроки' },
      { name: 'faqEyebrow', type: 'text', label: 'Надзаголовок FAQ', defaultValue: 'Вопросы' },
      { name: 'faqTitle', type: 'text', label: 'Заголовок FAQ', defaultValue: 'Частые вопросы' },
      { name: 'externalRatingLabel', type: 'text', label: 'Внешний рейтинг', defaultValue: '4.8 на Яндекс Картах' },
      { name: 'externalReviewsLabel', type: 'text', label: 'Количество отзывов', defaultValue: '312 отзывов о клубе' },
      { name: 'externalReviewsURL', type: 'text', label: 'Ссылка на отзывы', defaultValue: 'https://yandex.ru/maps' },
    ],
  },
]
