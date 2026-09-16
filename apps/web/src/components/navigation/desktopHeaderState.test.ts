import assert from 'node:assert/strict'
import test from 'node:test'

import { desktopSubmenuKeyAction, initialHeaderScrollState, navigationIconPreset, nextHeaderScrollState } from './desktopHeaderState'

test('header compacts after downward scroll and expands after upward scroll', () => {
  let state = initialHeaderScrollState()
  state = nextHeaderScrollState(state, 80)
  assert.equal(state.compact, true)
  state = nextHeaderScrollState(state, 60)
  assert.equal(state.compact, false)
})

test('header returns to expanded state near the top', () => {
  let state = initialHeaderScrollState(120)
  state = { ...state, compact: true, direction: 'down' }
  state = nextHeaderScrollState(state, 20)
  assert.equal(state.compact, false)
  assert.equal(state.direction, null)
})

test('navigation icons use stable route fallbacks', () => {
  assert.equal(navigationIconPreset('/'), 'home')
  assert.equal(navigationIconPreset('/blog'), 'article')
  assert.equal(navigationIconPreset('/unknown'), 'default')
})

test('submenu keyboard actions open, close, and preserve the link fallback', () => {
  assert.equal(desktopSubmenuKeyAction(' ', false), 'open')
  assert.equal(desktopSubmenuKeyAction('Enter', false), 'open')
  assert.equal(desktopSubmenuKeyAction('Escape', true), 'close')
  assert.equal(desktopSubmenuKeyAction('Enter', true), 'navigate')
  assert.equal(desktopSubmenuKeyAction('ArrowDown', true), null)
})
