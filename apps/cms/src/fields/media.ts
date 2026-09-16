import type { Where } from 'payload'

export const imageOnlyFilter: Where = {
  mimeType: {
    contains: 'image/',
  },
}
