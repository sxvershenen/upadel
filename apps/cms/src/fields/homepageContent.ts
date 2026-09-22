import type { Field } from 'payload'

import { createActionField } from './action'
import { imageOnlyFilter } from './media'
import { imageOverlayOptions, meshToneOptions } from './presentation'
import { validateUniqueRowsByKey } from './validators'

export const heroFields: Field[] = [
  {
    name: 'hero',
    type: 'group',
    label: 'Первый экран',
    fields: [
      {
        type: 'row',
        fields: [
          { name: 'titleLine', type: 'text', label: 'Первая строка', defaultValue: 'Первая тренировка', admin: { width: '50%' } },
          { name: 'titleConnector', type: 'text', label: 'Связка', defaultValue: 'за', admin: { width: '20%' } },
          { name: 'titleAccent', type: 'text', label: 'Акцент', defaultValue: '1 990 ₽', admin: { width: '30%' } },
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
      { ...createActionField('primaryAction', 'Основная кнопка'), defaultValue: { label: 'Забронировать', mode: 'booking' } },
      { ...createActionField('secondaryAction', 'Вторая кнопка'), defaultValue: { label: 'Пробное занятие', mode: 'trial-booking' } },
      {
        name: 'socialProof',
        type: 'group',
        label: 'Социальное доказательство',
        fields: [
          { name: 'ratingLabel', type: 'text', label: 'Рейтинг и аудитория', defaultValue: '4.9 · 500+ игроков' },
          { name: 'caption', type: 'text', label: 'Подпись', defaultValue: 'Рейтинг клуба на Новой Риге' },
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
      {
        name: 'stats',
        type: 'array',
        label: 'Статистика',
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
        maxRows: 7,
        admin: { description: 'До семи карточек: предел текущей desktop-сетки и mobile swiper.' },
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
              { label: 'Детская академия — широкая', value: 'kids-wide' },
            ],
          },
          { name: 'eyebrow', type: 'text', label: 'Надзаголовок' },
          { name: 'title', type: 'text', label: 'Заголовок', required: true },
          { name: 'description', type: 'textarea', label: 'Описание', required: true },
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
        admin: { description: 'До двух карточек: текущая раскладка состоит из двух равных колонок.' },
        validate: (value) => validateUniqueRowsByKey(value, 'variant', 'Каждый offer recipe можно использовать один раз.'),
        fields: [
          {
            name: 'variant',
            type: 'select',
            label: 'Recipe',
            required: true,
            options: [
              { label: 'Турнирная площадка', value: 'tournament-venue' },
              { label: 'Мероприятие', value: 'event' },
            ],
          },
          { name: 'badge', type: 'text', label: 'Бейдж', required: true },
          { name: 'title', type: 'text', label: 'Заголовок', required: true },
          { name: 'description', type: 'textarea', label: 'Описание', required: true },
          { name: 'image', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Изображение' },
          { name: 'overlay', type: 'select', label: 'Тон изображения', options: [...imageOverlayOptions], required: true },
          {
            name: 'icon',
            type: 'select',
            label: 'Иконка',
            required: true,
            options: [
              { label: 'Кубок', value: 'Trophy' },
              { label: 'Праздник', value: 'PartyPopper' },
            ],
          },
          createActionField('action', 'Действие'),
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
    name: 'pricingSection',
    type: 'group',
    label: 'Цены и абонементы',
    admin: {
      description:
        'Карточки: RentalRates 1–4, TrainingPrograms 1–5 и Memberships 1–4. Используются только опубликованные активные записи с флагом главной.',
    },
    fields: [
      { name: 'eyebrow', type: 'text', label: 'Надзаголовок', defaultValue: 'Тарифы' },
      { name: 'title', type: 'text', label: 'Заголовок', defaultValue: 'Цены и абонементы' },
      {
        name: 'defaultTab',
        type: 'select',
        label: 'Вкладка по умолчанию',
        defaultValue: 'rent',
        required: true,
        options: [
          { label: 'Аренда', value: 'rent' },
          { label: 'Тренировки', value: 'training' },
          { label: 'Абонементы', value: 'memberships' },
        ],
      },
      { name: 'rentTabLabel', type: 'text', label: 'Название вкладки аренды', defaultValue: 'Аренда' },
      { name: 'trainingTabLabel', type: 'text', label: 'Название вкладки тренировок', defaultValue: 'Тренировки' },
      { name: 'membershipsTabLabel', type: 'text', label: 'Название вкладки абонементов', defaultValue: 'Абонементы' },
    ],
  },
  {
    name: 'methodistBanner',
    type: 'group',
    label: 'Баннер методиста',
    fields: [
      {
        name: 'title',
        type: 'text',
        label: 'Заголовок',
        defaultValue: 'Не знаете, с чего начать или какого тренера выбрать?',
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'Описание',
        defaultValue:
          'Наш старший методист подберёт программу и напарников по вашему спортивному бэкграунду — бесплатная консультация занимает 10 минут.',
      },
      { name: 'decorativeMedia', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Декоративное изображение' },
      { name: 'meshTone', type: 'select', label: 'Mesh-тон', defaultValue: 'lavender', options: [...meshToneOptions] },
      { ...createActionField('action', 'Кнопка'), defaultValue: { label: 'Получить консультацию', mode: 'phone' } },
    ],
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
