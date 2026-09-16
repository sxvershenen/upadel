import type { Payload } from 'payload'

export const homepageCollectionLimits = {
  coaches: 8,
  courts: 4,
  'rental-rates': 4,
  'training-programs': 5,
  memberships: 4,
  tournaments: 3,
  'gallery-items': 10,
  reviews: 8,
  faqs: 10,
  partners: 12,
} as const

export type HomepageCollectionSlug = keyof typeof homepageCollectionLimits

export async function resolveHomepageEntities<TSlug extends HomepageCollectionSlug>(
  payload: Payload,
  collection: TSlug,
  options: { preview?: boolean } = {},
) {
  const requiresActive = collection !== 'tournaments'
  const { preview = false } = options

  const result = await payload.find({
    collection,
    draft: preview,
    limit: homepageCollectionLimits[collection],
    sort: 'homepageOrder',
    where: {
      and: [
        ...(!preview ? [{ _status: { equals: 'published' } }] : []),
        { showOnHomepage: { equals: true } },
        ...(requiresActive ? [{ isActive: { equals: true } }] : []),
      ],
    },
  })

  return result.docs
}
