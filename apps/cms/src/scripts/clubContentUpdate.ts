import { getPayload } from 'payload'
import config from '../payload.config'
import { applyClubContentUpdate } from '../content/clubContentUpdate'

const payload = await getPayload({ config })
try {
  const changed = await applyClubContentUpdate(payload)
  payload.logger.info(changed ? 'Club roster and supplied documents updated.' : 'Club update already applied; CMS edits preserved.')
} finally { await payload.destroy() }
