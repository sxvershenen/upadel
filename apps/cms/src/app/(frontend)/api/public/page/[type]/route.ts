import { projectionCache, publicProjectionError } from '@/content/projectionCache'
import { createHash, timingSafeEqual } from 'node:crypto'

import config from '@payload-config'
import { getPayload } from 'payload'

import { createPadelCourtZakazProjection } from '@/content/padelCourtZakazProjection'
import { createThematicPageProjection } from '@/content/thematicPageProjection'
import type { ThematicPageKind } from '@/globals/ThematicPages'
import { publicContentOrigin } from '@/config/publicURLs'

export const dynamic = 'force-dynamic'
const kinds = new Set<ThematicPageKind>(['prices', 'training', 'gift', 'courts', 'gallery', 'about', 'contacts', 'policy', 'oferta'])
const padelCourtZakazKind = 'padel-court-zakaz'

function validSecret(value: string | null): boolean {
  if (!process.env.PREVIEW_SECRET || !value) return false
  return timingSafeEqual(createHash('sha256').update(process.env.PREVIEW_SECRET).digest(), createHash('sha256').update(value).digest())
}

export async function GET(request: Request, context: { params: Promise<{ type: string }> }): Promise<Response> {
  const { type } = await context.params
  if (!kinds.has(type as ThematicPageKind) && type !== padelCourtZakazKind) return Response.json({ error: 'Unknown page type.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
  const url = new URL(request.url)
  const preview = url.searchParams.get('preview') === '1'
  if (preview && !validSecret(url.searchParams.get('secret'))) return Response.json({ error: 'Invalid preview credentials.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
  try {
    const payload = await getPayload({ config })
    const origin = publicContentOrigin(url.origin, process.env.PUBLIC_CONTENT_URL)
    const result = await projectionCache.read(`page:${type}:${origin}`, async () => type === padelCourtZakazKind
      ? await createPadelCourtZakazProjection(payload, { origin, preview })
      : await createThematicPageProjection(payload, { kind: type as ThematicPageKind, origin, preview }), preview)
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return publicProjectionError(error, 'page')
  }
}
