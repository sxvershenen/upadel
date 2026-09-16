import { timingSafeEqual } from 'node:crypto'
import config from '@payload-config'
import { getPayload } from 'payload'
import { aggregateRecent, runMaintenance } from '@/analytics/aggregate'

export const dynamic = 'force-dynamic'
function authorized(request: Request): boolean {
  const expected = process.env.ANALYTICS_JOB_SECRET ?? ''
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  return expected.length >= 32 && supplied.length === expected.length && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
}
export async function POST(request: Request): Promise<Response> {
  if (!authorized(request)) return Response.json({ error: 'Unauthorized.' }, { status: 401 })
  try {
    const payload = await getPayload({ config })
    return Response.json({ ok: true, aggregated: await aggregateRecent(payload), retention: await runMaintenance(payload) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ error: 'Maintenance failed safely.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}

