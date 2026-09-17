import assert from 'node:assert/strict'
import test from 'node:test'

import { selectMediaDocument } from './mediaDrawerSelection'

test('selects a Media document with the Payload drawer contract', () => {
  let selection: unknown
  assert.equal(selectMediaDocument((value) => { selection = value }, { id: 42, alt: 'Корт' }), true)
  assert.deepEqual(selection, {
    collectionSlug: 'media',
    doc: { id: 42, alt: 'Корт' },
    docID: '42',
  })
})

test('does not select a document without an id', () => {
  let called = false
  assert.equal(selectMediaDocument(() => { called = true }, { alt: 'Корт' }), false)
  assert.equal(called, false)
})
