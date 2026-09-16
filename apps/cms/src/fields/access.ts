import type { Access, Where } from 'payload'

export const authenticated: Access = ({ req }) => Boolean(req.user)

export const publishedOrAuthenticated: Access = ({ req }) => {
  if (req.user) return true

  return {
    _status: {
      equals: 'published',
    },
  }
}

export const publishedAndActiveOrAuthenticated: Access = ({ req }) => {
  if (req.user) return true

  const conditions: Where[] = [
    { _status: { equals: 'published' } },
    { isActive: { equals: true } },
  ]

  return {
    and: conditions,
  }
}
