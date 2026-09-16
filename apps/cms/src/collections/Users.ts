import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Пользователь',
    plural: 'Пользователи',
  },
  admin: {
    group: 'Настройки',
    hidden: true,
    useAsTitle: 'email',
  },
  auth: true,
  fields: [],
}
