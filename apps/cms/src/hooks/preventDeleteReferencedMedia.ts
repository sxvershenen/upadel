import { APIError, type CollectionBeforeDeleteHook } from 'payload'

import { getMediaUsage } from '../lib/mediaUsage'

export const preventDeleteReferencedMedia: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const usage = await getMediaUsage(req.payload, [id], req)
  if (usage.length === 0) return

  const locations = usage.slice(0, 3).map(({ location, state }) => `${location}${state === 'draft-only' ? ' (только черновик)' : ''}`)
  const remainder = usage.length > locations.length ? ` и ещё ${usage.length - locations.length}` : ''
  throw new APIError(`Медиафайл используется: ${locations.join('; ')}${remainder}. Сначала удалите эти связи.`, 409)
}
