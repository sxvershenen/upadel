import { projectionCache, publicProjectionError } from '@/content/projectionCache'
import { createHash, timingSafeEqual } from 'node:crypto'

import config from '@payload-config'
import { getPayload } from 'payload'

import { createHomepageProjection } from '@/content/homepageProjection'
import { publicContentOrigin } from '@/config/publicURLs'

export const dynamic = 'force-dynamic'

function validPreviewSecret(received: string | null): boolean {
  const expected = process.env.PREVIEW_SECRET
  if (!expected || !received) return false
  const expectedHash = createHash('sha256').update(expected).digest()
  const receivedHash = createHash('sha256').update(received).digest()
  return timingSafeEqual(expectedHash, receivedHash)
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const previewRequested = url.searchParams.get('preview') === 'homepage'
  if (previewRequested && !validPreviewSecret(url.searchParams.get('secret'))) {
    return Response.json({ error: 'Invalid preview credentials.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
  }

  try {
    const payload = await getPayload({ config })
    const origin = publicContentOrigin(url.origin, process.env.PUBLIC_CONTENT_URL)
    const dto = await projectionCache.read(`homepage:${origin}`, () => createHomepageProjection(payload, { origin, preview: previewRequested }), previewRequested)
    return Response.json(dto, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return publicProjectionError(error, 'homepage')
  }
}
