import type { TextField } from 'payload'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const slugField: TextField = {
  name: 'slug',
  type: 'text',
  label: 'URL-адрес',
  required: true,
  unique: true,
  admin: {
    description: 'Стабильный адрес латиницей: например, artem-volkov. Не меняйте после публикации без редиректа.',
    position: 'sidebar',
  },
  validate: (value) => {
    if (typeof value !== 'string' || !slugPattern.test(value)) {
      return 'Используйте строчные латинские буквы, цифры и одиночные дефисы.'
    }

    return true
  },
}
