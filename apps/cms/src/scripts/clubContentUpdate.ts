import { getPayload } from 'payload'
import config from '../payload.config'
import { applyClubLaunchUpdate } from '../content/clubLaunchUpdate'
import { applyClubRefinements } from '../content/clubRefinements'
import { applyClubContentUpdate } from '../content/clubContentUpdate'
import { applyClubOfferUpdate } from '../content/clubOfferUpdate'
import { applyClubHeroCopyUpdate } from '../content/clubHeroCopyUpdate'

const payload = await getPayload({ config })
try {
  const baseChanged = await applyClubContentUpdate(payload)
  const launchChanged = await applyClubLaunchUpdate(payload)
  const refined = await applyClubRefinements(payload)
  const offerChanged = await applyClubOfferUpdate(payload)
  const heroChanged = await applyClubHeroCopyUpdate(payload)
  const changed = baseChanged || launchChanged || refined || offerChanged || heroChanged
  payload.logger.info(changed ? 'Club content updated.' : 'Club update already applied; CMS edits preserved.')
} finally { await payload.destroy() }
