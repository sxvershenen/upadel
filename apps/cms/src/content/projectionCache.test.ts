import assert from 'node:assert/strict'
import test from 'node:test'
import { ProjectionCache, installTransactionInvalidation, markContentChanged, ContentUnavailableError, publicProjectionError } from './projectionCache'

const deferred = <T>() => { let resolve!: (value: T) => void; const promise = new Promise<T>((done) => { resolve = done }); return { promise, resolve } }

test('reuses bounded current values, expires them and isolates preview', async () => {
  let time = 0; let reads = 0
  const cache = new ProjectionCache(10, 2, 1024, () => time)
  const read = () => Promise.resolve(++reads)
  assert.equal(await cache.read('a', read), 1)
  assert.equal(await cache.read('a', read), 1)
  assert.equal(await cache.read('a', read, true), 2)
  assert.equal(await cache.read('a', read), 1)
  time = 11; assert.equal(await cache.read('a', read), 3)
  await cache.read('b', read); await cache.read('c', read)
  assert.equal(await cache.read('a', read), 6)
})

test('shares in-flight work and retries old results after publication', async () => {
  const cache = new ProjectionCache(); const first = deferred<string>(); let reads = 0
  const load = () => ++reads === 1 ? first.promise : Promise.resolve('published')
  const a = cache.read('page', load); const b = cache.read('page', load)
  assert.equal(reads, 1)
  cache.invalidate(); first.resolve('old')
  assert.deepEqual(await Promise.all([a, b]), ['published', 'published'])
  assert.equal(await cache.read('page', load), 'published')
  assert.equal(reads, 2)
})

test('invalidation spans commit and rollback, preserves adapter context and errors', async () => {
  const cache = new ProjectionCache(); let committed = false; let commits = 0
  const failure = new Error('commit failed')
  const db = { marker: true,
    async commitTransaction(id: unknown) { assert.equal(this, db); commits++; if (id === 'bad') throw failure; committed = true },
    async rollbackTransaction(_id: unknown) { assert.equal(this, db) },
  }
  installTransactionInvalidation({ db } as never, cache)
  installTransactionInvalidation({ db } as never, cache)
  await cache.read('page', async () => 'old')
  await markContentChanged({ transactionID: 'write' }, cache)
  assert.equal(await cache.read('page', async () => committed ? 'new' : 'old'), 'old')
  await db.commitTransaction('write')
  assert.equal(await cache.read('page', async () => committed ? 'new' : 'old'), 'new')
  assert.equal(commits, 1)
  await markContentChanged({ transactionID: 'bad' }, cache)
  await assert.rejects(db.commitTransaction('bad'), (error) => error === failure)
  assert.equal(cache.transactions.size, 0)
  await markContentChanged({ transactionID: 'rollback' }, cache)
  await db.rollbackTransaction('rollback')
  assert.equal(cache.transactions.size, 0)
})

test('unpublish cannot use previously cached content or an old in-flight result', async () => {
  const cache = new ProjectionCache(); const old = deferred<string>(); let published = true
  const load = async () => { if (!published) throw new ContentUnavailableError(); return old.promise }
  const pending = cache.read('page', load)
  published = false; await markContentChanged({}, cache); old.resolve('old')
  await assert.rejects(pending, ContentUnavailableError)
  await assert.rejects(cache.read('page', load), ContentUnavailableError)
})

test('read deadline bounds hung reads and permits a healthy retry', async () => {
  const cache = new ProjectionCache(10, 2, 1024, Date.now, 10)
  await assert.rejects(cache.read('a', () => new Promise(() => {})), /deadline/)
  assert.equal(await cache.read('a', async () => 'recovered'), 'recovered')
  await assert.rejects(cache.read('a', () => new Promise(() => {}), true), /deadline/)
})

test('unpublished errors have a stable public 404 without internal messages', async () => {
  const response = publicProjectionError(new ContentUnavailableError(), 'page')
  assert.equal(response.status, 404)
  assert.deepEqual(await response.json(), { error: 'Not found.' })
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
})

test('public failures redact exception messages and log safe route diagnostics', async (context) => {
  const messages: unknown[][] = []
  context.mock.method(console, 'error', (...args: unknown[]) => messages.push(args))
  const response = publicProjectionError(new Error('database-password-and-SQL'), 'homepage')
  assert.equal(response.status, 503)
  assert.doesNotMatch(JSON.stringify(await response.json()), /password|SQL/)
  assert.equal(messages.length, 1)
  assert.doesNotMatch(JSON.stringify(messages), /password|SQL/)
  assert.match(JSON.stringify(messages), /homepage/)
})
