import { getPayload } from 'payload'
import config from '../payload.config'
import { applyClubLaunchUpdate } from '../content/clubLaunchUpdate'
import { applyClubRefinements } from '../content/clubRefinements'
import { applyClubContentUpdate } from '../content/clubContentUpdate'
import { applyClubOfferUpdate } from '../content/clubOfferUpdate'

const payload = await getPayload({ config })
try {
  const baseChanged = await applyClubContentUpdate(payload)
  const launchChanged = await applyClubLaunchUpdate(payload)
  const refined = await applyClubRefinements(payload)
  const offerChanged = await applyClubOfferUpdate(payload)
  const changed = baseChanged || launchChanged || refined || offerChanged
  payload.logger.info(changed ? 'Club roster and supplied documents updated.' : 'Club update already applied; CMS edits preserved.')
} finally { await payload.destroy() }
