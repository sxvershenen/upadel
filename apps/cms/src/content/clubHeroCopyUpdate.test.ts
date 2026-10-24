import assert from 'node:assert/strict'
import test from 'node:test'
import { clubHeroCopy } from './clubHeroCopyUpdate'

test('hero campaign copy has two explicit lines and a mobile-safe size', () => {
  assert.deepEqual(clubHeroCopy, {
    titleLine: '2 недели с открытия',
    titleConnector: 'Аренда со скидкой',
    titleAccent: '50%',
    titleFontSize: { mobile: 24, desktop: 88 },
  })
})
