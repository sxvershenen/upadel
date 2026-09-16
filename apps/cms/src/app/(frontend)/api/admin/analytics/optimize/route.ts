import config from '@payload-config'
import { getPayload } from 'payload'

import { aggregateRecent, maintenancePreview, runMaintenance } from '@/analytics/aggregate'

export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401 })
  let input: unknown
  try { input = await request.json() } catch { return Response.json({ error: 'Invalid JSON.' }, { status: 400 }) }
  const mode = input && typeof input === 'object' && 'mode' in input ? (input as { mode: unknown }).mode : null
  if (mode !== 'preview' && mode !== 'run') return Response.json({ error: 'Invalid mode.' }, { status: 400 })
  try {
    if (mode === 'preview') return Response.json({ ok: true, preview: await maintenancePreview(payload) }, { headers: { 'Cache-Control': 'no-store' } })
    const aggregated = await aggregateRecent(payload)
    return Response.json({ ok: true, aggregated, result: await runMaintenance(payload) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ error: 'Optimization stopped without deleting unverified data.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}

