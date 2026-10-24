import { createLocalReq, type Payload } from 'payload'

export const clubHeroCopyRevision = 'club-hero-copy-20261024-v3'
export const clubHeroCopy = {
  titleLine: '2 недели с открытия',
  titleConnector: 'Аренда со скидкой',
  titleAccent: '50%',
  titleFontSize: { mobile: 24, desktop: 88 },
}

/** Apply the approved opening offer to the large hero heading and keep drafts in sync. */
export async function applyClubHeroCopyUpdate(payload: Payload): Promise<boolean> {
  const transactionID = await payload.db.beginTransaction()
  if (transactionID == null) throw new Error('A transaction is required for the club hero copy update.')
  try {
    const req = await createLocalReq({ req: { transactionID } }, payload)
    const opts = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
    const site = await payload.findGlobal({ ...opts, slug: 'site-settings', draft: false })
    if (site.clubUpdateVersion === clubHeroCopyRevision) {
      await payload.db.rollbackTransaction(transactionID)
      return false
    }
    if (site.clubUpdateVersion !== 'club-hero-copy-20261024-v2') throw new Error('Apply the previous hero copy update before the revised hero size.')

    const live = await payload.findGlobal({ ...opts, slug: 'homepage', draft: false })
    const pending = await payload.findGlobal({ ...opts, slug: 'homepage', draft: true })
    const patch = (home: Record<string, any>) => ({ hero: { ...home.hero, ...clubHeroCopy } })
    await payload.updateGlobal({ ...opts, slug: 'homepage', draft: false, data: { ...patch(live), _status: 'published' } } as never)
    if (pending._status === 'draft') {
      const { id, createdAt, updatedAt, ...draft } = pending
      await payload.updateGlobal({ ...opts, slug: 'homepage', draft: true, data: { ...draft, ...patch(pending), _status: 'draft' } } as never)
    }

    const draftSite = await payload.findGlobal({ ...opts, slug: 'site-settings', draft: true })
    await payload.updateGlobal({ ...opts, slug: 'site-settings', draft: false, data: { clubUpdateVersion: clubHeroCopyRevision, _status: 'published' } })
    if (draftSite._status === 'draft') {
      const { id, createdAt, updatedAt, ...draft } = draftSite
      await payload.updateGlobal({ ...opts, slug: 'site-settings', draft: true, data: { ...draft, clubUpdateVersion: clubHeroCopyRevision, _status: 'draft' } })
    }
    await payload.db.commitTransaction(transactionID)
    return true
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}
