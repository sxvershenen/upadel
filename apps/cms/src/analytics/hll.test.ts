import assert from 'node:assert/strict'
import test from 'node:test'

import { addHLL, createHLL, deserializeHLL, estimateHLL, mergeHLL, serializeHLL } from './hll'

test('HLL merges overlapping days instead of summing daily uniques', () => {
  const dayOne = createHLL(); const dayTwo = createHLL()
  for (let index = 0; index < 10_000; index += 1) addHLL(dayOne, `browser-${index}`)
  for (let index = 5_000; index < 15_000; index += 1) addHLL(dayTwo, `browser-${index}`)
  const merged = mergeHLL(deserializeHLL(serializeHLL(dayOne)), dayTwo)
  const estimate = estimateHLL(merged)
  assert.ok(estimate > 14_400 && estimate < 15_600, `expected about 15000, got ${estimate}`)
  assert.ok(estimate < estimateHLL(dayOne) + estimateHLL(dayTwo) - 3_000)
})

test('adding the same identifier repeatedly does not increase uniques', () => {
  const sketch = createHLL()
  for (let index = 0; index < 100; index += 1) addHLL(sketch, 'same-event-subject')
  assert.equal(estimateHLL(sketch), 1)
})

