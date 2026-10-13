import config from '@payload-config'
import { getPayload, type CollectionSlug } from 'payload'
import { formatAdminURL } from 'payload/shared'

import { requireAdmin } from '@/lib/adminAuth'
import { buildRecordSearchWhere } from '@/components/admin/adminQuickSearchModel'

export const dynamic = 'force-dynamic'

const searchableCollections = [
  { slug: 'rental-rates', titleField: 'title', fields: ['title', 'description', 'eyebrow', 'priceLabel'] },
  { slug: 'memberships', titleField: 'title', fields: ['title', 'description', 'badge', 'priceLabel'] },
  { slug: 'training-programs', titleField: 'title', fields: ['title', 'description', 'badge'] },
  { slug: 'articles', titleField: 'title', fields: ['title', 'excerpt'] },
  { slug: 'tournaments', titleField: 'title', fields: ['title', 'slug'] },
  { slug: 'coaches', titleField: 'name', fields: ['name', 'bio', 'specialization'] },
  { slug: 'gallery-items', titleField: 'title', fields: ['title', 'caption'] },
  { slug: 'partners', titleField: 'name', fields: ['name'] },
  { slug: 'courts', titleField: 'title', fields: ['title', 'description', 'eyebrow'] },
  { slug: 'reviews', titleField: 'authorName', fields: ['authorName', 'authorMeta', 'text'] },
  { slug: 'faqs', titleField: 'question', fields: ['question', 'answer'] },
] as const

type SearchDocument = Record<string, unknown> & { id: number | string }

function readTitle(doc: SearchDocument, field: string): string | null {
  const value = doc[field]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export async function GET(request: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const denied = await requireAdmin(payload, request.headers)
  if (denied) return denied

  const query = new URL(request.url).searchParams.get('q')?.trim().slice(0, 80) ?? ''
  if (query.length < 2) return Response.json({ results: [] }, { headers: { 'Cache-Control': 'no-store' } })

  const matches = await Promise.all(searchableCollections.map(async ({ slug, titleField, fields }) => {
    const where = buildRecordSearchWhere(fields, query)
    if (!where) return []
    const result = await payload.find({
      collection: slug as CollectionSlug,
      depth: 0,
      draft: true,
      limit: 3,
      overrideAccess: true,
      where,
    } as never) as unknown as { docs: SearchDocument[] }
    const collection = payload.config.collections.find((item) => item.slug === slug)
    const label = typeof collection?.labels?.singular === 'string' ? collection.labels.singular : slug
    return result.docs.flatMap((doc) => {
      const title = readTitle(doc, titleField)
      if (!title) return []
      return [{
        href: formatAdminURL({ adminRoute: payload.config.routes.admin, path: `/collections/${slug}/${doc.id}` }),
        label: title,
        group: label,
        record: true as const,
      }]
    })
  }))

  return Response.json({ results: matches.flat().slice(0, 12) }, { headers: { 'Cache-Control': 'no-store' } })
}
