import type { CollectionBeforeDeleteHook, CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { authenticated } from '../fields/access'
import { seoField } from '../fields/seo'
import { buildPagePath, isSystemPagePath, normalizePagePath, normalizePageSegment, pageParentExists, pagePathExists } from '../pageMap/pages'

const validatePage: CollectionBeforeValidateHook = async ({ data, operation, originalDoc, req }) => {
  if (!data) return data

  const parentPath = normalizePagePath(data.parentPath ?? originalDoc?.parentPath)
  const slug = normalizePageSegment(data.slug ?? originalDoc?.slug)
  const path = buildPagePath(parentPath, slug)

  if (!parentPath) throw new Error('Выберите существующий родительский путь.')
  if (!slug) throw new Error('URL-сегмент должен содержать строчные латинские буквы, цифры и одиночные дефисы.')
  if (!path || isSystemPagePath(path)) throw new Error('Этот путь зарезервирован системой.')

  if (operation === 'update' && originalDoc) {
    if (parentPath !== originalDoc.parentPath || slug !== originalDoc.slug) {
      throw new Error('Путь страницы стабилен. Для нового адреса создайте новую страницу и настройте редирект.')
    }
  }

  if (!(await pageParentExists(req.payload, parentPath))) {
    throw new Error('Родительская страница больше не существует. Обновите карту и выберите другой путь.')
  }
  if (await pagePathExists(req.payload, path, originalDoc?.id)) {
    throw new Error(`Путь ${path} уже занят другой публичной страницей.`)
  }

  data.parentPath = parentPath
  data.slug = slug
  data.path = path
  return data
}

const preventDeleteWithChildren: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const page = await req.payload.findByID({ collection: 'pages', id, depth: 0, overrideAccess: true })
  const children = await req.payload.count({
    collection: 'pages',
    overrideAccess: true,
    where: { parentPath: { equals: page.path } },
  })
  if (children.totalDocs > 0) {
    throw new Error('Сначала удалите дочерние страницы.')
  }
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Страница', plural: 'Страницы' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    readVersions: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'path', '_status', 'updatedAt'],
    description: 'Маршрут для новой code-defined страницы. Публичный шаблон реализуется в приложении отдельно.',
    hidden: true,
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название',
      required: true,
      maxLength: 120,
    },
    {
      name: 'parentPath',
      type: 'text',
      label: 'Родительский путь',
      required: true,
      admin: {
        description: 'Выбирается при создании из «Карты страниц» и после сохранения не меняется.',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'URL-сегмент',
      required: true,
      admin: {
        description: 'Стабильная часть адреса после родительского пути.',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'path',
      type: 'text',
      label: 'Полный путь',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'template',
      type: 'text',
      label: 'Шаблон',
      defaultValue: 'code-defined-page',
      required: true,
      admin: { hidden: true, readOnly: true },
    },
    seoField,
  ],
  hooks: { beforeDelete: [preventDeleteWithChildren], beforeValidate: [validatePage] },
  versions: {
    drafts: { autosave: true, schedulePublish: true },
    maxPerDoc: 50,
  },
}
