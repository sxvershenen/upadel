import config from '@payload-config'
import { getPayload } from 'payload'
import { aggregateRecent, runMaintenance } from '../analytics/aggregate'

const payload = await getPayload({ config })
const aggregated = await aggregateRecent(payload)
const retention = await runMaintenance(payload)
payload.logger.info({ aggregated, retention }, 'Analytics maintenance complete.')
process.exit(0)

