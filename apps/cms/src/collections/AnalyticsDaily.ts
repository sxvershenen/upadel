import type { CollectionConfig } from 'payload'
import { authenticated } from '../fields/access'

export const AnalyticsDaily: CollectionConfig = {
  slug: 'analytics-daily', labels: { singular: 'Дневной агрегат', plural: 'Дневные агрегаты' },
  access: { create: authenticated, delete: authenticated, read: authenticated, update: authenticated },
  admin: { hidden: true }, timestamps: false,
  fields: [
    { name: 'aggregateKey', type: 'text', required: true, unique: true, index: true, maxLength: 64 },
    { name: 'date', type: 'date', required: true, index: true }, { name: 'eventName', type: 'text', required: true, index: true, maxLength: 40 },
    { name: 'path', type: 'text', index: true, maxLength: 240 }, { name: 'objectType', type: 'text', index: true, maxLength: 24 }, { name: 'objectId', type: 'text', index: true, maxLength: 160 },
    { name: 'actionKind', type: 'text', maxLength: 24 }, { name: 'formType', type: 'text', maxLength: 40 },
    { name: 'channel', type: 'text', index: true, maxLength: 40 }, { name: 'source', type: 'text', maxLength: 80 }, { name: 'medium', type: 'text', maxLength: 80 },
    { name: 'campaign', type: 'text', index: true, maxLength: 120 }, { name: 'referrerDomain', type: 'text', index: true, maxLength: 160 },
    { name: 'firstChannel', type: 'text', index: true, maxLength: 40 }, { name: 'firstSource', type: 'text', maxLength: 80 },
    { name: 'firstMedium', type: 'text', maxLength: 80 }, { name: 'firstCampaign', type: 'text', index: true, maxLength: 120 },
    { name: 'device', type: 'text', index: true, maxLength: 20 }, { name: 'language', type: 'text', index: true, maxLength: 16 }, { name: 'visitorType', type: 'text', maxLength: 12 },
    { name: 'os', type: 'text', index: true, maxLength: 30 }, { name: 'osVersion', type: 'text', maxLength: 30 },
    { name: 'eventCount', type: 'number', required: true }, { name: 'activeMs', type: 'number', required: true }, { name: 'exactLeadCount', type: 'number', required: true },
    { name: 'browserHll', type: 'textarea', required: true }, { name: 'sessionHll', type: 'textarea', required: true },
    { name: 'rawEventCount', type: 'number', required: true }, { name: 'verifiedAt', type: 'date', required: true, index: true },
  ],
}
