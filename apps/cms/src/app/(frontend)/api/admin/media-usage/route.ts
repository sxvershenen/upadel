import config from '@payload-config'
import { getPayload } from 'payload'

import { getMediaUsage } from '@/lib/mediaUsage'
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const denied = await requireAdmin(payload, request.headers)
  if (denied) return denied

  let input: unknown
  try {
    input = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
  }
  const rawIDs = input && typeof input === 'object' && 'ids' in input ? (input as { ids: unknown }).ids : null
  if (!Array.isArray(rawIDs) || rawIDs.length > 100) {
    return Response.json({ error: 'Provide up to 100 media IDs.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
  }
  const ids = [...new Set(rawIDs.flatMap((id) => typeof id === 'number' || typeof id === 'string' ? [String(id)] : []))]
  if (ids.length !== rawIDs.length || ids.some((id) => !/^\d+$/.test(id))) {
    return Response.json({ error: 'Media IDs must be positive integers.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
  }

  const [usage, mediaResult] = await Promise.all([
    getMediaUsage(payload, ids),
    payload.find({ collection: 'media', depth: 0, pagination: false, overrideAccess: true, where: { id: { in: ids } } }),
  ])
  const media = Object.fromEntries(mediaResult.docs.map((doc) => [String(doc.id), {
    alt: doc.alt,
    filename: doc.filename,
    mimeType: doc.mimeType,
    thumbnailURL: doc.sizes?.thumbnail?.url ?? doc.thumbnailURL ?? doc.url,
  }]))

  return Response.json({ media, usage }, { headers: { 'Cache-Control': 'no-store' } })
}
