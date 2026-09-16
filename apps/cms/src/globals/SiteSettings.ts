import type { GlobalConfig } from 'payload'

import { authenticated } from '../fields/access'
import { imageOnlyFilter } from '../fields/media'
import { validateHTTPSOrPlaceholder, validateHTTPSURL, validateInternalLink } from '../fields/url'
import { requirePublishedGlobal } from '../hooks/requirePublishedGlobal'
import { validateBookingAdapter, validateBookingCredentialEnv, validateGA4MeasurementID, validateMetricaCounterID, validateWebmasterVerification } from '../integrations/validation'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Настройки сайта',
  access: {
    read: () => true,
    readVersions: authenticated,
    update: authenticated,
  },
  admin: { group: 'Настройки' },
  fields: [
    {
      name: 'seedVersion',
      type: 'text',
      admin: { hidden: true },
      access: { read: ({ req }) => Boolean(req.user) },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Бренд',
          fields: [
            { name: 'brandName', type: 'text', label: 'Название', defaultValue: 'UNLIM RIGA PADEL', required: true },
            { name: 'brandLogo', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Логотип' },
            {
              name: 'brandLogoMode',
              type: 'select',
              label: 'Отображение логотипа',
              defaultValue: 'prefix',
              options: [
                { label: 'Только текст', value: 'text' },
                { label: 'Логотип слева от названия', value: 'prefix' },
                { label: 'Полностью заменить текст', value: 'replace' },
              ],
            },
            { name: 'headerSubtitle', type: 'text', label: 'Подпись в шапке', defaultValue: 'Новорижское шоссе 3к1' },
          ],
        },
        {
          label: 'Навигация',
          fields: [
            {
              name: 'desktopNavigation',
              type: 'array',
              label: 'Desktop-навигация',
              maxRows: 8,
              defaultValue: [
                { label: 'Цены', href: '/prices' },
                { label: 'Тренировки', href: '/training' },
                { label: 'Тренеры', href: '/coaches' },
                { label: 'Турниры', href: '/tournaments' },
                { label: 'Статьи', href: '/blog' },
                { label: 'Подарить', href: '/gift' },
                { label: 'О нас', href: '/about' },
              ],
              fields: [
                { name: 'label', type: 'text', label: 'Название', required: true },
                { name: 'href', type: 'text', label: 'Ссылка', required: true, validate: validateInternalLink },
              ],
            },
            {
              name: 'mobileNavigation',
              type: 'array',
              label: 'Основная mobile-навигация',
              maxRows: 3,
              defaultValue: [
                { label: 'Главная', href: '/', icon: 'Home' },
                { label: 'Тренировки', href: '/training', icon: 'Dumbbell' },
                { label: 'Цены', href: '/prices', icon: 'Tag' },
              ],
              admin: { description: 'Центральная кнопка «Играть» и кнопка меню остаются code-defined.' },
              fields: [
                { name: 'label', type: 'text', label: 'Название', required: true },
                { name: 'href', type: 'text', label: 'Ссылка', required: true, validate: validateInternalLink },
                {
                  name: 'icon',
                  type: 'select',
                  label: 'Иконка',
                  required: true,
                  options: [
                    { label: 'Главная', value: 'Home' },
                    { label: 'Тренировки', value: 'Dumbbell' },
                    { label: 'Цены', value: 'Tag' },
                  ],
                },
              ],
            },
            {
              name: 'mobileMenuNavigation',
              type: 'array',
              label: 'Ссылки мобильного меню',
              maxRows: 8,
              defaultValue: [
                { label: 'Цены', href: '/prices' },
                { label: 'Тренировки', href: '/training' },
                { label: 'Тренеры', href: '/coaches' },
                { label: 'Турниры', href: '/tournaments' },
                { label: 'Статьи', href: '/blog' },
                { label: 'Подарить', href: '/gift' },
                { label: 'О нас', href: '/about' },
              ],
              fields: [
                { name: 'label', type: 'text', label: 'Название', required: true },
                { name: 'href', type: 'text', label: 'Ссылка', required: true, validate: validateInternalLink },
              ],
            },
            {
              name: 'mobileActions',
              type: 'group',
              label: 'Тексты мобильных действий',
              fields: [
                { name: 'playLabel', type: 'text', label: 'Центральная кнопка', defaultValue: 'Играть' },
                { name: 'menuLabel', type: 'text', label: 'Кнопка меню', defaultValue: 'Меню' },
                { name: 'menuTitle', type: 'text', label: 'Заголовок меню', defaultValue: 'Меню' },
                { name: 'quickActionsTitle', type: 'text', label: 'Заголовок быстрых действий', defaultValue: 'Быстрые действия' },
                { name: 'bookCourtLabel', type: 'text', label: 'Бронирование', defaultValue: 'Забронировать корт' },
                { name: 'callLabel', type: 'text', label: 'Звонок', defaultValue: 'Позвонить в клуб' },
                { name: 'directionsLabel', type: 'text', label: 'Маршрут', defaultValue: 'Проложить маршрут' },
              ],
            },
          ],
        },
        {
          label: 'Пользователи',
          fields: [
            {
              name: 'usersPanel',
              type: 'ui',
              admin: { components: { Field: '/components/admin/SettingsCollectionField#UsersSettingsField' } },
            },
          ],
        },
        {
          label: 'SEO и редиректы',
          fields: [
            {
              name: 'redirectsPanel',
              type: 'ui',
              admin: { components: { Field: '/components/admin/SettingsCollectionField#RedirectsSettingsField' } },
            },
          ],
        },
        {
          label: 'Контакты',
          fields: [
            { name: 'address', type: 'text', label: 'Адрес', defaultValue: 'Новорижское шоссе, 3к1' },
            { name: 'directionsURL', type: 'text', label: 'Ссылка «Проложить маршрут»', validate: validateHTTPSURL },
            { name: 'addressLabel', type: 'text', label: 'Подпись адреса', defaultValue: 'Адрес' },
            { name: 'transitLabel', type: 'text', label: 'Подпись маршрута', defaultValue: 'Ближайшее метро' },
            { name: 'parkingLabel', type: 'text', label: 'Подпись парковки', defaultValue: 'Парковка' },
            { name: 'openingHoursLabel', type: 'text', label: 'Подпись режима работы', defaultValue: 'Режим работы' },
            { name: 'phoneFieldLabel', type: 'text', label: 'Подпись телефона', defaultValue: 'Телефон' },
            { name: 'emailFieldLabel', type: 'text', label: 'Подпись email', defaultValue: 'Email' },
            { name: 'phoneDisplay', type: 'text', label: 'Телефон', defaultValue: '+7 999 000-00-00' },
            { name: 'phoneValue', type: 'text', label: 'Телефон для ссылки', defaultValue: '+79990000000' },
            { name: 'email', type: 'email', label: 'Email', defaultValue: 'hello@unlimriga.club' },
            { name: 'transit', type: 'text', label: 'Как добраться', defaultValue: 'Мякинино · 12 мин пешком' },
            { name: 'parking', type: 'text', label: 'Парковка', defaultValue: '40 бесплатных мест у входа' },
            { name: 'openingHours', type: 'text', label: 'Режим работы', defaultValue: 'Ежедневно 07:00–00:00' },
            {
              name: 'map',
              type: 'group',
              label: 'Карта',
              admin: { description: 'Координаты используются для безопасной code-defined карты; iframe/HTML не принимаются.' },
              fields: [
                { name: 'latitude', type: 'number', label: 'Широта', min: -90, max: 90, defaultValue: 55.8 },
                { name: 'longitude', type: 'number', label: 'Долгота', min: -180, max: 180, defaultValue: 37.15 },
                { name: 'zoom', type: 'number', label: 'Масштаб', min: 1, max: 20, defaultValue: 14 },
              ],
            },
          ],
        },
        {
          label: 'Футер',
          fields: [
            { name: 'footerImage', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Фотография клуба' },
            {
              name: 'footerAbout',
              type: 'textarea',
              label: 'Описание клуба',
              defaultValue:
                'Unlim Riga Padel — клуб для тех, кто хочет играть на кортах уровня мировых турниров рядом с домом. Мы строили пространство вокруг качества покрытия, работы тренеров и атмосферы, в которую хочется возвращаться.',
            },
            {
              name: 'footerStats',
              type: 'array',
              label: 'Метрики клуба',
              maxRows: 4,
              defaultValue: [
                { value: '2023', label: 'Год открытия' },
                { value: '4', label: 'Панорамных корта' },
                { value: '9', label: 'Тренеров в штате' },
                { value: '2 100+', label: 'Игроков в клубе' },
              ],
              fields: [
                { name: 'value', type: 'text', label: 'Значение', required: true },
                { name: 'label', type: 'text', label: 'Подпись', required: true },
              ],
            },
            { name: 'legalEntity', type: 'textarea', label: 'Реквизиты', defaultValue: 'ООО «Анлим Спорт» · ИНН 5024178932 · ОГРН 1235000078451' },
            {
              name: 'footerNavigation',
              type: 'array',
              label: 'Навигация футера',
              maxRows: 8,
              defaultValue: [
                { label: 'Цены', href: '/prices', column: '1' },
                { label: 'Тренировки', href: '/training', column: '1' },
                { label: 'Тренеры', href: '/coaches', column: '1' },
                { label: 'Турниры', href: '/tournaments', column: '2' },
                { label: 'Статьи', href: '/blog', column: '2' },
                { label: 'Подарить', href: '/gift', column: '2' },
                { label: 'О нас', href: '/about', column: '2' },
              ],
              fields: [
                { name: 'label', type: 'text', label: 'Название', required: true },
                { name: 'href', type: 'text', label: 'Ссылка', required: true, validate: validateInternalLink },
                { name: 'column', type: 'select', label: 'Колонка', defaultValue: '1', options: ['1', '2'], required: true },
              ],
            },
            {
              name: 'socialLinks',
              type: 'array',
              label: 'Соцсети',
              maxRows: 5,
              admin: { description: 'Значение # сохраняет prototype-заглушку безопасно; замените её реальным HTTPS URL до запуска.' },
              defaultValue: [
                { provider: 'telegram', label: 'Telegram', url: 'https://t.me' },
                { provider: 'vk', label: 'VK', url: 'https://vk.com' },
              ],
              fields: [
                {
                  name: 'provider',
                  type: 'select',
                  label: 'Сервис',
                  required: true,
                  options: ['telegram', 'vk', 'instagram', 'video'],
                },
                { name: 'label', type: 'text', label: 'Доступное название', required: true },
                { name: 'url', type: 'text', label: 'URL', required: true, validate: validateHTTPSOrPlaceholder },
              ],
            },
            {
              name: 'legalLinks',
              type: 'array',
              label: 'Юридические ссылки',
              maxRows: 5,
              defaultValue: [
                { label: 'Политика конфиденциальности', href: '/privacy' },
                { label: 'Публичная оферта', href: '/public-offer' },
                { label: 'Договор-оферта', href: '/contract-offer' },
              ],
              fields: [
                { name: 'label', type: 'text', label: 'Название', required: true },
                { name: 'href', type: 'text', label: 'Ссылка', required: true, validate: validateInternalLink },
              ],
            },
            { name: 'copyright', type: 'text', label: 'Копирайт', defaultValue: '© 2026 Unlim Riga Padel. Все права защищены.' },
            {
              name: 'cookieNotice',
              type: 'group',
              label: 'Уведомление cookies',
              fields: [
                {
                  name: 'text',
                  type: 'textarea',
                  label: 'Текст',
                  defaultValue: 'Используем cookies, чтобы бронирование и подбор тренировок работали быстрее.',
                },
                { name: 'acceptLabel', type: 'text', label: 'Кнопка принятия', defaultValue: 'Принять' },
                { name: 'rejectLabel', type: 'text', label: 'Кнопка отказа', defaultValue: 'Отклонить' },
                { name: 'manageLabel', type: 'text', label: 'Кнопка повторной настройки', defaultValue: 'Настроить cookies' },
              ],
            },
          ],
        },
        {
          label: 'Интеграции',
          fields: [
            {
              name: 'analytics', type: 'group', label: 'Сбор собственной аналитики',
              admin: { description: 'Юридическая модель для России ещё не согласована. Безопасное значение по умолчанию требует отдельного согласия посетителя.' },
              fields: [
                {
                  name: 'mode', type: 'select', label: 'Режим сбора', required: true, defaultValue: 'consent-required',
                  options: [
                    { label: 'Отключено', value: 'disabled' },
                    { label: 'Только после согласия', value: 'consent-required' },
                    { label: 'Первая сторона без баннера (после юридического согласования)', value: 'first-party' },
                  ],
                },
                { name: 'yandexMetricaEnabled', type: 'checkbox', label: 'Яндекс.Метрика включена', defaultValue: false },
                { name: 'yandexMetricaCounterID', type: 'text', label: 'ID счётчика Метрики', admin: { condition: (_, data) => data.yandexMetricaEnabled }, validate: validateMetricaCounterID },
                { name: 'yandexMetricaWebvisor', type: 'checkbox', label: 'Вебвизор', defaultValue: false, admin: { condition: (_, data) => data.yandexMetricaEnabled } },
                { name: 'yandexWebmasterVerification', type: 'text', label: 'Подтверждение Яндекс.Вебмастера', validate: validateWebmasterVerification },
                { name: 'ga4Enabled', type: 'checkbox', label: 'Google Analytics 4 включена', defaultValue: false },
                { name: 'ga4MeasurementID', type: 'text', label: 'GA4 Measurement ID', admin: { condition: (_, data) => data.ga4Enabled }, validate: validateGA4MeasurementID },
              ],
            },
            {
              name: 'leadNotifications', type: 'group', label: 'Уведомления об обращениях',
              admin: { description: 'По умолчанию выключены. Environment variables имеют приоритет над секретами из CMS.' },
              fields: [
                { name: 'telegramEnabled', type: 'checkbox', label: 'Telegram включён', defaultValue: false },
                { name: 'telegramBotToken', type: 'text', label: 'Telegram bot token', access: { read: ({ req }) => Boolean(req.user) }, admin: { condition: (_, data) => data.telegramEnabled, components: { Field: '/components/admin/SecretTextField#SecretTextField' } } },
                { name: 'telegramChatID', type: 'text', label: 'Telegram chat ID', access: { read: ({ req }) => Boolean(req.user) }, admin: { condition: (_, data) => data.telegramEnabled } },
                { name: 'vkEnabled', type: 'checkbox', label: 'VK включён', defaultValue: false },
                { name: 'vkAccessToken', type: 'text', label: 'VK access token', access: { read: ({ req }) => Boolean(req.user) }, admin: { condition: (_, data) => data.vkEnabled, components: { Field: '/components/admin/SecretTextField#SecretTextField' } } },
                { name: 'vkPeerID', type: 'text', label: 'VK peer ID', access: { read: ({ req }) => Boolean(req.user) }, admin: { condition: (_, data) => data.vkEnabled } },
                { name: 'vkAPIVersion', type: 'text', label: 'VK API version', defaultValue: '5.199', admin: { condition: (_, data) => data.vkEnabled } },
              ],
            },
          ],
        },
        {
          label: 'Подтверждения и формы',
          fields: [
            {
              name: 'contactConfirmation', type: 'group', label: 'Подтверждение контакта',
              admin: { description: 'Телефон, email и URL соцсетей берутся из вкладок «Контакты» и «Футер».' },
              fields: [
                { name: 'avatar', type: 'upload', relationTo: 'media', filterOptions: imageOnlyFilter, label: 'Аватар клуба' },
                { name: 'dialogTitle', type: 'text', label: 'Заголовок подтверждения', defaultValue: 'Связаться с клубом', required: true },
                { name: 'cancelLabel', type: 'text', label: 'Кнопка отмены', defaultValue: 'Отмена', required: true },
                { name: 'continueLabel', type: 'text', label: 'Кнопка перехода', defaultValue: 'Продолжить', required: true },
                { name: 'formTitle', type: 'text', label: 'Заголовок формы', defaultValue: 'Оставить заявку', required: true },
                { name: 'submitLabel', type: 'text', label: 'Кнопка отправки', defaultValue: 'Отправить', required: true },
                { name: 'successTitle', type: 'text', label: 'Заголовок успеха', defaultValue: 'Заявка отправлена', required: true },
                { name: 'successText', type: 'textarea', label: 'Текст успеха', defaultValue: 'Администратор клуба свяжется с вами.', required: true },
                { name: 'consentLabel', type: 'textarea', label: 'Текст согласия', defaultValue: 'Согласие на обработку персональных данных (текст требует юридического согласования)', required: true },
                { name: 'policyHref', type: 'text', label: 'Ссылка на политику', defaultValue: '/policy', required: true, validate: validateInternalLink },
                { name: 'phoneEnabled', type: 'checkbox', label: 'Подтверждать телефон', defaultValue: true },
                { name: 'emailEnabled', type: 'checkbox', label: 'Подтверждать email', defaultValue: true },
                { name: 'telegramEnabled', type: 'checkbox', label: 'Подтверждать Telegram', defaultValue: true },
                { name: 'vkEnabled', type: 'checkbox', label: 'Подтверждать VK', defaultValue: true },
              ],
            },
          ],
        },
        {
          label: 'Бронирование',
          fields: [
            {
              name: 'booking',
              type: 'group',
              label: 'Центральный адаптер бронирования',
              admin: { description: 'HTML и JavaScript не принимаются. Секреты хранятся только в environment variables.' },
              fields: [
                {
                  name: 'mode',
                  type: 'select',
                  label: 'Режим',
                  defaultValue: 'disabled',
                  required: true,
                  options: [
                    { label: 'Отключено', value: 'disabled' },
                    { label: 'Безопасная внешняя ссылка', value: 'external-link' },
                    { label: 'Code-defined provider adapter', value: 'provider-adapter' },
                  ],
                },
                {
                  name: 'externalURL',
                  type: 'text',
                  label: 'URL бронирования',
                  admin: { condition: (_, siblingData) => siblingData.mode === 'external-link' },
                  validate: (value: unknown, options: unknown) => {
                    const mode = (options as { siblingData?: { mode?: unknown } }).siblingData?.mode
                    return mode !== 'external-link' || validateHTTPSURL(value) === true
                      ? true
                      : 'Для внешнего режима укажите корректный https:// URL.'
                  },
                },
                {
                  name: 'providerAdapter',
                  type: 'select',
                  label: 'Адаптер',
                  options: [
                    { label: 'VivaCRM', value: 'vivacrm' },
                    { label: 'Lunda', value: 'lunda' },
                    { label: 'Padel app', value: 'padel-app' },
                  ],
                  admin: { condition: (_, siblingData) => siblingData.mode === 'provider-adapter' },
                  validate: (value: unknown, options: unknown) => validateBookingAdapter(value, (options as { siblingData?: Record<string, unknown> }).siblingData ?? {}),
                },
                {
                  name: 'providerAccountID',
                  type: 'text',
                  label: 'ID аккаунта/клуба',
                  access: { read: ({ req }) => Boolean(req.user) },
                  admin: { condition: (_, siblingData) => siblingData.mode === 'provider-adapter' },
                },
                {
                  name: 'credentialEnvironmentVariable',
                  type: 'text',
                  label: 'Имя environment variable с секретом',
                  access: { read: ({ req }) => Boolean(req.user) },
                  admin: {
                    condition: (_, siblingData) => siblingData.mode === 'provider-adapter',
                    description: 'Хранится только имя переменной, например BOOKING_API_TOKEN. Сам токен в CMS не вводится.',
                  },
                  validate: (value: unknown, options: unknown) => validateBookingCredentialEnv(value, (options as { siblingData?: Record<string, unknown> }).siblingData ?? {}),
                },
                { name: 'buttonLabel', type: 'text', label: 'Базовая подпись кнопки', defaultValue: 'Забронировать' },
                { name: 'bookingStatusHelp', type: 'ui', admin: { components: { Field: '/components/admin/IntegrationStatus#IntegrationStatus' } } },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: { beforeRead: [requirePublishedGlobal] },
  versions: { drafts: { autosave: true, schedulePublish: true }, max: 50 },
}
