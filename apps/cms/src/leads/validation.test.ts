import assert from 'node:assert/strict'
import test from 'node:test'

import { isAllowedLeadSourcePage, isLeadHoneypotTriggered, parseLeadSubmission } from './validation'

test('lead sources include fixed, code-defined, tournament catalog and safe detail routes', () => {
  for (const path of ['/training', '/gift', '/padel-court-zakaz', '/padel-courts', '/tournaments', '/tournaments/summer-open', '/coaches/anna-smith']) {
    assert.equal(isAllowedLeadSourcePage(path), true, path)
  }
  assert.equal(isAllowedLeadSourcePage('/tournaments/summer-open/'), true)
  assert.equal(isAllowedLeadSourcePage('/tournaments/summer-open/results'), false)
  assert.equal(isAllowedLeadSourcePage('/api/public/leads'), false)
  assert.equal(isAllowedLeadSourcePage('/padel-court-zakaz?preview=1'), false)
  assert.equal(isAllowedLeadSourcePage('/padel-courts?preview=1'), false)
})

test('validated lead preserves source fields and rejects invalid source or consent before database work', () => {
  const input = {
    name: 'Анна',
    phone: '+7 999 000-00-00',
    email: '',
    telegram: '',
    vk: '',
    comment: 'Хочу участвовать',
    type: 'consultation',
    sourcePage: '/tournaments/summer-open/',
    sourceEntity: 'Summer Open — регистрация',
    idempotencyKey: 'lead-source-test-01',
    consent: true,
    company: '',
  }
  assert.deepEqual(parseLeadSubmission(input), {
    name: 'Анна',
    phone: '+7 999 000-00-00',
    email: '',
    telegram: '',
    vk: '',
    comment: 'Хочу участвовать',
    type: 'consultation',
    sourcePage: '/tournaments/summer-open',
    sourceEntity: 'Summer Open — регистрация',
    idempotencyKey: 'lead-source-test-01',
  })
  assert.equal(parseLeadSubmission({ ...input, sourcePage: '/unknown' }), null)
  assert.equal(parseLeadSubmission({ ...input, consent: false }), null)
})

test('accepts the normalized gift landing payload with its exact source entity', () => {
  assert.deepEqual(parseLeadSubmission({
    name: 'Анна',
    phone: '',
    telegram: '@anna_padel',
    vk: '',
    email: '',
    comment: 'Формат: Электронный PDF. Назначение: match',
    consent: true,
    type: 'gift',
    sourcePage: '/gift',
    sourceEntity: 'Подарочный сертификат: Электронный PDF',
    idempotencyKey: 'gift-landing-test-01',
    company: '',
  }), {
    name: 'Анна',
    phone: '',
    email: '',
    telegram: '@anna_padel',
    vk: '',
    comment: 'Формат: Электронный PDF. Назначение: match',
    type: 'gift',
    sourcePage: '/gift',
    sourceEntity: 'Подарочный сертификат: Электронный PDF',
    idempotencyKey: 'gift-landing-test-01',
  })
})

test('honeypot rejects bot-filled fields without treating them as a valid lead', () => {
  const input = { name: 'Анна', phone: '+7 999 000-00-00', type: 'consultation', sourcePage: '/training', idempotencyKey: 'honeypot-test-01', consent: true, company: '', website: 'https://bot.invalid' }
  assert.equal(isLeadHoneypotTriggered(input), true)
  assert.equal(parseLeadSubmission(input), null)
})

test('ClientID is optional and kept only as a numeric string with an explicit analytics choice', () => {
  const input = { name: 'Анна', phone: '+7 999 000-00-00', type: 'consultation', sourcePage: '/', idempotencyKey: 'attribution-test', consent: true, yandexClientID: '1761630000123456789', yandexMetricaConsent: true }
  assert.equal(parseLeadSubmission(input)?.yandexClientID, input.yandexClientID)
  for (const value of ['<script>', '1'.repeat(33), 123]) assert.equal(parseLeadSubmission({ ...input, yandexClientID: value })?.yandexClientID, undefined)
  assert.equal(parseLeadSubmission({ ...input, yandexMetricaConsent: false })?.yandexClientID, undefined)
  assert.equal(parseLeadSubmission({ ...input, yandexClientID: undefined })?.name, 'Анна')
})
