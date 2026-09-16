import assert from 'node:assert/strict'
import test from 'node:test'
import { completedRawRetentionCutoff, executeRetentionDays } from './aggregate'

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
