import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { Select } from './Select'
import { SelectField } from './SelectField'

const options = [
  { value: 'box', label: 'Подарочный бокс' },
  { value: 'pdf', label: 'Электронный PDF' },
]

test('Select exposes a closed listbox trigger with the design-system API', () => {
  const html = renderToStaticMarkup(<Select aria-label="Формат" value="box" options={options} onChange={() => undefined} />)

  assert.match(html, /aria-haspopup="listbox"/)
  assert.match(html, /aria-expanded="false"/)
  assert.doesNotMatch(html, /role="listbox"/)
})

test('SelectField replaces native select while preserving form submission', () => {
  const html = renderToStaticMarkup(<SelectField label="Формат" name="format" defaultValue="box" options={options} />)

  assert.doesNotMatch(html, /<select/)
  assert.match(html, /aria-haspopup="listbox"/)
  assert.match(html, /type="hidden" name="format" value="box"/)
})
