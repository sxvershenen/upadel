import type { Field } from 'payload'

import { imageOnlyFilter } from './media'

export const pageHeroFields: Field[] = [
  {
    name: 'heroImage',
    type: 'upload',
    relationTo: 'media',
    filterOptions: imageOnlyFilter,
    label: 'Фоновое изображение',
    admin: { description: 'Если поле пустое, используется подготовленный фон страницы.' },
  },
  {
    name: 'heroGrayscale',
    type: 'checkbox',
    label: 'Чёрно-белый фон',
    defaultValue: true,
    admin: { description: 'Картинка страницы получает спокойный grayscale-режим.' },
  },
]
