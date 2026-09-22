import assert from 'node:assert/strict'
import test from 'node:test'
import { CMSReadError, createCMSReader } from './requestCMS'
const url = new URL('https://cms.test/api/public/homepage')
const parse = (input: unknown) => { if (!input || typeof input !== 'object' || !('title' in input)) throw new Error('Invalid'); return input as { title: string } }

test('contacts CMS on every request so saved changes appear immediately; finite outage fallback', async () => {
  let time = 0; let calls = 0; let mode = 'first'
  const read = createCMSReader({ now: () => time, fallbackMs: 100, fetcher: (async (_url, options) => {
    calls++; assert.equal(options?.cache, 'no-store')
    if (mode === 'offline') throw new Error('network')
    return Response.json({ title: mode })
  }) as typeof fetch })
  assert.equal((await read(url, parse)).title, 'first')
  mode = 'published'; assert.equal((await read(url, parse)).title, 'published'); assert.equal(calls, 2)
  mode = 'offline'; time = 50; assert.equal((await read(url, parse)).title, 'published')
  time = 101; await assert.rejects(read(url, parse), CMSReadError)
})

test('404/403/invalid data evict last-good and preview never uses or overwrites it', async () => {
  let mode: number | string = 'good'
  const read = createCMSReader({ fetcher: (async () => {
    if (mode === 'offline') throw new Error('network')
    return typeof mode === 'number' ? new Response(null, { status: mode }) : Response.json(mode === 'invalid' ? {} : { title: mode })
  }) as typeof fetch })
  for (const rejected of [404, 403, 'invalid']) {
    mode = 'good'; await read(url, parse)
    mode = rejected; await assert.rejects(read(url, parse))
    mode = 'offline'; await assert.rejects(read(url, parse))
  }
  mode = 'good'; await read(url, parse)
  mode = 'draft'; assert.equal((await read(url, parse, { preview: true })).title, 'draft')
  mode = 'offline'; await assert.rejects(read(url, parse, { preview: true }))
  assert.equal((await read(url, parse)).title, 'good')
})

test('concurrent requests revalidate independently and an older result cannot replace new content', async () => {
  const resolves: Array<(response: Response) => void> = []
  let offline = false
  const read = createCMSReader({ fetcher: (() => offline ? Promise.reject(new Error('network')) : new Promise<Response>((done) => { resolves.push(done) })) as typeof fetch })
  const first = read(url, parse)
  const second = read(url, parse)
  assert.equal(resolves.length, 2)
  resolves[1](Response.json({ title: 'new publication' }))
  assert.equal((await second).title, 'new publication')
  resolves[0](Response.json({ title: 'old publication' }))
  assert.equal((await first).title, 'old publication')
  offline = true
  assert.equal((await read(url, parse)).title, 'new publication')
})

test('an older successful response cannot revive a page after a newer unpublish404', async () => {
  const resolves: Array<(response: Response) => void> = []
  let offline = false
  const read = createCMSReader({ fetcher: (() => offline ? Promise.reject(new Error('network')) : new Promise<Response>((done) => { resolves.push(done) })) as typeof fetch })
  const old = read(url, parse)
  const fresh = read(url, parse)
  resolves[1](new Response(null, { status: 404 }))
  await assert.rejects(fresh, (error) => error instanceof CMSReadError && error.status === 404)
  resolves[0](Response.json({ title: 'unpublished' }))
  await old
  offline = true
  await assert.rejects(read(url, parse))
})

test('deadline covers fetch; body parse failures do not serve stale content', async () => {
  const read = createCMSReader({ timeoutMs: 10, fetcher: ((_url, options) => new Promise((_resolve, reject) => {
    options?.signal?.addEventListener('abort', () => reject(new Error('aborted')))
  })) as typeof fetch })
  await assert.rejects(read(url, parse), (error) => error instanceof CMSReadError && error.status === 503)
})

test('last-good entries are capacity bounded and HTTP outage is retryable', async () => {
  let offline = false
  const read = createCMSReader({ maxEntries: 1, fetcher: (async () => offline ? new Response(null, { status: 503 }) : Response.json({ title: 'good' })) as typeof fetch })
  await read(url, parse); const second = new URL('/api/public/page/gift', url); await read(second, parse)
  offline = true; await assert.rejects(read(url, parse)); assert.equal((await read(second, parse)).title, 'good')
})
