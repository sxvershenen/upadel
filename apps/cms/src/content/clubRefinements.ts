import { createLocalReq, type GlobalSlug, type Payload } from 'payload'

export const clubRefinementRevision = 'club-launch-20261023-v2'
export const withoutSameDayException = (text: string) => text.replace(/Для брони, созданной в день визита, — не менее чем за 3 часа\.\s*/g, '')
export function refineCancellationContent(value: any): any {
  if (!value || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.filter((node) => !node?.children?.some((child: any) => typeof child.text === 'string' && /за 3 часа/.test(child.text) && /созданн.*в день визита/.test(child.text) && !/12 часов/.test(child.text))).map(refineCancellationContent)
  if (typeof value.text === 'string') return { ...value, text: withoutSameDayException(value.text) }
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, refineCancellationContent(child)]))
}

/** One-time owner refinements; preserve unrelated published edits and pending drafts. */
export async function applyClubRefinements(payload: Payload): Promise<boolean> {
  const transactionID = await payload.db.beginTransaction()
  if (transactionID == null) throw new Error('A transaction is required for club refinements.')
  try {
    const req = await createLocalReq({ req: { transactionID } }, payload)
    const opts = { depth: 0, overrideAccess: true, showHiddenFields: true, req }
    const site = await payload.findGlobal({ ...opts, slug: 'site-settings', draft: false })
    if ([clubRefinementRevision, 'club-offer-20261024-v1'].includes(site.clubUpdateVersion ?? '')) { await payload.db.rollbackTransaction(transactionID); return false }
    if (site.clubUpdateVersion !== 'club-launch-20261023-v1') throw new Error('Apply the club launch update first.')
    const patchGlobal = async (slug: GlobalSlug, patch: (doc: any) => Record<string, unknown>) => {
      const live = await payload.findGlobal({ ...opts, slug, draft: false })
      const pending = await payload.findGlobal({ ...opts, slug, draft: true })
      await payload.updateGlobal({ ...opts, slug, draft: false, data: { ...patch(live), _status: 'published' } } as never)
      if (pending._status === 'draft') {
        const { id, createdAt, updatedAt, ...draft } = pending
        await payload.updateGlobal({ ...opts, slug, draft: true, data: { ...draft, ...patch(pending), _status: 'draft' } } as never)
      }
    }
    await patchGlobal('rules-page', (page) => ({ sections: (page.sections ?? []).map((section: any) => ({ ...section, content: refineCancellationContent(section.content) })) }))
    await patchGlobal('prices-page', (page) => ({
      rules: (page.rules ?? []).map((rule: any) => ({ ...rule, content: refineCancellationContent(rule.content) })),
      faq: (page.faq ?? []).map((item: any) => ({ ...item, answer: withoutSameDayException(item.answer) })),
    }))
    await patchGlobal('homepage', (home) => ({ hero: { ...home.hero, socialProof: { ...home.hero?.socialProof,
      ratingLabel: home.hero?.socialProof?.ratingLabel === '4.9' ? '4.9 · 500+ игроков' : home.hero?.socialProof?.ratingLabel,
      caption: home.hero?.socialProof?.caption === 'Яндекс' ? 'Рейтинг на Яндекс' : home.hero?.socialProof?.caption,
    } } }))
    await patchGlobal('site-settings', (settings) => ({ clubUpdateVersion: clubRefinementRevision, waitlist: { ...settings.waitlist, successText: settings.waitlist?.successText?.replace(/50%\.\s*/, '50%.\n') } }))
    await payload.db.commitTransaction(transactionID)
    return true
  } catch (error) { await payload.db.rollbackTransaction(transactionID); throw error }
}
