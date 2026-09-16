import { NotFound, type GlobalBeforeReadHook } from 'payload'

type DraftableGlobal = {
  _status?: null | 'draft' | 'published'
}

/**
 * Global access runs before Payload reads the document and cannot filter by `_status`.
 * Enforce publication after the base document (or requested draft version) is loaded.
 */
export const requirePublishedGlobal: GlobalBeforeReadHook = ({ doc, overrideAccess, req }) => {
  const status = (doc as DraftableGlobal)._status
  if (!overrideAccess && !req.user && status !== 'published') throw new NotFound(req.t)

  return doc
}
