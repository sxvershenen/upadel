import type { CollectionConfig } from 'payload'

import { authenticated } from '../fields/access'

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Обращение', plural: 'Обращения' },
  access: { create: authenticated, delete: authenticated, read: authenticated, update: authenticated },
  admin: {
    defaultColumns: ['createdAt', 'status', 'type', 'name', 'phone', 'email', 'telegram', 'vk', 'sourcePage', 'sourceEntity'],
    group: 'Обращения',
    useAsTitle: 'name',
  },
  defaultSort: '-createdAt',
  fields: [
    { name: 'type', type: 'select', label: 'Тип', required: true, options: [
      { label: 'Абонемент', value: 'membership' }, { label: 'Подарочный сертификат', value: 'gift' },
      { label: 'Пробная тренировка', value: 'trial' }, { label: 'Консультация', value: 'consultation' }, { label: 'Другое', value: 'other' },
    ] },
    { name: 'status', type: 'select', label: 'Статус', required: true, defaultValue: 'new', options: [
      { label: 'Новое', value: 'new' }, { label: 'Связались', value: 'contacted' }, { label: 'Квалифицировано', value: 'qualified' },
      { label: 'Конвертировано', value: 'converted' }, { label: 'Отклонено', value: 'rejected' },
    ], admin: { position: 'sidebar' } },
    { name: 'name', type: 'text', label: 'Имя', required: true, maxLength: 120 },
    { name: 'phone', type: 'text', label: 'Телефон', maxLength: 40 },
    { name: 'email', type: 'email', label: 'Email' },
    { name: 'telegram', type: 'text', label: 'Telegram', maxLength: 80 },
    { name: 'vk', type: 'text', label: 'VK', maxLength: 80 },
    { name: 'comment', type: 'textarea', label: 'Комментарий', maxLength: 2000 },
    { name: 'sourcePage', type: 'text', label: 'Страница-источник', required: true, maxLength: 120, admin: { readOnly: true } },
    { name: 'sourceEntity', type: 'text', label: 'Объект-источник', maxLength: 160, admin: { readOnly: true } },
    { name: 'idempotencyKey', type: 'text', label: 'Ключ идемпотентности', required: true, unique: true, index: true, maxLength: 100, admin: { hidden: true, readOnly: true } },
    { name: 'notificationStatus', type: 'select', label: 'Уведомления', defaultValue: 'not-configured', options: [
      { label: 'Не настроены', value: 'not-configured' }, { label: 'Отправлены', value: 'sent' }, { label: 'Отправлены частично', value: 'partial' }, { label: 'Ошибка', value: 'failed' },
    ], admin: { position: 'sidebar', readOnly: true } },
    { name: 'notifiedAt', type: 'date', label: 'Последняя попытка уведомления', admin: { position: 'sidebar', readOnly: true } },
    { name: 'notificationResult', type: 'textarea', label: 'Результат уведомления', maxLength: 500, admin: { position: 'sidebar', readOnly: true } },
    { name: 'notificationRetry', type: 'ui', admin: { position: 'sidebar', components: { Field: '/components/admin/LeadNotificationRetry#LeadNotificationRetry' } } },
    { name: 'analyticsAnonymousId', type: 'text', index: true, maxLength: 80, admin: { hidden: true, readOnly: true } },
    { name: 'analyticsSessionId', type: 'text', index: true, maxLength: 80, admin: { hidden: true, readOnly: true } },
    { name: 'analyticsChannel', type: 'text', maxLength: 40, admin: { hidden: true, readOnly: true } },
    { name: 'analyticsDevice', type: 'text', maxLength: 20, admin: { hidden: true, readOnly: true } },
    { name: 'analyticsLanguage', type: 'text', maxLength: 16, admin: { hidden: true, readOnly: true } },
  ],
}
