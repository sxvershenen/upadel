import type { TextareaField } from 'payload'
import { widgetURL, type WidgetKind } from '@unlim/content-contract'

export function createWidgetURLField(label: string, mode: 'vivacrm-widget' | 'embed-widget', kind?: WidgetKind): TextareaField {
  return {
    name: 'widgetURL', type: 'textarea', label,
    admin: {
      condition: (_, siblingData) => siblingData.mode === mode,
      description: kind === 'vivacrm-script'
        ? 'URL или тег script установки VivaCRM. Сохраняется только проверенный адрес.'
        : 'Вставьте https:// URL, iframe или script VivaCRM. Сохраняется только адрес; HTML и атрибуты не исполняются.',
    },
    hooks: { beforeValidate: [({ value, siblingData }) => widgetURL(value, kind ?? siblingData.widgetKind ?? 'iframe') ?? value] },
    validate: (value, { siblingData }) => {
      const data = siblingData as { mode?: string; widgetKind?: WidgetKind } | undefined
      return data?.mode !== mode || Boolean(widgetURL(value, kind ?? data?.widgetKind ?? 'iframe')) || 'Укажите корректный адрес виджета выбранного типа.'
    },
  }
}
