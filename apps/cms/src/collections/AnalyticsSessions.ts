import type { CollectionConfig } from 'payload'
import { authenticated } from '../fields/access'

export const AnalyticsSessions: CollectionConfig = {
  slug: 'analytics-sessions', labels: { singular: 'Сессия аналитики', plural: 'Сессии аналитики' },
  access: { create: authenticated, delete: authenticated, read: authenticated, update: authenticated },
  admin: { hidden: true }, timestamps: false,
  fields: [
    { name: 'sessionId', type: 'text', required: true, unique: true, index: true, maxLength: 80 },
    { name: 'anonymousId', type: 'text', required: true, index: true, maxLength: 80 },
    { name: 'startedAt', type: 'date', required: true, index: true }, { name: 'lastActivityAt', type: 'date', required: true, index: true },
    { name: 'endedAt', type: 'date', required: true, index: true, admin: { description: 'Вычисляется как последняя активность + 30 минут.' } },
    { name: 'channel', type: 'text', maxLength: 40 }, { name: 'source', type: 'text', maxLength: 80 }, { name: 'medium', type: 'text', maxLength: 80 },
    { name: 'campaign', type: 'text', maxLength: 120 }, { name: 'device', type: 'text', maxLength: 20 }, { name: 'language', type: 'text', maxLength: 16 },
    { name: 'os', type: 'text', maxLength: 30 }, { name: 'osVersion', type: 'text', maxLength: 30 },
    { name: 'hasTargetAction', type: 'checkbox', defaultValue: false, index: true },
  ],
}
