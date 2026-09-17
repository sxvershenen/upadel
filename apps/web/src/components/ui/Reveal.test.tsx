import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { Reveal } from './Reveal'
import { SplitTextReveal } from './SplitTextReveal'

test('Reveal stays visible in server-rendered HTML', () => {
  const html = renderToStaticMarkup(<Reveal>Контент секции</Reveal>)

  assert.match(html, /Контент секции/)
  assert.doesNotMatch(html, /opacity:0|translateY/)
})

test('SplitTextReveal stays visible in server-rendered HTML', () => {
  const html = renderToStaticMarkup(<SplitTextReveal text="Текст для проверки" />)

  assert.match(html, /для\u00a0проверки/)
  assert.match(html, /filter:blur\(0px\)/)
  assert.doesNotMatch(html, /opacity:0|blur\(5px\)/)
})
