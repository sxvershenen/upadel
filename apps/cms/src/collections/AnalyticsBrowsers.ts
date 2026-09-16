import type { CollectionConfig } from 'payload'
import { authenticated } from '../fields/access'

export const AnalyticsBrowsers: CollectionConfig = {
  slug: 'analytics-browsers',
  labels: { singular: 'Браузер аналитики', plural: 'Браузеры аналитики' },
  access: { create: authenticated, delete: authenticated, read: authenticated, update: authenticated },
  admin: { hidden: true }, timestamps: false,
  fields: [
    { name: 'anonymousId', type: 'text', required: true, unique: true, index: true, maxLength: 80 },
    { name: 'firstSeenAt', type: 'date', required: true, index: true },
    { name: 'lastSeenAt', type: 'date', required: true, index: true },
    { name: 'expiresAt', type: 'date', required: true, index: true },
    { name: 'firstSourceCapturedAt', type: 'date' },
    { name: 'firstChannel', type: 'text', maxLength: 40 }, { name: 'firstSource', type: 'text', maxLength: 80 },
    { name: 'firstMedium', type: 'text', maxLength: 80 }, { name: 'firstCampaign', type: 'text', maxLength: 120 },
  ],
}

