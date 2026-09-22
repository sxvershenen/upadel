import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import config from '@payload-config'
import { createLocalReq, getPayload } from 'payload'
import { ContentUnavailableError, projectionCache } from '../content/projectionCache'

const database = new URL(process.env.DATABASE_URL ?? '').pathname.slice(1)
assert.ok(/(?:_test|_fixes_)/.test(database) && process.env.ANALYTICS_TEST_DATABASE === database, 'Use an explicitly named disposable test database.')
assert.equal(process.env.PAYLOAD_DISABLE_JOBS, '1', 'Only run fixture jobs manually in this process.')
assert.notEqual(process.env.NODE_ENV, 'production')
const payload = await getPayload({ config })
const marker = `content-it-${Date.now()}-${randomBytes(3).toString('hex')}`
const ids: number[] = []
const originalSite = await payload.findGlobal({ slug: 'site-settings', draft: false, depth: 0, overrideAccess: true })
const originalDraft = await payload.findGlobal({ slug: 'site-settings', draft: true, depth: 0, overrideAccess: true })
let siteChanged = false
let activeTransaction: string | number | null = null
const readPublished = async (id: number) => {
  const result = await payload.find({ collection: 'faqs', draft: false, depth: 0, limit: 1, overrideAccess: true, where: { and: [{ id: { equals: id } }, { _status: { equals: 'published' } }] } })
  if (!result.docs[0]) throw new ContentUnavailableError()
  return result.docs[0].answer
}

