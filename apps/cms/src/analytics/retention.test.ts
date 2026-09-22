import assert from 'node:assert/strict'
import test from 'node:test'
import { aggregateDate, completedRawRetentionCutoff, executeRetentionDays } from './aggregate'

test('raw retention cutoff excludes the partial 90-day-old Moscow day', () => {
  assert.equal(completedRawRetentionCutoff(new Date('2026-04-01T01:00:00.000Z')), '2025-12-31T21:00:00.000Z')
})
test('all expired days are aggregated before any cross-day raw context is deleted', async () => {
  const calls: string[] = []
  const removed = await executeRetentionDays(['day-1', 'day-2'], {
    aggregateAndVerify: async (date) => { calls.push(`aggregate:${date}`) },
    removeRaw: async (date) => { calls.push(`delete:${date}`); return 2 },
  })
  assert.equal(removed, 4)
  assert.deepEqual(calls, ['aggregate:day-1', 'aggregate:day-2', 'delete:day-1', 'delete:day-2'])
})

test('failed day verification prevents all raw deletion', async () => {
  const calls: string[] = []
  await assert.rejects(executeRetentionDays(['one', 'two'], {
    aggregateAndVerify: async (date) => { calls.push(`verify:${date}`); if (date === 'two') throw new Error('verification failed') },
    removeRaw: async (date) => { calls.push(`delete:${date}`); return 1 },
  }), /verification failed/)
  assert.deepEqual(calls, ['verify:one', 'verify:two'])
})


test('a delayed worker preserves an expired verified day after raw retention using the supplied clock', async () => {
  const calls: string[] = []
  const verifiedAt = '2040-01-01T00:00:00.000Z'
  const client = {
    async query(text: string) {
      calls.push(text)
      return { rows: text.includes('max(verified_at)') ? [{ rows: '2', verified_at: verifiedAt }] : [] }
    }, release() {},
  }
  const result = await aggregateDate({ db: { pool: { connect: async () => client } } } as never, '2040-01-01', new Date('2040-06-01T00:00:00.000Z'))
  assert.equal(result.rows, 2)
  assert.equal(result.rawEvents, 0)
  assert.equal(result.verifiedAt, verifiedAt)
  assert.ok(!calls.some((query) => /DELETE FROM analytics_daily/.test(query)))
})
