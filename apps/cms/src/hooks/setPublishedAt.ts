import type { CollectionBeforeChangeHook } from 'payload'

type PublishableDocument = {
  _status?: null | 'draft' | 'published'
  id: string
  publishedAt?: null | string
}

export const setPublishedAt: CollectionBeforeChangeHook<PublishableDocument> = ({ data, originalDoc }) => {
  const status = data._status ?? originalDoc?._status
  if (status !== 'published' || data.publishedAt) return data

  return {
    ...data,
    publishedAt: originalDoc?.publishedAt ?? new Date().toISOString(),
  }
}
