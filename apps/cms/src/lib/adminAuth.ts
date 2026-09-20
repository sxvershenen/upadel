import type { Payload } from 'payload'

export async function requireAdmin(payload: Payload, headers: Headers): Promise<Response | null> {
  const { user, permissions } = await payload.auth({ headers })
  if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  if (permissions.canAccessAdmin !== true) return Response.json({ error: 'Admin access required.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
  return null
}
