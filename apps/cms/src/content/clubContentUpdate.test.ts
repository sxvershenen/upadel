import assert from 'node:assert/strict'
import test from 'node:test'
import { currentAnalyticsMode, documentRichText } from './clubContentUpdate'
import { clubCoachRoster } from './clubUpdateData'

test('document import preserves every paragraph and marks section headings without altering text', () => {
  const lines = ['1. Общие положения', '1.1. Точное условие договора.', 'Текст с 12 и 3 часами.', '2. Условия']
  const nodes = documentRichText(lines).root.children
  assert.deepEqual(nodes.map((node) => node.children[0].text), lines)
  assert.deepEqual(nodes.map((node) => node.type), ['heading', 'paragraph', 'paragraph', 'heading'])
})

test('new roster contains only five supplied identities and requested prices', () => {
  assert.equal(clubCoachRoster.length, 5)
  assert.equal(new Set(clubCoachRoster.map(({ slug }) => slug)).size, 5)
  assert.deepEqual(clubCoachRoster.map(({ priceFrom }) => priceFrom), [7500, 5500, 7500, 5500, 7500])
  assert.ok(clubCoachRoster.every(({ name, bio, experience }) => name && bio && experience))
})

test('club import upgrades legacy first-party analytics without changing disabled mode', () => {
  assert.equal(currentAnalyticsMode('first-party'), 'consent-required')
  assert.equal(currentAnalyticsMode('consent-required'), 'consent-required')
  assert.equal(currentAnalyticsMode('disabled'), 'disabled')
  assert.equal(currentAnalyticsMode(undefined), 'consent-required')
})
