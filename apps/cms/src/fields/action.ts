import type { GroupField } from 'payload'

export function createActionField(name: string, label: string): GroupField {
  return {
    name,
    type: 'group',
    label,
    fields: [
      {
        name: 'label',
        type: 'text',
        label: 'Текст кнопки',
      },
      {
        name: 'mode',
        type: 'select',
        label: 'Действие',
        defaultValue: 'none',
        required: true,
        options: [
          { label: 'Нет действия', value: 'none' },
          { label: 'Центральное бронирование', value: 'booking' },
          { label: 'Запись на пробную тренировку', value: 'trial-booking' },
          { label: 'Внутренняя ссылка или якорь', value: 'internal-link' },
          { label: 'Внешняя ссылка', value: 'external-link' },
          { label: 'Телефон из настроек сайта', value: 'phone' },
          { label: 'Email из настроек сайта', value: 'email' },
          { label: 'Контактная форма', value: 'lead-form' },
        ],
      },
      {
        name: 'href',
        type: 'text',
        label: 'Ссылка',
        admin: {
          condition: (_, siblingData) =>
            siblingData.mode === 'internal-link' || siblingData.mode === 'external-link',
          description: 'Для внутренней ссылки используйте /path или #anchor; внешняя должна начинаться с https://.',
        },
        validate: (value: unknown, options: unknown) => {
          const mode = (options as { siblingData?: { mode?: unknown } }).siblingData?.mode
          if (mode !== 'internal-link' && mode !== 'external-link') return true
          if (typeof value !== 'string' || value.length === 0) return 'Укажите ссылку для выбранного действия.'
          if (mode === 'internal-link') {
            return value.startsWith('/') || value.startsWith('#')
              ? true
              : 'Внутренняя ссылка должна начинаться с / или #.'
          }

          try {
            return new URL(value).protocol === 'https:' ? true : 'Внешняя ссылка должна использовать https://.'
          } catch {
            return 'Укажите корректную внешнюю ссылку.'
          }
        },
      },
      {
        name: 'leadType', dbName: 'lead_type', type: 'select', label: 'Тип обращения',
        admin: { condition: (_, siblingData) => siblingData.mode === 'lead-form' },
        options: [
          { label: 'Абонемент', value: 'membership' }, { label: 'Подарочный сертификат', value: 'gift' },
          { label: 'Пробная тренировка', value: 'trial' }, { label: 'Консультация', value: 'consultation' }, { label: 'Другое', value: 'other' },
        ],
        validate: (value: unknown, options: unknown) => (options as { siblingData?: { mode?: string } }).siblingData?.mode !== 'lead-form' || typeof value === 'string' ? true : 'Выберите тип обращения.',
      },
    ],
  }
}
