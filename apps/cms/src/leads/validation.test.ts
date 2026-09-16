import assert from 'node:assert/strict'
import test from 'node:test'

import { isAllowedLeadSourcePage, parseLeadSubmission } from './validation'

test('lead sources include fixed, code-defined, tournament catalog and safe detail routes', () => {
  for (const path of ['/training', '/gift', '/padel-courts', '/tournaments', '/tournaments/summer-open', '/coaches/anna-smith']) {
    assert.equal(isAllowedLeadSourcePage(path), true, path)
  }
  assert.equal(isAllowedLeadSourcePage('/tournaments/summer-open/'), true)
  assert.equal(isAllowedLeadSourcePage('/tournaments/summer-open/results'), false)
  assert.equal(isAllowedLeadSourcePage('/api/public/leads'), false)
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
