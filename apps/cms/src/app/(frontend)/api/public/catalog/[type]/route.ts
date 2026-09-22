import { parseCatalogQuery, catalogQueryParams } from '@unlim/content-contract'
import { projectionCache, publicProjectionError } from '@/content/projectionCache'
import { createHash, timingSafeEqual } from 'node:crypto'

import config from '@payload-config'
import { getPayload } from 'payload'

import { createCatalogProjection, createDetailProjection, type CatalogKind } from '@/content/catalogProjection'
import { publicContentOrigin } from '@/config/publicURLs'

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
    const query = parseCatalogQuery(kind, url.searchParams)
    const origin = publicContentOrigin(url.origin, process.env.PUBLIC_CONTENT_URL)
    const result = await projectionCache.read(`catalog:${kind}:${slug ?? ''}:${catalogQueryParams(query)}:${origin}`, async () => slug
      ? await createDetailProjection(payload, { kind, origin, preview, slug })
      : await createCatalogProjection(payload, { kind, origin, preview, query }), preview)
    if (!result) return Response.json({ error: 'Not found.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return publicProjectionError(error, 'catalog')
  }
}
