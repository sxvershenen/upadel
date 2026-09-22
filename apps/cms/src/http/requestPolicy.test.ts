import assert from 'node:assert/strict'
import test from 'node:test'
import { BodyReadError, clientAddress, createRateLimiter, readBoundedText } from './requestPolicy'

const headers = (ip = '192.0.2.1', prefix = 'spoofed') => new Headers({ 'x-real-ip': ip, 'x-forwarded-for': `${prefix}, ${ip}` })
test('trusts overwritten real address, not changing XFF; buckets expire and have bounded capacity', () => {
  let time = 0; const limited = createRateLimiter(2, 10, 2, () => time)
  assert.equal(clientAddress(new Headers({ 'x-forwarded-for': '192.0.2.8' })), 'unknown')
  assert.equal(clientAddress(headers('unvalidated')), 'unknown')
  assert.equal(limited(headers()), false); assert.equal(limited(headers()), false)
  assert.equal(limited(headers('192.0.2.1', 'different')), true)
  time = 11; assert.equal(limited(headers()), false)
  limited(headers('192.0.2.2')); limited(headers('192.0.2.3'))
  assert.equal(limited(headers()), false)
})

const request = (chunks: string[], extraHeaders?: HeadersInit) => new Request('http://local/', { method: 'POST', headers: extraHeaders, body: new ReadableStream({ start(controller) { for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk)); controller.close() } }), duplex: 'half' } as RequestInit)
test('bounded body counts actual bytes for chunked unicode and rejects forged length', async () => {
  assert.equal(await readBoundedText(request(['При', 'вет']), 12), 'Привет')
  await assert.rejects(readBoundedText(request(['При', 'вет']), 11), (error) => error instanceof BodyReadError && error.status === 413)
  await assert.rejects(readBoundedText(request(['x'], { 'content-length': '999' }), 12), (error) => error instanceof BodyReadError && error.status === 413)
  await assert.rejects(readBoundedText(request(['123', '456'], { 'content-length': '1' }), 5), (error) => error instanceof BodyReadError && error.status === 413)
})

test('slow body is cancelled at a finite deadline', async () => {
  let cancelled = false
  const req = new Request('http://local/', { method: 'POST', body: new ReadableStream({ cancel() { cancelled = true } }), duplex: 'half' } as RequestInit)
  await assert.rejects(readBoundedText(req, 100, 10), (error) => error instanceof BodyReadError && error.status === 408)
  assert.equal(cancelled, true)
})

test('invalid UTF-8 fails as a bad request', async () => {
  const req = new Request('http://local/', { method: 'POST', body: new Uint8Array([0xff]) })
  await assert.rejects(readBoundedText(req, 100), (error) => error instanceof BodyReadError && error.status === 400)
})
