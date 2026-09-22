import assert from 'node:assert/strict'
import test from 'node:test'
import { analyticsTransaction, databaseRow, insertValues } from './database'

test('analytics insert values remain parameters, including hostile strings', () => {
  const unsafe = "value'); DROP TABLE analytics_events; --"
  const result = insertValues([databaseRow({ eventId: unsafe, isBot: false, value: 0 })])
  assert.equal(result.columns, '"event_id","is_bot","value"')
  assert.equal(result.placeholders, '($1,$2,$3)')
  assert.deepEqual(result.values, [unsafe, false, 0])
  assert.doesNotMatch(result.placeholders + result.columns, /DROP/)
  assert.throws(() => insertValues([]))
  assert.throws(() => insertValues([{ 'bad;column': 1 }]))
})

test('advisory lock precedes snapshot, commits and releases without changing result', async () => {
  const calls: string[] = []
  const client = { query: async (text: string) => { calls.push(text); return { rows: [] } }, release: () => calls.push('release') }
  const result = await analyticsTransaction({ db: { pool: { connect: async () => client } } } as never, async () => 'result', 'day')
  assert.equal(result, 'result')
  assert.match(calls[0], /pg_advisory_lock/)
  assert.equal(calls[1], 'BEGIN ISOLATION LEVEL REPEATABLE READ')
  assert.equal(calls[2], 'COMMIT')
  assert.match(calls[3], /pg_advisory_unlock/)
  assert.equal(calls[4], 'release')
})

test('rollback preserves original failure and broken unlock destroys the connection', async () => {
  const failure = new Error('original failure'); const calls: string[] = []; let destroyed = false
  const client = { query: async (text: string) => { calls.push(text); if (text.includes('unlock')) throw new Error('unlock failed'); return { rows: [] } }, release: (destroy: boolean) => { destroyed = destroy } }
  await assert.rejects(analyticsTransaction({ db: { pool: { connect: async () => client } } } as never, async () => { throw failure }, 'day'), (error) => error === failure)
  assert.ok(calls.includes('ROLLBACK')); assert.ok(!calls.includes('COMMIT')); assert.equal(destroyed, true)
})
