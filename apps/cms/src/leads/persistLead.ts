import type { Payload } from 'payload'
import type { Lead } from '../payload-types'

export async function persistLead(payload: Payload, data: Record<string, unknown>): Promise<{ lead: Lead; duplicate: boolean }> {
  const existing = () => payload.find({ collection: 'leads', limit: 1, depth: 0, overrideAccess: true, where: { idempotencyKey: { equals: data.idempotencyKey } } })
  const found = (await existing()).docs[0]
  if (found) return { lead: found, duplicate: true }
  try {
    return { lead: await payload.create({ collection: 'leads', overrideAccess: true, data: data as never }), duplicate: false }
  } catch (error) {
    // A concurrent insert may have won the unique key after our initial lookup.
    const winner = (await existing()).docs[0]
    if (winner) return { lead: winner, duplicate: true }
    throw error
  }
}
