import { createHash, timingSafeEqual } from 'node:crypto'

import config from '@payload-config'
import { getPayload } from 'payload'

import { createHomepageProjection } from '@/content/homepageProjection'

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
    const dto = await createHomepageProjection(payload, { origin: url.origin, preview: previewRequested })
    return Response.json(dto, {
      headers: {
        'Cache-Control': previewRequested ? 'no-store' : 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    request.signal.throwIfAborted()
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unable to build homepage projection.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
