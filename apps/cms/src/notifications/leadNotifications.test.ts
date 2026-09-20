import assert from 'node:assert/strict'
import test from 'node:test'
import type { Payload } from 'payload'
import type { Lead } from '../payload-types'
import { deliverLeadNotifications, deliverOnlyForNewLead, formatLeadNotificationMessage } from './leadNotifications'

const lead = { id: 1, type: 'gift', name: 'Тест', phone: '+7000', sourcePage: '/prices', sourceEntity: 'Сертификат' } as Lead
const settings = { telegramEnabled: true, telegramBotToken: 'tg-secret', telegramChatID: '1', vkEnabled: true, vkAccessToken: 'vk-secret', vkPeerID: '2', vkAPIVersion: '5.199' }
function payload(config: Record<string, unknown>, drafts: boolean[]) { return { findGlobal: async (args: { draft: boolean }) => { drafts.push(args.draft); return { leadNotifications: config } } } as unknown as Payload }

test('delivery uses published settings and reports sent without leaking secrets', async () => {
  const drafts: boolean[] = []
  const result = await deliverLeadNotifications(payload(settings, drafts), lead, async () => new Response('{}', { status: 200 }))
  assert.deepEqual(drafts, [false])
  assert.equal(result.notificationStatus, 'sent')
  assert.doesNotMatch(result.notificationResult, /secret|api\.telegram\.org|api\.vk\.com/)
})

test('delivery reports partial, not-configured and injectable timeout', async () => {
  let calls = 0
  const partial = await deliverLeadNotifications(payload(settings, []), lead, async () => new Response('{}', { status: ++calls === 1 ? 200 : 500 }))
  assert.equal(partial.notificationStatus, 'partial')
  let offCalls = 0
  const off = await deliverLeadNotifications(payload({}, []), lead, async () => { offCalls += 1; return new Response() })
  assert.equal(off.notificationStatus, 'not-configured'); assert.equal(offCalls, 0)
  const timed = await deliverLeadNotifications(payload({ telegramEnabled: true, telegramBotToken: 'secret', telegramChatID: '1' }, []), lead, (_url, init) => new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))), 5)
  assert.equal(timed.notificationStatus, 'failed'); assert.match(timed.notificationResult, /таймаут/); assert.doesNotMatch(timed.notificationResult, /secret|telegram\.org/)
})

test('duplicate orchestration never invokes delivery', async () => {
  let calls = 0
  assert.equal(await deliverOnlyForNewLead(true, async () => { calls += 1; return 'sent' }), null)
  assert.equal(calls, 0)
  assert.equal(await deliverOnlyForNewLead(false, async () => { calls += 1; return 'sent' }), 'sent')
  assert.equal(calls, 1)
})

test('notification message preserves lead type, page and useful source entity', async () => {
  const tournamentLead = { ...lead, type: 'consultation', sourcePage: '/tournaments/summer-open', sourceEntity: 'Summer Open — регистрация', comment: 'Нужна суббота' } as Lead
  assert.match(formatLeadNotificationMessage(tournamentLead), /Новое обращение: Консультация/)
  assert.match(formatLeadNotificationMessage(tournamentLead), /Страница: \/tournaments\/summer-open/)
  assert.match(formatLeadNotificationMessage(tournamentLead), /Форма: Summer Open — регистрация/)
  assert.match(formatLeadNotificationMessage(tournamentLead), /Комментарий: Нужна суббота/)

  const messages: string[] = []
  await deliverLeadNotifications(payload(settings, []), tournamentLead, async (_url, init) => {
    const body = init?.body
    messages.push(body instanceof URLSearchParams ? body.get('message') ?? '' : String((JSON.parse(String(body)) as { text?: string }).text ?? ''))
    return new Response('{}', { status: 200 })
  })
  assert.equal(messages.length, 2)
  assert.equal(messages.every((message) => message.includes('/tournaments/summer-open') && message.includes('Summer Open — регистрация')), true)
})
