/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import config from '@payload-config'
import '@payloadcms/next/css'
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'

export const GET = REST_GET(config)
const restPost = REST_POST(config)

const LOGIN_WINDOW_MS = 60_000
const LOGIN_MAX_REQUESTS = 30
const loginRate = new Map<string, { count: number; resetAt: number }>()

function clientKey(request: Request): string {
  // The reverse proxy must overwrite these headers; never expose the CMS directly in production.
  return request.headers.get('x-real-ip')?.trim() || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

function loginLimited(request: Request): boolean {
  const now = Date.now()
  for (const [key, entry] of loginRate) if (entry.resetAt <= now) loginRate.delete(key)
  if (loginRate.size > 10_000) loginRate.clear()
  const key = clientKey(request)
  const current = loginRate.get(key)
  if (!current || current.resetAt <= now) {
    loginRate.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return false
  }
  current.count += 1
  return current.count > LOGIN_MAX_REQUESTS
}

export async function POST(request: Request, args: { params: Promise<{ slug?: string[] }> }): Promise<Response> {
  const slug = (await args.params).slug ?? []
  if (slug.join('/') === 'users/login' && loginLimited(request)) {
    return Response.json(
      { errors: [{ message: 'Too many login attempts. Try again later.' }] },
      { status: 429, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } },
    )
  }
  return restPost(request, { params: Promise.resolve({ slug }) })
}
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const PUT = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)