try {
  const faq = await payload.create({ collection: 'faqs', overrideAccess: true, data: { question: marker, answer: 'before', _status: 'published', isActive: true, showOnHomepage: false } })
  ids.push(faq.id)
  const key = `${marker}:faq`
  const read = () => projectionCache.read(key, () => readPublished(faq.id))
  assert.equal(await read(), 'before')
  await payload.update({ collection: 'faqs', id: faq.id, overrideAccess: true, data: { answer: 'saved', _status: 'published' } })
  assert.equal(await read(), 'saved')
  await payload.update({ collection: 'faqs', id: faq.id, draft: true, overrideAccess: true, data: { answer: 'private draft', _status: 'draft' } })
  assert.equal(await read(), 'saved')
  const preview = () => payload.findByID({ collection: 'faqs', id: faq.id, draft: true, depth: 0, overrideAccess: true }).then((doc) => doc.answer)
  assert.equal(await projectionCache.read(key, preview, true), 'private draft')
  assert.equal(await read(), 'saved')
  await payload.update({ collection: 'faqs', id: faq.id, overrideAccess: true, data: { _status: 'draft' } })
  await assert.rejects(read(), ContentUnavailableError)
  await payload.update({ collection: 'faqs', id: faq.id, overrideAccess: true, data: { answer: 'republished', _status: 'published' } })
  assert.equal(await read(), 'republished')

  const transactionID = await payload.db.beginTransaction()
  assert.ok(transactionID != null)
  activeTransaction = transactionID
  const req = await createLocalReq({ req: { transactionID } }, payload)
  await payload.update({ collection: 'faqs', id: faq.id, overrideAccess: true, req, data: { answer: 'committed', _status: 'published' } })
  assert.ok(projectionCache.transactions.has(transactionID))
  assert.equal(await read(), 'republished', 'uncommitted edits must not escape or warm the cache')
  await payload.db.commitTransaction(transactionID)
  activeTransaction = null
  assert.ok(!projectionCache.transactions.has(transactionID))
  assert.equal(await read(), 'committed')

  const rollbackID = await payload.db.beginTransaction()
  assert.ok(rollbackID != null)
  activeTransaction = rollbackID
  const rollbackReq = await createLocalReq({ req: { transactionID: rollbackID } }, payload)
  await payload.update({ collection: 'faqs', id: faq.id, overrideAccess: true, req: rollbackReq, data: { answer: 'rolled back', _status: 'published' } })
  assert.equal(await read(), 'committed')
  await payload.db.rollbackTransaction(rollbackID)
  activeTransaction = null
  assert.ok(!projectionCache.transactions.has(rollbackID))
  assert.equal(await read(), 'committed')

  let loaded!: () => void; let release!: () => void; let first = true
  const initialRead = new Promise<void>((resolve) => { loaded = resolve })
  const gate = new Promise<void>((resolve) => { release = resolve })
  const inflight = projectionCache.read(`${marker}:race`, async () => {
    const value = await readPublished(faq.id)
    if (first) { first = false; loaded(); await gate }
    return value
  })
  await initialRead
  await payload.update({ collection: 'faqs', id: faq.id, overrideAccess: true, data: { answer: 'new publication', _status: 'published' } })
  release()
  assert.equal(await inflight, 'new publication')

  const siteKey = `${marker}:site`
  const siteRead = () => projectionCache.read(siteKey, async () => (await payload.findGlobal({ slug: 'site-settings', draft: false, depth: 0, overrideAccess: true })).headerSubtitle)
  assert.equal(await siteRead(), originalSite.headerSubtitle)
  siteChanged = true
  await payload.updateGlobal({ slug: 'site-settings', overrideAccess: true, data: { headerSubtitle: marker, _status: 'published' } })
  assert.equal(await siteRead(), marker)

  const scheduled = await payload.create({ collection: 'faqs', draft: true, overrideAccess: true, data: { question: `${marker}-scheduled`, answer: 'scheduled content', _status: 'draft', isActive: true, showOnHomepage: false } })
  ids.push(scheduled.id)
  const scheduledRead = () => projectionCache.read(`${marker}:scheduled`, () => readPublished(scheduled.id))
  await assert.rejects(scheduledRead(), ContentUnavailableError)
  const job = await payload.jobs.queue({ task: 'schedulePublish', queue: marker, waitUntil: new Date(Date.now() + 60_000), input: { type: 'publish', doc: { relationTo: 'faqs', value: scheduled.id } } })
  await payload.jobs.run({ queue: marker, limit: 10 })
  await assert.rejects(scheduledRead(), ContentUnavailableError)
  await payload.update({ collection: 'payload-jobs', id: job.id, overrideAccess: true, data: { waitUntil: new Date(Date.now() - 1_000).toISOString() } })
  await payload.jobs.run({ queue: marker, limit: 10 })
  assert.equal(await scheduledRead(), 'scheduled content')
  await payload.jobs.queue({ task: 'schedulePublish', queue: marker, input: { type: 'unpublish', doc: { relationTo: 'faqs', value: scheduled.id } } })
  await payload.jobs.run({ queue: marker, limit: 10 })
  await assert.rejects(scheduledRead(), ContentUnavailableError)
  console.log(JSON.stringify({ result: 'passed', checks: ['published save', 'private draft and preview', 'unpublish', 'actual commit and rollback invalidation', 'in-flight publication race', 'global publication', 'job waitUntil', 'scheduled publish and unpublish'] }))
} finally {
  if (activeTransaction != null) await payload.db.rollbackTransaction(activeTransaction)
  await payload.delete({ collection: 'payload-jobs', overrideAccess: true, where: { queue: { equals: marker } } })
  for (const id of ids) await payload.delete({ collection: 'faqs', id, overrideAccess: true })
  if (siteChanged) {
    await payload.updateGlobal({ slug: 'site-settings', overrideAccess: true, data: { headerSubtitle: originalSite.headerSubtitle, _status: originalSite._status } })
    if (originalDraft._status === 'draft') await payload.updateGlobal({ slug: 'site-settings', draft: true, overrideAccess: true, data: { headerSubtitle: originalDraft.headerSubtitle, _status: 'draft' } })
  }
  projectionCache.invalidate()
  await payload.destroy()
}
process.exit(0)
