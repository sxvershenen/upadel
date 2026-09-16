import assert from 'node:assert/strict'
import test from 'node:test'

import { initialHeaderPlaygroundScrollState, nextHeaderPlaygroundScrollState } from './headerPlaygroundState'

test('playground header starts expanded at the top and compact below the top threshold', () => {
  assert.equal(initialHeaderPlaygroundScrollState(0).compact, false)
  assert.equal(initialHeaderPlaygroundScrollState(33).compact, true)
})

test('playground header compacts only after the fixed downward threshold', () => {
  let state = { ...initialHeaderPlaygroundScrollState(40), compact: false }
  state = nextHeaderPlaygroundScrollState(state, 52)
  assert.equal(state.compact, false)
  state = nextHeaderPlaygroundScrollState(state, 64)
  assert.equal(state.compact, true)
})

test('playground header expands only after accumulated upward movement', () => {
  let state = initialHeaderPlaygroundScrollState(80)
  state = { ...state, compact: true }
  state = nextHeaderPlaygroundScrollState(state, 65)
  assert.equal(state.compact, true)
  state = nextHeaderPlaygroundScrollState(state, 64)
  assert.equal(state.compact, false)
})

test('direction changes reset the opposite hysteresis accumulator', () => {
  let state = { ...initialHeaderPlaygroundScrollState(40), compact: false }
  state = nextHeaderPlaygroundScrollState(state, 58)
  state = nextHeaderPlaygroundScrollState(state, 50)
  state = nextHeaderPlaygroundScrollState(state, 69)
  assert.equal(state.compact, false)
})
