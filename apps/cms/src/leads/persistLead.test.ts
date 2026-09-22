import assert from 'node:assert/strict'
import test from 'node:test'
import { persistLead } from './persistLead'

test('concurrent same-key submissions return one new lead and one successful duplicate', async () => {
  let stored: unknown; let reads = 0; let release!: () => void
  const barrier = new Promise<void>((resolve) => { release = resolve })
  const payload = {
    async find() { if (++reads <= 2) { if (reads === 2) release(); await barrier; return { docs: [] } } return { docs: stored ? [stored] : [] } },
    async create({ data }: { data: unknown }) { if (stored) throw new Error('unique violation'); stored = { id: 1, ...data as object }; return stored },
  }
  const results = await Promise.all([persistLead(payload as never, { idempotencyKey: 'one' }), persistLead(payload as never, { idempotencyKey: 'one' })])
  assert.deepEqual(results.map(({ duplicate }) => duplicate), [false, true])
  assert.equal(results[0].lead.id, results[1].lead.id)
})
test('unrelated failed persistence is not disguised as a duplicate', async () => {
  const failure = new Error('unavailable')
  await assert.rejects(persistLead({ find: async () => ({ docs: [] }), create: async () => { throw failure } } as never, { idempotencyKey: 'one' }), (error) => error === failure)
})
