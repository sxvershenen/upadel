import { createHash, timingSafeEqual } from 'node:crypto'

import config from '@payload-config'
import { getPayload } from 'payload'

import { createCatalogProjection, createDetailProjection, type CatalogKind } from '@/content/catalogProjection'

export const dynamic = 'force-dynamic'
const kinds = new Set<CatalogKind>(['blog', 'coaches', 'tournaments'])

function validSecret(value: string | null): boolean {
  if (!process.env.PREVIEW_SECRET || !value) return false
  return timingSafeEqual(createHash('sha256').update(process.env.PREVIEW_SECRET).digest(), createHash('sha256').update(value).digest())
}

export async function GET(request: Request, context: { params: Promise<{ type: string }> }): Promise<Response> {
  const { type } = await context.params
  if (!kinds.has(type as CatalogKind)) return Response.json({ error: 'Unknown catalog type.' }, { status: 404 })
  const kind = type as CatalogKind
  const url = new URL(request.url)
  const preview = url.searchParams.get('preview') === '1'
  if (preview && !validSecret(url.searchParams.get('secret'))) return Response.json({ error: 'Invalid preview credentials.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
  const slug = url.searchParams.get('slug')
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return Response.json({ error: 'Invalid slug.' }, { status: 400 })

  try {
    const payload = await getPayload({ config })
    const result = slug
      ? await createDetailProjection(payload, { kind, origin: url.origin, preview, slug })
      : await createCatalogProjection(payload, { kind, origin: url.origin, preview })
    if (!result) return Response.json({ error: 'Not found.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
    return Response.json(result, { headers: { 'Cache-Control': preview ? 'no-store' : 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' } })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unable to build catalog projection.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
