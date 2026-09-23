import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('offers switch to two columns only above 1040px', () => {
  const source = readFileSync(new URL('./Offers.tsx', import.meta.url), 'utf8')

  assert.match(source, /grid gap-4 min-\[1041px\]:grid-cols-2/)
  assert.doesNotMatch(source, /md:grid-cols-2/)
})
