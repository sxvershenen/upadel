import type { Data } from 'payload'

type DrawerSelect = (args: { collectionSlug: 'media'; doc: Data; docID: string }) => void

export function selectMediaDocument(onSelect: DrawerSelect | undefined, doc: Record<string, unknown>): boolean {
  if (!onSelect || (typeof doc.id !== 'string' && typeof doc.id !== 'number')) return false
  onSelect({ collectionSlug: 'media', doc: doc as Data, docID: String(doc.id) })
  return true
}
