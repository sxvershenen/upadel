import type { Payload } from 'payload'

import type { Article } from '../payload-types'

const homepageSlotCount = 3
const cardSelect = { id: true, slug: true, homePosition: true, previewImage: true, category: true, readingTimeMinutes: true, title: true, excerpt: true, publishedAt: true, createdAt: true } as const

export function arrangeHomepageArticles(pinned: Article[], newestPublished: Article[]): Article[] {
  const slots: Array<Article | undefined> = Array.from({ length: homepageSlotCount })

  for (const article of pinned) {
    if (!article.homePosition) continue

    const index = Number(article.homePosition) - 1
    if (!Number.isInteger(index) || index < 0 || index >= homepageSlotCount) {
      throw new Error(`Article ${article.id} has an invalid homepage position.`)
    }
    if (slots[index]) {
      throw new Error(`Homepage article position ${article.homePosition} is duplicated.`)
    }

    slots[index] = article
  }

  const usedIDs = new Set(slots.flatMap((article) => (article ? [article.id] : [])))
  const fallback = newestPublished.filter((article) => !usedIDs.has(article.id))
  let fallbackIndex = 0

  for (let index = 0; index < slots.length; index += 1) {
    if (!slots[index] && fallback[fallbackIndex]) {
      slots[index] = fallback[fallbackIndex]
      fallbackIndex += 1
    }
  }

  return slots.filter((article): article is Article => Boolean(article))
}

export async function resolveHomepageArticles(payload: Payload, options: { preview?: boolean } = {}): Promise<Article[]> {
  const { preview = false } = options
  const pinnedResult = await payload.find({
    collection: 'articles',
    select: cardSelect,
    draft: preview,
    pagination: false,
    sort: 'homePosition',
    where: {
      and: [
        ...(!preview ? [{ _status: { equals: 'published' } }] : []),
        { homePosition: { in: ['1', '2', '3'] } },
      ],
    },
  })

  const pinned = pinnedResult.docs as Article[]
  const emptySlotCount = homepageSlotCount - pinned.length
  if (emptySlotCount <= 0) return arrangeHomepageArticles(pinned, [])

  const pinnedIDs = pinned.map(({ id }) => id)
  const newestResult = await payload.find({
    collection: 'articles',
    select: cardSelect,
    draft: preview,
    limit: emptySlotCount,
    sort: ['-publishedAt', '-createdAt'],
    where: {
      and: [
        ...(!preview ? [{ _status: { equals: 'published' } }] : []),
        ...(pinnedIDs.length > 0 ? [{ id: { not_in: pinnedIDs } }] : []),
      ],
    },
  })

  return arrangeHomepageArticles(pinned, newestResult.docs as Article[])
}
