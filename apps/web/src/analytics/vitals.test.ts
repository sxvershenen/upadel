import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateINP } from './vitals'

test('INP excludes one worst interaction for each 50 interactions', () => {
  const entries = Array.from({ length: 100 }, (_, index) => ({ interactionId: index + 1, duration: 200 - index }))
  assert.equal(calculateINP(entries.slice(0, 49), 49), 200)
  assert.equal(calculateINP(entries.slice(0, 50), 50), 199)
  assert.equal(calculateINP(entries, 100), 198)
})
test('INP keeps the longest duration recorded for one interaction id', () => {
  assert.equal(calculateINP([{ interactionId: 7, duration: 20 }, { interactionId: 7, duration: 80 }], 1), 80)
})
