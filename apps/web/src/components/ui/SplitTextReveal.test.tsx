import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { SplitTextReveal } from './SplitTextReveal'

test('animated headings retain real word separators in server HTML', () => {
  const html = renderToStaticMarkup(<SplitTextReveal text="Первая тренировка в клубе" animateOnMount />)
  const plainText = html.replace(/<[^>]*>/g, '').replace(/\u00a0/g, ' ')
  assert.equal(plainText, 'Первая тренировка в клубе')
})
