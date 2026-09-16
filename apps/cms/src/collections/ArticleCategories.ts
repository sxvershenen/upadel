import type { CollectionConfig } from 'payload'

import { authenticated, publishedOrAuthenticated } from '../fields/access'
import { seoField } from '../fields/seo'
import { seedKeyField } from '../fields/seedKey'
import { slugField } from '../fields/slug'

export const ArticleCategories: CollectionConfig = {
  slug: 'article-categories',
  labels: {
    singular: 'Категория статей',
    plural: 'Категории статей',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publishedOrAuthenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    hidden: true,
    useAsTitle: 'title',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Основное',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Название',
              required: true,
              unique: true,
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Описание',
            },
          ],
        },
        {
          label: 'SEO',
          fields: [seoField],
        },
      ],
    },
    slugField,
    seedKeyField,
  ],
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
