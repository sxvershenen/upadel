import { getPayload } from 'payload'
import config from '../payload.config'
import { applyOpeningContentTransaction } from '../content/openingContent'

const payload = await getPayload({ config })
try {
  const changed = await applyOpeningContentTransaction(payload)
  payload.logger.info(changed ? 'Opening content updated.' : 'Opening content already applied; editor changes preserved.')
} finally {
  await payload.destroy()
}
